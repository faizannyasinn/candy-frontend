import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PoisonSelector from './components/PoisonSelector';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | poison | game | end
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [poisonIndex, setPoisonIndex] = useState(null);
  const [opponentPoison, setOpponentPoison] = useState(null);
  const [gameOver, setGameOver] = useState(null); // true=win, false=lose

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
    socket.on("player-joined", () => {
      setStage("poison");
      setStatus("Select a poisonous candy (opponent won't know)");
    });

    socket.on("opponent-poison", (index) => {
      setOpponentPoison(index);
    });

    socket.on("poison-ready", () => {
      setStage("game");
      setIsMyTurn(true);
      setStatus("Game started! Your turn to eat a candy");
    });

    socket.on("switch-turn", () => {
      setIsMyTurn((prev) => !prev);
      setStatus((prev) => isMyTurn ? "Opponent's turn" : "Your turn to eat a candy");
    });

    socket.on("game-over", (didWin) => {
      setGameOver(didWin);
      setStage("end");
    });

    return () => {
      socket.off("player-joined");
      socket.off("opponent-poison");
      socket.off("poison-ready");
      socket.off("switch-turn");
      socket.off("game-over");
    };
  }, [isMyTurn]);

  const handlePoisonSelect = (index) => {
    setPoisonIndex(index);
    socket.emit("poison-selected", roomCode, index);
    setStatus("Waiting for opponent to select poison...");
  };

  const handleCandyClick = (index) => {
    if (!isMyTurn || stage !== "game") return;
    if (index === opponentPoison) {
      socket.emit("game-over", roomCode, false);
    } else {
      socket.emit("switch-turn", roomCode);
    }
  };

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '30px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input placeholder="Enter your name" value={name}
            onChange={(e) => setName(e.target.value)} /><br /><br />

          <button onClick={handleCreateRoom}>➕ Create Room</button>
          <div>OR</div>
          <input placeholder="Enter Room Code" value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)} /><br /><br />
          <button onClick={handleJoinRoom}>🔑 Join Room</button>
        </>
      )}

      {stage === "waiting" && <p style={{ whiteSpace: 'pre-line' }}>{status}</p>}

      {stage === "poison" && (
        <>
          <p>{status}</p>
          <PoisonSelector onSelect={handlePoisonSelect} />
        </>
      )}

      {stage === "game" && (
        <>
          <p>{status}</p>
          <CandyBoard onCandyClick={handleCandyClick} />
        </>
      )}

      {stage === "end" && (
        <>
          <h2>{gameOver ? "🎉 You Win!" : "💀 You Lose"}</h2>
        </>
      )}
    </div>
  );
}

export default App;
