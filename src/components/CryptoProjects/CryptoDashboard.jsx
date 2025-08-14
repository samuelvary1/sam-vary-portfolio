import React, { useEffect, useState } from "react";
import axios from "axios";

const TOKENS = [
  {
    name: "Sawyer Token",
    symbol: "SWYR",
    chain: "Polygon",
    address: "0xCa6059bB703E95B10688c56a09f5a76375f9CF47",
    dexscreenUrl:
      "https://dexscreener.com/polygon/0xCa6059bB703E95B10688c56a09f5a76375f9CF47",
  },
  {
    name: "Twan Token",
    symbol: "TWAN",
    chain: "Ethereum",
    address: "0xbD63095C802ACcAa86e3eBe5cf7c45F7d79899B0",
    dexscreenUrl:
      "https://dexscreener.com/ethereum/0xbd63095c802acca86e3ebe5cf7c45f7d79899b0",
  },
  {
    name: "Sawbone Coin",
    symbol: "SAWBONE",
    chain: "Solana",
    address: "HvhkPGGjByxnXzR8eWLqTn8LEY9DS8J3y8TF9ENopump",
    dexscreenUrl:
      "https://dexscreener.com/solana/HvhkPGGjByxnXzR8eWLqTn8LEY9DS8J3y8TF9ENopump",
  },
];

const fetchTokenData = async (address) => {
  const url = `https://api.dexscreener.com/latest/dex/search/?q=${address}`;
  try {
    const res = await axios.get(url);
    return res.data.pairs[0] || null;
  } catch {
    return null;
  }
};

const Meter = ({ label, value, max }) => {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "14px", marginBottom: "4px" }}>{label}</div>
      <div
        style={{
          backgroundColor: "#eee",
          borderRadius: "6px",
          height: "10px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            backgroundColor: "#22c55e",
            height: "10px",
            borderRadius: "6px",
          }}
        />
      </div>
    </div>
  );
};

export default function CryptoDashboard() {
  const [tokenData, setTokenData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const allData = {};
      for (const token of TOKENS) {
        const data = await fetchTokenData(token.address);
        if (data) allData[token.symbol] = data;
      }
      setTokenData(allData);
    })();
  }, [isOpen]);

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.75rem 1.25rem",
          backgroundColor: "#3a86ff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        {isOpen ? "Hide Live Dashboard" : "Show Live Dashboard"}
      </button>

      {isOpen && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {TOKENS.map((token) => {
            const data = tokenData[token.symbol];
            return (
              <div
                key={token.symbol}
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  border: "1px solid #ddd",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {token.name} ({token.symbol})
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    marginBottom: "1rem",
                  }}
                >
                  Chain: {token.chain}
                </p>
                {data ? (
                  <>
                    <p style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                      💰 Price: ${parseFloat(data.priceUsd).toFixed(6)}
                    </p>
                    <p style={{ marginBottom: "0.25rem" }}>
                      💧 Liquidity: $
                      {Number(data.liquidity.usd).toLocaleString()}
                    </p>
                    <p style={{ marginBottom: "0.25rem" }}>
                      📈 24h Volume: ${Number(data.volume.h24).toLocaleString()}
                    </p>
                    <p style={{ marginBottom: "1rem" }}>👥 Holders: —</p>
                    <Meter
                      label="Liquidity"
                      value={Number(data.liquidity.usd)}
                      max={5000}
                    />
                    <Meter
                      label="24h Volume"
                      value={Number(data.volume.h24)}
                      max={1000}
                    />
                    <a
                      href={token.dexscreenUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.9rem",
                        color: "#3a86ff",
                        textDecoration: "underline",
                        display: "inline-block",
                        marginTop: "1rem",
                      }}
                    >
                      View on DexScreener ↗
                    </a>
                  </>
                ) : (
                  <p style={{ color: "#999" }}>Loading data...</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
