import React, { useEffect, useState } from 'react';
import './CandyBoard.css';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6B6B', '#00C49F', '#C71585', '#FFD700',
  '#ADFF2F', '#20B2AA', '#FF4500', '#9370DB', '#00CED1'
];

function getRandomPosition(index) {
  const top = Math.random() * 70 + 10; // 10% to 80%
  const left = Math.random() * 70 + 10;
  return {
    top: `${top}%`,
    left: `${left}%`,
    backgroundColor: COLORS[index],
  };
}

const CandyBoard = ({ onSelect, disabled, selected }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const pos = Array(15).fill(0).map((_, i) => getRandomPosition(i));
    setPositions(pos);
  }, []);

  return (
    <div className="board">
      {positions.map((style, idx) => (
        <div
          key={idx}
          className="dot"
          style={style}
          onClick={() => !disabled && onSelect(idx)}
        >
          {selected === idx && <div className="selected-marker" />}
        </div>
      ))}
    </div>
  );
};

export default CandyBoard;
