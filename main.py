# main.py
import os, json, glob, math, time
from typing import List, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import numpy as np

# Config
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
GEN_MODEL = os.getenv("MODEL_NAME", "llama3.1:8b-instruct-q4_K_M")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
ARTIFACTS_DIR = os.getenv("ARTIFACTS_DIR", "/workspace/artifacts")
TOP_K = int(os.getenv("TOP_K", "6"))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1200"))   # chars
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sawyertoken.com",
        "https://www.sawyertoken.com",
        "https://twantoken.com",
        "https://www.twantoken.com",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskBody(BaseModel):
    prompt: str

def list_text_files(root: str) -> List[str]:
    exts = ("*.txt","*.md","*.markdown","*.json","*.csv")
    files = []
    for e in exts:
        files += glob.glob(os.path.join(root, "**", e), recursive=True)
    return files

def read_text(path: str) -> str:
    try:
        if path.endswith(".json"):
            with open(path, "r", encoding="utf-8") as f:
                return json.dumps(json.load(f))
        else:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
    except Exception:
        return ""

def chunk_text(t: str, size: int, overlap: int) -> List[str]:
    if not t:
        return []
    chunks = []
    i = 0
    while i < len(t):
        chunks.append(t[i:i+size])
        i += max(1, size - overlap)
    return chunks

def ollama_embed(texts: List[str]) -> np.ndarray:
    # batched for stability
    vecs = []
    for tx in texts:
        payload = {"model": EMBED_MODEL, "input": tx}
        r = requests.post(f"{OLLAMA_URL}/api/embeddings", json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        vecs.append(np.array(data["embedding"], dtype=np.float32))
    return np.vstack(vecs) if vecs else np.zeros((0,512), dtype=np.float32)

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1e-8
    return float(np.dot(a, b) / denom)

# Build the index once at startup
CHUNKS: List[str] = []
EMBEDS: np.ndarray = np.zeros((0, 1), dtype=np.float32)

def build_index():
    global CHUNKS, EMBEDS
    files = list_text_files(ARTIFACTS_DIR)
    texts = []
    meta = []

    for p in files:
        txt = read_text(p)
        if not txt:
            continue
        pieces = chunk_text(txt, CHUNK_SIZE, CHUNK_OVERLAP)
        for c in pieces:
            texts.append(c)
            meta.append(p)

    if not texts:
        CHUNKS = []
        EMBEDS = np.zeros((0, 1), dtype=np.float32)
        print("[index] no artifact text found")
        return

    print(f"[index] embedding {len(texts)} chunks from {len(files)} files with {EMBED_MODEL}")
    EMBEDS = ollama_embed(texts)
    CHUNKS = texts
    print("[index] ready")

def retrieve(query: str, k: int) -> List[Tuple[int, float]]:
    if EMBEDS.shape[0] == 0:
        return []
    qv = ollama_embed([query])[0]
    sims = EMBEDS @ qv / ((np.linalg.norm(EMBEDS, axis=1) * np.linalg.norm(qv)) + 1e-8)
    idxs = np.argsort(-sims)[:k]
    return [(int(i), float(sims[i])) for i in idxs]

def gen_with_context(prompt: str, context_chunks: List[str]) -> str:
    context = "\n\n---\n\n".join(context_chunks)
    system = (
        "You are a helpful assistant that must use the provided context when available. "
        "If the answer is not in the context, say you do not know."
    )
    full_prompt = (
        f"{system}\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{prompt}\n\n"
        f"Answer:"
    )
    payload = {"model": GEN_MODEL, "prompt": full_prompt, "stream": False}
    r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=300)
    r.raise_for_status()
    data = r.json()
    return data.get("response", "")

@app.on_event("startup")
def _startup():
    try:
        # quick ping to ensure ollama is reachable
        requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
    except Exception as e:
        print(f"[warn] ollama not reachable at startup: {e}")
    build_index()

@app.get("/health")
def health():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        r.raise_for_status()
        return {"status": "ok", "chunks": len(CHUNKS)}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ollama not ready: {e}")

@app.post("/ask")
def ask(body: AskBody):
    try:
        hits = retrieve(body.prompt, TOP_K)
        top_chunks = [CHUNKS[i] for i, _ in hits] if hits else []
        output = gen_with_context(body.prompt, top_chunks)
        return {"output": output, "used_chunks": len(top_chunks)}
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
