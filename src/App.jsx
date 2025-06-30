import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PoisonSelector from './components/PoisonSelector';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | game
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [playerRole, setPlayerRole] = useState(""); // 'player1' or 'player2'
  const [poisonSelected, setPoisonSelected] = useState({
    player1: false,
    player2: false,
  });

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
    socket.on("assign-role", (role) => {
      setPlayerRole(role);
    });

    socket.on("player-joined", () => {
      setStage("game");
      setStatus("🎉 Both players joined! Game starting soon...");
    });

    socket.on("poison-selected", (fromPlayer) => {
      setPoisonSelected(prev => ({ ...prev, [fromPlayer]: true }));
    });

    return () => {
      socket.off("assign-role");
      socket.off("player-joined");
      socket.off("poison-selected");
    };
  }, []);

  const handlePoisonSelect = (index) => {
    socket.emit("poison-selected", playerRole);
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
        <div style={{ whiteSpace: 'pre-line', marginTop: '30px' }}>
          {status}
        </div>
      )}

      {stage === "game" && !poisonSelected[playerRole] && (
        <>
          <h3>Select 1 poisonous candy</h3>
          <PoisonSelector onSelect={handlePoisonSelect} />
        </>
      )}

      {stage === "game" &&
        poisonSelected.player1 &&
        poisonSelected.player2 && (
          <CandyBoard socket={socket} />
      )}
    </div>
  );
}

export default App;
