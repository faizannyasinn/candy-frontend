import React from 'react';
import './PoisonSelector.css';

const candies = Array.from({ length: 15 }, (_, i) => i);

function PoisonSelector({ roomCode, socket, isFirstPlayer }) {
  const handleSelect = (index) => {
    socket.emit("poison-selected", { roomCode, poisonIndex: index });
  };

  return (
    <div>
      <h2>{isFirstPlayer ? "Choose 1 candy to poison for opponent" : "Waiting for opponent to choose poison..."}</h2>
      {isFirstPlayer && (
        <div className="candy-board">
          {candies.map((_, i) => (
            <div
              key={i}
              className="dot"
              onClick={() => handleSelect(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PoisonSelector;
