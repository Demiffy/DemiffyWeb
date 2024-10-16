// src/components/ui/Tile.tsx
import React from 'react';

interface TileProps {
    value: number;
    isNew: boolean;
    isMerged: boolean;
}

const getTileColor = (value: number): string => {
    switch (value) {
        case 2: return 'bg-blue-200';
        case 4: return 'bg-blue-300';
        case 8: return 'bg-blue-400';
        case 16: return 'bg-blue-500';
        case 32: return 'bg-blue-600';
        case 64: return 'bg-blue-700';
        case 128: return 'bg-green-300';
        case 256: return 'bg-green-400';
        case 512: return 'bg-green-500';
        case 1024: return 'bg-green-600';
        case 2048: return 'bg-green-700';
        default: return 'bg-gray-300';
    }
};

const Tile: React.FC<TileProps> = ({ value, isNew, isMerged }) => {
    const tileClass = `flex items-center justify-center w-16 h-16 text-white font-bold rounded-lg shadow-md 
        transition-transform transform duration-300 ease-in-out ${isNew ? 'scale-0 animate-expand' : ''} ${isMerged ? 'animate-pop' : ''}`;

    return (
        <div className={`${tileClass} ${getTileColor(value)}`}>
            {value > 0 ? value : ''}
        </div>
    );
};

export default Tile;
