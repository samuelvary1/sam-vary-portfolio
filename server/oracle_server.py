from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pathlib
import json
import threading
import zipfile
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# -----------------
# Config
# -----------------
ROOT = pathlib.Path(__file__).parent.resolve()
ARTIFACTS_DIR = (ROOT / os.getenv("ARTIFACTS_DIR", "artifacts")).resolve()
ARTIFACTS_ZIP = (ROOT / os.getenv("ARTIFACTS_ZIP", "../artifacts.zip")).resolve()

TOP_K = int(os.getenv("TOP_K", "6"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://www.samvary.com,https://samvary.com,http://localhost:3000"
).split(",")
ADMIN_TOKEN = os.getenv("ORACLE_ADMIN_TOKEN", "")

# -----------------
# App
# -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# -----------------
# State
# -----------------
docs: list[str] = []
files: list[str] = []
vectorizer: TfidfVectorizer | None = None
doc_matrix = None
_reload_lock = threading.Lock()

# -----------------
# Helpers
# -----------------
def _ensure_artifacts():
    """If artifacts dir is empty and a zip exists, unzip into it."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    has_files = any(ARTIFACTS_DIR.iterdir())
    if not has_files and ARTIFACTS_ZIP.exists():
        try:
            with zipfile.ZipFile(ARTIFACTS_ZIP) as z:
                z.extractall(ARTIFACTS_DIR)
            print(f"Unzipped {ARTIFACTS_ZIP} into {ARTIFACTS_DIR}")
        except Exception as e:
            print(f"Failed to unzip {ARTIFACTS_ZIP}: {e}")

def _read_text(path: pathlib.Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        # last resort try latin1 to avoid crashes
        try:
            return path.read_text(encoding="latin-1")
        except Exception:
            return None

def _rebuild_index():
    global docs, files, vectorizer, doc_matrix

    _ensure_artifacts()

    local_docs: list[str] = []
    local_files: list[str] = []

    if ARTIFACTS_DIR.exists():
        for p in ARTIFACTS_DIR.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".txt", ".md"}:
                txt = _read_text(p)
                if txt and txt.strip():
                    local_docs.append(txt)
                    # store relative path for clarity in responses
                    local_files.append(str(p.relative_to(ARTIFACTS_DIR)))

    if local_docs:
        vec = TfidfVectorizer(stop_words="english")
        mat = vec.fit_transform(local_docs)
    else:
        vec, mat = None, None

    docs, files, vectorizer, doc_matrix = local_docs, local_files, vec, mat
    print(f"Loaded {len(docs)} docs from {ARTIFACTS_DIR}")

# build index at startup
_rebuild_index()

def _auth_ok(req: request) -> bool:
    if not ADMIN_TOKEN:
        return True
    return req.headers.get("X-Oracle-Admin") == ADMIN_TOKEN

# -----------------
# Routes
# -----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "docs": len(docs)}), 200

@app.route("/list", methods=["GET"])
def list_docs():
    return jsonify({
        "dir": str(ARTIFACTS_DIR),
        "zip": str(ARTIFACTS_ZIP),
        "count": len(docs),
        "files": files,
    }), 200

@app.route("/reload", methods=["POST"])
def reload_index():
    if not _auth_ok(request):
        return jsonify({"error": "unauthorized"}), 401
    with _reload_lock:
        _rebuild_index()
        return jsonify({"ok": True, "docs": len(docs)}), 200

@app.route("/ask", methods=["POST"])
def ask():
    if vectorizer is None or doc_matrix is None or not docs:
        return jsonify({"matches": [], "note": "no documents loaded"}), 200

    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    q_vec = vectorizer.transform([prompt])
    sims = cosine_similarity(q_vec, doc_matrix).ravel()
    idxs = np.argsort(-sims)[:TOP_K]

    results = []
    for i in idxs:
        results.append({
            "score": float(sims[i]),
            "file": files[i],
            "text": docs[i],
        })
    return jsonify({"matches": results}), 200

# -----------------
# Local entrypoint
# -----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
