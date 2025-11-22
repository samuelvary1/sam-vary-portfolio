import React, { useState, useEffect, useRef } from "react";
import "./EasternFront.css";

// Game constants
const Side = {
  UKRAINE: "UKR",
  RUSSIA: "RUS",
  NEUTRAL: "NEU",
};

const Role = {
  INFANTRY: "INF",
  ARMOR: "ARM",
  ARTILLERY: "ART",
};

// Initial game state
const createInitialZones = () => ({
  KYIV: {
    name: "KYIV",
    fullName: "Kyiv",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 5,
    divisions: [],
    neighbors: ["CHER", "SUMY"],
  },
  SUMY: {
    name: "SUMY",
    fullName: "Sumy",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 3,
    divisions: [],
    neighbors: ["KYIV", "KHARKIV", "POLT"],
  },
  KHARKIV: {
    name: "KHARKIV",
    fullName: "Kharkiv",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 4,
    divisions: [],
    neighbors: ["SUMY", "LUHANSK", "POLT"],
  },
  CHER: {
    name: "CHER",
    fullName: "Cherkasy",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 2,
    divisions: [],
    neighbors: ["KYIV", "POLT", "MYKO"],
  },
  POLT: {
    name: "POLT",
    fullName: "Poltava",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 3,
    divisions: [],
    neighbors: ["SUMY", "KHARKIV", "CHER", "LUHANSK", "MYKO"],
  },
  LUHANSK: {
    name: "LUHANSK",
    fullName: "Luhansk",
    controller: Side.RUSSIA,
    isCity: true,
    supplyValue: 3,
    divisions: [],
    neighbors: ["KHARKIV", "POLT", "KHER"],
  },
  ODESA: {
    name: "ODESA",
    fullName: "Odesa",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 4,
    divisions: [],
    neighbors: ["MYKO"],
  },
  MYKO: {
    name: "MYKO",
    fullName: "Mykolaiv",
    controller: Side.UKRAINE,
    isCity: true,
    supplyValue: 3,
    divisions: [],
    neighbors: ["ODESA", "CHER", "POLT", "KHER"],
  },
  KHER: {
    name: "KHER",
    fullName: "Kherson",
    controller: Side.RUSSIA,
    isCity: true,
    supplyValue: 3,
    divisions: [],
    neighbors: ["MYKO", "POLT", "LUHANSK"],
  },
});

const createInitialDivisions = () => [
  {
    id: "ukr-1",
    name: "1st Guard",
    strength: 4,
    supplyNeed: 2,
    role: Role.INFANTRY,
    side: Side.UKRAINE,
    location: "KYIV",
  },
  {
    id: "ukr-2",
    name: "2nd Mech",
    strength: 3,
    supplyNeed: 2,
    role: Role.ARMOR,
    side: Side.UKRAINE,
    location: "KHARKIV",
  },
  {
    id: "ukr-3",
    name: "3rd Rifle",
    strength: 3,
    supplyNeed: 1,
    role: Role.INFANTRY,
    side: Side.UKRAINE,
    location: "ODESA",
  },
  {
    id: "ukr-4",
    name: "4th Artillery",
    strength: 2,
    supplyNeed: 2,
    role: Role.ARTILLERY,
    side: Side.UKRAINE,
    location: "POLT",
  },
  {
    id: "rus-1",
    name: "5th Guards",
    strength: 4,
    supplyNeed: 2,
    role: Role.ARMOR,
    side: Side.RUSSIA,
    location: "LUHANSK",
  },
  {
    id: "rus-2",
    name: "6th Motorized",
    strength: 3,
    supplyNeed: 2,
    role: Role.INFANTRY,
    side: Side.RUSSIA,
    location: "LUHANSK",
  },
  {
    id: "rus-3",
    name: "7th Tank",
    strength: 3,
    supplyNeed: 2,
    role: Role.ARMOR,
    side: Side.RUSSIA,
    location: "KHER",
  },
  {
    id: "rus-4",
    name: "8th Rocket",
    strength: 2,
    supplyNeed: 2,
    role: Role.ARTILLERY,
    side: Side.RUSSIA,
    location: "KHER",
  },
];

