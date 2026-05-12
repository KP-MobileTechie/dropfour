export const COLS = 7;
export const ROWS = 6;

export type Player = 1 | 2;
export type Cell = 0 | Player;
/** board[row][col]; row 0 is the BOTTOM row. */
export type Board = Cell[][];

export interface DropResult {
  board: Board;
  row: number;
}

export interface WinResult {
  player: Player;
  /** [row, col] of each cell in the winning line, in line order. */
  cells: [number, number][];
}

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

export function legalMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[ROWS - 1][c] === 0) moves.push(c);
  return moves;
}

/** Immutable drop. Returns null if the column is full. */
export function dropDisc(board: Board, col: number, player: Player): DropResult | null {
  for (let r = 0; r < ROWS; r++) {
    if (board[r][col] === 0) {
      const next = board.map((row) => [...row]);
      next[r][col] = player;
      return { board: next, row: r };
    }
  }
  return null;
}

const DIRECTIONS: [number, number][] = [
  [0, 1],  // horizontal →
  [1, 0],  // vertical ↑
  [1, 1],  // diagonal ↗
  [1, -1], // diagonal ↖ (covers ↘ lines scanned from their low end)
];

export function checkWin(board: Board): WinResult | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (player === 0) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const cells: [number, number][] = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] !== player) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { player, cells };
      }
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return checkWin(board) === null && legalMoves(board).length === 0;
}
