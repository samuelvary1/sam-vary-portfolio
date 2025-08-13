import React from "react";
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
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          paddingTop: "80px",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "2.5rem",
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
          }}
        >
          {/* Sawyer Token Card */}
          <a
            href="https://sawyertoken.com"
            target="_blank"
            rel="noopener noreferrer"
            className="crypto-card-link"
            style={{ height: 420, boxSizing: "border-box" }}
          >
            <div style={cardImageWrapper}>
              <img src={sawyerImageUrl} alt="Sawyer Token" style={cardImage} />
            </div>
            <h3>Sawyer Token</h3>
            <div style={chainLabel}>
              Built on <b>Polygon</b>
            </div>
            <div style={buttonStyle}>Visit SawyerToken.com</div>
          </a>

          {/* Twan Token Card */}
          <a
            href="https://twantoken.com"
            target="_blank"
            rel="noopener noreferrer"
            className="crypto-card-link"
            style={{ height: 420, boxSizing: "border-box" }}
          >
            <div style={cardImageWrapper}>
              <img src={twanImageUrl} alt="Twan Token" style={cardImage} />
            </div>
            <h3>Twan Token</h3>
            <div style={chainLabel}>
              Built on <b>Ethereum</b>
            </div>
            <div style={buttonStyle}>Visit TwanToken.com</div>
          </a>

          {/* Sawbone Coin Card */}
          <a
            href="https://sawbonecoin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="crypto-card-link"
            style={{ height: 420, boxSizing: "border-box" }}
          >
            <div style={cardImageWrapper}>
              <img src={sawboneImageUrl} alt="Sawbone Coin" style={cardImage} />
            </div>
            <h3>Sawbone Coin</h3>
            <div style={chainLabel}>
              Built on <b>Solana</b>
            </div>
            <div style={buttonStyle}>Visit SawboneCoin.com</div>
          </a>
        </div>
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
