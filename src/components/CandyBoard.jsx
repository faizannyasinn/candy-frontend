import React, { useEffect, useState } from 'react';
import './CandyBoard.css';

const colors = ['#ff4d4d', '#4dff4d', '#4d4dff', '#ffb84d', '#b84dff', '#4dd2ff'];

const generateCandies = () => {
  const candies = [];
  for (let i = 0; i < 15; i++) {
    candies.push({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 60) + 20,
      visible: true
    });
  }
  return candies;
};

export default function CandyBoard({ socket, player, roomCode, isMyTurn, setIsMyTurn }) {
  const [candies, setCandies] = useState(generateCandies());
  const [opponentPoison, setOpponentPoison] = useState(null);
  const [myPoison, setMyPoison] = useState(null);
  const [winner, setWinner] = useState(null);

  const handleCandyClick = (id) => {
    if (!isMyTurn || winner || !candies[id].visible) return;

    if (id === opponentPoison) {
      socket.emit('game-over', { roomCode, winner: 'opponent' });
      setWinner('opponent');
    } else {
      setCandies((prev) =>
        prev.map((candy) => (candy.id === id ? { ...candy, visible: false } : candy))
      );
      socket.emit('candy-eaten', { roomCode, candyId: id });
      setIsMyTurn(false);
    }
  };

  useEffect(() => {
    socket.on('start-game', ({ opponentPoisonId, yourTurn }) => {
      setOpponentPoison(opponentPoisonId);
      setIsMyTurn(yourTurn);
    });

    socket.on('opponent-ate', ({ candyId }) => {
      setCandies((prev) =>
        prev.map((candy) => (candy.id === candyId ? { ...candy, visible: false } : candy))
      );
      setIsMyTurn(true);
    });

    socket.on('you-win', () => {
      setWinner('you');
    });

    return () => {
      socket.off('start-game');
      socket.off('opponent-ate');
      socket.off('you-win');
    };
  }, [socket]);

  return (
    <div className="board">
      {candies.map((candy) =>
        candy.visible ? (
          <div
            key={candy.id}
            className="candy-dot"
            onClick={() => handleCandyClick(candy.id)}
            style={{
              backgroundColor: candy.color,
              left: `${candy.x}%`,
              top: `${candy.y}%`
            }}
          />
        ) : null
      )}
      {winner && (
        <div className="game-result">
          {winner === 'you' ? '🎉 You Win!' : '💀 You Lost!'}
        </div>
      )}
    </div>
  );
}
