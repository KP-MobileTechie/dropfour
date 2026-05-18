'use client';

import { useGame, type Mode } from '@/hooks/useGame';
import type { Difficulty } from '@/lib/engine/ai';
import { ModeMenu } from '@/components/ModeMenu';
import { GameBoard } from '@/components/GameBoard';
import { useState } from 'react';

export default function Home() {
  const [state, dispatch] = useGame();
  const [started, setStarted] = useState(false);

  function start(mode: Mode, difficulty: Difficulty) {
    dispatch({ type: 'NEW_GAME', mode, difficulty });
    setStarted(true);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      {!started ? (
        <ModeMenu onStart={start} defaultDifficulty="medium" />
      ) : (
        <>
          <GameBoard
            board={state.board}
            current={state.current}
            win={state.win}
            disabled={state.status !== 'playing' || state.aiThinking}
            lastDrop={state.lastDrop}
            hintCol={null}
            onDrop={(col) => dispatch({ type: 'DROP', col })}
            onIllegal={() => {}}
          />
          <button
            onClick={() => setStarted(false)}
            className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/15"
          >
            ← Menu
          </button>
        </>
      )}
    </main>
  );
}
