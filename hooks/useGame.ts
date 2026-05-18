'use client';

import { useReducer } from 'react';
import {
  checkWin, dropDisc, emptyBoard, isDraw,
  type Board, type Player, type WinResult,
} from '@/lib/engine/board';
import type { Difficulty } from '@/lib/engine/ai';

export type Mode = 'ai' | 'two';
export type Status = 'playing' | 'won' | 'draw';

export interface GameState {
  mode: Mode;
  difficulty: Difficulty;
  board: Board;
  current: Player;
  status: Status;
  win: WinResult | null;
  /** Snapshots BEFORE each move, for undo. */
  history: { board: Board; current: Player }[];
  /** Column and landing row of the last drop, for animation. */
  lastDrop: { col: number; row: number } | null;
  aiThinking: boolean;
  /** Human is always P1 in ai mode. */
  moveCount: number;
}

export type GameAction =
  | { type: 'NEW_GAME'; mode: Mode; difficulty: Difficulty }
  | { type: 'DROP'; col: number }
  | { type: 'AI_START' }
  | { type: 'AI_DROP'; col: number }
  | { type: 'UNDO' };

export function initialState(mode: Mode = 'ai', difficulty: Difficulty = 'medium'): GameState {
  return {
    mode, difficulty,
    board: emptyBoard(),
    current: 1,
    status: 'playing',
    win: null,
    history: [],
    lastDrop: null,
    aiThinking: false,
    moveCount: 0,
  };
}

function applyDrop(state: GameState, col: number): GameState {
  if (state.status !== 'playing') return state;
  const result = dropDisc(state.board, col, state.current);
  if (!result) return state; // full column — caller shows shake
  const win = checkWin(result.board);
  const draw = !win && isDraw(result.board);
  return {
    ...state,
    board: result.board,
    current: state.current === 1 ? 2 : 1,
    status: win ? 'won' : draw ? 'draw' : 'playing',
    win,
    history: [...state.history, { board: state.board, current: state.current }],
    lastDrop: { col, row: result.row },
    aiThinking: false,
    moveCount: state.moveCount + 1,
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return initialState(action.mode, action.difficulty);
    case 'DROP': {
      if (state.aiThinking) return state;
      if (state.mode === 'ai' && state.current !== 1) return state;
      return applyDrop(state, action.col);
    }
    case 'AI_START':
      return state.status === 'playing' ? { ...state, aiThinking: true } : state;
    case 'AI_DROP':
      return state.status === 'playing' ? applyDrop(state, action.col) : state;
    case 'UNDO': {
      if (state.aiThinking || state.history.length === 0) return state;
      // ai mode: pop two plies (AI reply + human move) when available.
      const steps = state.mode === 'ai' ? Math.min(2, state.history.length) : 1;
      const target = state.history[state.history.length - steps];
      return {
        ...state,
        board: target.board,
        current: target.current,
        status: 'playing',
        win: null,
        history: state.history.slice(0, -steps),
        lastDrop: null,
        moveCount: state.moveCount - steps,
      };
    }
  }
}

export function useGame() {
  return useReducer(reducer, undefined, () => initialState());
}
