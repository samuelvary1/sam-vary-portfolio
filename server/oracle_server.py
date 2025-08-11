from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pathlib
import threading
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq

# -----------------
# Config
# -----------------
ROOT = pathlib.Path(__file__).parent.resolve()
ARTIFACTS_DIR = (ROOT / os.getenv("ARTIFACTS_DIR", "artifacts")).resolve()

TOP_K = int(os.getenv("TOP_K", "6"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://www.samvary.com,https://samvary.com,http://localhost:3000"
).split(",")

# Chunked indexing and compact context
CHUNK_CHARS = int(os.getenv("CHUNK_CHARS", "1200"))          # size of each text chunk in characters
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))       # overlap between consecutive chunks
CTX_DOCS = int(os.getenv("CTX_DOCS", "4"))                   # how many top chunks to include in context
CTX_TOTAL_CHARS = int(os.getenv("CTX_TOTAL_CHARS", "3500"))  # total context character cap
MAX_ANSWER_TOKENS = int(os.getenv("MAX_ANSWER_TOKENS", "400"))

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
ADMIN_TOKEN = os.getenv("ORACLE_ADMIN_TOKEN", "")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# -----------------
# App
# -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# -----------------
# State
# -----------------
docs: list[str] = []          # list of chunk texts
files: list[str] = []         # list of "relative_path#chunkN" labels
vectorizer: TfidfVectorizer | None = None
doc_matrix = None
_reload_lock = threading.Lock()

# -----------------
# Helpers
# -----------------
def _read_text(path: pathlib.Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        try:
            return path.read_text(encoding="latin-1")
        except Exception:
            return None

def chunk_text(t: str, size: int, overlap: int):
    """Split normalized text into overlapping chunks. Returns list of (start_index, chunk_text)."""
    if not t:
        return []
    t = " ".join(t.split())  # normalize whitespace
    chunks = []
    step = max(1, size - overlap)
    for i in range(0, len(t), step):
        chunk = t[i:i + size]
        if len(chunk) < 120:  # skip very small tails
            break
        chunks.append((i, chunk))
    return chunks

def _rebuild_index():
    """Scan artifacts recursively, chunk large files, and build the TF IDF index."""
    global docs, files, vectorizer, doc_matrix

    local_docs: list[str] = []
    local_files: list[str] = []

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    for p in ARTIFACTS_DIR.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".txt", ".md"}:
            continue
        txt = _read_text(p)
        if not txt or not txt.strip():
            continue

        rel = str(p.relative_to(ARTIFACTS_DIR))
        for j, (start, ch) in enumerate(chunk_text(txt, CHUNK_CHARS, CHUNK_OVERLAP)):
            local_docs.append(ch)
            local_files.append(f"{rel}#chunk{j}")

    if local_docs:
        vec = TfidfVectorizer(stop_words="english")
        mat = vec.fit_transform(local_docs)
    else:
        vec, mat = None, None

    docs, files, vectorizer, doc_matrix = local_docs, local_files, vec, mat
    print(f"Indexed {len(docs)} chunks from {ARTIFACTS_DIR}")

# Build index at startup
_rebuild_index()

def _retrieve(prompt: str, k: int):
    if vectorizer is None or doc_matrix is None or not docs:
        return [], np.array([])
    q_vec = vectorizer.transform([prompt])
    sims = cosine_similarity(q_vec, doc_matrix).ravel()
    idxs = np.argsort(-sims)[:k]
    return idxs, sims

def _auth_ok(req: request) -> bool:
    if not ADMIN_TOKEN:
        return True
    return req.headers.get("X-Oracle-Admin") == ADMIN_TOKEN

def generate_answer_with_fallback(messages, primary, fallback="llama-3.1-8b-instant"):
    if not groq_client:
        return ""
    try:
        return groq_client.chat.completions.create(
            model=primary,
            messages=messages,
            temperature=0.2,
            max_tokens=MAX_ANSWER_TOKENS,
        ).choices[0].message.content.strip()
    except Exception as e:
        msg = str(e)
        if "decommissioned" in msg or "Request too large" in msg or "tokens per minute" in msg:
            return groq_client.chat.completions.create(
                model=fallback,
                messages=messages,
                temperature=0.2,
                max_tokens=MAX_ANSWER_TOKENS,
            ).choices[0].message.content.strip()
        raise

# -----------------
# Routes
# -----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "docs": len(docs)}), 200

@app.route("/list", methods=["GET"])
def list_docs():
    entries = []
    if ARTIFACTS_DIR.exists():
        try:
            entries = [
                str(p.relative_to(ARTIFACTS_DIR))
                for p in ARTIFACTS_DIR.rglob("*")
                if p.is_file()
            ]
        except Exception:
            entries = []
    return jsonify({
        "dir": str(ARTIFACTS_DIR),
        "count": len(docs),
        "files_indexed": files[:25],   # sample to keep payload small
        "total_files_in_dir": len(entries),
        "files_in_dir_sample": entries[:25],
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

    idxs, sims = _retrieve(prompt, TOP_K)
    matches = [{"score": float(sims[i]), "file": files[i], "text": docs[i]} for i in idxs]
    return jsonify({"matches": matches}), 200

@app.route("/answer", methods=["POST"])
def answer():
    if vectorizer is None or doc_matrix is None or not docs:
        return jsonify({"answer": "", "matches": [], "note": "no documents loaded"}), 200

    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("prompt") or "").strip()
    if not question:
        return jsonify({"error": "No prompt provided"}), 400

    idxs, sims = _retrieve(question, TOP_K)
    matches = [{"score": float(sims[i]), "file": files[i], "text": docs[i]} for i in idxs]

    # Build a compact context from the top chunks
    top_ctx, total = [], 0
    for i in idxs[:CTX_DOCS]:
        block = f"[{files[i]}]\n{docs[i]}"
        if total + len(block) > CTX_TOTAL_CHARS:
            remain = max(0, CTX_TOTAL_CHARS - total)
            block = block[:remain]
        top_ctx.append(block)
        total += len(block)
        if total >= CTX_TOTAL_CHARS:
            break
    context = "\n\n".join(top_ctx)

    if not groq_client:
        return jsonify({
            "answer": "",
            "matches": matches,
            "note": "set GROQ_API_KEY to enable natural language answers"
        }), 200

    system_msg = (
        "Answer using only the provided context. "
        "Cite document names inline when helpful. "
        "If the answer is not in the context, say you do not know."
    )
    user_msg = f"Question:\n{question}\n\nContext:\n{context}\n\nAnswer clearly and concisely."

    try:
        answer_text = generate_answer_with_fallback(
            [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            primary=GROQ_MODEL,
        )
    except Exception as e:
        return jsonify({
            "answer": "",
            "matches": matches,
            "error": f"generation failed: {e}"
        }), 500

    return jsonify({"answer": answer_text, "matches": matches}), 200

# -----------------
# Local entry
# -----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
