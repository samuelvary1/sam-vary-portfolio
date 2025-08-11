import React, { useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  // ...existing code...
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setError("");
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error contacting the Oracle");
        return;
      }

      setAnswer(data.answer || "");

      // Friendly fallback when no model key is set server side
      if (!data.answer && data.note) {
        setAnswer(
          "No model answer available yet. Showing the most relevant passages from your writing.",
        );
      }
    } catch {
      setError("Could not reach the Oracle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="oracle-wrapper">
      <div className="oracle-box" style={{ textAlign: "center" }}>
        <h2
          style={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: "10px",
            padding: "0.75rem 1.5rem",
            display: "inline-block",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontWeight: 700,
            fontSize: "2rem",
            marginBottom: "1.5rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <span role="img" aria-label="oracle" style={{ marginRight: 8 }}>
            🧙
          </span>
          Speak to the Oracle
        </h2>

        <form onSubmit={handleAsk}>
          <input
            type="text"
            placeholder="Ask about a thesis, character, scene, or theme"
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

        {answer && !error && (
          <div className="oracle-answer" style={{ textAlign: "left" }}>
            <h3 style={{ textAlign: "left" }}>📜 The Oracle says</h3>
            <p
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "Segoe UI, Verdana, Arial, sans-serif",
                fontSize: "1.15rem",
                lineHeight: 1.7,
              }}
            >
              {answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskTheOracle;
