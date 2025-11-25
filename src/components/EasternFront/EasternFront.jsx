import React, { useState, useEffect } from "react";
import { GameProvider } from "./context/GameContext";
import MainMenu from "./components/MainMenu";
import FactionSelection from "./components/FactionSelection";
import DifficultySelection from "./components/DifficultySelection";
import CampaignScreen from "./components/CampaignScreen";
import GameOver from "./components/GameOver";
import "./EasternFront.css";

const GAME_STATES = {
  MAIN_MENU: "main_menu",
  FACTION_SELECTION: "faction_selection",
  DIFFICULTY_SELECTION: "difficulty_selection",
  CAMPAIGN: "campaign",
  GAME_OVER: "game_over",
};

function EasternFrontInner() {
  const [gameState, setGameState] = useState(GAME_STATES.MAIN_MENU);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem("easternfront_save");
    if (savedGame) {
      // Enable continue button in main menu
    }
  }, []);

  const handleNewGame = () => {
    setGameState(GAME_STATES.FACTION_SELECTION);
  };

  const handleContinueGame = () => {
    // TODO: Implement load game functionality
    setGameState(GAME_STATES.CAMPAIGN);
  };

  const handleFactionSelected = (faction) => {
    setSelectedFaction(faction);
    setGameState(GAME_STATES.DIFFICULTY_SELECTION);
  };

  const handleDifficultySelected = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setGameState(GAME_STATES.CAMPAIGN);
  };

  const handleBackToMenu = () => {
    setGameState(GAME_STATES.MAIN_MENU);
    setSelectedFaction(null);
    setSelectedDifficulty(null);
  };

  const renderCurrentScreen = () => {
    switch (gameState) {
      case GAME_STATES.MAIN_MENU:
        return (
          <MainMenu
            onNewGame={handleNewGame}
            onContinueGame={handleContinueGame}
            hasSavedGame={!!localStorage.getItem("easternfront_save")}
          />
        );

      case GAME_STATES.FACTION_SELECTION:
        return (
          <FactionSelection
            onFactionSelected={handleFactionSelected}
            onBack={handleBackToMenu}
          />
        );

      case GAME_STATES.DIFFICULTY_SELECTION:
        return (
          <DifficultySelection
            selectedFaction={selectedFaction}
            onDifficultySelected={handleDifficultySelected}
            onBack={() => setGameState(GAME_STATES.FACTION_SELECTION)}
          />
        );

      case GAME_STATES.CAMPAIGN:
        return (
          <CampaignScreen
            faction={selectedFaction}
            difficulty={selectedDifficulty}
            onGameOver={() => setGameState(GAME_STATES.GAME_OVER)}
            onBackToMenu={handleBackToMenu}
          />
        );

      case GAME_STATES.GAME_OVER:
        return (
          <GameOver onNewGame={handleNewGame} onBackToMenu={handleBackToMenu} />
        );

      default:
        return (
          <MainMenu
            onNewGame={handleNewGame}
            onContinueGame={handleContinueGame}
          />
        );
    }
  };

  return <div className="eastern-front-app">{renderCurrentScreen()}</div>;
}

export default function EasternFront() {
  return (
    <GameProvider>
      <EasternFrontInner />
    </GameProvider>
  );
}
