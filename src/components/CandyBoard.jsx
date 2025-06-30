import React, { useEffect, useState } from "react";
import "./CandyBoard.css";

// Import 15 candy images from /assets/candies/ folder
const candyImages = Array.from({ length: 15 }, (_, i) =>
  require(`../assets/candies/candy${i + 1}.png`)
);

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

const CandyBoard = ({ onCandyClick, disabled }) => {
  const [candies, setCandies] = useState([]);

  useEffect(() => {
    const shuffled = shuffle(candyImages.map((src, i) => ({ id: i, src })));
    setCandies(shuffled);
  }, []);

  return (
    <div className="candy-board">
      {candies.map((candy) => (
        <div key={candy.id} className="candy-cell">
          <img
            src={candy.src}
            alt={`Candy ${candy.id}`}
            className="candy-img"
            onClick={() => !disabled && onCandyClick(candy.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default CandyBoard;
