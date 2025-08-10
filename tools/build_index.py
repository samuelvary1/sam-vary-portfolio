# tools/build_index.py
import json, numpy as np, faiss
from pathlib import Path
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
CHUNKS = ROOT / "artifacts" / "corpus" / "chunks.jsonl"
OUT = ROOT / "artifacts" / "index"
OUT.mkdir(parents=True, exist_ok=True)

model_name = "intfloat/e5-base-v2"
model = SentenceTransformer(model_name)

docs = []
texts = []
with open(CHUNKS, "r", encoding="utf-8") as f:
    for line in f:
        r = json.loads(line)
        docs.append(r)
        texts.append("passage: " + r["text"])

emb = model.encode(
    texts,
    batch_size=64,
    convert_to_numpy=True,
    normalize_embeddings=True,
    show_progress_bar=True,
)

dim = emb.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(emb.astype("float32"))

faiss.write_index(index, str(OUT / "faiss.index"))
np.save(OUT / "emb.npy", emb)
with open(OUT / "docs.jsonl", "w", encoding="utf-8") as f:
    for d in docs:
        f.write(json.dumps(d, ensure_ascii=False) + "\n")

print("Index ready at", OUT)
