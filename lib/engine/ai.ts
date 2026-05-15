import { legalMoves, type Board, type Player } from './board';
import { findBestMove } from './minimax';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Record<Difficulty, { depth: number; blunderRate: number; label: string }> = {
  easy: { depth: 2, blunderRate: 0.3, label: 'Easy' },
  medium: { depth: 4, blunderRate: 0, label: 'Medium' },
  hard: { depth: 7, blunderRate: 0, label: 'Hard' },
};

/**
 * Pick the AI's column. `rng` is injectable for deterministic tests
 * (defaults to Math.random in production use).
 */
export function chooseMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  rng: () => number = Math.random,
): number {
  const { depth, blunderRate } = DIFFICULTIES[difficulty];
  if (blunderRate > 0 && rng() < blunderRate) {
    const moves = legalMoves(board);
    return moves[Math.floor(rng() * moves.length)];
  }
  return findBestMove(board, player, depth).column;
}

/** Best move for the human, computed at Hard strength. */
export function getHint(board: Board, player: Player): number {
  return findBestMove(board, player, DIFFICULTIES.hard.depth).column;
}
