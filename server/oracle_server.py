from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pathlib
import json
import numpy as np
from sentence_transformers import SentenceTransformer

# -----------------
# Config
# -----------------
ROOT = pathlib.Path(__file__).parent.resolve()
EMBEDDINGS_FILE = (ROOT / os.getenv("EMBEDDINGS_PATH", "oracle_embeddings.json")).resolve()

TOP_K = int(os.getenv("TOP_K", "6"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://www.samvary.com,https://samvary.com,http://localhost:3000"
).split(",")

LOCAL_EMBED_MODEL = os.getenv("LOCAL_EMBED_MODEL", "all-MiniLM-L6-v2")

# -----------------
# Init Flask
# -----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# -----------------
# Load embeddings
# -----------------
if EMBEDDINGS_FILE.exists():
    with open(EMBEDDINGS_FILE, "r", encoding="utf-8") as f:
        embeddings_data = json.load(f)
else:
    embeddings_data = []

embed_model = SentenceTransformer(LOCAL_EMBED_MODEL)

# -----------------
# Routes
# -----------------
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    query_vec = embed_model.encode(prompt)
    scores = []

    for entry in embeddings_data:
        emb = np.array(entry["embedding"])
        score = float(np.dot(query_vec, emb) / (np.linalg.norm(query_vec) * np.linalg.norm(emb)))
        scores.append((score, entry))

    scores.sort(key=lambda x: x[0], reverse=True)
    top_matches = [{"score": s, "file": e["file"], "text": e["text"]} for s, e in scores[:TOP_K]]

    return jsonify({"matches": top_matches})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

# -----------------
# Entrypoint
# -----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render gives PORT, local uses 5000
    app.run(host="0.0.0.0", port=port)
