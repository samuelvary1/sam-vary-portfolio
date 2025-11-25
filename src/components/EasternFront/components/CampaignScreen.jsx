import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";

export default function CampaignScreen({
  faction,
  difficulty,
  onGameOver,
  onBackToMenu,
}) {
  const { gameState, initializeGame, executeTurn, moveUnit, attackUnit } =
    useContext(GameContext);

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedHex, setSelectedHex] = useState(null);
  const [gameMode, setGameMode] = useState("strategic"); // 'strategic' or 'tactical'
  const [showSupplyOverlay, setShowSupplyOverlay] = useState(false);

  useEffect(() => {
    initializeGame(faction, difficulty);
  }, [faction, difficulty, initializeGame]);

  const handleHexClick = (hexId) => {
    if (selectedUnit) {
      // Try to move or attack
      const targetHex = gameState.hexes[hexId];
      if (
        targetHex.unit &&
        targetHex.unit.faction !== gameState.currentPlayer
      ) {
        attackUnit(selectedUnit.id, hexId);
      } else if (!targetHex.unit) {
        moveUnit(selectedUnit.id, hexId);
      }
      setSelectedUnit(null);
    } else {
      // Select unit or hex
      const hex = gameState.hexes[hexId];
      if (hex.unit && hex.unit.faction === gameState.currentPlayer) {
        setSelectedUnit(hex.unit);
      }
      setSelectedHex(hexId);
    }
  };

  const handleEndTurn = () => {
    executeTurn();
    setSelectedUnit(null);
    setSelectedHex(null);
  };

  const renderGameBoard = () => {
    return (
      <div className="game-board">
        <div className="map-container">
          {Object.entries(gameState.hexes || {}).map(([hexId, hex]) => (
            <div
              key={hexId}
              className={`hex ${hex.terrain} ${selectedHex === hexId ? "selected" : ""}`}
              onClick={() => handleHexClick(hexId)}
            >
              {hex.unit && (
                <div className={`unit ${hex.unit.faction} ${hex.unit.type}`}>
                  <div className="unit-strength">{hex.unit.strength}</div>
                  <div className="unit-type">{hex.unit.name}</div>
                </div>
              )}
              {hex.objective && (
                <div className={`objective ${hex.objective.type}`}>
                  {hex.objective.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {showSupplyOverlay && (
          <div className="supply-overlay">
            {/* Supply line visualization */}
          </div>
        )}
      </div>
    );
  };

  const renderControlPanel = () => {
    return (
      <div className="control-panel">
        <div className="turn-info">
          <h3>Turn {gameState.turn}</h3>
          <p>
            {gameState.season} {gameState.year}
          </p>
          <p>Current Player: {gameState.currentPlayer}</p>
        </div>

        <div className="game-stats">
          <div className="victory-points">
            <h4>Victory Progress</h4>
            <div className="vp-track">
              <div className="german-vp">
                German: {gameState.victoryPoints?.german || 0}
              </div>
              <div className="soviet-vp">
                Soviet: {gameState.victoryPoints?.soviet || 0}
              </div>
            </div>
          </div>

          <div className="weather">
            <h4>Weather: {gameState.weather}</h4>
            <p>
              Effects:{" "}
              {gameState.weatherEffects?.join(", ") || "Normal conditions"}
            </p>
          </div>
        </div>

        <div className="unit-info">
          {selectedUnit && (
            <div className="selected-unit-info">
              <h4>{selectedUnit.name}</h4>
              <p>
                Strength: {selectedUnit.strength}/{selectedUnit.maxStrength}
              </p>
              <p>Experience: {selectedUnit.experience}</p>
              <p>Supply: {selectedUnit.supply}%</p>
              <p>Movement: {selectedUnit.movementPoints}</p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            onClick={() =>
              setGameMode(gameMode === "strategic" ? "tactical" : "strategic")
            }
          >
            {gameMode === "strategic" ? "Tactical View" : "Strategic View"}
          </button>

          <button onClick={() => setShowSupplyOverlay(!showSupplyOverlay)}>
            Toggle Supply Lines
          </button>

          <button onClick={handleEndTurn} className="end-turn">
            End Turn
          </button>
        </div>

        <div className="menu-buttons">
          <button
            onClick={() => {
              /* TODO: Save game */
            }}
          >
            Save Game
          </button>
          <button onClick={onBackToMenu}>Main Menu</button>
        </div>
      </div>
    );
  };

  const renderBattleResolution = () => {
    if (!gameState.currentBattle) return null;

    return (
      <div className="battle-resolution-modal">
        <div className="battle-info">
          <h3>Battle Resolution</h3>
          <p>Attacker: {gameState.currentBattle.attacker.name}</p>
          <p>Defender: {gameState.currentBattle.defender.name}</p>
          <p>Terrain: {gameState.currentBattle.terrain}</p>

          <div className="battle-results">
            {gameState.currentBattle.results && (
              <div>
                <p>
                  Attacker Losses:{" "}
                  {gameState.currentBattle.results.attackerLosses}
                </p>
                <p>
                  Defender Losses:{" "}
                  {gameState.currentBattle.results.defenderLosses}
                </p>
                <p>Outcome: {gameState.currentBattle.results.outcome}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              /* Close battle modal */
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Check for game over conditions
  useEffect(() => {
    if (gameState.gameOver) {
      onGameOver();
    }
  }, [gameState.gameOver, onGameOver]);

  if (!gameState.initialized) {
    return (
      <div className="loading-screen">
        <h2>Initializing Campaign...</h2>
        <p>Setting up the Eastern Front</p>
      </div>
    );
  }

  return (
    <div className="campaign-screen">
      <div className="game-interface">
        {renderGameBoard()}
        {renderControlPanel()}
        {renderBattleResolution()}
      </div>
    </div>
  );
}
