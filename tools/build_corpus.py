# LLM python script.py

# tools/build_corpus.py
# Steps 2 to 5: convert, clean, label, chunk

import re
import json
from pathlib import Path
from typing import List, Tuple
from unidecode import unidecode
import tiktoken

# Paths
SITE_ROOT = Path(__file__).resolve().parents[1]
INPUT_ROOT = SITE_ROOT / "public" / "data" / "writing"
ARTIFACTS = SITE_ROOT / "artifacts" / "corpus"
TXT_STAGE = ARTIFACTS / "txt_clean"
CHUNKS_PATH = ARTIFACTS / "chunks.jsonl"
REPORT_PATH = ARTIFACTS / "report.txt"

ARTIFACTS.mkdir(parents=True, exist_ok=True)
TXT_STAGE.mkdir(parents=True, exist_ok=True)

# Converters
try:
    from pypdf import PdfReader
except Exception as e:
    PdfReader = None

try:
    from docx import Document as DocxDocument
except Exception as e:
    DocxDocument = None

def read_any(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".pdf":
        assert PdfReader, "Install pypdf"
        text_parts = []
        reader = PdfReader(str(path))
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
        return "\n".join(text_parts)
    if ext == ".docx":
        assert DocxDocument, "Install python-docx"
        d = DocxDocument(str(path))
        return "\n".join(p.text for p in d.paragraphs)
    if ext == ".txt":
        return path.read_text(errors="ignore", encoding="utf-8")
    return ""

def normalize_text(txt: str) -> str:
    # unify newlines
    txt = txt.replace("\r\n", "\n").replace("\r", "\n")
    # de hyphenate line breaks like know-\nledge
    txt = re.sub(r"(\w)-\n(\w)", r"\1\2", txt)
    # remove trailing spaces
    txt = re.sub(r"[ \t]+\n", "\n", txt)
    # collapse long blank runs
    txt = re.sub(r"\n{3,}", "\n\n", txt)
    # normalize unicode punctuation
    txt = unidecode(txt)
    return txt.strip()

# Simple repeated header and page number cleaner
HEADER_PATTERNS = [
    r"^\s*\d+\s*$",                 # bare page number line
    r"^Page\s+\d+\s*$",             # Page 12
    r"^Sam(uel)?\s+Vary\s*\d*\s*$", # your name header variant
]

def strip_headers_footers(txt: str) -> str:
    keep = []
    for ln in txt.splitlines():
        if any(re.match(p, ln) for p in HEADER_PATTERNS):
            continue
        keep.append(ln)
    out = "\n".join(keep)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()

def title_from_path(p: Path) -> str:
    # Use folder and file stem to create a nice default section title
    parts = p.relative_to(INPUT_ROOT).parts
    if len(parts) >= 2:
        return f"{parts[0]} • {p.stem}"
    return p.stem

def ensure_section_headers(txt: str, default_title: str) -> str:
    # If the text already has lines that begin with "# " keep them
    if any(line.startswith("# ") for line in txt.splitlines()):
        return txt
    # Otherwise add one header at top
    return f"# {default_title}\n\n{txt}"

# Chunking
enc = tiktoken.get_encoding("cl100k_base")
TARGET = 1000
OVERLAP = 120

def token_count(s: str) -> int:
    return len(enc.encode(s))

def chunk_paragraphs(paras: List[str]) -> List[str]:
    chunks: List[str] = []
    cur: List[str] = []
    cur_tokens = 0
    for p in paras:
        ptok = token_count(p)
        if cur and cur_tokens + ptok > TARGET:
            joined = "\n\n".join(cur)
            chunks.append(joined)
            # create overlap tail
            tail_ids = enc.encode(joined)[-OVERLAP:]
            tail = enc.decode(tail_ids)
            cur = [tail, p]
            cur_tokens = token_count("\n\n".join(cur))
        else:
            cur.append(p)
            cur_tokens += ptok
    if cur:
        chunks.append("\n\n".join(cur))
    return chunks

def chunk_text(txt: str) -> List[Tuple[str, str]]:
    # split on blank lines as paragraphs
    paras = [p.strip() for p in txt.split("\n\n") if p.strip()]
    return [(f"Section {i+1}", ck) for i, ck in enumerate(chunk_paragraphs(paras))]

def process_file(src: Path):
    raw = read_any(src)
    if not raw.strip():
        return []
    cleaned = normalize_text(raw)
    cleaned = strip_headers_footers(cleaned)
    titled = ensure_section_headers(cleaned, title_from_path(src))

    # write a clean txt for audit
    out_txt = TXT_STAGE / src.relative_to(INPUT_ROOT)
    out_txt = out_txt.with_suffix(".txt")
    out_txt.parent.mkdir(parents=True, exist_ok=True)
    out_txt.write_text(titled, encoding="utf-8")

    # section aware chunking
    records = []
    lines = titled.splitlines()
    sections = []
    cur_title = None
    buf = []
    for line in lines:
        if line.startswith("# "):
            if cur_title and buf:
                sections.append((cur_title, "\n".join(buf).strip()))
                buf = []
            cur_title = line[2:].strip()
        else:
            buf.append(line)
    if cur_title and buf:
        sections.append((cur_title, "\n".join(buf).strip()))

    for title, body in sections:
        paras = [p.strip() for p in body.split("\n\n") if p.strip()]
        for i, chunk in enumerate(chunk_paragraphs(paras), 1):
            records.append({
                "id": f"{src.relative_to(INPUT_ROOT)}__{title}__{i:04d}".replace("\\", "/"),
                "work": src.parts[-2] if len(src.parts) >= 2 else "writing",
                "source": str(src.relative_to(INPUT_ROOT)).replace("\\", "/"),
                "title": title,
                "section": title,
                "text": chunk
            })
    return records

def main():
    sources = []
    for ext in (".pdf", ".docx", ".txt"):
        sources.extend(INPUT_ROOT.rglob(f"*{ext}"))

    all_recs = []
    for p in sorted(sources):
        try:
            recs = process_file(p)
            all_recs.extend(recs)
            print(f"Processed {p} with {len(recs)} chunks")
        except Exception as e:
            print(f"Skip {p} due to error: {e}")

    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        for r in all_recs:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    avg_tokens = 0
    if all_recs:
        counts = [token_count(r["text"]) for r in all_recs]
        avg_tokens = sum(counts) / len(counts)

    report = [
        f"Input root: {INPUT_ROOT}",
        f"Clean txt folder: {TXT_STAGE}",
        f"Chunks file: {CHUNKS_PATH}",
        f"Files seen: {len(sources)}",
        f"Chunks written: {len(all_recs)}",
        f"Average chunk tokens: {avg_tokens:.1f}",
    ]
    REPORT_PATH.write_text("\n".join(report), encoding="utf-8")
    print("\n".join(report))

if __name__ == "__main__":
    main()
