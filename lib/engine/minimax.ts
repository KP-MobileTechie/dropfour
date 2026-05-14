import {
  checkWin, dropDisc, legalMoves, type Board, type Player,
} from './board';
import { evaluate } from './evaluate';

export interface SearchResult {
  column: number;
  score: number;
  nodesSearched: number;
}

const WIN_SCORE = 1_000_000;
/** Center-first ordering — strongest columns first maximizes alpha-beta pruning. */
const ORDER = [3, 2, 4, 1, 5, 0, 6];

function other(p: Player): Player {
  return p === 1 ? 2 : 1;
}

export function findBestMove(board: Board, player: Player, depth: number): SearchResult {
  let nodes = 0;

  function alphabeta(
    b: Board, current: Player, d: number, alpha: number, beta: number,
  ): number {
    nodes++;
    const win = checkWin(b);
    if (win) {
      // Depth-adjusted so nearer wins/losses dominate.
      return win.player === player ? WIN_SCORE + d : -(WIN_SCORE + d);
    }
    const moves = legalMoves(b);
    if (moves.length === 0) return 0; // draw
    if (d === 0) return evaluate(b, player);

    const maximizing = current === player;
    let best = maximizing ? -Infinity : Infinity;
    for (const col of ORDER) {
      if (!moves.includes(col)) continue;
      const dropped = dropDisc(b, col, current)!;
      const value = alphabeta(dropped.board, other(current), d - 1, alpha, beta);
      if (maximizing) {
        best = Math.max(best, value);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, value);
        beta = Math.min(beta, best);
      }
      if (alpha >= beta) break; // prune
    }
    return best;
  }

  let bestColumn = -1;
  let bestScore = -Infinity;
  const moves = legalMoves(board);
  for (const col of ORDER) {
    if (!moves.includes(col)) continue;
    const dropped = dropDisc(board, col, player)!;
    const score = alphabeta(dropped.board, other(player), depth - 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestColumn = col;
    }
  }
  return { column: bestColumn, score: bestScore, nodesSearched: nodes };
}
