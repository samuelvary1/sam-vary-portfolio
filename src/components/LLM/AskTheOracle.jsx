import React, { useState } from "react";
import "./AskTheOracle.css"; // Optional: add your styles here

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await res.json();
      setAnswer(data.response);
    } catch (err) {
      setAnswer("⚠️ Something went wrong talking to the Oracle.");
    } finally {
      setLoading(false);
    }
  };

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
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskTheOracle;
