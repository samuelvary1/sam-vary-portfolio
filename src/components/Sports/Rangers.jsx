import React from "react";
import { Link } from "react-router-dom";
import "./Rangers.css";

const Rangers = () => {
  return (
    <div className="rangers-container">
      <Link to="/sports" className="rangers-back-button">
        Back to Sports
      </Link>

      <div className="rangers-content">
        <div className="rangers-team-header">
          <img
            src="/assets/rangers-logo.png"
            alt="New York Rangers"
            className="rangers-team-header-logo"
          />
          <h1 className="rangers-team-page-title">New York Rangers</h1>
        </div>

        <div className="rangers-team-info">
          <div className="rangers-section rangers-about-section">
            <h2>About the Rangers</h2>
            <p>
              The New York Rangers are a professional ice hockey team based in
              New York City, founded in 1926. As one of the "Original Six" NHL
              teams, they compete in the Metropolitan Division and call the
              iconic Madison Square Garden their home.
            </p>
            <p>
              Known as "Broadway's Team," the Rangers have a rich history
              spanning nearly a century. From legendary players like Mark
              Messier and Henrik Lundqvist to unforgettable moments like the
              1994 Stanley Cup victory that ended a 54-year drought, the Rangers
              embody the heart and soul of New York hockey.
            </p>
          </div>

          <div className="rangers-section rangers-stats-section">
            <h3>Team Statistics</h3>
            <ul className="rangers-stats-list">
              <li>
                <strong>Founded:</strong> 1926
              </li>
              <li className="stanley-cup-highlight">
                <strong>Stanley Cups:</strong> 1928, 1933, 1940, 1994
              </li>
              <li>
                <strong>Conference Championships:</strong> 11 titles
              </li>
              <li>
                <strong>Division Championships:</strong> 8 titles
              </li>
              <li>
                <strong>Home Arena:</strong> Madison Square Garden
              </li>
              <li>
                <strong>Division:</strong> Metropolitan Division
              </li>
              <li>
                <strong>Team Colors:</strong> Blue, Red, White
              </li>
              <li>
                <strong>Retired Numbers:</strong> 11 numbers retired
              </li>
              <li>
                <strong>Hall of Famers:</strong> 58 players and personnel
              </li>
              <li>
                <strong>Playoff Appearances:</strong> 64 times
              </li>
            </ul>
          </div>

          <div className="rangers-section rangers-fan-section">
            <h3>Why I'm a Fan</h3>
            <p>
              Being a Rangers fan means being part of something bigger than
              hockey – it's about tradition, resilience, and the magic of
              Madison Square Garden. There's nothing quite like the atmosphere
              when 18,000 fans are on their feet, chanting "Let's Go Rangers!"
              as the team battles on Broadway's biggest stage.
            </p>
            <p>
              From watching Henrik Lundqvist make impossible saves to witnessing
              clutch playoff performances, the Rangers have provided countless
              memories of pure hockey excellence. The team's commitment to never
              giving up, combined with the electric energy of "The World's Most
              Famous Arena," creates an experience that goes far beyond the game
              itself.
            </p>
            <p>
              Whether it's a regular season matchup or a playoff thriller, every
              Rangers game carries the weight of history and the hope for future
              glory. That's what makes being part of the Blueshirts faithful so
              special.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rangers;
