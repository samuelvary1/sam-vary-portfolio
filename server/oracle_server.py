from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, math
import numpy as np
import openai

# ---- Config ----
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "oracle_embeddings.json")  # place this file in the server folder
TOP_K = int(os.getenv("TOP_K", "6"))
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")

# OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("ALLOWED_ORIGINS", "*").split(",")}})

# ---- Load embeddings at startup ----
# Expected file format: array of { id, text, embedding }
with open(EMBEDDINGS_PATH, "r", encoding="utf-8") as f:
    _rows = json.load(f)

# Convert embeddings to a 2D numpy array; keep parallel lists for id/text
CHUNK_IDS   = [r.get("id", "") for r in _rows]
CHUNK_TEXTS = [r.get("text", "") for r in _rows]
EMBEDS      = np.array([r["embedding"] for r in _rows], dtype=np.float32)
EMB_NORMS   = np.linalg.norm(EMBEDS, axis=1) + 1e-8

def embed_query(text: str) -> np.ndarray:
    """Embed the user query with the same model used to build the file."""
    resp = openai.Embedding.create(model=EMBED_MODEL, input=text)
    vec = np.array(resp["data"][0]["embedding"], dtype=np.float32)
    return vec

def top_k(query_vec: np.ndarray, k: int = TOP_K):
    """Cosine similarity with preloaded matrix, return indices & scores."""
    qn = np.linalg.norm(query_vec) + 1e-8
    sims = (EMBEDS @ query_vec) / (EMB_NORMS * qn)
    idxs = np.argsort(-sims)[:k]
    return [(int(i), float(sims[i])) for i in idxs]

def build_context(indices):
    """Join the retrieved chunk texts."""
    parts = [CHUNK_TEXTS[i] for i, _ in indices]
    return "\n\n---\n\n".join(parts)

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

        # 1) Embed question
        qv = embed_query(prompt)

        # 2) Retrieve top chunks
        hits = top_k(qv, TOP_K)
        context = build_context(hits)

        # 3) Compose a grounded prompt
        system = (
            "You are the Oracle. Use ONLY the provided context when possible. "
            "If the answer is not clearly supported by the context, say you do not know."
        )
        user = f"Context:\n{context}\n\nQuestion:\n{prompt}\n\nAnswer:"

        # 4) Generate
        comp = openai.ChatCompletion.create(
            model=MODEL_NAME,
            messages=[{"role":"system","content":system},{"role":"user","content":user}],
            temperature=0.2,
            max_tokens=600,
        )
        answer = comp.choices[0].message["content"]

        # 5) Return answer + simple citations
        citations = [
            {"title": CHUNK_IDS[i], "source": "artifacts"}
            for i, _ in hits
        ]
        return jsonify({"response": answer, "citations": citations})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
