import React, { useState } from "react";
import OracleStatus from "./OracleStatus";

function AskTheOracle() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_ORACLE_API;

  async function handleAsk(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setCitations([]);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.response || "");
      setCitations(data.citations || []);
    } catch (err) {
      setResponse("Error talking to the Oracle.");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Wake button + status chip */}
      <div style={{ marginBottom: "1rem" }}>
        <OracleStatus />
      </div>

      {/* Chat form */}
      <form onSubmit={handleAsk} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the Oracle..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.5rem 1rem" }}
        >
          Ask
        </button>
      </form>

      {/* Loading */}
      {loading && <p>Consulting the Oracle...</p>}

      {/* Response */}
      {response && (
        <div style={{ marginTop: "1rem" }}>
          <p>{response}</p>
          {citations.length > 0 && (
            <ul>
              {citations.map((c, idx) => (
                <li key={idx}>
                  [{c.title} • {c.source}]
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AskTheOracle;
