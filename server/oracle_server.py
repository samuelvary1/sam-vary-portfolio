from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os, json, pathlib
import numpy as np

# NEW: local embeddings (CPU)
from sentence_transformers import SentenceTransformer

# -----------------
# Config
# -----------------
ROOT = pathlib.Path(__file__).parent.resolve()
EMBEDDINGS_FILE = (ROOT / os.getenv("EMBEDDINGS_PATH", "oracle_embeddings.json")).resolve()

TOP_K = int(os.getenv("TOP_K", "6"))
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
LOCAL_EMBED_MODEL = os.getenv("LOCAL_EMBED_MODEL", "all-MiniLM-L6-v2")  # ~90MB

# -----------------
# Init Groq client
# -----------------
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not set in environment variables")
groq_client = Groq(api_key=api_key)

# -----------------
# Load artifacts index (precomputed doc chunk embeddings)
# -----------------
if not EMBEDDINGS_FILE.exists():
    raise FileNotFoundError(f"Embeddings file not found: {EMBEDDINGS_FILE}")

with EMBEDDINGS_FILE.open("r", encoding="utf-8") as f:
    rows = json.load(f)

CHUNK_IDS = [r.get("id", "") for r in rows]
CHUNK_TEXTS = [r.get("text", "") for r in rows]
EMBEDS = np.array([r["embedding"] for r in rows], dtype=np.float32)  # (N, D)
EMB_NORMS = np.linalg.norm(EMBEDS, axis=1) + 1e-8

# -----------------
# Local embedder (loads once on startup)
# -----------------
_embedder: SentenceTransformer | None = None

def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        # downloads model on first run (~90MB), then cached on Render’s disk
        _embedder = SentenceTransformer(LOCAL_EMBED_MODEL)
    return _embedder

def embed_query_local(text: str) -> np.ndarray:
    model = get_embedder()
    vec = model.encode([text], normalize_embeddings=True)[0]  # (D,)
    return np.asarray(vec, dtype=np.float32)

# -----------------
# Retrieval helpers
# -----------------
def top_k_similar(qv: np.ndarray, k: int):
    qn = np.linalg.norm(qv) + 1e-8
    sims = (EMBEDS @ qv) / (EMB_NORMS * qn)
    idxs = np.argsort(-sims)[:k]
    return [(int(i), float(sims[i])) for i in idxs]

def build_context(indices):
    return "\n\n---\n\n".join(CHUNK_TEXTS[i] for i, _ in indices)

# -----------------
# Flask app
# -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

@app.get("/health")
def health():
    return jsonify({"status": "ok", "chunks": len(CHUNK_TEXTS)})

@app.post("/ask")
def ask():
    try:
        data = request.get_json(force=True) or {}
        prompt = (data.get("prompt") or "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # 1) Embed the user question locally (CPU)
        qv = embed_query_local(prompt)

        # 2) Retrieve top chunks
        hits = top_k_similar(qv, TOP_K)
        context = build_context(hits)

        # 3) Grounded prompt
        system_msg = (
            "You are the Oracle. Use ONLY the provided context when possible. "
            "If the answer is not clearly supported by the context, say you do not know."
        )
        user_msg = f"Context:\n{context}\n\nQuestion:\n{prompt}\n\nAnswer:"

        # 4) Generate with Groq (fast, free-tier)
        comp = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.2,
            max_tokens=600,
        )
        answer = comp.choices[0].message.content

        citations = [{"title": CHUNK_IDS[i], "source": "artifacts"} for i, _ in hits]
        return jsonify({"response": answer, "citations": citations})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
