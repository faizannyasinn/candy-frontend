import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PoisonSelector from './components/PoisonSelector';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | poison | game | result
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [poisonChosen, setPoisonChosen] = useState(false);
  const [bothPoisonSelected, setBothPoisonSelected] = useState(false);

  const generateRoomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = generateRoomCode();
    setRoomCode(code);
    setIsCreator(true);
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
    socket.on("player-joined", () => {
      if (isCreator) {
        setStage("poison");
        setStatus("🎯 Choose 1 candy to mark as poison");
      } else {
        setStage("waiting");
        setStatus("Waiting for opponent to choose poison...");
      }
    });

    socket.on("poison-set", () => {
      if (!isCreator) {
        setStage("poison");
        setStatus("🎯 Your turn! Choose 1 candy to mark as poison");
      } else {
        setStatus("Waiting for opponent to choose poison...");
      }
    });

    socket.on("both-poison-set", () => {
      setStage("game");
      setStatus("🎮 Both players chose poison. Let the game begin!");
    });

    return () => {
      socket.off("player-joined");
      socket.off("poison-set");
      socket.off("both-poison-set");
    };
  }, [isCreator]);

  const handlePoisonSelected = () => {
    setPoisonChosen(true);
    socket.emit("poison-selected", roomCode);
  };

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '40px' }}>
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
          <h3>{status}</h3>
          <PoisonSelector onSelect={handlePoisonSelected} />
        </>
      )}

      {stage === "game" && (
        <>
          <h3>{status}</h3>
          <CandyBoard />
        </>
      )}
    </div>
  );
}

export default App;
