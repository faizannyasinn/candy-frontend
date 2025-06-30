import React from 'react';
import './CandyBoard.css';

function CandyBoard({ onCandyClick, disabled = false }) {
  const candies = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="board">
      {candies.map((num) => (
        <img
          key={num}
          src={`assets/candies/candy${num}.png`}
          alt={`Candy ${num}`}
          className="candy"
          onClick={() => !disabled && onCandyClick(num)}
        />
      ))}
    </div>
  );
}

export default CandyBoard;
