// src/components/2048Game.tsx
import React, { useState, useEffect } from 'react';
import Tile from './ui/Tile';
import { initializeBoard, moveTiles } from '../utils/2048Logic';

const Game: React.FC = () => {
    const [board, setBoard] = useState<number[][]>(initializeBoard());
    const [score, setScore] = useState<number>(0);
    const [newTiles, setNewTiles] = useState<{ row: number; col: number }[]>([]);
    const [mergedTiles, setMergedTiles] = useState<{ row: number; col: number }[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const newBoard = moveTiles(board, e.key);
            if (newBoard) {
                setBoard(newBoard.board);
                setScore(prevScore => prevScore + newBoard.score);
                setNewTiles(newBoard.newTiles);
                setMergedTiles(newBoard.mergedTiles);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [board]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">2048</h1>
            <div className="grid grid-cols-4 gap-2 transition-opacity duration-300">
                {board.map((row, rowIndex) =>
                    row.map((tile, colIndex) => (
                        <Tile
                            key={`${rowIndex}-${colIndex}`}
                            value={tile}
                            isNew={newTiles.some(t => t.row === rowIndex && t.col === colIndex)}
                            isMerged={mergedTiles.some(t => t.row === rowIndex && t.col === colIndex)}
                        />
                    ))
                )}
            </div>
            <div className="mt-4 text-xl">Score: {score}</div>
        </div>
    );
};

export default Game;
