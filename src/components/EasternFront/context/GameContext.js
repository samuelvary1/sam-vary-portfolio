import React, { createContext, useContext, useReducer } from "react";
import {
  INITIAL_UKRAINIAN_FORCES,
  INITIAL_RUSSIAN_FORCES,
  INITIAL_REGIONS,
  DIFFICULTY_LEVELS,
} from "../data/gameData";

const GameContext = createContext();

export { GameContext };

const initialState = {
  turn: 1,
  playerFaction: null,
  difficulty: null,
  brigades: [],
  regions: [],
  weather: "clear",
  eventLog: [],
  orders: [],
  gameStarted: false,
  gameOver: false,
  victory: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "START_GAME":
      const { faction, difficulty } = action.payload;
      const brigades =
        faction === "ukraine"
          ? INITIAL_UKRAINIAN_FORCES
          : INITIAL_RUSSIAN_FORCES;
      const regions = INITIAL_REGIONS.map((region) => ({
        ...region,
        // Adjust initial values based on faction
        baseSupply:
          faction === "russia" &&
          ["kyiv_center", "kyiv_south", "supply_route"].includes(region.id)
            ? region.baseSupply * 0.3
            : faction === "russia" && region.id === "belarus_border"
              ? 85
              : region.baseSupply,
        enemyStrengthEstimate:
          faction === "russia" && region.id === "kyiv_center"
            ? 90
            : faction === "russia"
              ? region.enemyStrengthEstimate * 0.5
              : region.enemyStrengthEstimate,
      }));

      return {
        ...state,
        playerFaction: faction,
        difficulty: DIFFICULTY_LEVELS[difficulty],
        brigades: brigades.map((brigade) => ({
          ...brigade,
          drones: DIFFICULTY_LEVELS[difficulty].startingDrones,
        })),
        regions,
        gameStarted: true,
        eventLog: [
          faction === "ukraine"
            ? `Campaign begins. Defend Ukraine.\n\nFIRST TURN GUIDANCE:\n• Check the MAP to see your positions\n• Review your brigades' status and location\n• Kyiv Northwest is under heavy threat - consider reinforcing\n• Protect your supply route from the west\n• Tap regions on the map for tactical details\n\nWhen ready, end your turn to begin combat.`
            : `Campaign begins. Execute the offensive.\n\nFIRST TURN GUIDANCE:\n• Check the MAP to see enemy positions\n• Your forces are staged at Belarus Border\n• Kyiv Northwest is the first objective\n• Cut off Ukrainian supply from the west\n• Capture Kyiv to win the campaign\n\nWhen ready, end your turn to begin combat.`,
        ],
      };

    case "ADD_ORDER":
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };

    case "CLEAR_ORDERS":
      return {
        ...state,
        orders: [],
      };

    case "UPDATE_BRIGADE":
      return {
        ...state,
        brigades: state.brigades.map((brigade) =>
          brigade.id === action.payload.id
            ? { ...brigade, ...action.payload.updates }
            : brigade,
        ),
      };

    case "UPDATE_REGION":
      return {
        ...state,
        regions: state.regions.map((region) =>
          region.id === action.payload.id
            ? { ...region, ...action.payload.updates }
            : region,
        ),
      };

    case "ADD_EVENT_LOG":
      return {
        ...state,
        eventLog: [...state.eventLog, action.payload],
      };

    case "SET_WEATHER":
      return {
        ...state,
        weather: action.payload,
      };

    case "ADVANCE_TURN":
      return {
        ...state,
        turn: state.turn + 1,
      };

    case "SET_GAME_OVER":
      return {
        ...state,
        gameOver: true,
        victory: action.payload,
      };

    case "LOAD_GAME":
      return {
        ...action.payload,
      };

    case "RESET_GAME":
      return initialState;

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const initializeGame = (faction, difficulty) => {
    dispatch({ type: "START_GAME", payload: { faction, difficulty } });
  };

  const executeTurn = () => {
    dispatch({ type: "EXECUTE_TURN" });
  };

  const moveUnit = (unitId, hexId) => {
    dispatch({ type: "MOVE_UNIT", payload: { unitId, hexId } });
  };

  const attackUnit = (attackerUnitId, targetHexId) => {
    dispatch({ type: "ATTACK_UNIT", payload: { attackerUnitId, targetHexId } });
  };

  const gameState = {
    ...state,
    initialized: state.gameStarted,
    hexes: {},
    currentPlayer: state.playerFaction,
    season: "Summer",
    year: 1941,
    weatherEffects: [],
    victoryPoints: { german: 0, soviet: 0 },
    currentBattle: null,
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        initializeGame,
        executeTurn,
        moveUnit,
        attackUnit,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
