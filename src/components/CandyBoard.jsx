import React, { useState } from 'react';
import './CandyBoard.css';

const candyImages = [
  'c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png',
  'c6.png', 'c7.png', 'c8.png', 'c9.png', 'c10.png',
  'c11.png', 'c12.png', 'c13.png', 'c14.png', 'c15.png'
];

function CandyBoard({ isYourTurn, onCandyClick, message }) {
  return (
    <div className="candy-board-container">
      <h3>{message}</h3>
      <div className="candy-grid">
        {candyImages.map((img, index) => (
          <img
            key={index}
            src={`/candies/${img}`}
            alt={`Candy ${index + 1}`}
            className="candy-img"
            onClick={() => isYourTurn && onCandyClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default CandyBoard;
