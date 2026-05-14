import { COLS, ROWS, type Board, type Player } from './board';

const SCORE_THREE = 100;   // open three (one empty in window)
const SCORE_TWO = 10;      // open two
const OPP_THREE = -120;    // opponent open three — blocking outranks building
const CENTER_BONUS = 6;

function scoreWindow(window: number[], player: Player): number {
  const opp: Player = player === 1 ? 2 : 1;
  const mine = window.filter((c) => c === player).length;
  const theirs = window.filter((c) => c === opp).length;
  const empty = window.filter((c) => c === 0).length;

  if (mine > 0 && theirs > 0) return 0; // dead window
  if (mine === 3 && empty === 1) return SCORE_THREE;
  if (mine === 2 && empty === 2) return SCORE_TWO;
  if (theirs === 3 && empty === 1) return OPP_THREE;
  return 0;
}

/**
 * Positional score of `board` from `player`'s perspective.
 * Terminal win/loss is handled by the search, not here.
 */
export function evaluate(board: Board, player: Player): number {
  let score = 0;
  const centerCol = Math.floor(COLS / 2);

  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === player) score += CENTER_BONUS;
    else if (board[r][centerCol] !== 0) score -= CENTER_BONUS;
  }

  // All 4-cell windows: horizontal, vertical, both diagonals.
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS)
        score += scoreWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], player);
      if (r + 3 < ROWS)
        score += scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], player);
      if (r + 3 < ROWS && c + 3 < COLS)
        score += scoreWindow(
          [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], player);
      if (r + 3 < ROWS && c - 3 >= 0)
        score += scoreWindow(
          [board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]], player);
    }
  }
  return score;
}
