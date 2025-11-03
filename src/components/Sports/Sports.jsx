import React from "react";
import { Link } from "react-router-dom";
import "./Sports.css";

const Sports = () => {
  return (
    <div className="sports-container">
      <div className="sports-content">
        <h1 className="sports-title">My Sports Teams</h1>

        <div className="teams-grid">
          {/* New York Mets Card */}
          <Link to="/sports/mets" className="team-card mets-card">
            <div className="team-logo-container">
              <img
                src="/assets/mets-logo.png"
                alt="New York Mets"
                className="team-logo"
              />
            </div>
            <h3 className="team-name">New York Mets</h3>
            <p className="team-sport">MLB - National League East</p>
          </Link>

          {/* New York Rangers Card */}
          <Link to="/sports/rangers" className="team-card rangers-card">
            <div className="team-logo-container">
              <img
                src="/assets/rangers-logo.png"
                alt="New York Rangers"
                className="team-logo"
              />
            </div>
            <h3 className="team-name">New York Rangers</h3>
            <p className="team-sport">NHL - Metropolitan Division</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sports;
