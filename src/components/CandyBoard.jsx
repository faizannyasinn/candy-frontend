import React from 'react';
import './CandyBoard.css';

function CandyBoard({ candies, onClick }) {
  return (
    <div className="candy-grid">
      {candies.map((candy, index) => (
        <div key={index} className="candy-tile" onClick={() => onClick(index)}>
          🍬
        </div>
      ))}
    </div>
  );
}

export default CandyBoard;
