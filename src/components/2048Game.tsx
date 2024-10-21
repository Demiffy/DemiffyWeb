// src/components/2048Game.tsx
import React, { useState, useEffect } from 'react';
import Tile from './ui/Tile';
import { initializeBoard, moveTiles } from '../utils/2048Logic';
import Footer from './ui/Footer';

const Game: React.FC = () => {
    const [board, setBoard] = useState<number[][]>(initializeBoard());
    const [score, setScore] = useState<number>(0);
    const [newTiles, setNewTiles] = useState<{ row: number; col: number }[]>([]);
    const [mergedTiles, setMergedTiles] = useState<{ row: number; col: number }[]>([]);

    const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);

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

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            setStartTouch({ x: touch.clientX, y: touch.clientY });
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!startTouch) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - startTouch.x;
            const deltaY = touch.clientY - startTouch.y;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                const direction = deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
                const newBoard = moveTiles(board, direction);
                if (newBoard) {
                    setBoard(newBoard.board);
                    setScore(prevScore => prevScore + newBoard.score);
                    setNewTiles(newBoard.newTiles);
                    setMergedTiles(newBoard.mergedTiles);
                }
                setStartTouch(null);
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                const direction = deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
                const newBoard = moveTiles(board, direction);
                if (newBoard) {
                    setBoard(newBoard.board);
                    setScore(prevScore => prevScore + newBoard.score);
                    setNewTiles(newBoard.newTiles);
                    setMergedTiles(newBoard.mergedTiles);
                }
                setStartTouch(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [board, startTouch]);

    return (
    <div className="min-h-screen flex flex-col text-white">
        <div className="flex-grow flex flex-col items-center justify-center p-4">
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
        <Footer />
    </div>
    );
}

export default Game;
