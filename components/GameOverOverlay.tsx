'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { GameState } from '@/hooks/useGame';

interface Props {
  state: GameState;
  onRematch: () => void;
  onMenu: () => void;
}

function resultText(state: GameState): { title: string; sub: string; celebrate: boolean } {
  if (state.status === 'draw') return { title: "It's a draw", sub: 'Every column is full.', celebrate: false };
  const winner = state.win!.player;
  if (state.mode === 'two') {
    return { title: `Player ${winner} wins!`, sub: 'Rematch?', celebrate: false };
  }
  return winner === 1
    ? {
        title: 'You win! 🎉',
        sub: state.difficulty === 'hard' ? 'You beat the depth-7 search.' : 'Try a harder difficulty?',
        celebrate: state.difficulty === 'hard',
      }
    : { title: 'AI wins', sub: 'Undo is still available — or rematch.', celebrate: false };
}

const CONFETTI = ['🟡', '🔴', '🟣', '🟠', '✨'];

export function GameOverOverlay({ state, onRematch, onMenu }: Props) {
  const reduced = useReducedMotion() ?? false;
  if (state.status === 'playing') return null;
  const { title, sub, celebrate } = resultText(state);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass relative flex flex-col items-center gap-3 rounded-3xl px-10 py-6 text-center"
      role="dialog"
      aria-label="Game over"
    >
      {celebrate && !reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {CONFETTI.flatMap((emoji, i) =>
            [0, 1, 2].map((j) => (
              <motion.span
                key={`${i}-${j}`}
                initial={{ y: -20, x: 20 + i * 55 + j * 18, opacity: 1 }}
                animate={{ y: 140, opacity: 0, rotate: 180 }}
                transition={{ duration: 1.4, delay: (i * 3 + j) * 0.08, ease: 'easeIn' }}
                className="absolute text-lg"
              >
                {emoji}
              </motion.span>
            )),
          )}
        </div>
      )}
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-[var(--fg-dim)]">{sub}</p>
      <div className="mt-1 flex gap-2">
        <button
          onClick={onRematch}
          autoFocus
          className="glass rounded-xl px-5 py-2 text-sm font-semibold hover:bg-white/15
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          Rematch
        </button>
        <button
          onClick={onMenu}
          className="glass rounded-xl px-5 py-2 text-sm hover:bg-white/15
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          Menu
        </button>
      </div>
    </motion.div>
  );
}
