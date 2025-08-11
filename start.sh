# Create the script
cat > /workspace/start_ollama_proxy.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Persistent locations
export PATH="/workspace/bin:$PATH"
export OLLAMA_HOME="/workspace/.ollama"
export OLLAMA_MODELS="/workspace/ollama_models"
export OLLAMA_URL="http://127.0.0.1:11434"
export MODEL_NAME="${MODEL_NAME:-llama3.1:8b-instruct-q4_K_M}"

mkdir -p /workspace/bin "$OLLAMA_HOME" "$OLLAMA_MODELS"

# Install Ollama binary if missing
if [ ! -x /workspace/bin/ollama ]; then
  echo "[setup] installing Ollama into /workspace/bin"
  curl -L https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64.tgz -o /workspace/ollama.tgz
  tar -xzf /workspace/ollama.tgz -C /workspace/bin
  rm -f /workspace/ollama.tgz
  chmod +x /workspace/bin/ollama
fi

# Start Ollama if not running
if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
  echo "[ollama] starting daemon on 127.0.0.1:11434"
  nohup /workspace/bin/ollama serve > /workspace/ollama.log 2>&1 &
  # small wait so the API comes up
  sleep 2
fi

# Pull a small model that fits typical pods
echo "[ollama] ensuring model present: ${MODEL_NAME}"
/workspace/bin/ollama list | grep -q "^${MODEL_NAME%%:*}" || /workspace/bin/ollama pull "${MODEL_NAME}" || true

# Python deps for the proxy (installed once, then cached)
if [ -f /workspace/ollama_proxy/requirements.txt ]; then
  if [ ! -f /workspace/ollama_proxy/.deps_installed ]; then
    echo "[proxy] installing python requirements"
    python3 -m pip install --upgrade pip
    python3 -m pip install -r /workspace/ollama_proxy/requirements.txt
    touch /workspace/ollama_proxy/.deps_installed
  fi
else
  echo "[proxy] ERROR: /workspace/ollama_proxy/requirements.txt not found"
  exit 1
fi

# Run the FastAPI proxy on the pod public port
echo "[proxy] starting FastAPI on 0.0.0.0:5000"
cd /workspace/ollama_proxy
exec python3 -m uvicorn main:app --host 0.0.0.0 --port 5000
EOF

# Make it executable
chmod +x /workspace/start_ollama_proxy.sh
