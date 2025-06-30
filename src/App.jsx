import poisonselector from './components/poisonselector';
import candyboard from './components/CandyBoard';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby | waiting | poison | game | end
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [poisonId, setPoisonId] = useState(null);
  const [turn, setTurn] = useState(null);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [opponentPoison, setOpponentPoison] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

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
    setPlayerNumber(1);
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) return alert("Enter name and room code");
    socket.emit("join-room", roomCode, name);
    setStage("waiting");
    setStatus("Joining room...");
    setPlayerNumber(2);
  };

  const handlePoisonSelect = (id) => {
    setPoisonId(id);
    socket.emit("poison-selected", { room: roomCode, id });
    setStatus("Waiting for opponent to choose poison candy...");
  };

  const handleCandyClick = (id) => {
    if (gameOver || turn !== playerNumber) return;
    if (id === opponentPoison) {
      setWinner(playerNumber === 1 ? 2 : 1);
      setGameOver(true);
      setStage("end");
      socket.emit("candy-picked", { room: roomCode, id, loser: name });
    } else {
      setTurn(playerNumber === 1 ? 2 : 1);
      setStatus("Waiting for opponent's turn...");
      socket.emit("turn-change", roomCode);
    }
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStage("poison");
      setStatus("🎉 Both players joined! Choose your poison candy...");
    });

    socket.on("both-poison-selected", ({ opponent }) => {
      setOpponentPoison(opponent);
      setStage("game");
      setTurn(1);
      setStatus("Game started! Player 1's turn");
    });

    socket.on("turn-update", (newTurn) => {
      setTurn(newTurn);
      setStatus(`Player ${newTurn}'s turn`);
    });

    socket.on("game-over", ({ loser }) => {
      setWinner(loser === name ? (playerNumber === 1 ? 2 : 1) : playerNumber);
      setGameOver(true);
      setStage("end");
    });

    return () => {
      socket.off("player-joined");
      socket.off("both-poison-selected");
      socket.off("turn-update");
      socket.off("game-over");
    };
  }, [name, roomCode, playerNumber]);

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
        <>
          <h2>{status}</h2>
          <poisonselector onSelect={handlePoisonSelect} />
        </>
      )}

      {stage === "game" && (
        <>
          <h2>{status}</h2>
          <candyboard onCandyClick={handleCandyClick} disabled={turn !== playerNumber} />
        </>
      )}

      {stage === "end" && (
        <h2 style={{ color: winner === playerNumber ? 'green' : 'red' }}>
          {winner === playerNumber ? '🎉 You Win!' : '💀 You Lost!'}
        </h2>
      )}
    </div>
  );
}

export default App;
