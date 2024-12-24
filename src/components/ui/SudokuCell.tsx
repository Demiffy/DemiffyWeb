// src/components/ui/SudokuCell.tsx
import React from 'react';

interface SudokuCellProps {
  value: number | null;
  row: number;
  col: number;
  onChange: (row: number, col: number, value: number | null) => void;
  isInitial: boolean;
  isCurrent?: boolean;
  isSolving?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  row,
  col,
  onChange,
  isInitial,
  isCurrent = false,
  isSolving = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[1-9]$/.test(val)) {
      onChange(row, col, parseInt(val));
    } else if (val === '') {
      onChange(row, col, null);
    }
  };

  return (
    <input
      type="text"
      maxLength={1}
      value={value !== null ? value : ''}
      onChange={handleChange}
      disabled={isInitial || isSolving}
      className={`w-full h-12 bg-gray-700 text-center text-2xl font-bold rounded 
        ${(col + 1) % 3 === 0 && col !== 8 ? 'border-r-2 border-gray-500' : 'border-gray-500'} 
        ${(row + 1) % 3 === 0 && row !== 8 ? 'border-b-2 border-gray-500' : 'border-gray-500'} 
        focus:outline-none focus:ring-2 focus:ring-cyan-400 
        ${isInitial ? 'bg-gray-700 text-white cursor-not-allowed' : 'bg-gray-800 text-cyan-300 cursor-pointer'}
        ${isCurrent ? 'bg-yellow-500 text-black' : ''}
        transition duration-200 ease-in-out
        hover:bg-gray-600
      `}
    />
  );
};

export default SudokuCell;
