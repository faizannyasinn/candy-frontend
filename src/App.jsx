import poisonselector from './components/poisonselector';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | poison | game
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");

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

  const handlePoisonSelect = (id) => {
    console.log("Poison candy chosen:", id);
    socket.emit("poison-selected", { room: roomCode, id });
    setStatus("Waiting for opponent to choose poison candy...");
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStage("poison");
      setStatus("🎉 Both players joined! Choose your poison candy...");
    });

    socket.on("both-poison-selected", () => {
      setStage("game");
      setStatus("Game Started! Take turns to pick candies...");
    });

    return () => {
      socket.off("player-joined");
      socket.off("both-poison-selected");
    };
  }, []);

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
        <div style={{ whiteSpace: 'pre-line', marginTop: '30px' }}>
          {status}
        </div>
      )}

      {stage === "poison" && (
        <>
          <h2>{status}</h2>
          <poisonselector onSelect={handlePoisonSelect} />
        </>
      )}

      {stage === "game" && (
        <>
          <h2>{status}</h2>
        </>
      )}
    </div>
  );
}

export default App;
