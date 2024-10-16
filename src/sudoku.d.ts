// src/sudoku.d.ts
declare module 'sudoku' {
    /**
     * Generates a new Sudoku puzzle.
     * @returns
     */
    export function makepuzzle(): (number | null)[];
  
    /**
     * Solves a given Sudoku puzzle.
     * @param puzzle
     * @returns
     */
    export function solvepuzzle(puzzle: (number | null)[]): (number | null)[];
  }
  