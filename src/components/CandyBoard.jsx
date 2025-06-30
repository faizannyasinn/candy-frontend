import React, { useState, useEffect } from 'react';
import './CandyBoard.css';

const candies = [
  "/images/candy1.png", "/images/candy2.png", "/images/candy3.png",
  "/images/candy4.png", "/images/candy5.png", "/images/candy6.png",
  "/images/candy7.png", "/images/candy8.png", "/images/candy9.png",
];

function CandyBoard({ socket, myRole, poisonInfo, setWinner }) {
  const [turn, setTurn] = useState("player1");
  const [selected, setSelected] = useState([]);

  const handleClick = (index) => {
    if (turn !== myRole || selected.includes(index)) return;

    if (
      (myRole === "player1" && poisonInfo.player2 === index) ||
      (myRole === "player2" && poisonInfo.player1 === index)
    ) {
      setWinner("You lost! 💀");
      socket.emit("game-over", myRole === "player1" ? "player2" : "player1");
    } else {
      setSelected([...selected, index]);
      socket.emit("next-turn", myRole === "player1" ? "player2" : "player1");
    }
  };

  useEffect(() => {
    socket.on("next-turn", (next) => {
      setTurn(next);
    });

    socket.on("game-over", (winner) => {
      if (winner === myRole) {
        setWinner("🎉 You Won!");
      } else {
        setWinner("You lost! 💀");
      }
    });

    return () => {
      socket.off("next-turn");
      socket.off("game-over");
    };
  }, [socket, myRole]);

  return (
    <div className="board-container">
      <h3>Turn: {turn === myRole ? "Your Turn" : "Opponent's Turn"}</h3>
      <div className="candy-grid">
        {candies.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Candy ${idx}`}
            className={`candy-img ${selected.includes(idx) ? "dimmed" : ""}`}
            onClick={() => handleClick(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default CandyBoard;
