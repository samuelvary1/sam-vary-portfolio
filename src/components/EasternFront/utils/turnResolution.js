import {
  updateSupply,
  rollWeather,
  performReconnaissance,
  checkVictoryConditions,
} from "./gameLogic";

// Compute AI actions for the enemy faction
export function computeAIActions(
  regions,
  brigades,
  weather,
  difficulty,
  playerFaction,
) {
  const aiFaction = playerFaction === "ukraine" ? "russia" : "ukraine";
  const aiRegions = regions.filter((r) => r.control === aiFaction);
  const actions = [];

  aiRegions.forEach((region) => {
    // AI activity chance based on difficulty
    if (Math.random() > difficulty.enemyActivityModifier) return;

    const strength =
      region.enemyStrengthEstimate * difficulty.enemyStrengthModifier;
    const adjacentEnemies = region.adjacency
      .map((id) => regions.find((r) => r.id === id))
      .filter((r) => r && r.control !== aiFaction);

    // Decision: Attack if strong enough
    if (adjacentEnemies.length > 0 && strength > 60) {
      const weakestTarget = adjacentEnemies.reduce((weakest, current) => {
        const currentDef = brigades
          .filter((b) => b.location === current.id)
          .reduce((sum, b) => sum + b.strength, 0);
        const weakestDef = brigades
          .filter((b) => b.location === weakest.id)
          .reduce((sum, b) => sum + b.strength, 0);
        return currentDef < weakestDef ? current : weakest;
      });

      const targetDefense = brigades
        .filter((b) => b.location === weakestTarget.id)
        .reduce((sum, b) => sum + b.strength, 0);

      if (strength > targetDefense * 1.3) {
        actions.push({
          type: "attack",
          from: region.id,
          target: weakestTarget.id,
          strength: strength,
        });
      }
    }
  });

  return actions;
}

// Execute AI attacks on player positions
export function executeAIActions(actions, state, dispatch) {
  actions.forEach((action) => {
    if (action.type === "attack") {
      const targetBrigades = state.brigades.filter(
        (b) => b.location === action.target,
      );
      const targetRegion = state.regions.find((r) => r.id === action.target);

      if (targetBrigades.length > 0 && targetRegion) {
        // Calculate defensive power
        const totalDefensePower = targetBrigades.reduce((total, brigade) => {
          return (
            total +
            calculateCombatPowerForAI(
              brigade,
              targetRegion,
              state.weather,
              "defending",
            )
          );
        }, 0);

        const ratio = action.strength / Math.max(totalDefensePower, 1);

        let outcome, playerLosses, aiLosses, controlChange;

        if (ratio > 2.0) {
          outcome = "ai_victory";
          playerLosses = 25 + Math.random() * 20;
          aiLosses = 5 + Math.random() * 10;
          controlChange = true;
        } else if (ratio > 1.2) {
          outcome = "ai_minor_victory";
          playerLosses = 15 + Math.random() * 15;
          aiLosses = 10 + Math.random() * 15;
          controlChange = false;
        } else if (ratio > 0.8) {
          outcome = "stalemate";
          playerLosses = 10 + Math.random() * 10;
          aiLosses = 15 + Math.random() * 15;
          controlChange = false;
        } else {
          outcome = "player_victory";
          playerLosses = 5 + Math.random() * 10;
          aiLosses = 25 + Math.random() * 20;
          controlChange = false;
        }

        // Apply losses to player brigades
        const lossPerBrigade = playerLosses / targetBrigades.length;
        targetBrigades.forEach((brigade) => {
          dispatch({
            type: "UPDATE_BRIGADE",
            payload: {
              id: brigade.id,
              updates: {
                strength: Math.max(0, brigade.strength - lossPerBrigade),
                ammo: Math.max(0, brigade.ammo - 10),
                morale: outcome.includes("ai_victory")
                  ? Math.max(0, brigade.morale - 15)
                  : brigade.morale,
              },
            },
          });
        });

        // Update enemy strength and control
        const regionUpdates = {
          enemyStrengthEstimate: Math.max(0, action.strength - aiLosses),
        };

        if (controlChange) {
          regionUpdates.control =
            state.playerFaction === "ukraine" ? "russia" : "ukraine";
        }

        dispatch({
          type: "UPDATE_REGION",
          payload: {
            id: action.target,
            updates: regionUpdates,
          },
        });

        // Log the attack
        const outcomeMessages = {
          ai_victory: `ENEMY ATTACK: Heavy assault on ${targetRegion.name} succeeds!`,
          ai_minor_victory: `ENEMY ATTACK: Enemy forces pressure ${targetRegion.name}.`,
          stalemate: `ENEMY ATTACK: Fierce fighting at ${targetRegion.name} with no clear victor.`,
          player_victory: `ENEMY ATTACK: Enemy assault on ${targetRegion.name} repulsed!`,
        };

        dispatch({
          type: "ADD_EVENT_LOG",
          payload: `${outcomeMessages[outcome]} Your losses: ${Math.round(playerLosses)} strength.`,
        });
      }
    }
  });
}

