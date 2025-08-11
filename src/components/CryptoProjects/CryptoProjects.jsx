import React from "react";

const CryptoProjects = () => {
  const sawyerImageUrl = "/assets/sawyer-beach.png"; // Update with your actual image path
  const twanImageUrl = "/assets/twan-art.png"; // Update with your actual image path for Twan

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
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Only Token Cards Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
          minHeight: "calc(100vh - 80px)",
          marginTop: "64px",
        }}
      >
        {/* Sawyer Token Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            padding: "1.5rem",
            width: "260px",
            textAlign: "center",
          }}
        >
          <img
            src={sawyerImageUrl}
            alt="Sawyer Token"
            style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
          />
          <h3>Sawyer Token</h3>
          <a
            href="https://sawyertoken.com"
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            Visit SawyerToken.com
          </a>
        </div>
        {/* Twan Token Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            padding: "1.5rem",
            width: "260px",
            textAlign: "center",
          }}
        >
          <img
            src={twanImageUrl}
            alt="Twan Token"
            style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
          />
          <h3>Twan Token</h3>
          <a
            href="https://twantoken.com"
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            Visit TwanToken.com
          </a>
        </div>
      </div>

      {/* ...no main content or footer... */}
    </div>
  );
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
