// scripts/make_embeddings_local.mjs
import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

const ARTIFACTS_DIR = path.resolve("artifacts");
const OUT = path.resolve("public/oracle_embeddings.json");
const CHUNK_SIZE = 1200;
const OVERLAP = 200;

// mean pooled sentence embeddings from a small model
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

function* chunkText(t, size, overlap) {
  let i = 0;
  while (i < t.length) {
    yield t.slice(i, i + size);
    i += Math.max(1, size - overlap);
  }
}

function readAllFiles(dir) {
  const out = [];
  const exts = new Set([".txt", ".md", ".markdown", ".json", ".csv"]);
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const s = fs.statSync(p);
      if (s.isDirectory()) stack.push(p);
      else if (exts.has(path.extname(name).toLowerCase())) out.push(p);
    }
  }
  return out;
}

async function embedOne(text) {
  const r = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(r.data); // Float32Array -> plain array
}

async function main() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.error("No ./artifacts folder found");
    process.exit(1);
  }
  const files = readAllFiles(ARTIFACTS_DIR);
  if (files.length === 0) {
    console.error("No text files in ./artifacts");
    process.exit(1);
  }

  const rows = [];
  let total = 0;

  for (const file of files) {
    let txt = "";
    try {
      if (file.endsWith(".json")) txt = JSON.stringify(JSON.parse(fs.readFileSync(file, "utf8")));
      else txt = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    let idx = 0;
    for (const chunk of chunkText(txt, CHUNK_SIZE, OVERLAP)) {
      const id = `${path.relative(ARTIFACTS_DIR, file)}#${idx++}`;
      const embedding = await embedOne(chunk);
      rows.push({ id, text: chunk, embedding });
      total++;
      if (total % 10 === 0) process.stdout.write(`\rChunks: ${total}`);
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(rows));
  console.log(`\nWrote ${rows.length} chunks to ${OUT}`);
}

main();
