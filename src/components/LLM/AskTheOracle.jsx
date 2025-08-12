import React, { useEffect, useState } from "react";
import "./AskTheOracle.css";

const API_BASE = process.env.REACT_APP_ORACLE_API || "http://localhost:5000";

// Lint-safe regex to remove [file#chunk123] citations
const CITE_RE = new RegExp("\\[[^\\]]*?#\\s*chunk\\s*\\d+\\]", "gi");
const stripCitations = (t = "") =>
  t
    .replace(CITE_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const ensureAwake = async (retries = 4) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const r = await fetch(`${API_BASE}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(id);
      if (r.ok) return true;
    } catch {}
    await new Promise((res) => setTimeout(res, 500 * (i + 1)));
  }
  return false;
};

const baseName = (path = "") => {
  const noChunk = path.split("#")[0] || path;
  const parts = noChunk.split("/");
  return parts[parts.length - 1] || noChunk;
};

// Build a categorized catalog from /list
function parseWorks(files = []) {
  const pretty = {
    novels: "Novels",
    screenplays: "Screenplays",
    short_stories: "Short Stories",
    thesis: "Thesis & Academic",
    summaries: "Summaries",
  };
  const titleCase = (s) => s.replace(/\.(txt|md)$/i, "").replace(/_/g, " ");

  const cats = {};
  const add = (cat, item) => {
    const key = pretty[cat] || "Other";
    if (!cats[key]) cats[key] = [];
    if (!cats[key].some((w) => w.path === item.path)) cats[key].push(item);
  };

  files
    .filter((f) => /\.(txt|md)$/i.test(f))
    .filter((f) => !/oracle_faq(\.|$)/i.test(f))
    .forEach((f) => {
      const [cat = "Other"] = f.split("/");
      add(cat, { title: titleCase(baseName(f)), path: f });
    });

  Object.keys(cats).forEach((k) =>
    cats[k].sort((a, b) => a.title.localeCompare(b.title)),
  );

  const order = [
    "Summaries",
    "Novels",
    "Screenplays",
    "Short Stories",
    "Thesis & Academic",
    "Other",
  ];
  const sorted = {};
  order.forEach((k) => {
    if (cats[k]?.length) sorted[k] = cats[k];
  });
  Object.keys(cats).forEach((k) => {
    if (!(k in sorted)) sorted[k] = cats[k];
  });
  return sorted;
}

const AskTheOracle = () => {
  const [userInput, setUserInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  const [sources, setSources] = useState([]);

  // Sidebar catalog
  const [catalog, setCatalog] = useState({});
  const [catalogNote, setCatalogNote] = useState("");

  // "quick" => /answer, "deep" => /deep_answer
  const [mode, setMode] = useState(
    () => window.localStorage?.getItem("oracleMode") || "deep",
  );
  const selectMode = (m) => {
    setMode(m);
    try {
      window.localStorage.setItem("oracleMode", m);
    } catch {}
  };

  // Wake on mount + fetch catalog
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setWaking(true);
      await ensureAwake();
      if (!isMounted) return;

      try {
        const r = await fetch(`${API_BASE}/list`, { cache: "no-store" });
        const data = await r.json();
        const files = Array.isArray(data.files_in_dir_sample)
          ? data.files_in_dir_sample
          : [];
        setCatalog(parseWorks(files));
        setCatalogNote(
          data.total_files_in_dir > files.length
            ? `Showing a subset of ${data.total_files_in_dir} files.`
            : "",
        );
      } catch {}
      if (isMounted) setWaking(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("");
    setError("");
    setSources([]);
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      setWaking(true);
      await ensureAwake();
      setWaking(false);

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

      let text = data.answer || "";
      if (!text && data.note) {
        text =
          "No model answer available yet. Showing the most relevant passages from your writing.";
      }
      setAnswer(stripCitations(text));

      const uniq = Array.from(
        new Set((data.matches || []).map((m) => (m.file || "").split("#")[0])),
      ).slice(0, 4);
      setSources(uniq);
    } catch {
      setError("Could not reach the Oracle");
    } finally {
      setLoading(false);
      setWaking(false);
    }
  }

  const insertPrompt = (p) => {
    setUserInput(p);
    const el = document.querySelector(".oracle-box form input");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasAnswer = !!(answer && !error);

  return (
    <div className="oracle-wrapper">
      {/* Centered max-width layout so the TOC sits farther right */}
      <div className="oracle-main-layout">
        <div className="oracle-grid">
          {/* Main Oracle (left column) */}
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
                {waking
                  ? "Waking the Oracle…"
                  : mode === "quick"
                    ? "Fast, concise answers."
                    : "Thorough map→reduce answer for big questions."}
              </div>
            </div>

            <form className="oracle-form" onSubmit={handleAsk}>
              <input
                type="text"
                placeholder="Ask about a thesis, character, scene, or theme"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button type="submit" disabled={loading || waking}>
                {loading
                  ? "Consulting..."
                  : waking
                    ? "Waking…"
                    : mode === "deep"
                      ? "Ask (Deep)"
                      : "Ask"}
              </button>
            </form>

            {/* Stable answer area: reserves space so header/toggle/input don't move */}
            <div
              className="oracle-answer"
              style={{
                textAlign: "left",
                transition: "opacity 160ms ease",
                marginTop: "1rem",
                minHeight: 260, // reserve space; tweak to taste
                opacity: hasAnswer ? 1 : 0.02,
              }}
            >
              <h3 style={{ textAlign: "left", marginTop: 0 }}>
                📜 The Oracle says {mode === "deep" ? "(Deep)" : ""}
              </h3>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "Segoe UI, Verdana, Arial, sans-serif",
                  fontSize: "1.15rem",
                  lineHeight: 1.7,
                  marginTop: 8,
                }}
              >
                {hasAnswer ? answer : "Ask a question to see an answer here."}
              </p>

              {mode === "deep" && sources.length > 0 && hasAnswer && (
                <div style={{ marginTop: 12, opacity: 0.85 }}>
                  <small>
                    <strong>Sources:</strong>{" "}
                    {sources.map((s, i) => (
                      <span key={s}>
                        {baseName(s)}
                        {i < sources.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar TOC (right column) */}
          <aside className="oracle-catalog">
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>
              📚 What I can answer about
            </h3>
            {catalogNote && (
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                {catalogNote}
              </div>
            )}

            {Object.keys(catalog).length === 0 ? (
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                {waking ? "Waking the Oracle…" : "No catalog to show yet."}
              </div>
            ) : (
              Object.entries(catalog).map(([cat, works]) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      margin: "8px 0 6px",
                    }}
                  >
                    {cat}
                  </div>
                  <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
                    {works.map((w) => (
                      <li key={w.path} style={{ marginBottom: 6 }}>
                        <button
                          onClick={() =>
                            insertPrompt(`Summarize "${w.title}".`)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1.4,
                            color: "#1a1a1a",
                          }}
                          title="Click to ask for a summary"
                        >
                          {w.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AskTheOracle;
