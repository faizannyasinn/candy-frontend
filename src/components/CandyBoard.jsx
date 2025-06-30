import React from 'react';
import './CandyBoard.css';

const CandyBoard = ({ candies, currentPlayer, playerTurn, onCandyClick }) => {
  return (
    <div>
      <h2>{playerTurn === currentPlayer ? "Your turn!" : "Opponent's turn..."}</h2>
      <div className="board">
        {candies.map((candy) => (
          <div
            key={candy.id}
            className="candy-dot"
            style={{ backgroundColor: candy.color, top: candy.top, left: candy.left }}
            onClick={() => playerTurn === currentPlayer && onCandyClick(candy.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CandyBoard;
