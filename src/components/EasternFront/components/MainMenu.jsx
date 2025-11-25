import React from "react";

export default function MainMenu({ onNewGame, onContinueGame, hasSavedGame }) {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">Eastern Front 1941</h1>
        <div className="subtitle">The Decisive Campaign</div>

        <div className="menu-buttons">
          <button className="menu-button primary" onClick={onNewGame}>
            New Campaign
          </button>

          {hasSavedGame && (
            <button className="menu-button" onClick={onContinueGame}>
              Continue Campaign
            </button>
          )}

          <button className="menu-button">Tutorial</button>

          <button className="menu-button">Historical Information</button>
        </div>

        <div className="credits">
          <p>A Strategic Wargame Experience</p>
          <p>Historical scenarios based on Operation Barbarossa</p>
        </div>
      </div>
    </div>
  );
}
