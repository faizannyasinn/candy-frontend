import React, { useState } from 'react';
import './CandyBoard.css';

const candies = Array.from({ length: 15 }, (_, i) => i);

function CandyBoard() {
  const [message, setMessage] = useState("Game started! Take turns to pick a candy.");

  return (
    <div>
      <h2>{message}</h2>
      <div className="candy-board">
        {candies.map((_, i) => (
          <div key={i} className="dot" />
        ))}
      </div>
    </div>
  );
}

export default CandyBoard;
