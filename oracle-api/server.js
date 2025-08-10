// oracle-api/server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.post("/wake", (_req, res) =>
  res.json({ ok: true, apiBase: "http://localhost:5000" }),
);

app.post("/ask", async (req, res) => {
  const { prompt } = req.body || {};
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }
  try {
    // simple non streaming call, replace with your preferred model
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt || "" }],
        temperature: 0.7,
      }),
    });
    const j = await r.json();
    const text =
      j?.choices?.[0]?.message?.content?.trim() ||
      j?.error?.message ||
      "No answer";
    res.json({
      response: text,
      citations: [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Request failed" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Oracle API on http://localhost:${port}`));
