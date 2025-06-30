import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CandyBoard from './components/CandyBoard';
import PoisonSelector from './components/PoisonSelector';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | poison | game | end
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [poisonIndex, setPoisonIndex] = useState(null);

  const generateRoomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

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

  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
    });

    socket.on("player-joined", (players) => {
      if (players[0] === socket.id) {
        setStage("poison");
        setStatus("You're Player 1. Choose a poisonous candy.");
      } else {
        setStage("waiting");
        setStatus("You're Player 2. Waiting for Player 1 to choose poison...");
      }
    });

    socket.on("poison-chosen", () => {
      setStage("game");
      setStatus("Game started! Player 1's turn.");
      if (playerId === socket.id) {
        setIsPlayerTurn(true);
      }
    });

    socket.on("turn-played", ({ nextPlayerId }) => {
      setIsPlayerTurn(socket.id === nextPlayerId);
      setStatus(socket.id === nextPlayerId ? "Your turn!" : "Opponent's turn...");
    });

    socket.on("game-over", ({ winnerId }) => {
      setStage("end");
      if (winnerId === socket.id) {
        setStatus("🎉 You won!");
      } else {
        setStatus("💀 You clicked the poisonous candy. You lost!");
      }
    });

    return () => {
      socket.off("connect");
      socket.off("player-joined");
      socket.off("poison-chosen");
      socket.off("turn-played");
      socket.off("game-over");
    };
  }, [playerId]);

  const handlePoisonSelect = (index) => {
    setPoisonIndex(index);
    setStage("game");
    setIsPlayerTurn(true);
    setStatus("Game started! Your turn.");
    socket.emit("poison-chosen", { roomCode, poisonIndex: index });
  };

  const handleCandyClick = (index) => {
    if (!isPlayerTurn || stage !== "game") return;

    socket.emit("play-turn", { roomCode, candyIndex: index });
  };

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', marginBottom: '10px' }}
          /><br />

          <button onClick={handleCreateRoom} style={{ margin: '10px', padding: '10px 20px' }}>
            ➕ Create a Room
          </button>

          <div style={{ marginTop: '20px' }}>or</div>

          <input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{ padding: '10px', marginTop: '10px' }}
          /><br />

          <button onClick={handleJoinRoom} style={{ marginTop: '10px', padding: '10px 20px' }}>
            🔑 Join a Room
          </button>
        </>
      )}

      {stage === "waiting" && (
        <div style={{ whiteSpace: 'pre-line', marginTop: '30px' }}>{status}</div>
      )}

      {stage === "poison" && (
        <PoisonSelector onSelect={handlePoisonSelect} message={status} />
      )}

      {stage === "game" && (
        <>
          <h3>{status}</h3>
          <CandyBoard isYourTurn={isPlayerTurn} onCandyClick={handleCandyClick} />
        </>
      )}

      {stage === "end" && <h2>{status}</h2>}
    </div>
  );
}

export default App;
