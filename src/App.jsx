import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [stage, setStage] = useState("lobby"); // lobby, waiting, poison, playing, end
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [poisonedByPlayer, setPoisonedByPlayer] = useState({});
  const [myTurn, setMyTurn] = useState(false);
  const [selectedCandy, setSelectedCandy] = useState(null);

  const generateRoomCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleCreateRoom = () => {
    if (!name) return alert("Enter your name");
    const code = generateRoomCode();
    setRoomCode(code);
    setIsPlayer1(true);
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

  const handleCandyClick = (idx) => {
    if (stage === "poison") {
      socket.emit("poison-select", roomCode, idx);
      setStatus("Waiting for opponent to select poison...");
      setStage("wait-poison");
    } else if (stage === "playing" && myTurn) {
      setSelectedCandy(idx);
      socket.emit("eat-candy", roomCode, idx);
    }
  };

  useEffect(() => {
    socket.on("player-joined", () => {
      setStatus(isPlayer1 ? "Your turn to choose poison!" : "Waiting for opponent to choose poison...");
      setStage(isPlayer1 ? "poison" : "wait-poison");
    });

    socket.on("both-poisoned", () => {
      setStatus(isPlayer1 ? "Your turn! Eat a candy." : "Waiting for opponent's move...");
      setMyTurn(isPlayer1);
      setStage("playing");
    });

    socket.on("opponent-ate", (idx) => {
      if (poisonedByPlayer[isPlayer1 ? "player2" : "player1"] === idx) {
        setStage("end");
        setStatus("You win! Opponent ate your poison candy.");
      } else {
        setMyTurn(true);
        setStatus("Your turn! Eat a candy.");
      }
    });

    socket.on("game-over", () => {
      setStage("end");
      setStatus("You lost! You ate poison candy.");
    });

    socket.on("store-poison", (who, index) => {
      setPoisonedByPlayer(prev => ({ ...prev, [who]: index }));
    });

    return () => {
      socket.off("player-joined");
      socket.off("both-poisoned");
      socket.off("opponent-ate");
      socket.off("game-over");
      socket.off("store-poison");
    };
  }, [isPlayer1, poisonedByPlayer, roomCode]);

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

      {(stage === "waiting" || stage === "wait-poison" || stage === "end") && (
        <div style={{ whiteSpace: 'pre-line', marginTop: '30px' }}>
          {status}
        </div>
      )}

      {(stage === "poison" || stage === "playing") && (
        <>
          <h3 style={{ marginTop: '20px' }}>{status}</h3>
          <CandyBoard
            onSelect={handleCandyClick}
            disabled={stage === "wait-poison" || (stage === "playing" && !myTurn)}
            selected={selectedCandy}
          />
        </>
      )}
    </div>
  );
}

export default App;
