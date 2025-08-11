import React, { useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setCitations([]);
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error contacting the Oracle");
        return;
      }

      setAnswer(data.response || "");
      setCitations(Array.isArray(data.citations) ? data.citations : []);
    } catch (err) {
      setError("Could not reach the Oracle");
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

        {error && (
          <div className="oracle-error">
            <p>{error}</p>
          </div>
        )}

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
