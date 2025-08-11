# main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")

app = FastAPI()

# Allow your sites to call this
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
    model: str | None = None  # optional, falls back to env or server default

@app.get("/health")
def health():
    # shallow check of the local ollama
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        r.raise_for_status()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ollama not ready: {e}")

@app.post("/ask")
def ask(body: AskBody):
    model = body.model or os.getenv("MODEL_NAME", "llama3.1:8b-instruct-q4_K_M")
    payload = {"model": model, "prompt": body.prompt, "stream": False}
    try:
        r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        return {"output": data.get("response", ""), "model": model}
    except requests.HTTPError as e:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
