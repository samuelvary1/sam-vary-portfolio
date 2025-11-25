import React from "react";

const DIFFICULTIES = {
  EASY: {
    id: "easy",
    name: "Cadet",
    description: "Recommended for first-time players",
    modifiers: [
      "AI makes occasional tactical errors",
      "Extended time limits for objectives",
      "Additional reinforcements available",
      "Reduced supply penalties",
    ],
  },
  NORMAL: {
    id: "normal",
    name: "Officer",
    description: "Balanced historical experience",
    modifiers: [
      "Historical accuracy priority",
      "Standard time limits",
      "Realistic supply constraints",
      "Competent AI opposition",
    ],
  },
  HARD: {
    id: "hard",
    name: "General",
    description: "Maximum challenge for veterans",
    modifiers: [
      "Optimized AI strategies",
      "Tight objective timelines",
      "Harsh weather effects",
      "Limited reinforcement availability",
    ],
  },
};

export default function DifficultySelection({
  selectedFaction,
  onDifficultySelected,
  onBack,
}) {
  return (
    <div className="difficulty-selection">
      <div className="selection-container">
        <h2>Select Difficulty</h2>
        <p>
          Playing as:{" "}
          <span className="faction-name">
            {selectedFaction === "germany"
              ? "German Wehrmacht"
              : "Soviet Red Army"}
          </span>
        </p>

        <div className="difficulty-cards">
          {Object.values(DIFFICULTIES).map((difficulty) => (
            <div
              key={difficulty.id}
              className={`difficulty-card ${difficulty.id}`}
            >
              <h3>{difficulty.name}</h3>
              <p className="difficulty-description">{difficulty.description}</p>

              <div className="modifiers">
                <h4>Game Modifiers:</h4>
                <ul>
                  {difficulty.modifiers.map((modifier, index) => (
                    <li key={index}>{modifier}</li>
                  ))}
                </ul>
              </div>

              <button
                className="select-difficulty-btn"
                onClick={() => onDifficultySelected(difficulty.id)}
              >
                Begin Campaign
              </button>
            </div>
          ))}
        </div>

        <button className="back-button" onClick={onBack}>
          Back to Faction Selection
        </button>
      </div>
    </div>
  );
}
