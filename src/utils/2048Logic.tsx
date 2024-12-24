// src/utils/2048Logic.tsx

export interface EmptyTile {
    rowIndex: number;
    colIndex: number;
}

export const initializeBoard = (): number[][] => {
    const board: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
    const newTiles: { row: number; col: number }[] = [];
    addRandomTile(board, newTiles);
    addRandomTile(board, newTiles);
    return board;
};

const addRandomTile = (board: number[][], newTiles: { row: number; col: number }[]) => {
    const emptyTiles: EmptyTile[] = [];
    board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile === 0) emptyTiles.push({ rowIndex, colIndex });
        });
    });

    if (emptyTiles.length === 0) return;

    const { rowIndex, colIndex } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board[rowIndex][colIndex] = Math.random() < 0.9 ? 2 : 4;
    newTiles.push({ row: rowIndex, col: colIndex });
}

export interface MoveResult {
    board: number[][];
    score: number;
    newTiles: { row: number; col: number }[];
    mergedTiles: { row: number; col: number }[];
}

export const moveTiles = (board: number[][], direction: string): MoveResult | null => {
    let newBoard = JSON.parse(JSON.stringify(board));
    let score = 0;
    let moved = false;
    const newTiles: { row: number; col: number }[] = [];
    const mergedTiles: { row: number; col: number }[] = [];

    const slideAndMerge = (row: number[], rowIndex: number): number[] => {
        const newRow = row.filter(tile => tile !== 0);
        const mergedRow: number[] = [];

        for (let i = 0; i < newRow.length; i++) {
            if (newRow[i] === newRow[i + 1]) {
                mergedRow.push(newRow[i] * 2);
                score += newRow[i] * 2;
                mergedTiles.push({ row: rowIndex, col: i });
                i++;
                moved = true;
            } else {
                mergedRow.push(newRow[i]);
            }
        }

        while (mergedRow.length < 4) mergedRow.push(0);
        return mergedRow;
    };

    switch (direction) {
        case 'ArrowLeft':
            for (let row = 0; row < 4; row++) {
                const newRow = slideAndMerge(newBoard[row], row);
                if (JSON.stringify(newRow) !== JSON.stringify(newBoard[row])) moved = true;
                newBoard[row] = newRow;
            }
            break;

        case 'ArrowRight':
            for (let row = 0; row < 4; row++) {
                const newRow = slideAndMerge(newBoard[row].reverse(), row).reverse();
                if (JSON.stringify(newRow) !== JSON.stringify(newBoard[row])) moved = true;
                newBoard[row] = newRow;
            }
            break;

        case 'ArrowUp':
            for (let col = 0; col < 4; col++) {
                const column = newBoard.map((row: number[]) => row[col]);
                const newColumn = slideAndMerge(column, col);
                for (let row = 0; row < 4; row++) {
                    if (newColumn[row] !== newBoard[row][col]) moved = true;
                    newBoard[row][col] = newColumn[row];
                    if (newColumn[row] > 0 && board[row][col] === 0) {
                        newTiles.push({ row, col });
                    }
                }
            }
            break;

        case 'ArrowDown':
            for (let col = 0; col < 4; col++) {
                const column = newBoard.map((row: number[]) => row[col]).reverse();
                const newColumn = slideAndMerge(column, col).reverse();
                for (let row = 0; row < 4; row++) {
                    if (newColumn[row] !== newBoard[row][col]) moved = true;
                    newBoard[row][col] = newColumn[row];
                    if (newColumn[row] > 0 && board[row][col] === 0) {
                        newTiles.push({ row, col });
                    }
                }
            }
            break;

        default:
            return null;
    }

    if (moved) {
        addRandomTile(newBoard, newTiles);
    }

    return { board: newBoard, score, newTiles, mergedTiles };
};
