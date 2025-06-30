import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CandyBoard from './components/CandyBoard';
import './App.css';

const socket = io('https://candy-backend-production.up.railway.app');

function App() {
  const [stage, setStage] = useState('lobby'); // lobby | waiting | poison | game | end
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [candies, setCandies] = useState([]);
  const [poisonedByOpponent, setPoisonedByOpponent] = useState(null);
  const [selectedPoison, setSelectedPoison] = useState(null);
  const [winner, setWinner] = useState('');

  const generateRoomCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  const handleCreateRoom = () => {
    if (!name) return alert('Enter your name');
    const code = generateRoomCode();
    setRoomCode(code);
    socket.emit('join-room', code, name);
    setStatus(`Room Code: ${code}`);
    setStage('waiting');
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) return alert('Enter name and room code');
    socket.emit('join-room', roomCode, name);
    setStage('waiting');
    setStatus('Joining room...');
  };

  useEffect(() => {
    socket.on('connected', (id) => {
      setPlayerId(id);
    });

    socket.on('both-joined', (data) => {
      setCandies(data.candies);
      if (data.turn === socket.id) {
        setIsMyTurn(true);
        setStatus('Your turn to choose poison');
      } else {
        setStatus('Waiting for opponent to choose poison...');
      }
      setStage('poison');
    });

    socket.on('start-game', (data) => {
      setCandies(data.candies);
      setPoisonedByOpponent(data.poisonedCandy);
      setStage('game');
      setIsMyTurn(data.turn === socket.id);
      setStatus(data.turn === socket.id ? 'Your turn to eat a candy' : 'Opponent\'s turn');
    });

    socket.on('update-board', (data) => {
      setCandies(data.candies);
      setIsMyTurn(data.turn === socket.id);
      setStatus(data.turn === socket.id ? 'Your turn' : 'Opponent\'s turn');
    });

    socket.on('game-over', (data) => {
      setStage('end');
      setWinner(data.winner === socket.id ? 'You win!' : 'You lose!');
    });

    return () => {
      socket.off('connected');
      socket.off('both-joined');
      socket.off('start-game');
      socket.off('update-board');
      socket.off('game-over');
    };
  }, []);

  const handleCandyClick = (index) => {
    if (!isMyTurn || stage !== 'game') return;
    socket.emit('eat-candy', { roomCode, index });
  };

  const handlePoisonSelect = (index) => {
    if (selectedPoison !== null || stage !== 'poison') return;
    setSelectedPoison(index);
    socket.emit('select-poison', { roomCode, poisonIndex: index });
    setStatus('Waiting for opponent to choose poison...');
  };

  return (
    <div className="App" style={{ textAlign: 'center', padding: '40px' }}>
      <h1>🍬 Tutti Frutti Candy Game</h1>

      {stage === 'lobby' && (
        <>
          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', margin: '5px' }}
          /><br />
          <button onClick={handleCreateRoom} style={{ margin: '10px', padding: '10px 20px' }}>
            ➕ Create Room
          </button><br />
          <div>or</div>
          <input
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{ padding: '10px', margin: '5px' }}
          /><br />
          <button onClick={handleJoinRoom} style={{ padding: '10px 20px' }}>
            🔑 Join Room
          </button>
        </>
      )}

      {(stage === 'waiting' || stage === 'poison' || stage === 'game') && (
        <>
          <h3>{status}</h3>
          <p>Room Code: {roomCode}</p>
        </>
      )}

      {(stage === 'poison' || stage === 'game') && (
        <CandyBoard
          candies={candies}
          onCandyClick={stage === 'poison' ? handlePoisonSelect : handleCandyClick}
        />
      )}

      {stage === 'end' && (
        <h2>{winner}</h2>
      )}
    </div>
  );
}

export default App;
