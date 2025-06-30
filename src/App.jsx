import React, { useEffect, useState } from 'react';
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
  const [candies, setCandies] = useState([]);
  const [poison, setPoison] = useState(null);
  const [opponentPoison, setOpponentPoison] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winner, setWinner] = useState("");

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
    setPoison(index);
    socket.emit("poison-selected", roomCode, index);
    setStatus("Waiting for opponent to select poison...");
  };

  const handleCandyClick = (index) => {
    if (!isMyTurn || stage !== "game") return;

    if (index === opponentPoison) {
      socket.emit("game-over", roomCode, false);
      setWinner("opponent");
      setStage("end");
    } else {
      socket.emit("switch-turn", roomCode);
    }
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStage("poison");
      const generatedCandies = Array.from({ length: 15 }, (_, i) => i);
      setCandies(generatedCandies.sort(() => Math.random() - 0.5));
      setStatus("Both players joined! Choose your poison candy.");
    });

    socket.on("opponent-poison", (index) => {
      setOpponentPoison(index);
    });

    socket.on("poison-ready", () => {
      setStage("game");
      setStatus("Your turn to eat a candy");
      setIsMyTurn(true);
    });

    socket.on("switch-turn", () => {
      setIsMyTurn((prev) => {
        const newTurn = !prev;
        setStatus(newTurn ? "Your turn to eat a candy" : "Opponent's turn");
        return newTurn;
      });
    });

    socket.on("game-over", (winnerName) => {
      setWinner(winnerName === name ? "you" : "opponent");
      setStage("end");
    });

    return () => {
      socket.off("player-joined");
      socket.off("opponent-poison");
      socket.off("poison-ready");
      socket.off("switch-turn");
      socket.off("game-over");
    };
  }, [name, roomCode]);

  return (
    <div className="App">
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleCreateRoom}>Create Room</button>
          <div>or</div>
          <input placeholder="Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
          <button onClick={handleJoinRoom}>Join Room</button>
        </>
      )}

      {stage === "waiting" && <p>{status}</p>}

      {stage === "poison" && (
        <>
          <p>{status}</p>
          <PoisonSelector candies={candies} onSelect={handlePoisonSelect} selected={poison} />
        </>
      )}

      {stage === "game" && (
        <>
          <p>{status}</p>
          <CandyBoard candies={candies} onClick={handleCandyClick} />
        </>
      )}

      {stage === "end" && (
        <h2>{winner === "you" ? "🎉 You Win!" : "💀 You Lost!"}</h2>
      )}
    </div>
  );
}

export default App;
