# tools/build_corpus.py
# Steps 2 to 5: convert, clean, label, chunk -> artifacts/corpus

import os
import re
import json
import shutil
import subprocess
from pathlib import Path
from typing import List, Tuple
from unidecode import unidecode
import tiktoken

# ------------- Paths -------------
SITE_ROOT = Path(__file__).resolve().parents[1]
INPUT_ROOT = SITE_ROOT / "public" / "data" / "writing"
ARTIFACTS = SITE_ROOT / "artifacts" / "corpus"
TXT_STAGE = ARTIFACTS / "txt_clean"
CHUNKS_PATH = ARTIFACTS / "chunks.jsonl"
REPORT_PATH = ARTIFACTS / "report.txt"

ARTIFACTS.mkdir(parents=True, exist_ok=True)
TXT_STAGE.mkdir(parents=True, exist_ok=True)

# ------------- Converters -------------
try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

try:
    from docx import Document as DocxDocument
except Exception:
    DocxDocument = None

def convert_doc_to_docx(src: Path) -> Path | None:
    """
    Optional helper: if LibreOffice is installed, convert .doc to .docx.
    Returns the new .docx path or None on failure.
    """
    soffice = shutil.which("soffice") or r"C:\Program Files\LibreOffice\program\soffice.exe"
    if not Path(str(soffice)).exists():
        return None
    try:
        subprocess.run(
            [soffice, "--headless", "--convert-to", "docx", str(src), "--outdir", str(src.parent)],
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        outp = src.with_suffix(".docx")
        return outp if outp.exists() else None
    except Exception:
        return None

def read_any(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".doc":
        maybe = convert_doc_to_docx(path)
        if maybe and maybe.exists():
            path = maybe
            ext = ".docx"
        else:
            return ""
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

# ------------- Normalization and cleaning -------------
HEADER_PATTERNS = [
    r"^\s*\d+\s*$",                 # bare page number
    r"^Page\s+\d+\s*$",             # Page 12
    r"^Sam(uel)?\s+Vary\s*\d*\s*$", # example name header
]

def normalize_text(txt: str) -> str:
    txt = txt.replace("\r\n", "\n").replace("\r", "\n")
    txt = re.sub(r"(\w)-\n(\w)", r"\1\2", txt)           # de hyphenate line wraps
    txt = re.sub(r"[ \t]+\n", "\n", txt)                 # trim trailing spaces
    txt = re.sub(r"\n{3,}", "\n\n", txt)                 # collapse long blank runs
    txt = unidecode(txt)                                 # normalize unicode punctuation
    return txt.strip()

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
    parts = p.relative_to(INPUT_ROOT).parts
    if len(parts) >= 2:
        return f"{parts[0]} • {p.stem}"
    return p.stem

def ensure_section_headers(txt: str, default_title: str) -> str:
    if any(line.startswith("# ") for line in txt.splitlines()):
        return txt
    return f"# {default_title}\n\n{txt}"

# ------------- Chunking -------------
enc = tiktoken.get_encoding("cl100k_base")
TARGET = 1000
OVERLAP = 120

def token_ids(text):
    # Ensure we always pass a plain string to tiktoken
    if text is None:
        text = ""
    elif not isinstance(text, str):
        text = str(text)
    return enc.encode(text)

def ids_to_text(ids: List[int]) -> str:
    return enc.decode(ids)

def chunk_by_tokens(text: str, target: int = TARGET, overlap: int = OVERLAP) -> List[str]:
    """
    Robust token window chunker. Produces windows near target size
    even if the input has no blank lines or has very long paragraphs.
    """
    ids = token_ids(text)
    n = len(ids)
    if n == 0:
        return []
    chunks: List[str] = []
    start = 0
    while start < n:
        end = min(start + target, n)
        window = ids[start:end]
        chunks.append(ids_to_text(window))
        if end == n:
            break
        start = max(0, end - overlap)  # slide with overlap
    return chunks

def chunk_section(title: str, body: str) -> List[Tuple[str, str]]:
    """
    Try to respect blank line paragraphs, but fall back to token windows
    so we always get sensible chunk sizes.
    """
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    chunks: List[str] = []
    cur_texts: List[str] = []
    cur_ids: List[int] = []

    for p in paras:
        p_ids = token_ids(p)
        if len(p_ids) >= TARGET:
            if cur_ids:
                text = "\n\n".join(cur_texts)
                chunks.extend(chunk_by_tokens(text))
                cur_texts, cur_ids = [], []
            chunks.extend(chunk_by_tokens(p))  # hard split this big paragraph
            continue

        if cur_ids and len(cur_ids) + len(p_ids) > TARGET:
            text = "\n\n".join(cur_texts)
            chunks.extend(chunk_by_tokens(text))
            cur_texts, cur_ids = [p], p_ids
        else:
            cur_texts.append(p)
            cur_ids += p_ids

    if cur_texts:
        text = "\n\n".join(cur_texts)
        chunks.extend(chunk_by_tokens(text))

    return [(title, c) for c in chunks]

# ------------- Processing -------------
def process_file(src: Path):
    raw = read_any(src)
    if not raw or not raw.strip():
        print(f"[WARN] No text extracted from {src}")
        return []

    cleaned = normalize_text(raw)
    cleaned = strip_headers_footers(cleaned)
    titled = ensure_section_headers(cleaned, title_from_path(src))

    # write audit friendly clean text
    out_txt = TXT_STAGE / src.relative_to(INPUT_ROOT)
    out_txt = out_txt.with_suffix(".txt")
    out_txt.parent.mkdir(parents=True, exist_ok=True)
    out_txt.write_text(titled, encoding="utf-8")

    # split by explicit section headers that start with "# "
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
        for i, chunk in enumerate(chunk_section(title, body), 1):
            records.append({
                "id": f"{src.relative_to(INPUT_ROOT)}__{title}__{i:04d}".replace("\\", "/"),
                "work": src.parts[-2] if len(src.parts) >= 2 else "writing",
                "source": str(src.relative_to(INPUT_ROOT)).replace("\\", "/"),
                "title": title,
                "section": title,
                "text": str(chunk)  # ensure plain string
            })
    return records

def main():
    sources = []
    for ext in (".pdf", ".docx", ".txt", ".doc"):
        sources.extend(INPUT_ROOT.rglob(f"*{ext}"))

    all_recs = []
    for p in sorted(sources):
        try:
            recs = process_file(p)
            all_recs.extend(recs)
            print(f"Processed {p} with {len(recs)} chunks")
        except Exception as e:
            print(f"[ERROR] Skip {p} due to: {e}")

    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        for r in all_recs:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    avg_tokens = 0.0
    if all_recs:
        # lazy token count by characters is fine for a quick report, but we can estimate tokens too
        tok_counts = [len(token_ids(r["text"])) for r in all_recs]
        avg_tokens = sum(tok_counts) / len(tok_counts)

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
