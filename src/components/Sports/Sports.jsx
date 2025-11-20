import React from "react";
import { Link } from "react-router-dom";
import "./Sports.css";

const Sports = () => {
  return (
    <div className="sports-container">
      <div className="sports-content">
        <h1 className="sports-title">My Sports Teams</h1>

        <div className="teams-grid">
          <Link to="/sports/mets" className="team-section">
            <img src="/assets/mets-logo.png" alt="New York Mets" />
            <h3>New York Mets</h3>
            <p>MLB - National League East</p>
          </Link>

          <Link to="/sports/rangers" className="team-section">
            <img src="/assets/rangers-logo.png" alt="New York Rangers" />
            <h3>New York Rangers</h3>
            <p>NHL - Metropolitan Division</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sports;
