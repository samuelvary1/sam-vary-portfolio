#!/usr/bin/env bash
set -e

echo "[INFO] Booting Oracle backend (no venv)..."

# ====== 0) Paths & env ======
cd /workspace/sam-vary-portfolio

# Persist Python packages under /workspace/.local
export PATH="/workspace/.local/bin:$PATH"
export PYTHONPATH="/workspace/.local/lib/python3.11/site-packages:$PYTHONPATH"

# Persist models & artifacts under /workspace
export OLLAMA_MODELS=/workspace/ollama
export ARTIFACTS_DIR=/workspace/artifacts
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_HOST=0.0.0.0   # make Ollama listen on all interfaces
MODEL_NAME="${MODEL_NAME:-qwen2.5:7b-instruct}"

mkdir -p "$OLLAMA_MODELS" "$ARTIFACTS_DIR"

# ====== 1) Python deps (user site, persistent) ======
if [ -f "requirements.txt" ]; then
  echo "[INFO] Installing Python deps to /workspace/.local..."
  pip3 install --user --no-cache-dir -r requirements.txt
else
  echo "[WARN] requirements.txt not found — skipping pip install."
fi

# ====== 2) Install Ollama if missing ======
if ! command -v ollama >/dev/null 2>&1; then
  echo "[INFO] Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "[INFO] Ollama already installed."
fi

# ====== 3) Populate /workspace/artifacts if empty ======
if [ -z "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]; then
  echo "[INFO] $ARTIFACTS_DIR is empty — populating..."
  ZIP_PATH=/workspace/sam-vary-portfolio/artifacts.zip
  WRITING_PATH=/workspace/sam-vary-portfolio/public/data/writing

  if [ -f "$ZIP_PATH" ]; then
    echo "[INFO] Extracting $ZIP_PATH -> $ARTIFACTS_DIR"
    python3 -m zipfile -e "$ZIP_PATH" "$ARTIFACTS_DIR"
    rm -f "$ZIP_PATH"
  elif [ -d "$WRITING_PATH" ] && [ -n "$(ls -A "$WRITING_PATH")" ]; then
    echo "[INFO] Building artifacts from $WRITING_PATH -> $ARTIFACTS_DIR"
    python3 tools/build_corpus.py --input "$WRITING_PATH" --out "$ARTIFACTS_DIR"
    python3 tools/audit_corpus.py --input "$ARTIFACTS_DIR" || true
  else
    echo "[WARN] No artifacts.zip and no writing folder — starting without corpus."
  fi
else
  echo "[INFO] $ARTIFACTS_DIR already populated. Skipping rebuild."
fi

# ====== 4) Start Ollama (background) ======
echo "[INFO] Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama API to come up
echo "[INFO] Waiting for Ollama API..."
until curl -s "$OLLAMA_BASE_URL/api/tags" >/dev/null; do sleep 1; done
echo "[INFO] Ollama is up."

# ====== 5) Pull model if missing, then warm ======
if ! ollama list | grep -q "$MODEL_NAME"; then
  echo "[INFO] Pulling model: $MODEL_NAME"
  ollama pull "$MODEL_NAME"
else
  echo "[INFO] Model already present: $MODEL_NAME"
fi

echo "[INFO] Warming model..."
curl -s -X POST "$OLLAMA_BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL_NAME\",\"prompt\":\"Say OK.\",\"stream\":false}" >/dev/null || true
echo "[INFO] Model warmed."

# ====== 6) Start FastAPI (foreground) ======
echo "[INFO] Starting FastAPI on :5000..."
python3 -m uvicorn server:app --host 0.0.0.0 --port 5000

# Keep Ollama alive if uvicorn exits
wait $OLLAMA_PID
