import React, { useState } from "react";
import "./AskTheOracle.css";
import { pipeline } from "@xenova/transformers";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [embedder, setEmbedder] = useState(null);

  async function ensureEmbedder() {
    if (!embedder) {
      const pipe = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
      setEmbedder(pipe);
      return pipe;
    }
    return embedder;
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!userInput.trim()) return;

    setAnswer("");
    setCitations([]);
    setLoading(true);

    try {
      const embedPipe = await ensureEmbedder();
      const output = await embedPipe(userInput, {
        pooling: "mean",
        normalize: true,
      });
      const queryEmbedding = Array.from(output.data);

      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userInput,
          query_embedding: queryEmbedding,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setAnswer(data.response || "");
      setCitations(Array.isArray(data.citations) ? data.citations : []);
    } catch (err) {
      console.error(err);
      setAnswer("❌ There was an error asking the Oracle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="oracle-wrapper">
      <div className="oracle-box">
        <h2>🧙 Speak to the Oracle</h2>

        <form onSubmit={handleAsk}>
          <input
            type="text"
            placeholder="Ask about your world, novel, or lore..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Consulting..." : "Ask"}
          </button>
        </form>

        {answer && (
          <div className="oracle-answer">
            <h3>📜 The Oracle says:</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{answer}</p>

            {citations.length > 0 && (
              <div className="oracle-citations">
                <small>
                  {citations.map((c, i) => (
                    <span key={i} style={{ marginRight: 8 }}>
                      [{c.title} • {c.source}]
                    </span>
                  ))}
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskTheOracle;
