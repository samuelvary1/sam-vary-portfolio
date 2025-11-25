import React, { useContext } from "react";
import { GameContext } from "../context/GameContext";

export default function GameOver({ onNewGame, onBackToMenu }) {
  const { gameState } = useContext(GameContext);

  const getVictoryMessage = () => {
    if (!gameState.gameOverReason) return "Campaign Complete";

    switch (gameState.gameOverReason.type) {
      case "german_victory_swift":
        return "German Strategic Victory!";
      case "german_victory_capture":
        return "German Territorial Victory!";
      case "soviet_victory_survival":
        return "Soviet Defensive Victory!";
      case "soviet_victory_winter":
        return "Soviet Winter Victory!";
      case "soviet_victory_counteroffensive":
        return "Soviet Counteroffensive Victory!";
      default:
        return "Campaign Complete";
    }
  };

  const getDetailedResults = () => {
    if (!gameState.gameOverReason) return null;

    return (
      <div className="victory-details">
        <h3>{getVictoryMessage()}</h3>
        <p>{gameState.gameOverReason.description}</p>

        <div className="final-stats">
          <div className="stat-row">
            <span>Total Turns:</span>
            <span>{gameState.turn}</span>
          </div>

          <div className="stat-row">
            <span>Final Date:</span>
            <span>
              {gameState.season} {gameState.year}
            </span>
          </div>

          <div className="stat-row">
            <span>German Victory Points:</span>
            <span>{gameState.victoryPoints?.german || 0}</span>
          </div>

          <div className="stat-row">
            <span>Soviet Victory Points:</span>
            <span>{gameState.victoryPoints?.soviet || 0}</span>
          </div>

          {gameState.gameOverReason.objectives && (
            <div className="objectives-status">
              <h4>Objective Status:</h4>
              {gameState.gameOverReason.objectives.map((obj, index) => (
                <div key={index} className="objective-result">
                  <span>{obj.name}</span>
                  <span className={obj.achieved ? "achieved" : "failed"}>
                    {obj.achieved ? "Achieved" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {gameState.gameOverReason.casualties && (
            <div className="casualty-report">
              <h4>Casualties:</h4>
              <div className="casualties">
                <div>German: {gameState.gameOverReason.casualties.german}</div>
                <div>Soviet: {gameState.gameOverReason.casualties.soviet}</div>
              </div>
            </div>
          )}
        </div>

        <div className="historical-context">
          <h4>Historical Context</h4>
          <p>
            {gameState.gameOverReason.historicalNote ||
              "The Eastern Front was one of the most decisive theaters of World War II."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="game-over">
      <div className="game-over-container">
        <div className="victory-banner">
          <h2>{getVictoryMessage()}</h2>
        </div>

        {getDetailedResults()}

        <div className="performance-rating">
          <h4>Commander Rating</h4>
          <div className="rating">
            {/* Calculate based on objectives, casualties, time */}
            {gameState.performanceRating || "Strategic Competence"}
          </div>
        </div>

        <div className="action-buttons">
          <button className="primary-button" onClick={onNewGame}>
            New Campaign
          </button>

          <button
            className="secondary-button"
            onClick={() => {
              /* TODO: View detailed statistics */
            }}
          >
            Detailed Report
          </button>

          <button className="secondary-button" onClick={onBackToMenu}>
            Main Menu
          </button>
        </div>

        <div className="replay-options">
          <h4>Campaign Options</h4>
          <button
            onClick={() => {
              /* TODO: Save replay */
            }}
          >
            Save Battle Report
          </button>
          <button
            onClick={() => {
              /* TODO: Change difficulty and retry */
            }}
          >
            Retry Different Difficulty
          </button>
        </div>
      </div>
    </div>
  );
}
