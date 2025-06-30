import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PoisonSelector from './components/PoisonSelector';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby, waiting, poison, game, end
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [candies, setCandies] = useState([]);
  const [poisonSelected, setPoisonSelected] = useState(false);
  const [opponentPoison, setOpponentPoison] = useState(null);

  // Create 15 random candies
  const generateCandies = () => {
    const colors = [
      '#FF5C5C', '#FFB347', '#FFD700', '#ADFF2F', '#40E0D0',
      '#6495ED', '#DA70D6', '#FF69B4', '#FF7F50', '#90EE90',
      '#FF6347', '#BA55D3', '#00CED1', '#FFA07A', '#20B2AA'
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length]
    }));
  };

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setRoomCode(code);
    setIsHost(true);
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

  const handleSelectPoison = (index) => {
    if (poisonSelected) return;
    setPoisonSelected(true);
    socket.emit("select-poison", roomCode, index);
    setStatus("Waiting for opponent to select poison...");
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStatus("🎉 Both players joined!");
      setCandies(generateCandies());
      setTimeout(() => {
        setStage("poison");
        setStatus("Select a candy to poison.");
      }, 1000);
    });

    socket.on("opponent-selected-poison", () => {
      setOpponentPoison(true);
    });

    socket.on("start-game", () => {
      setStage("game");
      setStatus("Game has started!");
    });

    return () => {
      socket.off("player-joined");
      socket.off("opponent-selected-poison");
      socket.off("start-game");
    };
  }, [roomCode]);

  return (
    <div className="App" style={{ textAlign: 'center', paddingTop: '40px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', marginBottom: '10px', width: '220px' }}
          /><br />

          <button onClick={handleCreateRoom} style={{ margin: '10px', padding: '10px 20px' }}>
            ➕ Create a Room
          </button>

          <div style={{ marginTop: '20px' }}>or</div>

          <input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{ padding: '10px', marginTop: '10px', width: '220px' }}
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
        <>
          <p>{status}</p>
          <PoisonSelector
            candies={candies}
            onSelect={handleSelectPoison}
            selectedIndex={poisonSelected ? -1 : null}
            isDisabled={poisonSelected}
          />
        </>
      )}

      {stage === "game" && (
        <>
          <p>{status}</p>
          <CandyBoard />
        </>
      )}
    </div>
  );
}

export default App;
