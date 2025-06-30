
// 📁 React Frontend (client/src/App.jsx)
import React, { useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";
import './App.css';
import candy1 from "./assets/candy1.png";
import candy2 from "./assets/candy2.png";
import candy3 from "./assets/candy3.png";
import candy4 from "./assets/candy4.png";
import candy5 from "./assets/candy5.png";
import candy6 from "./assets/candy6.png";
import candy7 from "./assets/candy7.png";
import candy8 from "./assets/candy8.png";
import candy9 from "./assets/candy9.png";
import candy10 from "./assets/candy10.png";
import candy11 from "./assets/candy11.png";
import candy12 from "./assets/candy12.png";
import candy13 from "./assets/candy13.png";
import candy14 from "./assets/candy14.png";
import candy15 from "./assets/candy15.png";

const socket = io("https://your-backend-url.onrender.com"); // Replace with real backend

const candyImages = [
  candy1, candy2, candy3, candy4, candy5,
  candy6, candy7, candy8, candy9, candy10,
  candy11, candy12, candy13, candy14, candy15
];

function getRandomCandies(count = 15) {
  const shuffled = [...candyImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function App() {
  const [candies, setCandies] = useState(getRandomCandies());
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleCreateRoom = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setRoomCode(code);
    socket.emit("create-room", { roomCode: code, name });
    setHasJoined(true);
  };

  const handleJoinRoom = () => {
    socket.emit("join-room", { roomCode, name });
    setHasJoined(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-yellow-100 text-center p-6">
      {!hasJoined ? (
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-pink-600">Tutti Frutti Candy Game</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-60"
          />
          {isCreating ? (
            <button
              onClick={handleCreateRoom}
              className="bg-pink-500 text-white px-4 py-2 rounded"
            >
              Create Room
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="border p-2 rounded w-40"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Join Room
              </button>
            </>
          )}
          <div>
            <button
              onClick={() => setIsCreating(true)}
              className="text-sm text-blue-500"
            >
              Want to create a room?
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Room Code: {roomCode}</h2>
          <div className="grid grid-cols-5 gap-4 justify-center items-center">
            {candies.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="candy"
                className="w-16 h-16 rounded shadow"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
