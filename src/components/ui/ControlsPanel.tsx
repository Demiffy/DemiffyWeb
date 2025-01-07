// src/components/ui/ControlsPanel.tsx

import React from 'react';

type ControlsPanelProps = {
  moveLeft: () => void;
  moveRight: () => void;
  rotatePiece: () => void;
  dropPiece: (speed: number) => void;
  resetSpeed: () => void;
};

const ControlsPanel: React.FC<ControlsPanelProps> = ({ moveLeft, moveRight, rotatePiece, dropPiece, resetSpeed }) => {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex space-x-4 mb-4">
        <button
          onMouseDown={moveLeft}
          className="text-white text-4xl p-2 hover:text-gray-400 focus:outline-none"
          style={{ background: 'transparent', border: 'none' }}
        >
          ⬅
        </button>

        <button
          onMouseDown={rotatePiece}
          className="text-white text-4xl p-2 hover:text-gray-400 focus:outline-none"
          style={{ background: 'transparent', border: 'none' }}
        >
          ↻
        </button>

        <button
          onMouseDown={moveRight}
          className="text-white text-4xl p-2 hover:text-gray-400 focus:outline-none"
          style={{ background: 'transparent', border: 'none' }}
        >
          ➡
        </button>
      </div>

      <button
        onMouseDown={() => dropPiece(50)}
        onMouseUp={resetSpeed}
        className="text-white text-4xl p-2 hover:text-gray-400 focus:outline-none"
        style={{ background: 'transparent', border: 'none' }}
      >
        ⬇
      </button>
    </div>
  );
};

export default ControlsPanel;