# server.py
# Oracle backend: FAISS retrieval + BM25 blend + cross-encoder rerank + local Ollama

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from pathlib import Path
import json, os, re
import numpy as np
import faiss
import requests

# ---------- Auto-detect paths ----------
ROOT = Path(__file__).resolve().parent

# Detect persistent pod paths
POD_ARTIFACTS = Path("/workspace/artifacts")
POD_OLLAMA = Path("/workspace/ollama")

# Choose artifacts dir
ARTIFACTS_DIR = Path(
    os.getenv("ARTIFACTS_DIR") or
    (POD_ARTIFACTS if POD_ARTIFACTS.exists() else ROOT / "artifacts")
)

# Default Ollama model store for pod
if POD_OLLAMA.exists():
    os.environ.setdefault("OLLAMA_MODELS", str(POD_OLLAMA))

# Choose Ollama base URL
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_URL = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"

# Choose model
GEN_MODEL = os.getenv("MODEL_NAME", "qwen2.5:7b-instruct")

# Generation settings
TEMPERATURE = float(os.getenv("GEN_TEMPERATURE", "0.2"))
TOP_P = float(os.getenv("GEN_TOP_P", "0.9"))
NUM_CTX = int(os.getenv("GEN_NUM_CTX", "8192"))

# ---------- Load artifacts ----------
IDX_DIR = ARTIFACTS_DIR / "index"
DOCS_PATH = IDX_DIR / "docs.jsonl"
INDEX_PATH = IDX_DIR / "faiss.index"

if not DOCS_PATH.exists() or not INDEX_PATH.exists():
    raise RuntimeError(f"Artifacts missing in {ARTIFACTS_DIR}")

DOCS = [json.loads(l) for l in open(DOCS_PATH, "r", encoding="utf-8")]
INDEX = faiss.read_index(str(INDEX_PATH))

# ---------- Embeddings and reranker ----------
from sentence_transformers import SentenceTransformer, CrossEncoder

EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "intfloat/e5-base-v2")
embedder = SentenceTransformer(EMBED_MODEL_NAME)

RERANK_MODEL_NAME = os.getenv("RERANK_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
reranker = CrossEncoder(RERANK_MODEL_NAME)

# ---------- BM25 setup ----------
from rank_bm25 import BM25Okapi

TOKEN_RE = re.compile(r"[A-Za-z0-9']+")
def tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text.lower())

BM25_CORPUS = [tokenize(d["text"]) for d in DOCS]
bm25 = BM25Okapi(BM25_CORPUS)

# ---------- FastAPI app with CORS ----------
app = FastAPI(title="Oracle Backend")

origins = os.getenv("FRONTEND_ORIGINS", "").split(",") if os.getenv("FRONTEND_ORIGINS") else [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:5173", "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Retrieval ----------
def retrieve(query: str, vec_k: int = 12, bm_k: int = 12, final_k: int = 6) -> List[Dict]:
    qv = embedder.encode(["query: " + query], normalize_embeddings=True).astype("float32")
    _, I = INDEX.search(qv, vec_k)
    vec_idxs = set(int(i) for i in I[0])

    bm_scores = bm25.get_scores(tokenize(query))
    bm_idxs = set(int(i) for i in np.argsort(-bm_scores)[:bm_k])

    cand_idxs = list(vec_idxs.union(bm_idxs))
    if not cand_idxs:
        return []

    candidates = [DOCS[i] for i in cand_idxs]
    pairs = [[query, d["text"]] for d in candidates]
    scores = reranker.predict(pairs).tolist()
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

    return [{
        "rank": rank,
        "title": d["title"],
        "source": d["source"],
        "text": d["text"],
        "score": float(score),
    } for rank, (d, score) in enumerate(ranked[:final_k], 1)]

# ---------- Prompt & generation ----------
def build_prompt(question: str, passages: List[Dict]) -> str:
    context = "\n\n".join(f"[{p['title']} • {p['source']}]\n{p['text']}" for p in passages)
    system = (
        "You are The Oracle. Use only the Context below. "
        "If the Context does not contain the answer, say you do not know. "
        "Do not invent names or facts. Keep answers concise unless asked for detail. "
        "End with short citations like [title • source]."
    )
    return f"{system}\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"

def generate_with_ollama(prompt: str) -> str:
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": GEN_MODEL,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": TEMPERATURE,
                    "top_p": TOP_P,
                    "num_ctx": NUM_CTX
                },
            },
            stream=True, timeout=600,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        return f"Error talking to model: {e}"

    out = []
    for line in resp.iter_lines():
        if not line:
            continue
        try:
            data = json.loads(line.decode("utf-8"))
            if "response" in data:
                out.append(data["response"])
        except Exception:
            continue
    return "".join(out).strip()

# ---------- API ----------
class AskBody(BaseModel):
    prompt: str

@app.get("/health")
def health():
    return {
        "status": "ok",
        "docs": len(DOCS),
        "artifacts_dir": str(ARTIFACTS_DIR),
        "ollama_models": os.getenv("OLLAMA_MODELS", ""),
        "embed_model": EMBED_MODEL_NAME,
        "rerank_model": RERANK_MODEL_NAME,
        "gen_model": GEN_MODEL,
        "ollama_base": OLLAMA_BASE_URL,
    }

@app.post("/ask")
def ask(body: AskBody):
    passages = retrieve(body.prompt, vec_k=16, bm_k=16, final_k=6)
    if not passages:
        return {"response": "I do not know based on the provided writings.", "citations": []}
    prompt = build_prompt(body.prompt, passages)
    answer = generate_with_ollama(prompt)
    return {
        "response": answer,
        "citations": [{"title": p["title"], "source": p["source"]} for p in passages],
    }
