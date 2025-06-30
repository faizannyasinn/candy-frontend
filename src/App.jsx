import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CandyBoard from './components/CandyBoard';
import PoisonSelector from './components/PoisonSelector';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby, poison, game
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);

  const generateRoomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = generateRoomCode();
    setRoomCode(code);
    socket.emit("join-room", code, name);
    setStatus(`Room Code: ${code}\nWaiting for opponent...`);
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) return alert("Enter name and room code");
    socket.emit("join-room", roomCode, name);
    setStatus("Joining room...");
  };

  useEffect(() => {
    socket.on("start-poison-selection", ({ isFirst }) => {
      setIsFirstPlayer(isFirst);
      setStage("poison");
    });

    socket.on("start-game", () => {
      setStage("game");
    });

    return () => {
      socket.off("start-poison-selection");
      socket.off("start-game");
    };
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '40px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} /><br />
          <button onClick={handleCreateRoom}>Create Room</button>
          <p>or</p>
          <input placeholder="Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} /><br />
          <button onClick={handleJoinRoom}>Join Room</button>
          <div style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>{status}</div>
        </>
      )}

      {stage === "poison" && (
        <PoisonSelector
          roomCode={roomCode}
          socket={socket}
          isFirstPlayer={isFirstPlayer}
        />
      )}

      {stage === "game" && (
        <CandyBoard
          socket={socket}
          roomCode={roomCode}
        />
      )}
    </div>
  );
}

export default App;