// Simplified combat power calculation for AI
function calculateCombatPowerForAI(brigade, region, weather, role) {
  let power = brigade.strength;

  // Basic modifiers
  power *= (brigade.morale / 100) * 0.5 + 0.5;
  if (brigade.supply < 40) power *= 0.7;

  // Terrain defense
  if (role === "defending") {
    const terrainBonus = {
      urban: 1.4,
      forest: 1.2,
      rural: 1.0,
      highway: 0.9,
    };
    power *= terrainBonus[region.terrain];
  }

  return power;
}

// Main turn resolution function
export function endTurn(state, dispatch) {
  const { brigades, regions, difficulty, playerFaction, turn } = state;

  // 1. Roll Weather
  const newWeather = rollWeather();
  dispatch({ type: "SET_WEATHER", payload: newWeather });
  dispatch({
    type: "ADD_EVENT_LOG",
    payload: `Turn ${turn + 1}: Weather is ${newWeather}`,
  });

  // 2. Update Air Defense (simplified - could be expanded)
  // 3. Electronic Warfare (simplified - could be expanded)

  // 4. Reconnaissance
  brigades.forEach((brigade) => {
    const reconResult = performReconnaissance(brigade, regions, newWeather);
    if (reconResult) {
      // Update brigade drones
      dispatch({
        type: "UPDATE_BRIGADE",
        payload: {
          id: brigade.id,
          updates: {
            drones: Math.max(0, brigade.drones - 1),
            reconAssigned: false,
          },
        },
      });

      // Update region intel
      reconResult.reconResults.forEach((result) => {
        dispatch({
          type: "UPDATE_REGION",
          payload: {
            id: result.regionId,
            updates: { enemyStrengthEstimate: result.newEstimate },
          },
        });
      });

      dispatch({
        type: "ADD_EVENT_LOG",
        payload: `Reconnaissance by ${brigade.name} provides updated enemy strength estimates.`,
      });
    }
  });

  // 5. Intel Decay
  regions.forEach((region) => {
    if (region.control !== playerFaction && region.enemyStrengthEstimate > 0) {
      const decay = 10 + Math.random() * 10;
      dispatch({
        type: "UPDATE_REGION",
        payload: {
          id: region.id,
          updates: {
            enemyStrengthEstimate: Math.max(
              0,
              region.enemyStrengthEstimate - decay,
            ),
          },
        },
      });
    }
  });

  // 6. Player Orders (already executed when issued)
  dispatch({ type: "CLEAR_ORDERS" });

  // 7. Supply Update
  brigades.forEach((brigade) => {
    const supplyUpdates = updateSupply(
      brigade,
      regions,
      newWeather,
      playerFaction,
      difficulty,
    );
    dispatch({
      type: "UPDATE_BRIGADE",
      payload: {
        id: brigade.id,
        updates: supplyUpdates,
      },
    });
  });

  // 8. Drone Losses (based on air defense)
  brigades.forEach((brigade) => {
    const location = regions.find((r) => r.id === brigade.location);
    if (location && location.airDefenseLevel > 70 && brigade.drones > 0) {
      const lossChance = (location.airDefenseLevel - 70) / 100;
      if (Math.random() < lossChance) {
        dispatch({
          type: "UPDATE_BRIGADE",
          payload: {
            id: brigade.id,
            updates: { drones: Math.max(0, brigade.drones - 1) },
          },
        });
        dispatch({
          type: "ADD_EVENT_LOG",
          payload: `${brigade.name} loses a drone to enemy air defenses.`,
        });
      }
    }
  });

  // 9. Turn Start Events
  if (Math.random() < 0.15 * difficulty.eventFrequencyModifier) {
    const events = [
      "Intelligence reports enemy reinforcements moving up.",
      "Weather conditions affecting operations across the front.",
      "Supply convoy delayed due to security concerns.",
      "Electronic warfare systems detect enemy communications.",
      "Aerial reconnaissance spots enemy movement.",
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    dispatch({ type: "ADD_EVENT_LOG", payload: `EVENT: ${event}` });
  }

  // 10. AI Actions
  const aiActions = computeAIActions(
    regions,
    brigades,
    newWeather,
    difficulty,
    playerFaction,
  );

  // 11. Defensive Battles
  executeAIActions(aiActions, { ...state, weather: newWeather }, dispatch);

  // 12. Artillery Damage
  regions.forEach((region) => {
    if (region.artilleryIntensity > 50) {
      const brigadesInRegion = brigades.filter((b) => b.location === region.id);
      brigadesInRegion.forEach((brigade) => {
        const damage =
          (region.artilleryIntensity / 100) * (5 + Math.random() * 10);
        dispatch({
          type: "UPDATE_BRIGADE",
          payload: {
            id: brigade.id,
            updates: {
              strength: Math.max(0, brigade.strength - damage),
              morale: Math.max(0, brigade.morale - 5),
            },
          },
        });
      });
      if (brigadesInRegion.length > 0) {
        dispatch({
          type: "ADD_EVENT_LOG",
          payload: `Artillery bombardment at ${region.name} causes casualties.`,
        });
      }
    }
  });

  // 13. Turn End Events
  if (Math.random() < 0.15 * difficulty.eventFrequencyModifier) {
    const events = [
      "Night operations disrupt enemy movements.",
      "Supply situation stabilizes in friendly regions.",
      "Communication intercepts reveal enemy plans.",
      "Morale remains steady among the troops.",
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    dispatch({ type: "ADD_EVENT_LOG", payload: `EVENT: ${event}` });
  }

  // 14. Drone Regeneration
  brigades.forEach((brigade) => {
    const maxDrones = difficulty.startingDrones;
    if (brigade.drones < maxDrones) {
      const regen = Math.min(
        difficulty.playerDroneRegen,
        maxDrones - brigade.drones,
      );
      if (regen > 0) {
        dispatch({
          type: "UPDATE_BRIGADE",
          payload: {
            id: brigade.id,
            updates: { drones: brigade.drones + regen },
          },
        });
      }
    }
  });

  // 15. Advance Turn
  dispatch({ type: "ADVANCE_TURN" });

  // 16. Victory Check
  setTimeout(() => {
    // Need to get fresh state after all updates
    const victoryCheck = checkVictoryConditions(
      playerFaction,
      turn + 1,
      regions,
      brigades,
    );
    if (victoryCheck.gameOver) {
      dispatch({ type: "SET_GAME_OVER", payload: victoryCheck.victory });
      dispatch({
        type: "ADD_EVENT_LOG",
        payload: `GAME OVER: ${victoryCheck.reason}`,
      });
    }
  }, 100);
}
