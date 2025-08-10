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

# ====== If artifacts.zip exists and artifacts folder is empty, extract it ======
if [ -f /workspace/artifacts.zip ] && [ -z "$(ls -A /workspace/artifacts 2>/dev/null)" ]; then
    echo "[INFO] Extracting artifacts.zip into /workspace/artifacts..."
    python -m zipfile -e /workspace/artifacts.zip /workspace/artifacts
    echo "[INFO] Extraction complete."
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
# If you use a venv, uncomment:
# source .venv/bin/activate

uvicorn server:app --host 0.0.0.0 --port 5000

# ====== Keep Ollama alive if uvicorn exits ======
wait $OLLAMA_PID
