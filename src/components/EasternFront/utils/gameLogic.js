import {
  TYPE_MULTIPLIERS,
  STANCE_MODIFIERS,
  TERRAIN_DEFENSE,
  WEATHER_PENALTIES,
} from "../data/gameData";

// Calculate combat power for a brigade
export function calculateCombatPower(brigade, region, weather, combatRole) {
  let power = brigade.strength;

  // Type modifiers
  power *= TYPE_MULTIPLIERS[brigade.type];

  // Morale effect
  power *= (brigade.morale / 100) * 0.5 + 0.5;

  // Supply penalties
  if (brigade.supply < 40) power *= 0.7;
  if (brigade.ammo < 30) power *= 0.6;
  if (brigade.fuel < 20) power *= 0.8;

  // Stance modifiers
  power *=
    combatRole === "attacking"
      ? STANCE_MODIFIERS[brigade.stance].attack
      : STANCE_MODIFIERS[brigade.stance].defense;

  // Terrain effects (defender bonus)
  if (combatRole === "defending") {
    power *= TERRAIN_DEFENSE[region.terrain];
  }

  // Weather penalties
  power *= WEATHER_PENALTIES[weather];

  // Experience bonus
  power *= 1 + brigade.experience / 200;

  return Math.round(power);
}

// Resolve combat between attacking brigade and target region
export function resolveCombat(
  attackingBrigade,
  targetRegion,
  weather,
  dispatch,
) {
  const attackPower = calculateCombatPower(
    attackingBrigade,
    targetRegion,
    weather,
    "attacking",
  );
  const defensePower = targetRegion.enemyStrengthEstimate;

  const ratio = attackPower / Math.max(defensePower, 1);

  let outcome, strengthLoss, moraleLoss, enemyLoss, controlChange;

  if (ratio > 2.5) {
    outcome = "decisive_victory";
    strengthLoss = 5 + Math.random() * 10;
    moraleLoss = -5; // Morale boost
    enemyLoss = 40 + Math.random() * 30;
    controlChange = true;
  } else if (ratio > 1.5) {
    outcome = "victory";
    strengthLoss = 10 + Math.random() * 15;
    moraleLoss = 0;
    enemyLoss = 25 + Math.random() * 20;
    controlChange = true;
  } else if (ratio > 0.8) {
    outcome = "stalemate";
    strengthLoss = 15 + Math.random() * 15;
    moraleLoss = 5;
    enemyLoss = 10 + Math.random() * 15;
    controlChange = false;
  } else if (ratio > 0.5) {
    outcome = "setback";
    strengthLoss = 20 + Math.random() * 20;
    moraleLoss = 10;
    enemyLoss = 5 + Math.random() * 10;
    controlChange = false;
  } else {
    outcome = "defeat";
    strengthLoss = 30 + Math.random() * 25;
    moraleLoss = 20;
    enemyLoss = 0 + Math.random() * 5;
    controlChange = false;
  }

  // Apply casualties
  const newStrength = Math.max(0, attackingBrigade.strength - strengthLoss);
  const newMorale = Math.max(
    0,
    Math.min(100, attackingBrigade.morale - moraleLoss),
  );
  const newEnemyStrength = Math.max(
    0,
    targetRegion.enemyStrengthEstimate - enemyLoss,
  );

  // Update brigade
  dispatch({
    type: "UPDATE_BRIGADE",
    payload: {
      id: attackingBrigade.id,
      updates: {
        strength: newStrength,
        morale: newMorale,
        ammo: Math.max(0, attackingBrigade.ammo - 15), // Combat uses ammo
      },
    },
  });

  // Update region
  const regionUpdates = {
    enemyStrengthEstimate: newEnemyStrength,
  };

  if (controlChange) {
    regionUpdates.control = attackingBrigade.location; // This needs to be faction
  }

  dispatch({
    type: "UPDATE_REGION",
    payload: {
      id: targetRegion.id,
      updates: regionUpdates,
    },
  });

  // Generate combat report
  const outcomeMessages = {
    decisive_victory: `DECISIVE VICTORY! ${attackingBrigade.name} overwhelms enemy defenses at ${targetRegion.name}.`,
    victory: `VICTORY! ${attackingBrigade.name} successfully attacks ${targetRegion.name}.`,
    stalemate: `STALEMATE: ${attackingBrigade.name} engages enemy at ${targetRegion.name} with limited results.`,
    setback: `SETBACK: ${attackingBrigade.name} suffers heavy casualties attacking ${targetRegion.name}.`,
    defeat: `DEFEAT: ${attackingBrigade.name} is repulsed at ${targetRegion.name} with severe losses.`,
  };

  dispatch({
    type: "ADD_EVENT_LOG",
    payload: `${outcomeMessages[outcome]} Casualties: -${Math.round(strengthLoss)} strength, enemy: -${Math.round(enemyLoss)}.`,
  });

  return { outcome, strengthLoss, moraleLoss, enemyLoss, controlChange };
}

