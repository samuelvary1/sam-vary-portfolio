#!/usr/bin/env bash
set -e

echo "[INFO] Booting Oracle backend..."

# ====== 1. Set working directory ======
cd /workspace/sam-vary-portfolio

# ====== 2. Create & activate persistent venv ======
if [ ! -d "/workspace/.venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv /workspace/.venv
fi
source /workspace/.venv/bin/activate

# ====== 3. Install Python dependencies ======
if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
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
    python tools/build_corpus.py
else
    echo "[INFO] Artifacts folder already exists."
fi

# ====== 9. Start FastAPI server ======
echo "[INFO] Starting FastAPI server..."
uvicorn server:app --host 0.0.0.0 --port 5000 --reload
