'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  COLS, ROWS, dropDisc, type Board, type Player, type WinResult,
} from '@/lib/engine/board';

interface Props {
  board: Board;
  current: Player;
  win: WinResult | null;
  disabled: boolean;
  lastDrop: { col: number; row: number } | null;
  hintCol: number | null;
  onDrop: (col: number) => void;
  onIllegal: () => void;
}

/** Disc with color + inset ring so state never relies on color alone. */
function Disc({ player, animateFrom, reduced }: {
  player: Player; animateFrom: number | null; reduced: boolean;
}) {
  const palette = player === 1
    ? 'bg-gradient-to-br from-[var(--p1-hi)] to-[var(--p1)] ring-amber-200/70'
    : 'bg-gradient-to-br from-[var(--p2-hi)] to-[var(--p2)] ring-rose-200/70';
  return (
    <motion.div
      initial={animateFrom !== null && !reduced ? { y: animateFrom } : false}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`h-full w-full rounded-full ring-4 ring-inset shadow-lg ${palette}`}
      data-player={player}
    />
  );
}

export function GameBoard({
  board, current, win, disabled, lastDrop, hintCol, onDrop, onIllegal,
}: Props) {
  const [cursor, setCursor] = useState(3); // keyboard column cursor
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [shakeCol, setShakeCol] = useState<number | null>(null);
  const reduced = useReducedMotion() ?? false;

  const winSet = new Set((win?.cells ?? []).map(([r, c]) => `${r},${c}`));
  const ghostCol = hoverCol ?? cursor;
  const ghost = !disabled ? dropDisc(board, ghostCol, current) : null;

  function tryDrop(col: number) {
    if (disabled) return;
    if (board[ROWS - 1][col] !== 0) {
      setShakeCol(col);
      setTimeout(() => setShakeCol(null), 400);
      onIllegal();
      return;
    }
    onDrop(col);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { setCursor((c) => Math.max(0, c - 1)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setCursor((c) => Math.min(COLS - 1, c + 1)); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { tryDrop(cursor); e.preventDefault(); }
  }

  return (
    <div
      role="grid"
      aria-label="Connect Four board"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="glass rounded-3xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:p-4"
    >
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {Array.from({ length: COLS }, (_, col) => (
          <button
            key={col}
            aria-label={`Drop in column ${col + 1}`}
            onClick={() => tryDrop(col)}
            onMouseEnter={() => setHoverCol(col)}
            onMouseLeave={() => setHoverCol(null)}
            disabled={disabled}
            className={`flex flex-col-reverse gap-2 sm:gap-3 ${shakeCol === col ? 'shake' : ''}
                        ${hintCol === col ? 'rounded-2xl ring-2 ring-[var(--focus)] animate-pulse' : ''}`}
          >
            {Array.from({ length: ROWS }, (_, row) => {
              const cell = board[row][col];
              const isWin = winSet.has(`${row},${col}`);
              const isLanding = lastDrop?.col === col && lastDrop?.row === row;
              const isGhost = cell === 0 && ghost !== null && ghostCol === col && ghost.row === row;
              return (
                <div
                  key={row}
                  className={`relative aspect-square w-9 rounded-full sm:w-14
                              ${cell === 0 ? 'bg-[var(--well)]' : ''} ${isWin ? 'win-cell' : ''}`}
                >
                  {cell !== 0 && (
                    <Disc
                      player={cell}
                      animateFrom={isLanding ? -(ROWS - row) * 60 : null}
                      reduced={reduced}
                    />
                  )}
                  {isGhost && (
                    <div
                      className={`h-full w-full rounded-full opacity-30
                                  ${current === 1 ? 'bg-[var(--p1)]' : 'bg-[var(--p2)]'}`}
                    />
                  )}
                </div>
              );
            })}
          </button>
        ))}
      </div>
    </div>
  );
}
