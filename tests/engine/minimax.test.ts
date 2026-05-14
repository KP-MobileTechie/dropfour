import { describe, it, expect } from 'vitest';
import { emptyBoard, dropDisc, type Board, type Player } from '@/lib/engine/board';
import { evaluate } from '@/lib/engine/evaluate';
import { findBestMove } from '@/lib/engine/minimax';

/** Drop a sequence of [col, player] moves onto an empty board. */
function play(moves: [number, Player][]): Board {
  let board = emptyBoard();
  for (const [col, player] of moves) board = dropDisc(board, col, player)!.board;
  return board;
}

describe('evaluate', () => {
  it('scores center-column discs above edge discs', () => {
    const center = play([[3, 1]]);
    const edge = play([[0, 1]]);
    expect(evaluate(center, 1)).toBeGreaterThan(evaluate(edge, 1));
  });

  it('rewards own open threes and penalizes opponent open threes', () => {
    const own = play([[1, 1], [2, 1], [3, 1]]);  // P1 three on bottom row
    const opp = play([[1, 2], [2, 2], [3, 2]]);  // same shape for P2
    expect(evaluate(own, 1)).toBeGreaterThan(0);
    expect(evaluate(opp, 1)).toBeLessThan(0);
  });
});

describe('findBestMove — tactics', () => {
  it('takes an immediate win (horizontal)', () => {
    // P1 has discs on cols 1,2,3 bottom row; col 0 or 4 wins.
    const board = play([[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2]]);
    const { column } = findBestMove(board, 1, 4);
    expect([0, 4]).toContain(column);
  });

  it('blocks an opponent open three', () => {
    // P2 on cols 0,1,2 bottom row → only col 3 stops it.
    const board = play([[0, 2], [0, 1], [1, 2], [1, 1], [2, 2]]);
    const { column } = findBestMove(board, 1, 4);
    expect(column).toBe(3);
  });

  it('prefers winning now over blocking', () => {
    const board = play([[0, 1], [4, 2], [1, 1], [5, 2], [2, 1], [6, 2]]);
    // P1: 0,1,2 bottom → win at 3. P2: 4,5,6 bottom → would win at 3 too.
    const { column } = findBestMove(board, 1, 4);
    expect(column).toBe(3);
  });

  it('reports nodesSearched and prunes (deeper searches more nodes)', () => {
    const board = play([[3, 1], [3, 2]]);
    const shallow = findBestMove(board, 1, 2);
    const deep = findBestMove(board, 1, 5);
    expect(shallow.nodesSearched).toBeGreaterThan(0);
    expect(deep.nodesSearched).toBeGreaterThan(shallow.nodesSearched);
  });

  it('opens in the center column on an empty board', () => {
    const { column } = findBestMove(emptyBoard(), 1, 5);
    expect(column).toBe(3);
  });
});
