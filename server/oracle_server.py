from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, time, re, pathlib, threading
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
try:
    from rank_bm25 import BM25Okapi  # optional
except Exception:
    BM25Okapi = None
from groq import Groq

# -----------------
# Config (env)
# -----------------
ROOT = pathlib.Path(__file__).parent.resolve()
ARTIFACTS_DIR = (ROOT / os.getenv("ARTIFACTS_DIR", "artifacts")).resolve()

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://www.samvary.com,https://samvary.com,http://localhost:3000"
).split(",")

TOP_K = int(os.getenv("TOP_K", "6"))

# Chunking / context
CHUNK_CHARS = int(os.getenv("CHUNK_CHARS", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
MIN_CHARS = int(os.getenv("MIN_CHARS", "80"))  # min size for a chunk; short files still get 1 chunk
CTX_DOCS = int(os.getenv("CTX_DOCS", "4"))
CTX_TOTAL_CHARS = int(os.getenv("CTX_TOTAL_CHARS", "3800"))
MAX_ANSWER_TOKENS = int(os.getenv("MAX_ANSWER_TOKENS", "400"))

# Retrieval blend (0..1): 1.0 = pure TF-IDF, 0.0 = pure BM25
RETRIEVAL_ALPHA = float(os.getenv("RETRIEVAL_ALPHA", "0.6"))

# Optional FAQ pinning
FAQ_FILE = os.getenv("FAQ_FILE", "oracle_faq.txt")

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
ADMIN_TOKEN = os.getenv("ORACLE_ADMIN_TOKEN", "")

# Map→Reduce env
MAP_CHUNKS = int(os.getenv("MAP_CHUNKS", "12"))
MAP_SUMMARY_TOKENS = int(os.getenv("MAP_SUMMARY_TOKENS", "140"))
REDUCE_TOKENS = int(os.getenv("REDUCE_TOKENS", "600"))

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# -----------------
# App
# -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# -----------------
# State
# -----------------
docs: list[str] = []          # chunk texts
files: list[str] = []         # "relative_path#chunkN"
vectorizer: TfidfVectorizer | None = None
doc_matrix = None
bm25 = None  # type: ignore
_reload_lock = threading.Lock()

# -----------------
# Helpers
# -----------------
def _read_text(path: pathlib.Path) -> str | None:
    """Robust text reader; strips NULs and handles common encodings."""
    try:
        t = path.read_text(encoding="utf-8")
    except Exception:
        try:
            t = path.read_text(encoding="latin-1")
        except Exception:
            return None
    return t.replace("\x00", "")

SENT_END = re.compile(r"([.!?])\s+")

def chunk_text(t: str, size: int, overlap: int):
    """Sentence-aware sliding window; returns (start_idx, chunk_text)."""
    if not t:
        return []
    t = " ".join(t.split())  # normalize whitespace
    chunks = []
    step = max(1, size - overlap)
    i = 0
    while i < len(t):
        piece = t[i:i + size]
        # allow a single short chunk for short files
        if len(piece) < MIN_CHARS:
            if i == 0 and len(piece) > 0:
                chunks.append((i, piece))
            break
        # try to end on sentence boundary
        ends = list(SENT_END.finditer(piece))
        if ends:
            piece = piece[:ends[-1].end()]
        chunks.append((i, piece))
        i += step
    return chunks

def _rebuild_index():
    """Scan artifacts recursively, chunk files, build TF-IDF (bigrams) and optional BM25."""
    global docs, files, vectorizer, doc_matrix, bm25

    local_docs: list[str] = []
    local_files: list[str] = []
    scanned = eligible = decoded = produced = 0

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    for p in ARTIFACTS_DIR.rglob("*"):
        if not p.is_file():
            continue
        scanned += 1
        if p.suffix.lower() not in {".txt", ".md"}:
            continue
        eligible += 1

        txt = _read_text(p)
        if not txt or not txt.strip():
            continue
        decoded += 1

        rel = str(p.relative_to(ARTIFACTS_DIR))
        for j, (start, ch) in enumerate(chunk_text(txt, CHUNK_CHARS, CHUNK_OVERLAP)):
            local_docs.append(ch)
            local_files.append(f"{rel}#chunk{j}")
            produced += 1

    if local_docs:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        doc_matrix = vectorizer.fit_transform(local_docs)
        if BM25Okapi is not None:
            tokenized = [d.lower().split() for d in local_docs]
            bm25 = BM25Okapi(tokenized)
        else:
            bm25 = None
    else:
        vectorizer, doc_matrix, bm25 = None, None, None

    docs, files = local_docs, local_files
    print(f"[index] scanned={scanned} eligible={eligible} decoded={decoded} chunks={produced} dir={ARTIFACTS_DIR}")
    app.config["INDEX_STATS"] = dict(
        scanned=scanned, eligible=eligible, decoded=decoded, chunks=produced, dir=str(ARTIFACTS_DIR)
    )

def _normalize(arr):
    a = np.asarray(arr, dtype=float)
    if a.size == 0:
        return a
    mx, mn = a.max(), a.min()
    if mx == mn:
        return np.zeros_like(a)
    return (a - mn) / (mx - mn + 1e-12)

def _expand_query(q: str) -> str:
    """Tiny synonym expansion to help retrieval."""
    SYN = {
        "thesis": ["honors thesis", "capstone"],
        "protagonist": ["main character", "lead"],
        "antagonist": ["villain", "opponent"],
    }
    low = q.lower()
    extras = []
    for k, alts in SYN.items():
        if k in low:
            extras.extend(alts)
    return q if not extras else (q + " " + " ".join(extras))

def _retrieve(prompt: str, k: int):
    """
    Blend TF-IDF and (if available) BM25; return (idxs, blended_scores).
    Falls back to pure TF-IDF when BM25 isn't initialized or installed.
    """
    if vectorizer is None or doc_matrix is None or not docs:
        return np.array([], dtype=int), np.array([])

    q = _expand_query(prompt)

    # TF-IDF cosine
    tfidf_vec = vectorizer.transform([q])
    tfidf_scores = cosine_similarity(tfidf_vec, doc_matrix).ravel()
    blended = _normalize(tfidf_scores)

    # Optional BM25 blend
    if bm25 is not None:
        bm_scores = bm25.get_scores(q.lower().split())
        blended = RETRIEVAL_ALPHA * _normalize(tfidf_scores) + (1 - RETRIEVAL_ALPHA) * _normalize(bm_scores)

    idxs = np.argsort(-blended)[:k]
    return idxs, blended

def select_diverse(idxs, k, max_sim=0.9):
    """Greedy pick top-k with low pairwise similarity between chosen chunks."""
    if vectorizer is None:
        return np.array(idxs[:k])
    chosen = []
    chosen_vecs = []
    for i in idxs:
        v = vectorizer.transform([docs[i]])
        if all(cosine_similarity(v, cv)[0, 0] < max_sim for cv in chosen_vecs):
            chosen.append(i)
            chosen_vecs.append(v)
        if len(chosen) >= k:
            break
    return np.array(chosen, dtype=int)

def _auth_ok(req: request) -> bool:
    if not ADMIN_TOKEN:
        return True
    return req.headers.get("X-Oracle-Admin") == ADMIN_TOKEN

def _groq_chat(messages, model, max_tokens, temperature=0.2):
    """Single Groq chat call with simple backoff on rate/TPM errors."""
    if not groq_client:
        return ""
    for attempt in range(3):
        try:
            r = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return r.choices[0].message.content.strip()
        except Exception as e:
            msg = str(e).lower()
            if "rate" in msg or "tokens per minute" in msg:
                time.sleep(1.0 + attempt)
                continue
            if "decommissioned" in msg:
                # auto fallback
                return _groq_chat(messages, "llama-3.1-8b-instant", max_tokens, temperature)
            raise
    return ""

def generate_answer_with_fallback(messages, primary, fallback="llama-3.1-8b-instant"):
    if not groq_client:
        return ""
    try:
        return _groq_chat(messages, primary, MAX_ANSWER_TOKENS, temperature=0.2)
    except Exception:
        return _groq_chat(messages, fallback, MAX_ANSWER_TOKENS, temperature=0.2)

def _summarize_chunk_for(question: str, label: str, text: str) -> str:
    """Map step: short, focused summary for one chunk with a citation label."""
    sys = (
        "You create short, factual, question-focused notes from a single passage. "
        "Do not invent facts. Stay grounded in the passage. "
        "Return 2–4 bullet points, each ending with the provided source label."
    )
    usr = (
        f"Question:\n{question}\n\n"
        f"Passage (source {label}):\n{text}\n\n"
        f"Write 2–4 bullet points that help answer the question. "
        f"End each bullet with {label}."
    )
    return _groq_chat(
        [{"role": "system", "content": sys}, {"role": "user", "content": usr}],
        GROQ_MODEL,
        MAP_SUMMARY_TOKENS,
        temperature=0.1,
    )

def _reduce_summaries(question: str, summaries: list[str]) -> str:
    """Reduce step: synthesize a clear answer from multiple labeled notes."""
    sys = (
        "Synthesize a concise, well-structured answer using only the notes. "
        "Preserve citations exactly as the source labels like [file#chunkN]. "
        "If the notes don't contain an answer, say you don't know."
    )
    notes = "\n".join(summaries)
    usr = f"Question:\n{question}\n\nNotes:\n{notes}\n\nWrite the final answer with inline citations."
    return _groq_chat(
        [{"role": "system", "content": sys}, {"role": "user", "content": usr}],
        GROQ_MODEL,
        REDUCE_TOKENS,
        temperature=0.2,
    )

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
                for p in ARTIFACTS_DIR.rglob("*") if p.is_file()
            ]
        except Exception:
            entries = []
    return jsonify({
        "dir": str(ARTIFACTS_DIR),
        "count": len(docs),
        "files_indexed_sample": files[:25],
        "total_files_in_dir": len(entries),
        "files_in_dir_sample": entries[:25],
    }), 200

@app.route("/reload", methods=["POST"])
def reload_index():
    if not _auth_ok(request):
        return jsonify({"error": "unauthorized"}), 401
    with _reload_lock:
        _rebuild_index()
        stats = app.config.get("INDEX_STATS", {})
        return jsonify({"ok": True, "docs": len(docs), "stats": stats}), 200

@app.route("/ask", methods=["POST"])
def ask():
    # NOTE: do NOT require bm25 here — TF-IDF fallback should still work
    if vectorizer is None or doc_matrix is None or not docs:
        return jsonify({"matches": [], "note": "no documents loaded"}), 200

    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    idxs, scores = _retrieve(prompt, TOP_K)
    matches = [{"score": float(scores[i]), "file": files[i], "text": docs[i]} for i in idxs]
    return jsonify({"matches": matches}), 200

@app.route("/answer", methods=["POST"])
def answer():
    if vectorizer is None or doc_matrix is None or not docs:
        return jsonify({"answer": "", "matches": [], "note": "no documents loaded"}), 200

    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("prompt") or "").strip()
    if not question:
        return jsonify({"error": "No prompt provided"}), 400

    # Retrieve a wider set, then select diverse context
    idxs, scores = _retrieve(question, max(TOP_K, CTX_DOCS * 2))

    # Optional: pin FAQ for certain questions
    q_low = question.lower()
    should_pin_faq = ("who is sam vary" in q_low) or ("what do you know" in q_low)
    if should_pin_faq:
        faq_idxs = [i for i, f in enumerate(files) if f.split("#")[0].endswith(FAQ_FILE)]
        if faq_idxs:
            best_faq = max(faq_idxs, key=lambda i: scores[i] if scores.size else 0.0)
            idxs = np.array([best_faq] + [j for j in idxs if j != best_faq])

    idxs_ctx = select_diverse(idxs, CTX_DOCS)

    # Build compact context under the cap
    top_ctx, total = [], 0
    for i in idxs_ctx:
        block = f"[{files[i]}]\n{docs[i]}"
        if total + len(block) > CTX_TOTAL_CHARS:
            remain = max(0, CTX_TOTAL_CHARS - total)
            block = block[:remain]
        top_ctx.append(block)
        total += len(block)
        if total >= CTX_TOTAL_CHARS:
            break
    context = "\n\n".join(top_ctx)

    # Provide matches for UI
    top_idxs = idxs[:TOP_K]
    matches = [{"score": float(scores[i]), "file": files[i], "text": docs[i]} for i in top_idxs]

    if not groq_client:
        return jsonify({
            "answer": "",
            "matches": matches,
            "note": "set GROQ_API_KEY to enable natural language answers"
        }), 200

    system_msg = (
        "Answer using only the provided context. "
        "Cite sources as [file#chunkN] when helpful. "
        "If the answer is not in the context, say you do not know."
    )
    user_msg = f"Question:\n{question}\n\nContext:\n{context}\n\nAnswer clearly and concisely."
    answer_text = generate_answer_with_fallback(
        [{"role": "system", "content": system_msg}, {"role": "user", "content": user_msg}],
        primary=GROQ_MODEL,
    )
    return jsonify({"answer": answer_text, "matches": matches}), 200

