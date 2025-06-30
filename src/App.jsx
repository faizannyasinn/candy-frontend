import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CandyBoard from './components/CandyBoard.jsx';
import PoisonSelector from './components/PoisonSelector.jsx';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby, waiting, poison, game, over
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [lastClicked, setLastClicked] = useState(null);
  const [gameOverMsg, setGameOverMsg] = useState("");

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

  useEffect(() => {
    socket.on("both-joined", () => {
      setStage("poison");
    });

    socket.on("start-game", () => {
      setStage("game");
    });

    socket.on("next-turn", ({ currentTurn, lastClicked }) => {
      setIsMyTurn(currentTurn === socket.id);
      setLastClicked(lastClicked);
    });

    socket.on("game-over", ({ loser }) => {
      setStage("over");
      setGameOverMsg(socket.id === loser ? "You Lost 😢" : "You Win 🎉");
    });

    return () => {
      socket.off("both-joined");
      socket.off("start-game");
      socket.off("next-turn");
      socket.off("game-over");
    };
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', padding: '30px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === "lobby" && (
        <>
          <input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
          <br /><br />
          <button onClick={handleCreateRoom}>➕ Create Room</button>
          <br /><br />
          <input placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
          <br /><br />
          <button onClick={handleJoinRoom}>🔑 Join Room</button>
        </>
      )}

      {stage === "waiting" && (
        <div style={{ whiteSpace: 'pre-line' }}>{status}</div>
      )}

      {stage === "poison" && (
        <PoisonSelector socket={socket} roomCode={roomCode} />
      )}

      {stage === "game" && (
        <CandyBoard
          socket={socket}
          roomCode={roomCode}
          isMyTurn={isMyTurn}
          lastClicked={lastClicked}
        />
      )}

      {stage === "over" && (
        <div>
          <h2>{gameOverMsg}</h2>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
