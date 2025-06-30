import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PoisonSelector from './components/PoisonSelector';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | select | game
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState(""); // player1 or player2
  const [poisonInfo, setPoisonInfo] = useState({ player1: null, player2: null });
  const [winner, setWinner] = useState("");

  const generateRoomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = generateRoomCode();
    setRoomCode(code);
    setRole("player1");
    socket.emit("join-room", code, name);
    setStage("waiting");
    setStatus(`Room Code: ${code}\nWaiting for opponent...`);
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) return alert("Enter name and room code");
    setRole("player2");
    socket.emit("join-room", roomCode, name);
    setStage("waiting");
    setStatus("Joining room...");
  };

  const handlePoisonSelect = (index) => {
    socket.emit("select-poison", roomCode, role, index);
    setStatus("Waiting for opponent to select poison...");
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStatus("🎉 Both players joined! Select your secret poison candy...");
      setStage("select");
    });

    socket.on("poison-update", (data) => {
      setPoisonInfo(data);

      if (data.player1 !== null && data.player2 !== null) {
        setStage("game");
        setStatus("Game has started! Pick candies one by one.");
        if (role === "player1") {
          socket.emit("next-turn", "player1");
        }
      }
    });

    socket.on("next-turn", (nextPlayer) => {
      if (nextPlayer === role) {
        setStatus("🎯 Your turn to pick a candy");
      } else {
        setStatus("⏳ Waiting for opponent's move...");
      }
    });

    socket.on("game-over", (winnerRole) => {
      if (winnerRole === role) {
        setWinner("🎉 You Won!");
      } else {
        setWinner("💀 You Lost!");
      }
    });

    return () => {
      socket.off("player-joined");
      socket.off("poison-update");
      socket.off("next-turn");
      socket.off("game-over");
    };
  }, [role, roomCode]);

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

      {stage === "select" && poisonInfo[role] === null && (
        <PoisonSelector onSelect={handlePoisonSelect} />
      )}

      {stage === "select" && poisonInfo[role] !== null && (
        <div style={{ marginTop: '20px' }}>{status}</div>
      )}

      {stage === "game" && (
        <>
          <h3 style={{ marginTop: '20px' }}>{status}</h3>
          {!winner && (
            <CandyBoard
              socket={socket}
              myRole={role}
              poisonInfo={poisonInfo}
              setWinner={setWinner}
            />
          )}
          {winner && (
            <h2 style={{ marginTop: '30px' }}>{winner}</h2>
          )}
        </>
      )}
    </div>
  );
}

export default App;
