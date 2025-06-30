import React from 'react';
import './PoisonSelector.css';

function PoisonSelector({ candies, onSelect, selected }) {
  return (
    <div className="poison-grid">
      {candies.map((candy, index) => (
        <div
          key={index}
          className={`poison-candy ${selected === index ? 'selected' : ''}`}
          onClick={() => onSelect(index)}
        >
          🍭
        </div>
      ))}
    </div>
  );
}

export default PoisonSelector;
