import React from 'react';
import './CandyBoard.css';

function CandyBoard({ isYourTurn, onCandyClick }) {
  const candies = Array.from({ length: 15 });

  return (
    <div>
      <h4>{isYourTurn ? "Your Turn!" : "Opponent's Turn"}</h4>
      <div className="candy-board">
        {candies.map((_, i) => (
          <div key={i} className="candy" onClick={() => isYourTurn && onCandyClick(i)}>
            🍬
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandyBoard;
