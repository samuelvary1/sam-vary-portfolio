import { useState } from "react";

async function wakePod() {
  const API_KEY = process.env.REACT_APP_RUNPOD_API_KEY;
  const POD_ID = process.env.REACT_APP_RUNPOD_POD_ID;

  const resp = await fetch(`https://api.runpod.io/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${API_KEY}`,
    },
    body: JSON.stringify({
      query: `
        mutation {
          podResume(input: { podId: "${POD_ID}" }) {
            id
            desiredStatus
          }
        }
      `,
    }),
  });

  const data = await resp.json();
  console.log("WakePod response:", data);
  return data;
}

function OracleStatus() {
  const [status, setStatus] = useState("Idle");
  const API_URL = process.env.REACT_APP_ORACLE_API;

  async function handleWake() {
    setStatus("Starting pod...");
    await wakePod();

    setStatus("Warming up...");
    let ready = false;
    while (!ready) {
      try {
        const res = await fetch(`${API_URL}/wake`);
        const data = await res.json();
        if (data.status === "ready") {
          ready = true;
          setStatus("Ready");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <div
        style={{
          padding: "0.5rem",
          background: status === "Ready" ? "green" : "orange",
          color: "white",
          borderRadius: "4px",
        }}
      >
        {status}
      </div>
      <button onClick={handleWake} style={{ padding: "0.5rem 1rem" }}>
        Wake Oracle
      </button>
    </div>
  );
}

export default OracleStatus;
