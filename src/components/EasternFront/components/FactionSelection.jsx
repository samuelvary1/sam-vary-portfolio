import React from "react";

const FACTIONS = {
  GERMANY: {
    id: "germany",
    name: "German Wehrmacht",
    description:
      "Achieve swift victory through coordinated blitzkrieg tactics. Capture key objectives before winter sets in.",
    advantages: [
      "Superior initial equipment and training",
      "Combined arms doctrine advantage",
      "Tactical air supremacy early war",
    ],
    challenges: [
      "Limited time window before winter",
      "Lengthy supply lines as advance continues",
      "Growing Soviet resistance",
    ],
  },
  SOVIET_UNION: {
    id: "soviet",
    name: "Soviet Red Army",
    description:
      "Survive the initial onslaught and mount a determined defense of the Motherland.",
    advantages: [
      "Vast human and material reserves",
      "Defensive terrain advantages",
      "Winter warfare adaptation",
    ],
    challenges: [
      "Initial equipment and training disadvantages",
      "Surprise attack penalties",
      "Political commissar limitations",
    ],
  },
};

export default function FactionSelection({ onFactionSelected, onBack }) {
  return (
    <div className="faction-selection">
      <div className="selection-container">
        <h2>Choose Your Side</h2>

        <div className="faction-cards">
          {Object.values(FACTIONS).map((faction) => (
            <div key={faction.id} className="faction-card">
              <h3>{faction.name}</h3>
              <p className="faction-description">{faction.description}</p>

              <div className="faction-details">
                <div className="advantages">
                  <h4>Advantages:</h4>
                  <ul>
                    {faction.advantages.map((advantage, index) => (
                      <li key={index}>{advantage}</li>
                    ))}
                  </ul>
                </div>

                <div className="challenges">
                  <h4>Challenges:</h4>
                  <ul>
                    {faction.challenges.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                className="select-faction-btn"
                onClick={() => onFactionSelected(faction.id)}
              >
                Fight as {faction.name}
              </button>
            </div>
          ))}
        </div>

        <button className="back-button" onClick={onBack}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}
