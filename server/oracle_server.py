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

# Compact context defaults
CTX_DOCS = int(os.getenv("CTX_DOCS", "3"))               # top docs to include
CTX_WINDOW_CHARS = int(os.getenv("CTX_WINDOW_CHARS", "1200"))  # chars per doc
CTX_TOTAL_CHARS = int(os.getenv("CTX_TOTAL_CHARS", "3500"))    # total context cap
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
docs: list[str] = []
files: list[str] = []
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

def _rebuild_index():
    """Scan artifacts recursively and build a TF IDF index."""
    global docs, files, vectorizer, doc_matrix

    local_docs: list[str] = []
    local_files: list[str] = []

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    if ARTIFACTS_DIR.exists():
        for p in ARTIFACTS_DIR.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".txt", ".md"}:
                txt = _read_text(p)
                if txt and txt.strip():
                    local_docs.append(" ".join(txt.split()))
                    local_files.append(str(p.relative_to(ARTIFACTS_DIR)))

    if local_docs:
        vec = TfidfVectorizer(stop_words="english")
        mat = vec.fit_transform(local_docs)
    else:
        vec, mat = None, None

    docs, files, vectorizer, doc_matrix = local_docs, local_files, vec, mat
    print(f"Loaded {len(docs)} docs from {ARTIFACTS_DIR}")

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

def best_window(text: str, query: str, window_chars: int) -> str:
    if not text:
        return ""
    t = text
    q_terms = re.findall(r"\w+", (query or "").lower())
    q_terms = [w for w in q_terms if len(w) > 2]

    pos = None
    low = t.lower()
    for term in q_terms:
        i = low.find(term)
        if i != -1:
            pos = i if pos is None else min(pos, i)
    if pos is None:
        pos = 0

    start = max(0, pos - window_chars // 2)
    end = min(len(t), start + window_chars)
    return t[start:end]

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
        "files_indexed": files,
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

    # Build a compact context
    top_ctx = []
    total = 0
    for i in idxs[:CTX_DOCS]:
        snippet = best_window(docs[i], question, CTX_WINDOW_CHARS)
        block = f"[{files[i]}]\n{snippet}"
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
