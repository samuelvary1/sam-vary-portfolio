# tools/audit_corpus.py
from pathlib import Path
import json, statistics

ROOT = Path(__file__).resolve().parents[1]
CHUNKS = ROOT / "artifacts" / "corpus" / "chunks.jsonl"

by_work = {}
by_source = {}

n = 0
lens = []

with open(CHUNKS, "r", encoding="utf-8") as f:
    for line in f:
        r = json.loads(line)
        n += 1
        t = r["text"].strip()
        lens.append(len(t))
        by_work.setdefault(r["work"], 0)
        by_work[r["work"]] += 1
        by_source.setdefault(r["source"], 0)
        by_source[r["source"]] += 1

print(f"Total chunks: {n}")
if lens:
    print(f"Median chunk chars: {int(statistics.median(lens))}")
print("\nChunks by work:")
for k, v in sorted(by_work.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

print("\nTop 20 sources:")
for i, (k, v) in enumerate(sorted(by_source.items(), key=lambda x: -x[1])[:20], 1):
    print(f"{i:2d}. {k} -> {v}")
