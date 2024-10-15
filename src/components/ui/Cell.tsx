// src/components/ui/Cell.tsx

import React from 'react';
import { CellType } from './types';

type CellProps = {
  cell: CellType;
};

const Cell: React.FC<CellProps> = ({ cell }) => {
  return (
    <div
      className={`w-6 h-6 sm:w-6 sm:h-6 md:w-10 md:h-10 ${cell.color} border border-gray-700`}
    ></div>
  );
};

export default Cell;
