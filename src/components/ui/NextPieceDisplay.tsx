// src/components/ui/NextPieceDisplay.tsx

import React from 'react';
import { Tetromino } from './types';

type NextPieceDisplayProps = {
  nextPiece: Tetromino | null;
};

const NextPieceDisplay: React.FC<NextPieceDisplayProps> = ({ nextPiece }) => {
  if (!nextPiece) return null;

  const { shape, color } = nextPiece;

  const gridSize = 4;
  const paddedShape = Array.from({ length: gridSize }, (_, y) => {
    const row = shape[y] || [];
    return Array.from({ length: gridSize }, (_, x) => row[x] || 0);
  });

  return (
    <div className="mt-4">
      <h2 className="text-white mb-4 text-center font-semibold">Next Piece</h2>
      <div
        className="grid grid-cols-4 gap-1 bg-gray-800 p-3 rounded-lg shadow-lg"
        style={{
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        {paddedShape.map((row: number[], y: number) =>
          row.map((cell: number, x: number) => (
            <div
              key={`${y}-${x}`}
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
                cell ? color : 'bg-gray-700'
              } border border-gray-600 rounded-md`}
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default NextPieceDisplay;
