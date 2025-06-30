import React, { useState } from "react";
import "./CandyBoard.css"; // Reusing same styles
import candyImages from "../utils/candyImages";

const PoisonSelector = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleClick = (id) => {
    setSelectedId(id);
    setTimeout(() => {
      onSelect(id); // Send poison id to parent
    }, 1000); // Short delay to simulate "secret" selection
  };

  return (
    <div className="candy-board">
      <h2 style={{ gridColumn: "1 / -1", textAlign: "center" }}>
        🔒 Select a secret poisonous candy
      </h2>
      {candyImages.map((src, i) => (
        <div key={i} className="candy-cell">
          <img
            src={src}
            alt={`Candy ${i}`}
            className={`candy-img ${
              selectedId === i ? "selected-candy" : ""
            }`}
            onClick={() => handleClick(i)}
          />
        </div>
      ))}
    </div>
  );
};

export default PoisonSelector;
