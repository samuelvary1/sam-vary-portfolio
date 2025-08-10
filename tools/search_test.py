# tools/search_test.py
import json, numpy as np, faiss
from pathlib import Path
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
IDX = ROOT / "artifacts" / "index"
DOCS = [json.loads(l) for l in open(IDX / "docs.jsonl", "r", encoding="utf-8")]
EMB = np.load(IDX / "emb.npy")
INDEX = faiss.read_index(str(IDX / "faiss.index"))

model = SentenceTransformer("intfloat/e5-base-v2")

def search(q: str, k: int = 5):
    qv = model.encode(["query: " + q], normalize_embeddings=True)
    D, I = INDEX.search(qv.astype("float32"), k)
    out = []
    for rank, idx in enumerate(I[0], 1):
        r = DOCS[idx]
        preview = r["text"][:240].replace("\n", " ") + "..."
        out.append((rank, r["title"], r["source"], preview))
    return out

if __name__ == "__main__":
    while True:
        q = input("Ask about your writings: ").strip()
        if not q:
            break
        for rank, title, src, preview in search(q, 5):
            print(f"{rank}. [{title}] from {src}")
            print("   " + preview)
