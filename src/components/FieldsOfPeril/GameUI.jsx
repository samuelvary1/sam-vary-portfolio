import React, { useState, useEffect, useRef } from "react";
import yaml from "js-yaml";
import { evaluateCommand } from "../../engine/GameEngine";
import "./GameUI.css";

const GameUI = () => {
  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("");
  const outputRef = useRef(null);

  useEffect(() => {
    const savedGame = localStorage.getItem("adventureGameState");
    const savedLog = localStorage.getItem("adventureLog");

    if (savedGame) {
      setGame(JSON.parse(savedGame));
    } else {
      loadGame();
    }

    if (savedLog) {
      setLog(JSON.parse(savedLog));
    }
  }, []);

  useEffect(() => {
    if (game) {
      localStorage.setItem("adventureGameState", JSON.stringify(game));
    }
  }, [game]);

  useEffect(() => {
    localStorage.setItem("adventureLog", JSON.stringify(log));
  }, [log]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({
        top: outputRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [log]);

  const loadGame = async () => {
    const [locRes, itemRes] = await Promise.all([
      fetch("/data/locations.yml").then((res) => res.text()),
      fetch("/data/items.yml").then((res) => res.text()),
    ]);

    const locations = yaml.load(locRes);
    const items = yaml.load(itemRes);

    const rooms = {};
    locations.forEach((room) => {
      rooms[room.title] = { ...room, been_before: false };
    });

    const itemMap = {};
    items.forEach((item) => {
      itemMap[item.handle] = item;
    });

    setGame({
      rooms,
      items: itemMap,
      player: { location: "apartment_living_room", inventory: [] },
      messages: {
        help: "Available commands: go, look, take, open, use, examine, read, inventory, quit",
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !game) return;

    const response = evaluateCommand(input.trim(), game, setGame);
    setLog((prev) => [...prev, `> ${input}`, response]);
    setInput("");
  };

  if (!game) return <div>Loading game data...</div>;

  const currentRoom = game.rooms[game.player.location];
  const initialDesc = !currentRoom.been_before
    ? currentRoom.first_time_message
    : currentRoom.header;

  return (
    <div className="game-container">
      <div className="game-output" ref={outputRef}>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {initialDesc}
          {"\n"}
          {log.join("\n")}
        </pre>
      </div>
      <form onSubmit={handleSubmit} className="game-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a command..."
          autoFocus
        />
        <button type="submit">Submit</button>
      </form>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        style={{
          marginTop: "12px",
          background: "#444",
          color: "#fff",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Reset Game
      </button>
    </div>
  );
};

export default GameUI;
