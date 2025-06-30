import React, { useState } from 'react';
import './PoisonSelector.css';

function PoisonSelector({ candies, onSelect, selectedIndex, isDisabled }) {
  return (
    <div className="selector-board">
      {candies.map((candy, index) => (
        <div
          key={index}
          className={`selector-dot ${selectedIndex === index ? 'selected' : ''}`}
          style={{ backgroundColor: candy.color }}
          onClick={() => !isDisabled && onSelect(index)}
        />
      ))}
    </div>
  );
}

export default PoisonSelector;
