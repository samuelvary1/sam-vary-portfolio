from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, pathlib, json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ROOT = pathlib.Path(__file__).parent.resolve()
ARTIFACTS_DIR = (ROOT / os.getenv("ARTIFACTS_DIR", "artifacts")).resolve()
TOP_K = int(os.getenv("TOP_K", "6"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://www.samvary.com,https://samvary.com,http://localhost:3000"
).split(",")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# Load docs
docs = []
files = []
if ARTIFACTS_DIR.exists():
    for p in sorted(ARTIFACTS_DIR.glob("*")):
        if p.is_file() and p.suffix.lower() in {".txt", ".md"}:
            try:
                txt = p.read_text(encoding="utf-8")
                if txt.strip():
                    docs.append(txt)
                    files.append(p.name)
            except Exception:
                pass

# Build TF IDF
if docs:
    vectorizer = TfidfVectorizer(stop_words="english")
    doc_matrix = vectorizer.fit_transform(docs)
else:
    vectorizer = None
    doc_matrix = None

@app.route("/ask", methods=["POST"])
def ask():
    if not vectorizer or doc_matrix is None or not docs:
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
            "text": docs[i]
        })
    return jsonify({"matches": results})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "docs": len(docs)}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