@app.route("/deep_answer", methods=["POST"])
def deep_answer():
    """Map-Reduce answering for broad questions (multi-call but token-safe)."""
    if vectorizer is None or doc_matrix is None or not docs:
        return jsonify({"answer": "", "matches": [], "note": "no documents loaded"}), 200

    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("prompt") or "").strip()
    if not question:
        return jsonify({"error": "No prompt provided"}), 400
    if not groq_client:
        return jsonify({"answer": "", "matches": [], "note": "set GROQ_API_KEY"}), 200

    # Retrieve a wide set, then pick diverse chunks for the map step
    idxs, scores = _retrieve(question, max(TOP_K * 3, MAP_CHUNKS * 2))
    if idxs.size == 0:
        return jsonify({"answer": "", "matches": [], "note": "no relevant chunks found"}), 200
    idxs_map = select_diverse(idxs, MAP_CHUNKS, max_sim=0.88)

    # Map
    summaries = []
    for i in idxs_map:
        label = f"[{files[i]}]"
        text = docs[i]
        summary = _summarize_chunk_for(question, label, text)
        if summary:
            summaries.append(summary)

    # Reduce
    final_answer = _reduce_summaries(question, summaries) if summaries else ""

    # Top matches for UI
    top_idxs = idxs[:TOP_K]
    matches = [{"score": float(scores[i]), "file": files[i], "text": docs[i]} for i in top_idxs]

    return jsonify({"answer": final_answer, "matches": matches, "notes_used": len(summaries)}), 200

# -----------------
# Local entry
# -----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
