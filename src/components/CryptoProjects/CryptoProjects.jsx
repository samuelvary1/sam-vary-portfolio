import React from "react";
// import CryptoDashboard from "./CryptoDashboard"; // Hidden for now
import "./CryptoProjects.css";

const CryptoProjects = () => {
  const sawyerImageUrl = "/assets/sawyer-beach.png";
  const twanImageUrl = "/assets/twan-art.png";
  const sawboneImageUrl = "/assets/sawbone-art.png";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        minHeight: "100vh",
        minWidth: "100vw",
        color: "#333",
        padding: 0,
        margin: 0,
        width: "100vw",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "120px",
          paddingBottom: "80px",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "3.5rem",
            letterSpacing: "-1px",
            color: "#222",
            textShadow: "0 2px 8px rgba(0,0,0,0.07)",
          }}
        >
          Homemade Cryptocurrencies
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
            maxWidth: "1200px",
          }}
        >
          {/* Sawyer Token Card */}
          <div
            className="crypto-card-link"
            style={{
              height: "auto",
              boxSizing: "border-box",
              marginBottom: "2rem",
            }}
          >
            <div style={cardImageWrapper}>
              <img src={sawyerImageUrl} alt="Sawyer Token" style={cardImage} />
            </div>
            <h3>Sawyer Token</h3>
            <div style={chainLabel}>
              Built on <b>Polygon</b>
            </div>
            <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              <a
                href="https://sawyertoken.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  display: "block",
                  marginBottom: "0.75rem",
                }}
              >
                Visit SawyerToken.com
              </a>
              <a
                href="https://polygonscan.com/token/0xca6059bb703e95b10688c56a09f5a76375f9cf47"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6b7280",
                  display: "block",
                }}
              >
                View Contract
              </a>
            </div>
          </div>

          {/* Twan Token Card */}
          <div
            className="crypto-card-link"
            style={{
              height: "auto",
              boxSizing: "border-box",
              marginBottom: "2rem",
            }}
          >
            <div style={cardImageWrapper}>
              <img src={twanImageUrl} alt="Twan Token" style={cardImage} />
            </div>
            <h3>Twan Token</h3>
            <div style={chainLabel}>
              Built on <b>Ethereum</b>
            </div>
            <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              <a
                href="https://twantoken.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  display: "block",
                  marginBottom: "0.75rem",
                }}
              >
                Visit TwanToken.com
              </a>
              <a
                href="https://etherscan.io/token/0xbD63095C802ACcAa86e3eBe5cf7c45F7d79899B0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6b7280",
                  display: "block",
                }}
              >
                View Contract
              </a>
            </div>
          </div>

          {/* Sawbone Coin Card */}
          <div
            className="crypto-card-link"
            style={{
              height: "auto",
              boxSizing: "border-box",
              marginBottom: "2rem",
            }}
          >
            <div style={cardImageWrapper}>
              <img src={sawboneImageUrl} alt="Sawbone Coin" style={cardImage} />
            </div>
            <h3>Sawbone Coin</h3>
            <div style={chainLabel}>
              Built on <b>Solana</b>
            </div>
            <div style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              <a
                href="https://sawbonecoin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  display: "block",
                  marginBottom: "0.75rem",
                }}
              >
                Visit SawboneCoin.com
              </a>
              <a
                href="https://solscan.io/token/HvhkPGGjByxnXzR8eWLqTn8LEY9DS8J3y8TF9ENopump"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6b7280",
                  display: "block",
                }}
              >
                View Contract
              </a>
            </div>
          </div>
        </div>

        {/* 🔽 Dashboard Below */}
        {/* <div style={{ width: "100%", marginTop: "4rem", maxWidth: "1200px" }}>
          <CryptoDashboard />
        </div> */}
      </div>
    </div>
  );
};

const cardImageWrapper = {
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  borderRadius: "8px",
  marginBottom: "1rem",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const chainLabel = {
  fontSize: "0.98rem",
  color: "#666",
  marginBottom: "0.5rem",
};

const buttonStyle = {
  display: "inline-block",
  padding: "0.75rem 1.25rem",
  backgroundColor: "#3a86ff",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "6px",
  marginTop: "1rem",
};

export default CryptoProjects;
