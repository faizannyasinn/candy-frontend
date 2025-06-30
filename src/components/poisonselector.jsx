import React from 'react';
import './CandyBoard.css';

function PoisonSelector({ onSelect, message }) {
  const candies = Array.from({ length: 15 });

  return (
    <div>
      <h3>{message}</h3>
      <div className="candy-board">
        {candies.map((_, i) => (
          <div key={i} className="candy" onClick={() => onSelect(i)}>
            🍭
          </div>
        ))}
      </div>
    </div>
  );
}

export default PoisonSelector;
