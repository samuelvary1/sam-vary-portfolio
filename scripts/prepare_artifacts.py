# scripts/prepare_artifacts.py
# Usage:
#   python scripts/prepare_artifacts.py --src public/data/writing --dst server/artifacts --zip
# Optional: --reload-url https://sam-vary-portfolio.onrender.com/reload --admin <secret>

import argparse, shutil, zipfile, pathlib, re, os
from typing import Optional

# light deps
try:
    import docx2txt
except Exception:
    docx2txt = None

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

SRC_DEFAULT = "public/data/writing"
DST_DEFAULT = "server/artifacts"

def clean_text(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def convert_docx(path: pathlib.Path) -> str:
    if docx2txt is None:
        raise RuntimeError("docx2txt is not installed")
    return docx2txt.process(str(path)) or ""

def convert_pdf(path: pathlib.Path) -> str:
    if PdfReader is None:
        raise RuntimeError("pypdf is not installed")
    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        txt = page.extract_text() or ""
        parts.append(txt)
    return "\n".join(parts)

def copy_or_convert(src_root: pathlib.Path, dst_root: pathlib.Path) -> tuple[int,int,int,int]:
    copied_txt, copied_md, converted_docx, converted_pdf = 0,0,0,0
    for p in src_root.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(src_root)
        dst = dst_root / rel
        dst.parent.mkdir(parents=True, exist_ok=True)

        try:
            if p.suffix.lower() in {".txt", ".md"}:
                shutil.copy2(p, dst)
                if p.suffix.lower() == ".txt":
                    copied_txt += 1
                else:
                    copied_md += 1
            elif p.suffix.lower() == ".docx":
                text = clean_text(convert_docx(p))
                dst = dst.with_suffix(".txt")
                dst.write_text(text, encoding="utf-8")
                converted_docx += 1
            elif p.suffix.lower() == ".pdf":
                text = clean_text(convert_pdf(p))
                dst = dst.with_suffix(".txt")
                dst.write_text(text, encoding="utf-8")
                converted_pdf += 1
            else:
                # skip other types
                pass
        except Exception as e:
            print(f"Skipping {p} due to error: {e}")

    return copied_txt, copied_md, converted_docx, converted_pdf

def make_zip(dst_root: pathlib.Path, zip_path: pathlib.Path):
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in dst_root.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(dst_root))
    print(f"Built {zip_path}")

def maybe_reload(url: Optional[str], admin: Optional[str]):
    if not url:
        return
    try:
        import requests
        headers = {}
        if admin:
            headers["X-Oracle-Admin"] = admin
        r = requests.post(url, headers=headers, timeout=20)
        print("Reload:", r.status_code, r.text[:200])
    except Exception as e:
        print("Reload failed:", e)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=SRC_DEFAULT)
    ap.add_argument("--dst", default=DST_DEFAULT)
    ap.add_argument("--zip", action="store_true")
    ap.add_argument("--reload-url", default=None)
    ap.add_argument("--admin", default=None)
    args = ap.parse_args()

    src_root = pathlib.Path(args.src).resolve()
    dst_root = pathlib.Path(args.dst).resolve()
    dst_root.mkdir(parents=True, exist_ok=True)

    ct, cm, cdocx, cpdf = copy_or_convert(src_root, dst_root)
    print(f"Copied txt {ct}, md {cm}, converted docx {cdocx}, pdf {cpdf}")

    if args.zip:
        zip_path = pathlib.Path("artifacts.zip").resolve()
        make_zip(dst_root, zip_path)

    if args.reload_url:
        maybe_reload(args.reload_url, args.admin)

if __name__ == "__main__":
    main()