const EasternFront = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState(null);
  const [aiSide, setAiSide] = useState(null);
  const [turn, setTurn] = useState(0);
  const [zones, setZones] = useState(createInitialZones());
  const [divisions, setDivisions] = useState(createInitialDivisions());
  const [playerSupply, setPlayerSupply] = useState(0);
  const [gamePhase, setGamePhase] = useState("start"); // start, reinforce, move, combat, event, gameover
  const [log, setLog] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const logEndRef = useRef(null);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  // Place divisions in zones initially
  useEffect(() => {
    if (gameStarted) {
      const newZones = { ...zones };
      divisions.forEach((div) => {
        if (!newZones[div.location].divisions.find((d) => d.id === div.id)) {
          newZones[div.location].divisions.push(div);
        }
      });
      setZones(newZones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  const addLog = (message, type = "info") => {
    setLog((prev) => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const calculateSupply = (side) => {
    return Object.values(zones).reduce((total, zone) => {
      if (zone.controller === side && zone.isCity) {
        return total + zone.supplyValue;
      }
      return total;
    }, 0);
  };

  const startGame = (side) => {
    setPlayerSide(side);
    setAiSide(side === Side.UKRAINE ? Side.RUSSIA : Side.UKRAINE);
    setGameStarted(true);
    setTurn(1);
    setGamePhase("reinforce");
    addLog(`=== GAME START ===`, "header");
    addLog(`You are playing as ${side}`, "info");
    const supply = calculateSupply(side);
    setPlayerSupply(supply);
    addLog(`Turn 1 begins. Your supply: ${supply}`, "info");
  };

  const reinforceDivision = (divId) => {
    if (playerSupply < 2) {
      addLog("Not enough supply! Need 2 supply to reinforce.", "error");
      return;
    }

    setDivisions((prev) =>
      prev.map((div) => {
        if (div.id === divId && div.side === playerSide && div.strength < 5) {
          addLog(`${div.name} reinforced to S${div.strength + 1}`, "success");
          setPlayerSupply((s) => s - 2);
          return { ...div, strength: div.strength + 1 };
        }
        return div;
      }),
    );
  };

  const skipReinforcement = () => {
    addLog("Reinforcement phase skipped.", "info");
    setGamePhase("move");
  };

  const moveDivision = (divId, targetZone) => {
    const div = divisions.find((d) => d.id === divId);
    if (!div) return;

    const currentZone = zones[div.location];
    if (!currentZone.neighbors.includes(targetZone)) {
      addLog("Invalid move - zones not adjacent!", "error");
      return;
    }

    // Update division location
    setDivisions((prev) =>
      prev.map((d) => (d.id === divId ? { ...d, location: targetZone } : d)),
    );

    // Update zones
    setZones((prev) => {
      const newZones = { ...prev };
      newZones[div.location].divisions = newZones[
        div.location
      ].divisions.filter((d) => d.id !== divId);
      newZones[targetZone].divisions.push({ ...div, location: targetZone });
      return newZones;
    });

    addLog(`${div.name} moved to ${zones[targetZone].fullName}`, "success");
    setSelectedDivision(null);
  };

  const endMovement = () => {
    addLog("Movement phase complete.", "info");
    // AI movement
    performAIMovement();
    setGamePhase("combat");
    setTimeout(() => resolveCombat(), 1000);
  };

  const performAIMovement = () => {
    addLog("=== AI MOVEMENT ===", "header");
    const aiDivs = divisions.filter((d) => d.side === aiSide && d.strength > 0);

    aiDivs.forEach((div) => {
      const zone = zones[div.location];
      const enemyNeighbors = zone.neighbors.filter(
        (n) => zones[n].controller !== aiSide,
      );

      if (enemyNeighbors.length > 0 && Math.random() > 0.4) {
        const target =
          enemyNeighbors[Math.floor(Math.random() * enemyNeighbors.length)];

        setDivisions((prev) =>
          prev.map((d) => (d.id === div.id ? { ...d, location: target } : d)),
        );

        setZones((prev) => {
          const newZones = { ...prev };
          newZones[div.location].divisions = newZones[
            div.location
          ].divisions.filter((d) => d.id !== div.id);
          newZones[target].divisions.push({ ...div, location: target });
          return newZones;
        });

        addLog(`AI: ${div.name} → ${zones[target].fullName}`, "ai");
      }
    });
  };

  const resolveCombat = () => {
    addLog("=== COMBAT RESOLUTION ===", "header");
    let combatOccurred = false;

    Object.values(zones).forEach((zone) => {
      const sidesPresent = new Set(zone.divisions.map((d) => d.side));

      if (sidesPresent.size > 1) {
        combatOccurred = true;
        const attackers = zone.divisions.filter(
          (d) => d.side !== zone.controller,
        );
        const defenders = zone.divisions.filter(
          (d) => d.side === zone.controller,
        );

        if (attackers.length === 0 || defenders.length === 0) return;

        const attackerStrength = attackers.reduce(
          (sum, d) => sum + d.strength,
          0,
        );
        const defenderStrength = defenders.reduce(
          (sum, d) => sum + d.strength,
          0,
        );

        addLog(`⚔️ Combat in ${zone.fullName}`, "combat");
        addLog(
          `  Attackers: ${attackerStrength} | Defenders: ${defenderStrength}`,
          "combat",
        );

        if (attackerStrength < defenderStrength) {
          // Attacker loses
          const casualties = Math.min(2, attackers.length);
          for (let i = 0; i < casualties; i++) {
            if (attackers[i]) {
              const div = attackers[i];
              setDivisions((prev) =>
                prev.map((d) =>
                  d.id === div.id
                    ? { ...d, strength: Math.max(0, d.strength - 1) }
                    : d,
                ),
              );
              addLog(`  ${div.name} takes damage`, "combat");
            }
          }
        } else if (attackerStrength > defenderStrength) {
          // Defender loses
          const casualties = Math.min(2, defenders.length);
          for (let i = 0; i < casualties; i++) {
            if (defenders[i]) {
              const div = defenders[i];
              setDivisions((prev) =>
                prev.map((d) =>
                  d.id === div.id
                    ? { ...d, strength: Math.max(0, d.strength - 1) }
                    : d,
                ),
              );
              addLog(`  ${div.name} takes damage`, "combat");
            }
          }

          // Zone captured
          if (defenders.every((d) => d.strength === 0)) {
            setZones((prev) => ({
              ...prev,
              [zone.name]: {
                ...prev[zone.name],
                controller: attackers[0].side,
              },
            }));
            addLog(
              `  ${zone.fullName} captured by ${attackers[0].side}!`,
              "success",
            );
          }
        } else {
          // Equal - both take damage
          if (attackers[0]) {
            setDivisions((prev) =>
              prev.map((d) =>
                d.id === attackers[0].id
                  ? { ...d, strength: Math.max(0, d.strength - 1) }
                  : d,
              ),
            );
          }
          if (defenders[0]) {
            setDivisions((prev) =>
              prev.map((d) =>
                d.id === defenders[0].id
                  ? { ...d, strength: Math.max(0, d.strength - 1) }
                  : d,
              ),
            );
          }
          addLog(`  Both sides take casualties`, "combat");
        }
      }
    });

    if (!combatOccurred) {
      addLog("No combat this turn.", "info");
    }

    setTimeout(() => {
      triggerRandomEvent();
      setGamePhase("event");
    }, 1500);
  };

  const triggerRandomEvent = () => {
    const events = [
      { name: "Heavy Rain", effect: "supply", value: 0 },
      { name: "Clear Weather", effect: "supply", value: 2 },
      { name: "Civilian Unrest", effect: "supply", value: -2 },
      { name: "Intelligence Report", effect: "none", value: 0 },
      { name: "Reinforcements Arrive", effect: "reinforce", value: 1 },
      { name: "Morale Boost", effect: "none", value: 0 },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    addLog(`=== RANDOM EVENT ===`, "header");
    addLog(`${event.name}`, "event");

    if (event.effect === "supply") {
      setPlayerSupply((s) => Math.max(0, s + event.value));
      if (event.value !== 0) {
        addLog(`Supply ${event.value > 0 ? "+" : ""}${event.value}`, "event");
      }
    } else if (event.effect === "reinforce") {
      const eligibleDivs = divisions.filter(
        (d) => d.strength > 0 && d.strength < 5,
      );
      if (eligibleDivs.length > 0) {
        const lucky =
          eligibleDivs[Math.floor(Math.random() * eligibleDivs.length)];
        setDivisions((prev) =>
          prev.map((d) =>
            d.id === lucky.id ? { ...d, strength: d.strength + 1 } : d,
          ),
        );
        addLog(`${lucky.name} reinforced!`, "event");
      }
    }
  };

  const endTurn = () => {
    // Check victory
    const ukrZones = Object.values(zones).filter(
      (z) => z.controller === Side.UKRAINE,
    ).length;
    const rusZones = Object.values(zones).filter(
      (z) => z.controller === Side.RUSSIA,
    ).length;
    const ukrDivs = divisions.filter(
      (d) => d.side === Side.UKRAINE && d.strength > 0,
    ).length;
    const rusDivs = divisions.filter(
      (d) => d.side === Side.RUSSIA && d.strength > 0,
    ).length;

    if (ukrZones >= 7 || rusDivs === 0) {
      setGamePhase("gameover");
      addLog("=== GAME OVER ===", "header");
      addLog("Ukraine wins!", "success");
      return;
    } else if (rusZones >= 7 || ukrDivs === 0) {
      setGamePhase("gameover");
      addLog("=== GAME OVER ===", "header");
      addLog("Russia wins!", "success");
      return;
    }

    // Next turn
    setTurn((t) => t + 1);
    const newPlayerSupply = calculateSupply(playerSide);
    setPlayerSupply(newPlayerSupply);
    setGamePhase("reinforce");
    addLog(`=== TURN ${turn + 1} ===`, "header");
    addLog(`Your supply: ${newPlayerSupply}`, "info");
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayerSide(null);
    setAiSide(null);
    setTurn(0);
    setZones(createInitialZones());
    setDivisions(createInitialDivisions());
    setPlayerSupply(0);
    setGamePhase("start");
    setLog([]);
    setSelectedDivision(null);
  };

  const renderZone = (zoneName) => {
    const zone = zones[zoneName];
    const divCount = zone.divisions.filter(
      (d) => divisions.find((div) => div.id === d.id)?.strength > 0,
    ).length;
    const totalStrength = zone.divisions.reduce((sum, d) => {
      const div = divisions.find((div) => div.id === d.id);
      return sum + (div?.strength || 0);
    }, 0);

    return (
      <div
        key={zoneName}
        className={`zone zone-${zone.controller.toLowerCase()}`}
      >
        <div className="zone-name">{zone.name}</div>
        <div className="zone-controller">{zone.controller}</div>
        {divCount > 0 && (
          <div className="zone-strength">
            D{divCount} S{totalStrength}
          </div>
        )}
      </div>
    );
  };

  const renderDivisionList = () => {
    const playerDivs = divisions.filter(
      (d) => d.side === playerSide && d.strength > 0,
    );

    return (
      <div className="division-list">
        <h3>YOUR DIVISIONS</h3>
        {playerDivs.map((div) => {
          const zone = zones[div.location];
          return (
            <div
              key={div.id}
              className={`division-item ${selectedDivision === div.id ? "selected" : ""}`}
              onClick={() => {
                if (gamePhase === "move") setSelectedDivision(div.id);
              }}
            >
              <div className="div-name">{div.name}</div>
              <div className="div-stats">
                {div.role} S{div.strength}
              </div>
              <div className="div-location">@ {zone.fullName}</div>
              {gamePhase === "reinforce" && (
                <button
                  className="btn-reinforce"
                  onClick={(e) => {
                    e.stopPropagation();
                    reinforceDivision(div.id);
                  }}
                  disabled={playerSupply < 2 || div.strength >= 5}
                >
                  +1 (2S)
                </button>
              )}
              {gamePhase === "move" && selectedDivision === div.id && (
                <div className="move-options">
                  {zone.neighbors.map((neighbor) => (
                    <button
                      key={neighbor}
                      className="btn-move"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveDivision(div.id, neighbor);
                      }}
                    >
                      → {zones[neighbor].fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="eastern-front-container">
        <div className="terminal-window">
          <div className="terminal-header">
            <span>EASTERN_FRONT_2022.EXE</span>
          </div>
          <div className="terminal-body start-screen">
            <pre className="ascii-title">
              {`
╔═══════════════════════════════════════════════╗
║                                               ║
║        EASTERN FRONT 2022                     ║
║                                               ║
║   A Minimalist Grand Strategy Wargame        ║
║                                               ║
╚═══════════════════════════════════════════════╝
`}
            </pre>
            <div className="side-selection">
              <p className="select-prompt">SELECT YOUR FACTION:</p>
              <button
                className="btn-side ukraine"
                onClick={() => startGame(Side.UKRAINE)}
              >
                <span className="side-flag">🇺🇦</span>
                <span className="side-name">UKRAINE</span>
              </button>
              <button
                className="btn-side russia"
                onClick={() => startGame(Side.RUSSIA)}
              >
                <span className="side-flag">🇷🇺</span>
                <span className="side-name">RUSSIA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eastern-front-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <span>EASTERN_FRONT_2022.EXE</span>
          <span className="turn-display">TURN {turn}</span>
        </div>

        <div className="game-layout">
          {/* Left Panel - Map & Status */}
          <div className="left-panel">
            <div className="status-bar">
              <div className="status-item">
                <span className="label">YOUR SIDE:</span>
                <span className={`value side-${playerSide.toLowerCase()}`}>
                  {playerSide}
                </span>
              </div>
              <div className="status-item">
                <span className="label">SUPPLY:</span>
                <span className="value supply">{playerSupply}</span>
              </div>
              <div className="status-item">
                <span className="label">PHASE:</span>
                <span className="value phase">{gamePhase.toUpperCase()}</span>
              </div>
            </div>

            <div className="map-grid">
              <div className="map-row">
                {renderZone("KYIV")}
                {renderZone("SUMY")}
                {renderZone("KHARKIV")}
              </div>
              <div className="map-row">
                {renderZone("CHER")}
                {renderZone("POLT")}
                {renderZone("LUHANSK")}
              </div>
              <div className="map-row">
                {renderZone("ODESA")}
                {renderZone("MYKO")}
                {renderZone("KHER")}
              </div>
            </div>

            <div className="phase-controls">
              {gamePhase === "reinforce" && (
                <button className="btn-phase" onClick={skipReinforcement}>
                  SKIP REINFORCEMENT →
                </button>
              )}
              {gamePhase === "move" && (
                <button className="btn-phase" onClick={endMovement}>
                  END MOVEMENT →
                </button>
              )}
              {gamePhase === "event" && (
                <button className="btn-phase" onClick={endTurn}>
                  NEXT TURN →
                </button>
              )}
              {gamePhase === "gameover" && (
                <button className="btn-phase" onClick={resetGame}>
                  NEW GAME
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Divisions & Log */}
          <div className="right-panel">
            {renderDivisionList()}

            <div className="event-log">
              <h3>COMBAT LOG</h3>
              <div className="log-entries">
                {log.map((entry, i) => (
                  <div key={i} className={`log-entry log-${entry.type}`}>
                    {entry.message}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasternFront;
