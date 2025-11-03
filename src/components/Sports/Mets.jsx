import React from "react";
import { Link } from "react-router-dom";
import "./Mets.css";

const Mets = () => {
  return (
    <div className="mets-container">
      <Link to="/sports" className="mets-back-button">
        Back to Sports
      </Link>

      <div className="mets-content">
        <div className="mets-team-header">
          <img
            src="/assets/mets-logo.png"
            alt="New York Mets"
            className="mets-team-header-logo"
          />
          <h1 className="mets-team-page-title">New York Mets</h1>
        </div>

        <div className="mets-team-info">
          <div className="mets-section mets-about-section">
            <h2>About the Mets</h2>
            <p>
              The New York Mets are a Major League Baseball team based in New
              York City. Founded in 1962, they compete in the National League
              East division and play their home games at Citi Field in Queens.
              Known for their passionate fanbase and memorable moments, the Mets
              have brought joy and heartbreak to millions of fans across the
              decades.
            </p>
            <p>
              From the "Miracle Mets" of 1969 to the unforgettable 1986
              championship run, the team has created some of baseball's most
              iconic moments. With stars like Tom Seaver, Mike Piazza, and David
              Wright, the Mets continue to be a beloved part of New York's
              sports landscape.
            </p>
          </div>

          <div className="mets-section mets-stats-section">
            <h3>Team Statistics</h3>
            <ul className="mets-stats-list">
              <li>
                <strong>Founded:</strong> 1962
              </li>
              <li>
                <strong>World Series Titles:</strong> 1969, 1986
              </li>
              <li>
                <strong>NL Pennants:</strong> 1969, 1973, 1986, 2000, 2015
              </li>
              <li>
                <strong>Home Stadium:</strong> Citi Field (41,922 capacity)
              </li>
              <li>
                <strong>Division:</strong> National League East
              </li>
              <li>
                <strong>Team Colors:</strong> Blue, Orange, White
              </li>
              <li>
                <strong>Retired Numbers:</strong> 14 numbers retired
              </li>
              <li>
                <strong>Hall of Famers:</strong> 12 players
              </li>
            </ul>
          </div>

          <div className="mets-section mets-fan-section">
            <h3>Why I'm a Fan</h3>
            <p>
              Being a Mets fan is about more than just baseball - it's about
              believing in magic, hope, and the possibility that this year could
              be "the year." The team's resilient spirit and ability to create
              unforgettable moments keeps fans coming back, season after season.
            </p>
            <p>
              From watching games at Shea Stadium as a kid to experiencing the
              electric atmosphere at Citi Field, the Mets have been a constant
              source of excitement, anticipation, and community. Whether it's a
              walk-off home run or a perfectly executed double play, there's
              nothing quite like being part of the orange and blue faithful.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mets;
