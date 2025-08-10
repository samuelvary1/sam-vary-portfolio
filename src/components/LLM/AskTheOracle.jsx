import React, { useEffect, useRef, useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ready"); // ready | sleeping | waking | error
  const lastQuestion = useRef("");

  useEffect(() => {
    checkHealth();
    const id = setInterval(() => {
      if (status === "ready") fetch(`${API_BASE}/health`).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, [status]);

  async function checkHealth() {
    try {
      const r = await fetch(`${API_BASE}/health`, { cache: "no-store" });
      setStatus(r.ok ? "ready" : "sleeping");
    } catch {
      setStatus("sleeping");
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setCitations([]);
    setLoading(true);
    lastQuestion.current = userInput;

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!res.ok) {
        setStatus("sleeping");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAnswer(data.response || "");
      setCitations(Array.isArray(data.citations) ? data.citations : []);
      setStatus("ready");
    } catch {
      setStatus("sleeping");
    } finally {
      setLoading(false);
    }
  }

  async function wakeOracle() {
    setStatus("waking");
    try {
      const r = await fetch("/api/oracle-wake", { method: "POST" });
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "Wake failed");

      const base = data.apiBase || API_BASE;
      const deadline = Date.now() + 120000;

      while (Date.now() < deadline) {
        try {
          const h = await fetch(`${base}/health`, { cache: "no-store" });
          if (h.ok) {
            setStatus("ready");
            return true;
          }
        } catch {}
        await new Promise((res) => setTimeout(res, 3000));
      }
      throw new Error("Backend did not come up in time");
    } catch {
      setStatus("error");
      return false;
    }
  }

  async function handleWakeAndRetry() {
    const ok = await wakeOracle();
    if (ok && lastQuestion.current) {
      await new Promise((r) => setTimeout(r, 1200));
      setUserInput(lastQuestion.current);
      await handleAsk({ preventDefault: () => {} });
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
          <button type="submit" disabled={loading || status === "waking"}>
            {loading ? "Consulting..." : "Ask"}
          </button>
        </form>

        {status === "sleeping" && (
          <div className="oracle-wake">
            <p>The Oracle is sleeping. Wake it?</p>
            <button onClick={handleWakeAndRetry} disabled={status === "waking"}>
              {status === "waking" ? "Starting..." : "Wake the Oracle"}
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="oracle-error">
            <p>Could not reach the Oracle. Try waking again.</p>
            <button onClick={handleWakeAndRetry}>Wake the Oracle</button>
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
