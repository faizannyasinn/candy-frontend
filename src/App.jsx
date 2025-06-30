import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// 👇 Live backend URL
const socket = io("https://candy-backend-production.up.railway.app");

function App() {
  const [status, setStatus] = useState("Waiting for opponent...");

  useEffect(() => {
    socket.on("player-joined", () => {
      setStatus("🎉 Opponent joined! Get ready to play!");
    });

    // Optional: cleanup
    return () => {
      socket.off("player-joined");
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
