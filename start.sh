#!/usr/bin/env bash
set -e

echo "[INFO] Booting Oracle backend..."

# ====== Persistent paths ======
export OLLAMA_MODELS=/workspace/ollama
export ARTIFACTS_DIR=/workspace/artifacts
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export MODEL_NAME=qwen2.5:7b-instruct
export OLLAMA_HOST=0.0.0.0

# ====== Ensure persistent folders exist ======
mkdir -p "$OLLAMA_MODELS" "$ARTIFACTS_DIR"

# ====== Populate /workspace/artifacts if empty ======
if [ -z "$(ls -A /workspace/artifacts 2>/dev/null)" ]; then
    echo "[INFO] /workspace/artifacts is empty. Attempting to populate..."

    ZIP_PATH=/workspace/sam-vary-portfolio/artifacts.zip
    WRITING_PATH=/workspace/sam-vary-portfolio/public/data/writing

    if [ -f "$ZIP_PATH" ]; then
        echo "[INFO] Found $ZIP_PATH. Extracting..."
        python -m zipfile -e "$ZIP_PATH" /workspace/artifacts
        echo "[INFO] Extraction complete."
        rm -f "$ZIP_PATH"
        echo "[INFO] Removed $ZIP_PATH after extraction."
    elif [ -d "$WRITING_PATH" ] && [ -n "$(ls -A "$WRITING_PATH" 2>/dev/null)" ]; then
        echo "[INFO] Found writing folder at $WRITING_PATH. Rebuilding artifacts..."
        cd /workspace/sam-vary-portfolio
        # If you use a venv, uncomment:
        # source .venv/bin/activate
        pip install --no-cache-dir -r requirements.txt
        python tools/build_corpus.py --input "$WRITING_PATH" --out /workspace/artifacts
        python tools/audit_corpus.py --input /workspace/artifacts
        echo "[INFO] Artifact build complete."
    else
        echo "[WARN] No artifacts.zip or writing folder found. Starting without corpus."
    fi
else
    echo "[INFO] /workspace/artifacts already populated. Skipping rebuild."
fi

# ====== Start Ollama in background ======
echo "[INFO] Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

# Give Ollama a moment to come up
sleep 3

# ====== Pull model if missing ======
if ! ollama list | grep -q "$MODEL_NAME"; then
  echo "[INFO] Pulling model: $MODEL_NAME"
  ollama pull "$MODEL_NAME"
else
  echo "[INFO] Model already present: $MODEL_NAME"
fi

# ====== Start FastAPI backend ======
echo "[INFO] Starting FastAPI..."
cd /workspace/sam-vary-portfolio
uvicorn server:app --host 0.0.0.0 --port 5000

# ====== Keep Ollama alive if uvicorn exits ======
wait $OLLAMA_PID
