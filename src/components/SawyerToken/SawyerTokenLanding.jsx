import React from "react";

const SawyerTokenLanding = () => {
  const contractAddress = "0xca6059bb703e95b10688c56a09f5a76375f9cf47";
  const sawyerImageUrl = "/assets/sawyer.png"; // Update with your actual image path
  const sawyerLogoUrl = "/icons/sawyer-logo.png"; // Add your logo file here

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        color: "#333",
        padding: 0,
        margin: 0,
      }}
    >
      <header
        style={{
          background: "#0b132b",
          color: "#fff",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1>Sawyer Token ($SWYR)</h1>
        <p>Empowering the next wave of decentralized creativity</p>
      </header>

      <main style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
        <section style={sectionStyle}>
          <a
            href="https://polygonscan.com/token/0xca6059bb703e95b10688c56a09f5a76375f9cf47"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={sawyerLogoUrl}
              alt="SWYR Logo"
              style={{
                width: "150px",
                height: "150px",
                display: "block",
                margin: "0 auto 2rem",
              }}
            />
          </a>
          <img
            src={sawyerImageUrl}
            alt="Sawyer the Dog"
            style={{
              width: "60%",
              height: "auto",
              display: "block",
              margin: "0 auto 1.5rem",
              borderRadius: "12px",
              border: "4px solid black",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          />
          <h2>Token Details</h2>
          <p>
            <strong>Name:</strong> Sawyer Token
          </p>
          <p>
            <strong>Symbol:</strong> SWYR
          </p>
          <p>
            <strong>Supply:</strong> 1,000,000,000 SWYR
          </p>
          <p>
            <strong>Network:</strong> Polygon (MATIC)
          </p>
          <p>
            <strong>Contract Address:</strong> <code>{contractAddress}</code>
          </p>
          <a
            href={`https://polygonscan.com/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            View on Polygonscan
          </a>
        </section>

        <section style={sectionStyle}>
          <h2>How to Buy</h2>
          <p>You can buy SWYR on QuickSwap once liquidity is available.</p>
          <a
            href="https://quickswap.exchange/#/swap"
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
          >
            Trade on QuickSwap
          </a>
        </section>

        <section style={sectionStyle}>
          <h2>About SWYR</h2>
          <p>
            $SWYR is a community-driven token launched for experimentation, fun,
            and learning in web3. It's not a security, not a financial
            instrument, and comes with no promises or roadmap.
          </p>
        </section>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          fontSize: "0.9rem",
          color: "#888",
        }}
      >
        &copy; 2025 Sawyer Token. This is a fun personal project and not
        financial advice.
      </footer>
    </div>
  );
};

const sectionStyle = {
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "2rem",
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

export default SawyerTokenLanding;
