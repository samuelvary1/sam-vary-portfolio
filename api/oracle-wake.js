// api/oracle-wake.js
// Wakes your RunPod pod, waits until it is RUNNING, then returns your API base

const RUNPOD_API = "https://rest.runpod.io/v1";
const POD_ID = process.env.RUNPOD_POD_ID;
const API_KEY = process.env.RUNPOD_API_KEY;
const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000"; // your FastAPI public URL

async function startPod() {
  const res = await fetch(`${RUNPOD_API}/pods/${POD_ID}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`RunPod start failed ${res.status}`);
}

async function getPodState() {
  const r = await fetch(`${RUNPOD_API}/pods/${POD_ID}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`RunPod query failed ${r.status}`);
  const j = await r.json();
  return j?.pod?.state || j?.state || "UNKNOWN";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    if (!POD_ID || !API_KEY) {
      res.status(500).json({ ok: false, error: "Missing RUNPOD env vars" });
      return;
    }

    await startPod();

    // Poll for up to two minutes
    const deadline = Date.now() + 2 * 60 * 1000;
    let state = "PENDING";
    while (Date.now() < deadline) {
      state = await getPodState();
      if (state === "RUNNING") break;
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (state !== "RUNNING") {
      res.status(504).json({ ok: false, state });
      return;
    }

    res.json({ ok: true, apiBase: API_BASE });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
};
