#!/usr/bin/env bash
set -e

echo "[INFO] Booting Oracle backend (no venv)..."

# ====== 1. Set working directory ======
cd /workspace/sam-vary-portfolio

# ====== 2. Persistent Python package location ======
export PATH="/workspace/.local/bin:$PATH"
export PYTHONPATH="/workspace/.local/lib/python3.11/site-packages:$PYTHONPATH"

# ====== 3. Install Python dependencies if requirements.txt exists ======
if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing Python dependencies to /workspace/.local..."
    pip3 install --user --no-cache-dir -r requirements.txt
else
    echo "[WARN] requirements.txt not found — skipping pip install."
fi

# ====== 4. Install Ollama if not installed ======
if ! command -v ollama &> /dev/null; then
    echo "[INFO] Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "[INFO] Ollama already installed."
fi

# ====== 5. Use persistent Ollama models folder ======
export OLLAMA_MODELS=/workspace/ollama

# ====== 6. Start Ollama in background ======
echo "[INFO] Starting Ollama..."
ollama serve &
sleep 5

# ====== 7. Pull model if not already present ======
MODEL_NAME="qwen2.5:7b-instruct"
if ! ollama list | grep -q "$MODEL_NAME"; then
    echo "[INFO] Pulling model $MODEL_NAME..."
    ollama pull $MODEL_NAME
else
    echo "[INFO] Model $MODEL_NAME already present."
fi

# ====== 8. Build artifacts if missing ======
if [ ! -d "artifacts" ] || [ -z "$(ls -A artifacts)" ]; then
    echo "[INFO] Building artifacts from corpus..."
    python3 tools/build_corpus.py
else
    echo "[INFO] Artifacts folder already exists."
fi

# ====== 9. Start FastAPI server (no reload to save RAM) ======
echo "[INFO] Starting FastAPI server..."
python3 -m uvicorn server:app --host 0.0.0.0 --port 5000
