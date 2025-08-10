#!/usr/bin/env bash
set -e

echo "[INFO] Booting Oracle backend..."

# ====== Persistent paths ======
export OLLAMA_MODELS=/workspace/ollama
export ARTIFACTS_DIR=/workspace/artifacts
export MODEL_NAME=qwen2.5:7b-instruct
export OLLAMA_HOST=0.0.0.0
export OLLAMA_BASE_URL=http://127.0.0.1:11434

# ====== Ensure persistent folders exist ======
mkdir -p "$OLLAMA_MODELS" "$ARTIFACTS_DIR"

# ====== Install Ollama if not present ======
if ! command -v ollama &> /dev/null; then
    echo "[INFO] Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "[INFO] Ollama installed."
fi

# ====== Start Ollama in background immediately ======
echo "[INFO] Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama API to be responsive
echo "[INFO] Waiting for Ollama to start..."
until curl -s http://127.0.0.1:11434/api/tags > /dev/null; do
    sleep 1
done
echo "[INFO] Ollama is running."

# ====== Pull model if missing ======
if ! ollama list | grep -q "$MODEL_NAME"; then
    echo "[INFO] Pulling model: $MODEL_NAME"
    ollama pull "$MODEL_NAME"
else
    echo "[INFO] Model already present: $MODEL_NAME"
fi

# ====== Build artifacts if folder is empty ======
if [ -z "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]; then
    if [ -d "/workspace/sam-vary-portfolio/public/data/writing" ]; then
        echo "[INFO] No artifacts found — building from /public/data/writing..."
        cd /workspace/sam-vary-portfolio
        python tools/build_corpus.py
        echo "[INFO] Build complete."
    else
        echo "[WARN] No /public/data/writing folder found — skipping build."
    fi
else
    echo "[INFO] /workspace/artifacts already populated. Skipping rebuild."
fi

# ====== Start FastAPI backend ======
echo "[INFO] Starting FastAPI..."
cd /workspace/sam-vary-portfolio
uvicorn server:app --host 0.0.0.0 --port 5000 --reload &

# ====== Keep processes alive ======
wait $OLLAMA_PID
