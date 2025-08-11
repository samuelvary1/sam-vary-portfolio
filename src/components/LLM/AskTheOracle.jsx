import React, { useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

function snippet(text, query) {
  const t = text || "";
  const terms = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  let idx = -1;
  for (const term of terms) {
    const i = t.toLowerCase().indexOf(term);
    if (i !== -1) {
      idx = i;
      break;
    }
  }
  if (idx === -1) idx = 0;
  const start = Math.max(0, idx - 140);
  const end = Math.min(t.length, idx + 280);
  return t.slice(start, end).replace(/\s+/g, " ");
}

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setMatches([]);
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
      setMatches(Array.isArray(data.matches) ? data.matches : []);

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
      <div className="oracle-box">
        <h2>🧙 Speak to the Oracle</h2>

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

        {(answer || matches.length > 0) && !error && (
          <div className="oracle-answer">
            {answer && (
              <>
                <h3>📜 The Oracle says</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{answer}</p>
              </>
            )}

            {matches.length > 0 && (
              <div className="oracle-citations">
                <h4 style={{ marginTop: 16 }}>Supporting passages</h4>
                <ul className="oracle-passages">
                  {matches.map((m, i) => (
                    <li key={i} className="oracle-passage">
                      <div className="oracle-file">
                        {m.file} • score{" "}
                        {typeof m.score === "number"
                          ? m.score.toFixed(3)
                          : m.score}
                      </div>
                      <div className="oracle-snippet">
                        {snippet(m.text, userInput)}…
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskTheOracle;
