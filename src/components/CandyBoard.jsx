import React, { useState, useEffect } from 'react';
import './CandyBoard.css';

const generateCandies = () => {
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'cyan', 'lime', 'magenta', 'teal', 'brown', 'coral', 'gold', 'violet'];
  return colors.sort(() => 0.5 - Math.random()).slice(0, 15);
};

function CandyBoard({ socket, roomCode, isMyTurn, lastClicked }) {
  const [candies, setCandies] = useState([]);

  useEffect(() => {
    setCandies(generateCandies());
  }, []);

  const handleClick = (index) => {
    if (!isMyTurn) return alert("Wait for your turn");
    socket.emit("candy-clicked", { roomCode, index });
  };

  return (
    <div className="board">
      {candies.map((color, index) => (
        <div
          key={index}
          className={`dot ${lastClicked === index ? 'last' : ''}`}
          style={{ background
