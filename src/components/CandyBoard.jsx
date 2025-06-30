import React, { useEffect, useState } from 'react';
import './CandyBoard.css';

const getRandomPosition = () => {
  const top = Math.floor(Math.random() * 80) + 10;
  const left = Math.floor(Math.random() * 80) + 10;
  return { top: `${top}%`, left: `${left}%` };
};

const colors = [
  '#FF5C5C', '#FFB347', '#FFD700', '#ADFF2F', '#40E0D0',
  '#6495ED', '#DA70D6', '#FF69B4', '#FF7F50', '#90EE90',
  '#FF6347', '#BA55D3', '#00CED1', '#FFA07A', '#20B2AA'
];

function CandyBoard() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const newDots = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      position: getRandomPosition()
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="candy-board">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="candy-dot"
          style={{
            backgroundColor: dot.color,
            top: dot.position.top,
            left: dot.position.left
          }}
        />
      ))}
    </div>
  );
}

export default CandyBoard;
