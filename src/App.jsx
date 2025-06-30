import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PoisonSelector from "./components/PoisonSelector";
import CandyBoard from "./components/CandyBoard";
import "./App.css";

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby, waiting, select, game, result
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [myPoison, setMyPoison] = useState(null);
  const [opponentPoison, setOpponentPoison] = useState(null);

  const generateRoomCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = generateRoomCode();
    setRoomCode(code);
    socket.emit("join-room", code, name);
    setStage("waiting");
    setStatus(`Room Code: ${code}\nWaiting for opponent...`);
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) return alert("Enter name and room code");
    socket.emit("join-room", roomCode, name);
    setStage("waiting");
    setStatus("Joining room...");
  };

  const handlePoisonSelect = (index) => {
    setMyPoison(index);
    socket.emit("poison-selected", roomCode, index);
    setStatus("Waiting for opponent to select poison...");
    setStage("waiting");
  };

  const handleCandyClick = (index) => {
    if (index === opponentPoison) {
      socket.emit("game-over", roomCode, false);
      setStatus("💀 You clicked opponent’s poison! You Lose.");
      setStage("result");
    } else {
      socket.emit("switch-turn", roomCode);
      setIsMyTurn(false);
    }
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStage("select");
      setStatus("🎉 Both players joined! Choose your poisonous candy.");
    });

    socket.on("poison-ready", () => {
      setStatus("Game started! Take turns to eat candies 🍬");
      setIsMyTurn(true);
      setStage("game");
    });

    socket.on("opponent-poison", (index) => {
      setOpponentPoison(index);
    });

    socket.on("switch-turn", () => {
      setIsMyTurn(true);
    });

    socket.on("game-over", (won) => {
      setStage("result");
      setStatus(won ? "🎉 You Win!" : "💀 You Lose!");
    });

    return () => {
      socket.off("player-joined");
      socket.off("poison-ready");
      socket.off("opponent-poison");
      socket.off("switch-turn");
      socket.off("game-over");
    };
  }, [roomCode]);

  return (
    <div className="App" style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", marginBottom: "10px" }}
          />
          <br />
          <button onClick={handleCreateRoom} style={{ margin: "10px", padding: "10px 20px" }}>
            ➕ Create a Room
          </button>
          <div style={{ marginTop: "20px" }}>or</div>
          <input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{ padding: "10px", marginTop: "10px" }}
          />
          <br />
          <button onClick={handleJoinRoom} style={{ marginTop: "10px", padding: "10px 20px" }}>
            🔑 Join a Room
          </button>
        </>
      )}

      {stage === "waiting" && (
        <div style={{ whiteSpace: "pre-line", marginTop: "30px" }}>{status}</div>
      )}

      {stage === "select" && (
        <PoisonSelector onSelect={handlePoisonSelect} message={status} />
      )}

      {stage === "game" && (
        <CandyBoard isYourTurn={isMyTurn} onCandyClick={handleCandyClick} />
      )}

      {stage === "result" && (
        <h2 style={{ marginTop: "40px" }}>{status}</h2>
      )}
    </div>
  );
}

export default App;
