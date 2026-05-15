import { describe, it, expect } from 'vitest';
import { emptyBoard, dropDisc, legalMoves, type Board, type Player } from '@/lib/engine/board';
import { chooseMove, getHint, DIFFICULTIES, type Difficulty } from '@/lib/engine/ai';

function play(moves: [number, Player][]): Board {
  let board = emptyBoard();
  for (const [col, player] of moves) board = dropDisc(board, col, player)!.board;
  return board;
}

describe('chooseMove', () => {
  it('returns a legal move for every difficulty on an empty board', () => {
    for (const d of Object.keys(DIFFICULTIES) as Difficulty[]) {
      const col = chooseMove(emptyBoard(), 1, d, () => 0.99);
      expect(legalMoves(emptyBoard())).toContain(col);
    }
  });

  it('easy plays a random legal move when rng < 0.3', () => {
    // rng() is called first for the blunder roll, then for random column pick.
    // With roll=0.1 (<0.3) and pick=0 → first legal column (0).
    const rngValues = [0.1, 0];
    const rng = () => rngValues.shift() ?? 0;
    const col = chooseMove(emptyBoard(), 1, 'easy', rng);
    expect(col).toBe(0);
  });

  it('easy plays the minimax move when rng >= 0.3', () => {
    const col = chooseMove(emptyBoard(), 1, 'easy', () => 0.9);
    expect(col).toBe(3); // depth-2 minimax opens center
  });

  it('hard blocks an open three', () => {
    const board = play([[0, 2], [0, 1], [1, 2], [1, 1], [2, 2]]);
    expect(chooseMove(board, 1, 'hard', () => 0.99)).toBe(3);
  });
});

describe('getHint', () => {
  it('recommends the winning column', () => {
    const board = play([[0, 1], [4, 2], [1, 1], [5, 2], [2, 1], [6, 2]]);
    expect(getHint(board, 1)).toBe(3);
  });
});
