from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os, json, pathlib
import numpy as np

# ---------- Config ----------
ROOT = pathlib.Path(__file__).parent.resolve()
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "oracle_embeddings.json")
EMBEDDINGS_FILE = (ROOT / EMBEDDINGS_PATH).resolve()

TOP_K = int(os.getenv("TOP_K", "6"))
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# OpenAI client (new SDK)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

# ---------- Load embeddings once ----------
# Expected JSON: [{ "id": string, "text": string, "embedding": [float,...] }, ...]
if not EMBEDDINGS_FILE.exists():
    raise FileNotFoundError(
        f"Embeddings file not found at {EMBEDDINGS_FILE}. "
        "Place your oracle_embeddings.json next to oracle_server.py or set EMBEDDINGS_PATH."
    )

with EMBEDDINGS_FILE.open("r", encoding="utf-8") as f:
    rows = json.load(f)

if not isinstance(rows, list) or len(rows) == 0:
    raise ValueError("Embeddings JSON is empty or malformed.")

CHUNK_IDS = [r.get("id", "") for r in rows]
CHUNK_TEXTS = [r.get("text", "") for r in rows]
EMBEDS = np.array([r["embedding"] for r in rows], dtype=np.float32)  # (N, D)
EMB_NORMS = np.linalg.norm(EMBEDS, axis=1) + 1e-8                   # (N,)

def embed_query(text: str) -> np.ndarray:
    """Embed the user query with the new OpenAI SDK."""
    resp = client.embeddings.create(model=EMBED_MODEL, input=text)
    vec = np.array(resp.data[0].embedding, dtype=np.float32)  # (D,)
    return vec

def top_k_similar(qv: np.ndarray, k: int = TOP_K):
    """Return top-k (index, score) by cosine similarity."""
    qn = np.linalg.norm(qv) + 1e-8
    sims = (EMBEDS @ qv) / (EMB_NORMS * qn)                   # (N,)
    idxs = np.argsort(-sims)[:k]
    return [(int(i), float(sims[i])) for i in idxs]

def build_context(indices) -> str:
    parts = [CHUNK_TEXTS[i] for i, _ in indices]
    return "\n\n---\n\n".join(parts)

# ---------- Routes ----------
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

        # 1) Embed query and retrieve
        qv = embed_query(prompt)
        hits = top_k_similar(qv, TOP_K)
        context = build_context(hits)

        # 2) Grounded prompt
        system = (
            "You are the Oracle. Use ONLY the provided context when possible. "
            "If the answer is not clearly supported by the context, say you do not know."
        )
        user = f"Context:\n{context}\n\nQuestion:\n{prompt}\n\nAnswer:"

        # 3) Generate (new SDK)
        comp = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
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