// Update supply for a brigade
export function updateSupply(
  brigade,
  regions,
  weather,
  playerFaction,
  difficulty,
) {
  const location = regions.find((r) => r.id === brigade.location);

  const supplyRate =
    (location.baseSupply / 100) * difficulty.playerSupplyModifier;

  // Weather penalty
  const weatherPenalties = {
    clear: 0,
    rain: 0.1,
    heavy_rain: 0.2,
    mud: 0.35,
    snow: 0.15,
  };
  const weatherPenalty = weatherPenalties[weather];

  // Control bonus/penalty
  const controlBonus = location.control === playerFaction ? 1.0 : 0.3;

  // Isolation check (no friendly adjacent regions)
  const hasSupplyRoute = location.adjacency.some((adjId) => {
    const adj = regions.find((r) => r.id === adjId);
    return adj && adj.control === playerFaction;
  });
  const isolationPenalty = hasSupplyRoute ? 1.0 : 0.5;

  // Enemy pressure
  const pressurePenalty = location.enemyStrengthEstimate > 60 ? 0.8 : 1.0;

  // Calculate changes
  const effectiveRate =
    supplyRate *
    controlBonus *
    isolationPenalty *
    pressurePenalty *
    (1 - weatherPenalty);

  const supplyChange = effectiveRate * 25 - 10;
  const fuelChange = effectiveRate * 20 - 8;
  const ammoChange = effectiveRate * 15 - 5;

  const newSupply = Math.max(0, Math.min(100, brigade.supply + supplyChange));
  const newFuel = Math.max(0, Math.min(100, brigade.fuel + fuelChange));
  const newAmmo = Math.max(0, Math.min(100, brigade.ammo + ammoChange));

  // Morale affected by supply
  let moraleChange = 0;
  if (newSupply < 40) {
    moraleChange = -3;
  } else if (newSupply > 70) {
    moraleChange = 1;
  }

  const newMorale = Math.max(0, Math.min(100, brigade.morale + moraleChange));

  return {
    supply: newSupply,
    fuel: newFuel,
    ammo: newAmmo,
    morale: newMorale,
  };
}

// Roll random weather for the turn
export function rollWeather() {
  const roll = Math.random();
  if (roll < 0.4) return "clear";
  if (roll < 0.65) return "rain";
  if (roll < 0.8) return "heavy_rain";
  if (roll < 0.9) return "mud";
  return "snow";
}

// Perform reconnaissance if brigade is assigned
export function performReconnaissance(brigade, regions, weather) {
  if (!brigade.reconAssigned || brigade.drones < 1) return null;

  const location = regions.find((r) => r.id === brigade.location);
  const adjacent = location.adjacency
    .map((id) => regions.find((r) => r.id === id))
    .filter((r) => r);

  const reconResults = [];

  // Update intel on adjacent regions
  adjacent.forEach((region) => {
    if (region.control !== location.control) {
      const accuracy = weather === "clear" ? 0.9 : 0.7;
      const noise = Math.random() * 20 - 10;
      const newEstimate = Math.max(
        0,
        Math.min(100, region.enemyStrengthEstimate * accuracy + noise),
      );

      reconResults.push({
        regionId: region.id,
        newEstimate: Math.round(newEstimate),
      });
    }
  });

  return {
    brigadeId: brigade.id,
    dronesUsed: 1,
    reconResults,
  };
}

// Check victory conditions
export function checkVictoryConditions(playerFaction, turn, regions, brigades) {
  const kyivRegion = regions.find((r) => r.id === "kyiv_center");
  const supplyRegion = regions.find((r) => r.id === "supply_route");
  const allDestroyed = brigades.every((b) => b.strength <= 0);

  if (playerFaction === "ukraine") {
    const kyivControlled = kyivRegion?.control === "ukraine";
    const supplyOpen = supplyRegion?.control === "ukraine";

    if (allDestroyed || !kyivControlled) {
      return {
        gameOver: true,
        victory: false,
        reason: allDestroyed ? "All brigades destroyed" : "Kyiv has fallen",
      };
    } else if (turn >= 20 && kyivControlled && supplyOpen) {
      return {
        gameOver: true,
        victory: true,
        reason: "Successfully defended Ukraine for 20 turns",
      };
    }
  } else {
    // Russia
    const kyivCaptured = kyivRegion?.control === "russia";

    if (allDestroyed) {
      return {
        gameOver: true,
        victory: false,
        reason: "All divisions destroyed",
      };
    } else if (kyivCaptured) {
      return {
        gameOver: true,
        victory: true,
        reason: "Kyiv captured - immediate victory!",
      };
    } else if (turn >= 20) {
      return {
        gameOver: true,
        victory: false,
        reason: "Failed to capture Kyiv within 20 turns",
      };
    }
  }

  return { gameOver: false, victory: false, reason: null };
}
