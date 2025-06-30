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
  const [playerId, setPlayerId] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [isPoisonChosen, setIsPoisonChosen] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winnerId, setWinnerId] = useState(null);

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
    socket.emit("poison-chosen", { roomCode, poisonIndex: index });
    setStatus("Waiting for opponent to choose...");
    setIsPoisonChosen(true);
  };

  const handleCandyClick = (index) => {
    if (!isMyTurn) return;
    socket.emit("play-turn", { roomCode, candyIndex: index });
  };

  useEffect(() => {
    setPlayerId(socket.id);

    socket.on("player-joined", (players) => {
      setPlayerList(players);
      if (players.length === 2) {
        setStage("poison");
        setStatus("Choose one candy to be poisonous...");
      }
    });

    socket.on("poison-chosen", () => {
      setStage("game");
    });

    socket.on("turn-played", ({ nextPlayerId }) => {
      setIsMyTurn(nextPlayerId === socket.id);
    });

    socket.on("game-over", ({ winnerId }) => {
      setStage("result");
      setWinnerId(winnerId);
    });

    return () => {
      socket.off("player-joined");
      socket.off("poison-chosen");
      socket.off("turn-played");
      socket.off("game-over");
    };
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <br /><br />
          <button onClick={handleCreateRoom}>➕ Create a Room</button>
          <br /><br />
          <input placeholder="Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
          <br /><br />
          <button onClick={handleJoinRoom}>🔑 Join a Room</button>
        </>
      )}

      {stage === "waiting" && <pre>{status}</pre>}

      {stage === "poison" && !isPoisonChosen && (
        <PoisonSelector onSelect={handlePoisonSelect} message={status} />
      )}

      {stage === "game" && (
        <CandyBoard isYourTurn={isMyTurn} onCandyClick={handleCandyClick} />
      )}

      {stage === "result" && (
        <h2>
          {winnerId === socket.id ? "🎉 You Win!" : "💀 You Lost!"}
        </h2>
      )}
    </div>
  );
}

export default App;
