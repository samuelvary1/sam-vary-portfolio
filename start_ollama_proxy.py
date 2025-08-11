#!/usr/bin/env python3
import os
import sys
import time
import tarfile
import urllib.request
import subprocess
from pathlib import Path

# Config
WORKSPACE = Path("/workspace")
BIN_DIR = WORKSPACE / "bin"
OLLAMA_BIN = BIN_DIR / "ollama"
OLLAMA_LOG = WORKSPACE / "ollama.log"
PROXY_DIR = WORKSPACE / "ollama_proxy"
REQS_FILE = PROXY_DIR / "requirements.txt"
MODEL_NAME = os.environ.get("MODEL_NAME", "llama3.1:8b-instruct-q4_K_M")
PUBLIC_PORT = int(os.environ.get("PUBLIC_PORT", "5000"))
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_TGZ = WORKSPACE / "ollama.tgz"
OLLAMA_RELEASE_URL = "https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64.tgz"

def run(cmd, **kwargs):
    print(f"[run] {' '.join(cmd)}")
    return subprocess.run(cmd, check=True, text=True, **kwargs)

def run_bg(cmd, stdout_path):
    print(f"[bg ] {' '.join(cmd)}  > {stdout_path}")
    stdout_file = open(stdout_path, "ab", buffering=0)
    return subprocess.Popen(cmd, stdout=stdout_file, stderr=subprocess.STDOUT)

def ensure_dirs():
    for p in [BIN_DIR, WORKSPACE / ".ollama", WORKSPACE / "ollama_models"]:
        p.mkdir(parents=True, exist_ok=True)

def ensure_path_env():
    os.environ["PATH"] = f"{BIN_DIR}:{os.environ.get('PATH','')}"
    os.environ["OLLAMA_HOME"] = str(WORKSPACE / ".ollama")
    os.environ["OLLAMA_MODELS"] = str(WORKSPACE / "ollama_models")
    os.environ["OLLAMA_URL"] = OLLAMA_URL
    os.environ["MODEL_NAME"] = MODEL_NAME

def download_ollama():
    print("[info] downloading Ollama release tgz")
    with urllib.request.urlopen(OLLAMA_RELEASE_URL) as resp, open(OLLAMA_TGZ, "wb") as out:
        out.write(resp.read())

def extract_ollama():
    print(f"[info] extracting to {BIN_DIR}")
    with tarfile.open(OLLAMA_TGZ, "r:gz") as tar:
        tar.extractall(BIN_DIR)
    try:
        OLLAMA_TGZ.unlink()
    except Exception:
        pass
    OLLAMA_BIN.chmod(0o755)

def ensure_ollama_installed():
    if OLLAMA_BIN.exists():
        print(f"[ok  ] ollama found at {OLLAMA_BIN}")
        return
    download_ollama()
    extract_ollama()
    print("[ok  ] ollama installed")

def is_ollama_up():
    # query tags to see if API is live
    try:
        out = subprocess.check_output(
            [str(OLLAMA_BIN), "list"], text=True, stderr=subprocess.STDOUT
        )
        return True
    except subprocess.CalledProcessError:
        return False
    except FileNotFoundError:
        return False

def start_ollama():
    if is_ollama_up():
        print("[ok  ] ollama already running")
        return
    print("[info] starting ollama serve in background")
    run_bg([str(OLLAMA_BIN), "serve"], stdout_path=str(OLLAMA_LOG))
    # wait for API
    for i in range(30):
        if is_ollama_up():
            print("[ok  ] ollama is up")
            return
        time.sleep(1)
    print("[warn] ollama may not be ready yet, continuing")

def ensure_model():
    print(f"[info] ensuring model present: {MODEL_NAME}")
    try:
        out = subprocess.check_output([str(OLLAMA_BIN), "list"], text=True)
    except subprocess.CalledProcessError:
        out = ""
    model_root = MODEL_NAME.split(":")[0]
    if model_root in out:
        print("[ok  ] model appears present")
        return
    try:
        run([str(OLLAMA_BIN), "pull", MODEL_NAME])
    except subprocess.CalledProcessError as e:
        print(f"[warn] pull failed or partial: {e}")

def install_proxy_requirements():
    if not REQS_FILE.exists():
        print(f"[error] requirements.txt not found at {REQS_FILE}")
        sys.exit(1)
    marker = PROXY_DIR / ".deps_installed"
    if marker.exists():
        print("[ok  ] proxy deps already installed")
        return
    print("[info] installing proxy python deps")
    run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    run([sys.executable, "-m", "pip", "install", "-r", str(REQS_FILE)])
    marker.touch()
    print("[ok  ] proxy deps installed")

def run_proxy():
    if not (PROXY_DIR / "main.py").exists():
        print(f"[error] main.py not found in {PROXY_DIR}")
        sys.exit(1)
    print(f"[info] starting FastAPI proxy on 0.0.0.0:{PUBLIC_PORT}")
    os.chdir(PROXY_DIR)
    # foreground so your pod treats this as the main process
    os.execvp(
        sys.executable,
        [
            sys.executable,
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            "0.0.0.0",
            "--port",
            str(PUBLIC_PORT),
        ],
    )

def main():
    ensure_dirs()
    ensure_path_env()
    ensure_ollama_installed()
    start_ollama()
    ensure_model()
    install_proxy_requirements()
    run_proxy()

if __name__ == "__main__":
    main()
