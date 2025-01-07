// src/components/Sudoku.tsx
import React, { useState, useEffect, useRef } from 'react';
import SudokuCell from './ui/SudokuCell';
import * as sudoku from 'sudoku';
import Button from "./ui/button";
import { Clock, RotateCcw, Play, Zap, FastForward } from "lucide-react";
import Footer from "./ui/Footer";

interface BubbleProps {
  color: string;
}

const Bubble: React.FC<BubbleProps> = ({ color }) => {
  const [position, setPosition] = useState<{ top: string; left: string }>(randomPosition());

  function randomPosition() {
    return {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
    };
  }

  const handleAnimationEnd = () => {
    setPosition(randomPosition());
  };

  return (
    <div
      className={`absolute w-48 h-48 rounded-full opacity-20 blur-2xl animate-ping-slow`}
      style={{ top: position.top, left: position.left, backgroundColor: color }}
      onAnimationIteration={handleAnimationEnd}
    ></div>
  );
};

const Sudoku: React.FC = () => {
  const [grid, setGrid] = useState<(number | null)[][]>(generateEmptyGrid());
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>(generateEmptyGrid());
  const [message, setMessage] = useState<string>('');
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [time, setTime] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [solverSpeed, setSolverSpeed] = useState<number>(100);

  const solverRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const solverSpeedRef = useRef<number>(solverSpeed);
  const solverGridRef = useRef<(number | null)[][]>(generateEmptyGrid());

  useEffect(() => {
    generatePuzzle();
  }, []);

  useEffect(() => {
    solverSpeedRef.current = solverSpeed;
  }, [solverSpeed]);

  useEffect(() => {
    setTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initialGrid]);

  function generateEmptyGrid(): (number | null)[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(null));
  }

  const generatePuzzle = () => {
    const puzzle = sudoku.makepuzzle();
    const formattedPuzzle: (number | null)[] = puzzle.map((cell: number | null) => (cell !== null ? cell + 1 : null));
    const twoDGrid = arrayTo2D(formattedPuzzle);
    setGrid(twoDGrid);
    setInitialGrid(twoDGrid);
    solverGridRef.current = arrayTo2D(formattedPuzzle);
    setMessage('');
    setMoves(0);
    setSolverSpeed(100);
    setIsCompleted(false);
  };

  const arrayTo2D = (arr: (number | null)[]): (number | null)[][] => {
    const twoD: (number | null)[][] = [];
    for (let i = 0; i < 9; i++) {
      twoD.push(arr.slice(i * 9, (i + 1) * 9));
    }
    return twoD;
  };

  const handleChange = (row: number, col: number, value: number | null) => {
    if (isSolving || isCompleted) return;
    const newGrid = grid.map(r => r.slice());
    newGrid[row][col] = value;
    setGrid(newGrid);
    setMoves(prevMoves => prevMoves + 1);
    solverGridRef.current = newGrid;
  };

  const validate = () => {
    for (let row = 0; row < 9; row++) {
      const rowSet = new Set<number>();
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value === null) {
          setMessage('Please fill all cells.');
          return;
        }
        if (rowSet.has(value)) {
          setMessage(`Duplicate number ${value} found in row ${row + 1}.`);
          return;
        }
        rowSet.add(value);
      }
    }

    for (let col = 0; col < 9; col++) {
      const colSet = new Set<number>();
      for (let row = 0; row < 9; row++) {
        const value = grid[row][col];
        if (colSet.has(value!)) {
          setMessage(`Duplicate number ${value} found in column ${col + 1}.`);
          return;
        }
        colSet.add(value!);
      }
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxSet = new Set<number>();
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            const value = grid[row][col];
            if (boxSet.has(value!)) {
              setMessage(
                `Duplicate number ${value} found in 3x3 subgrid starting at (${boxRow * 3 + 1}, ${boxCol * 3 + 1}).`
              );
              return;
            }
            boxSet.add(value!);
          }
        }
      }
    }

    setMessage('🎉 Sudoku Completed Correctly!');
    setIsCompleted(true);
    stopTimer();
  };

  const reset = () => {
    setGrid(initialGrid);
    setMessage('');
    setCurrentCell(null);
    setMoves(0);
    setTime(0);
    setSolverSpeed(100);
    solverGridRef.current = initialGrid.map(row => [...row]);
    setIsCompleted(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  // Brute-force solver
  const solveSudoku = async () => {
    if (isSolving || solverRef.current) return;
    solverRef.current = true;
    setIsSolving(true);
    setMessage('Solving...');

    const solverGrid = solverGridRef.current.map(row => [...row]);

    const success = await backtrack(solverGrid);

    if (success) {
      setGrid(solverGrid);
      setMessage('🎉 Sudoku Solved!');
      setIsCompleted(true);
      stopTimer();
    } else {
      setMessage('No solution exists for the current puzzle.');
    }

    setIsSolving(false);
    setCurrentCell(null);
    solverRef.current = false;
  };

  const backtrack = async (gridToSolve: (number | null)[][]): Promise<boolean> => {
    const { row, col } = findBestCell(gridToSolve);
    if (row === -1 && col === -1) {
      return true;
    }

    const candidates = getCandidates(gridToSolve, row, col);

    for (let num of candidates) {
      gridToSolve[row][col] = num;
      setGrid([...gridToSolve.map(r => [...r])]);
      setCurrentCell({ row, col });
      await delay(solverSpeedRef.current);

      if (await backtrack(gridToSolve)) {
        return true;
      }

      gridToSolve[row][col] = null;
      setGrid([...gridToSolve.map(r => [...r])]);
      setCurrentCell({ row, col });
      await delay(solverSpeedRef.current);
    }

    return false;
  };

  const findBestCell = (gridToCheck: (number | null)[][]): { row: number; col: number } => {
    let minCandidates = 10;
    let bestCell = { row: -1, col: -1 };

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gridToCheck[row][col] === null) {
          const candidates = getCandidates(gridToCheck, row, col);
          if (candidates.length < minCandidates) {
            minCandidates = candidates.length;
            bestCell = { row, col };
            if (minCandidates === 1) {
              return bestCell;
            }
          }
        }
      }
    }

    return bestCell;
  };

  const getCandidates = (gridToCheck: (number | null)[][], row: number, col: number): number[] => {
    const possible: boolean[] = Array(10).fill(true);
    for (let x = 0; x < 9; x++) {
      if (gridToCheck[row][x] !== null) {
        possible[gridToCheck[row][x]!] = false;
      }
    }
    for (let x = 0; x < 9; x++) {
      if (gridToCheck[x][col] !== null) {
        possible[gridToCheck[x][col]!] = false;
      }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (gridToCheck[r][c] !== null) {
          possible[gridToCheck[r][c]!] = false;
        }
      }
    }
    const candidates: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if (possible[num]) {
        candidates.push(num);
      }
    }
    return candidates;
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const speedUpSolver = () => {
    setSolverSpeed(prevSpeed => {
      const newSpeed = prevSpeed / 2;
      return newSpeed >= 25 ? newSpeed : prevSpeed;
    });
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-100 p-4 relative overflow-hidden">
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Bubble color="#ec4899" /> {/* Pink */}
          <Bubble color="#a855f7" /> {/* Purple */}
          <Bubble color="#4299e1" /> {/* Blue */}
          <Bubble color="#f56565" /> {/* Red */}
        </div>
      )}
  
      {/* Main Content */}
      <div className="flex-grow w-full max-w-4xl relative z-10 mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-400 glow mt-16">Sudoku!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sudoku Grid */}
          <div className="col-span-2">
            <div className="grid grid-cols-9 gap-1 bg-primary-color p-2 rounded-lg shadow-lg">
              {grid.map((rowValues, rowIndex) =>
                rowValues.map((cell, colIndex) => (
                  <SudokuCell
                    key={`${rowIndex}-${colIndex}`}
                    value={cell}
                    row={rowIndex}
                    col={colIndex}
                    onChange={handleChange}
                    isInitial={initialGrid[rowIndex][colIndex] !== null}
                    isCurrent={
                      isSolving && currentCell
                        ? currentCell.row === rowIndex && currentCell.col === colIndex
                        : false
                    }
                    isSolving={isSolving || isCompleted}
                  />
                ))
              )}
            </div>
          </div>
  
          {/* Game Info and Controls */}
          <div className="space-y-6">
            {/* Game Info */}
            <div className="bg-primary-color p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Game Info</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center">
                  <Clock className="mr-2" /> Time:
                </span>
                <span className="text-cyan-400 font-mono">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Moves:</span>
                <span className="text-cyan-400 font-mono">{moves}</span>
              </div>
            </div>
  
            {/* Controls */}
            <div className="bg-primary-color p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Controls</h2>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center hover:bg-cyan-700 hover:text-white transition-all duration-300"
                  onClick={validate}
                  disabled={isSolving || isCompleted}
                >
                  <Play className="mr-2" /> Validate
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center hover:bg-red-700 hover:text-white transition-all duration-300"
                  onClick={reset}
                  disabled={isSolving}
                >
                  <RotateCcw className="mr-2" /> Reset
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center hover:bg-green-700 hover:text-white transition-all duration-300"
                  onClick={generatePuzzle}
                  disabled={isSolving}
                >
                  <Play className="mr-2" /> New Puzzle
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center hover:bg-yellow-700 hover:text-white transition-all duration-300"
                  onClick={solveSudoku}
                  disabled={isSolving || isCompleted}
                >
                  <Zap className="mr-2" /> {isSolving ? 'Solving...' : 'Solve'}
                </Button>
                {isSolving && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center hover:bg-purple-700 hover:text-white transition-all duration-300 col-span-2"
                    onClick={speedUpSolver}
                    disabled={solverSpeedRef.current === 25}
                    title={solverSpeedRef.current === 25 ? "Maximum speed reached" : "Increase solver speed"}
                  >
                    <FastForward className="mr-2" /> Speed Up
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {message && <p className="mt-4 text-lg text-cyan-400 text-center">{message}</p>}
      </div>
      
      <style>{`
        .glow {
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.7),
                       0 0 20px rgba(6, 182, 212, 0.5),
                       0 0 30px rgba(6, 182, 212, 0.3);
        }
      `}</style>
      <Footer />
    </div>
  );
}  

export default Sudoku;
