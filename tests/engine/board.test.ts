import { describe, it, expect } from 'vitest';
import {
  COLS, ROWS, emptyBoard, legalMoves, dropDisc, checkWin, isDraw,
  type Board, type Player,
} from '@/lib/engine/board';

/** Build a board from visual rows (top row first), '.'=empty '1'/'2'=players. */
function b(...visualRows: string[]): Board {
  const board = emptyBoard();
  const rows = [...visualRows].reverse(); // bottom row becomes index 0
  rows.forEach((rowStr, r) =>
    [...rowStr].forEach((ch, c) => {
      if (ch === '1') board[r][c] = 1;
      if (ch === '2') board[r][c] = 2;
    }),
  );
  return board;
}

describe('emptyBoard / legalMoves', () => {
  it('creates a 6x7 empty board with all columns legal', () => {
    const board = emptyBoard();
    expect(board).toHaveLength(ROWS);
    expect(board[0]).toHaveLength(COLS);
    expect(board.flat().every((c) => c === 0)).toBe(true);
    expect(legalMoves(board)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('excludes full columns', () => {
    let board = emptyBoard();
    for (let i = 0; i < ROWS; i++) board = dropDisc(board, 3, ((i % 2) + 1) as Player)!.board;
    expect(legalMoves(board)).toEqual([0, 1, 2, 4, 5, 6]);
  });
});

describe('dropDisc', () => {
  it('lands on the bottom row of an empty column and is immutable', () => {
    const before = emptyBoard();
    const res = dropDisc(before, 2, 1)!;
    expect(res.row).toBe(0);
    expect(res.board[0][2]).toBe(1);
    expect(before[0][2]).toBe(0); // original untouched
  });

  it('stacks on top of existing discs', () => {
    const r1 = dropDisc(emptyBoard(), 4, 1)!;
    const r2 = dropDisc(r1.board, 4, 2)!;
    expect(r2.row).toBe(1);
    expect(r2.board[1][4]).toBe(2);
  });

  it('returns null for a full column', () => {
    let board = emptyBoard();
    for (let i = 0; i < ROWS; i++) board = dropDisc(board, 0, 1)!.board;
    expect(dropDisc(board, 0, 2)).toBeNull();
  });
});

describe('checkWin', () => {
  it('detects horizontal win with exact cells', () => {
    const board = b(
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.1111..',
    );
    const win = checkWin(board)!;
    expect(win.player).toBe(1);
    expect(win.cells).toEqual([[0, 1], [0, 2], [0, 3], [0, 4]]);
  });

  it('detects vertical win', () => {
    const board = b(
      '.......',
      '.......',
      '..2....',
      '..2....',
      '..2....',
      '..2....',
    );
    const win = checkWin(board)!;
    expect(win.player).toBe(2);
    expect(win.cells).toEqual([[0, 2], [1, 2], [2, 2], [3, 2]]);
  });

  it('detects diagonal ↗ win', () => {
    const board = b(
      '.......',
      '.......',
      '...1...',
      '..12...',
      '.122...',
      '1222...',
    );
    const win = checkWin(board)!;
    expect(win.player).toBe(1);
    expect(win.cells).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]]);
  });

  it('detects diagonal ↘ win', () => {
    const board = b(
      '.......',
      '.......',
      '...2...',
      '...12..',
      '...112.',
      '...1112',
    );
    const win = checkWin(board)!;
    expect(win.player).toBe(2);
    expect(win.cells).toEqual([[0, 6], [1, 5], [2, 4], [3, 3]]);
  });

  it('returns null when no win', () => {
    expect(checkWin(emptyBoard())).toBeNull();
  });
});

describe('isDraw', () => {
  it('full board without a win is a draw', () => {
    // Row pattern A A B A A B (bottom-up; A='1212121', B='2121212') — verified
    // free of vertical, horizontal, and both diagonal fours.
    const board = b(
      '2121212',
      '1212121',
      '1212121',
      '2121212',
      '1212121',
      '1212121',
    );
    expect(checkWin(board)).toBeNull();
    expect(isDraw(board)).toBe(true);
  });

  it('non-full board is not a draw', () => {
    expect(isDraw(emptyBoard())).toBe(false);
  });
});
