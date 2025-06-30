import React from 'react';
import './PoisonSelector.css';

const candies = [
  "/images/candy1.png", "/images/candy2.png", "/images/candy3.png",
  "/images/candy4.png", "/images/candy5.png", "/images/candy6.png",
  "/images/candy7.png", "/images/candy8.png", "/images/candy9.png",
];

function PoisonSelector({ onSelect }) {
  return (
    <div className="poison-grid">
      {candies.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Candy ${index}`}
          className="candy-img"
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

export default PoisonSelector;
