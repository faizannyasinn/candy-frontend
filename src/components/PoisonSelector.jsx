import React, { useState } from 'react';
import './PoisonSelector.css';

const PoisonSelector = ({ candies, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="poison-board">
      <h2>Select one candy to poison</h2>
      <div className="poison-grid">
        {candies.map((candy) => (
          <div
            key={candy.id}
            className={`candy-dot ${selected === candy.id ? 'selected' : ''}`}
            style={{ backgroundColor: candy.color, top: candy.top, left: candy.left }}
            onClick={() => handleSelect(candy.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PoisonSelector;
