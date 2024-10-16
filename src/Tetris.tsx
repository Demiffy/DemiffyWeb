// src/TetrisGame.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Cell from './components/ui/Cell';
import NextPieceDisplay from './components/ui/NextPieceDisplay';
import ControlsPanel from './components/ui/ControlsPanel';
import { Tetromino, CellType } from './components/ui/types';

const ROWS = 20;
const COLS = 10;

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'bg-yellow-500',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'bg-orange-500',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'bg-red-800',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'bg-green-500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-pink-500',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'bg-blue-500',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-purple-500',
  },
};

const createEmptyGrid = (): CellType[][] => {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ filled: false, color: 'bg-gray-800' }))
  );
};

const TetrisGame: React.FC = () => {
  const [grid, setGrid] = useState<CellType[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [dropSpeed, setDropSpeed] = useState(500);
  const [score, setScore] = useState(0);

  const randomTetromino = (): Tetromino => {
    const tetrominoTypes = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[];
    const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    return TETROMINOES[randomType];
  };

  useEffect(() => {
    const initialPiece = randomTetromino();
    const initialNextPiece = randomTetromino();
    setCurrentPiece(initialPiece);
    setNextPiece(initialNextPiece);
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
  }, []);

  const updateGame = useCallback(() => {
    if (currentPiece && !gameOver) {
      if (!checkCollision(0, 1, currentPiece.shape)) {
        setPosition(prev => ({ x: prev.x, y: prev.y + 1 }));
      } else {
        mergePiece();
        clearLines();
        spawnPiece();
      }
    }
  }, [currentPiece, gameOver, position]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGame();
    }, dropSpeed);

    return () => clearInterval(interval);
  }, [dropSpeed, updateGame]);

  const spawnPiece = () => {
    setCurrentPiece(nextPiece);
    setNextPiece(randomTetromino());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
  };

  const checkCollision = (offsetX: number, offsetY: number, shape: number[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = position.x + x + offsetX;
          const newY = position.y + y + offsetY;

          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX].filled)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.slice());
      currentPiece!.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value && position.y + y >= 0) {
            newGrid[position.y + y][position.x + x] = {
              filled: true,
              color: currentPiece!.color,
            };
          }
        });
      });
      return newGrid;
    });

    if (position.y <= 0) {
      setGameOver(true);
    }
  };

  const clearLines = () => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.filter(row => row.some(cell => !cell.filled));
      const clearedLines = ROWS - newGrid.length;
      if (clearedLines > 0) {
        const emptyRows = Array.from({ length: clearedLines }, () =>
          Array.from({ length: COLS }, () => ({ filled: false, color: 'bg-gray-800' }))
        );
        setScore(prevScore => prevScore + clearedLines * 1);
        return [...emptyRows, ...newGrid];
      }
      return prevGrid;
    });
  };

  const movePiece = (dir: number) => {
    if (!checkCollision(dir, 0, currentPiece!.shape)) {
      setPosition(prev => ({ x: prev.x + dir, y: prev.y }));
    }
  };

  const rotatePiece = () => {
    const rotatedShape = currentPiece!.shape[0].map((_, index) =>
      currentPiece!.shape.map(col => col[index]).reverse()
    );

    if (!checkCollision(0, 0, rotatedShape)) {
      setCurrentPiece({ ...currentPiece!, shape: rotatedShape });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameOver) return;

    if (e.key === 'ArrowLeft') {
      movePiece(-1);
    } else if (e.key === 'ArrowRight') {
      movePiece(1);
    } else if (e.key === 'ArrowDown') {
      setDropSpeed(50);
    } else if (e.key === 'ArrowUp') {
      rotatePiece();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      setDropSpeed(500);
    }
  };

  const drawGrid = () => {
    const displayGrid = grid.map(row => row.slice());

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value && position.y + y >= 0) {
            displayGrid[position.y + y][position.x + x] = {
              filled: true,
              color: currentPiece.color,
            };
          }
        });
      });
    }

    return displayGrid.flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Cell key={`${rowIndex}-${colIndex}`} cell={cell} />
      ))
    );
  };

  const resetSpeed = () => setDropSpeed(500);

  const dropPiece = (speed: number) => setDropSpeed(speed);

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setCurrentPiece(randomTetromino());
    setNextPiece(randomTetromino());
    setScore(0);
    setPosition({ x: 3, y: 0 });
    setGameOver(false);
  };

  return (
    <div
      className="flex justify-center items-center outline-none focus:outline-none p-8 mt-9 relative"
      tabIndex={0}
      onKeyDown={handleKeyPress}
      onKeyUp={handleKeyUp}
    >
      {gameOver ? (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <h2 className="text-white text-5xl mb-4 animate-bounce">Game Over</h2>
            <p className="text-white text-2xl mb-8">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="bg-blue-500 text-white px-6 py-2 text-lg rounded hover:bg-blue-700 transition-all"
            >
              Play Again
            </button>
          </div>
        ) : (
        <>
          <div className="absolute top-4 right-4 text-white text-2xl">Score: {score}</div>
          <div className="flex justify-center items-start space-x-8">
            <div
              className="grid grid-cols-10 gap-0 tetris-grid"
              style={{
                backgroundColor: '#2d3748',
                padding: '0.5rem',
                width: 'auto',
                height: 'auto',
                overflow: 'hidden',
              }}
            >
              {drawGrid()}
            </div>

            <div className="flex flex-col items-center justify-start">
              <NextPieceDisplay nextPiece={nextPiece} />
              <ControlsPanel
                moveLeft={() => movePiece(-1)}
                moveRight={() => movePiece(1)}
                rotatePiece={rotatePiece}
                dropPiece={dropPiece}
                resetSpeed={resetSpeed}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TetrisGame;
