import React, { useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // "quick" => /answer, "deep" => /deep_answer
  const [mode, setMode] = useState(
    () => window.localStorage?.getItem("oracleMode") || "quick",
  );

  function selectMode(m) {
    setMode(m);
    try {
      window.localStorage.setItem("oracleMode", m);
    } catch {}
  }

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setError("");
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const endpoint = mode === "deep" ? "/deep_answer" : "/answer";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error contacting the Oracle");
        return;
      }

      // graceful fallback if model disabled
      if (!data.answer && data.note) {
        setAnswer(
          "No model answer available yet. Showing the most relevant passages from your writing.",
        );
      } else {
        setAnswer(data.answer || "");
      }

      // (Optional) If you want to surface deep mode coverage:
      // if (mode === "deep" && typeof data.notes_used === "number") {
      //   setAnswer((prev) => `${prev}\n\n— (Built from ${data.notes_used} notes)`);
      // }
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
            marginBottom: "1.25rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <span role="img" aria-label="oracle" style={{ marginRight: 8 }}>
            🧙
          </span>
          Speak to the Oracle
        </h2>

        {/* Mode toggle */}
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 999,
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => selectMode("quick")}
              className="oracle-toggle"
              style={{
                padding: "0.5rem 0.9rem",
                border: "none",
                cursor: "pointer",
                background: mode === "quick" ? "#222" : "transparent",
                color: mode === "quick" ? "#fff" : "#333",
                fontWeight: 600,
              }}
            >
              Quick
            </button>
            <button
              type="button"
              onClick={() => selectMode("deep")}
              className="oracle-toggle"
              style={{
                padding: "0.5rem 0.9rem",
                border: "none",
                cursor: "pointer",
                background: mode === "deep" ? "#222" : "transparent",
                color: mode === "deep" ? "#fff" : "#333",
                fontWeight: 600,
              }}
            >
              Deep
            </button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            {mode === "quick"
              ? "Fast, concise answers."
              : "Thorough map→reduce answer for big questions."}
          </div>
        </div>

        <form onSubmit={handleAsk}>
          <input
            type="text"
            placeholder="Ask about a thesis, character, scene, or theme"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Consulting..." : mode === "deep" ? "Ask (Deep)" : "Ask"}
          </button>
        </form>

        {error && (
          <div className="oracle-error">
            <p>{error}</p>
          </div>
        )}

        {answer && !error && (
          <div className="oracle-answer" style={{ textAlign: "left" }}>
            <h3 style={{ textAlign: "left" }}>
              📜 The Oracle says {mode === "deep" ? "(Deep)" : ""}
            </h3>
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
