'use client';

import { DIFFICULTIES, type Difficulty } from '@/lib/engine/ai';
import type { Mode } from '@/hooks/useGame';

interface Props {
  onStart: (mode: Mode, difficulty: Difficulty) => void;
  defaultDifficulty: Difficulty;
}

export function ModeMenu({ onStart, defaultDifficulty }: Props) {
  return (
    <div className="glass flex w-full max-w-md flex-col gap-6 rounded-3xl p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">dropfour</h1>
        <p className="mt-1 text-sm text-[var(--fg-dim)]">
          Connect Four vs a minimax AI — or a friend.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-[var(--fg-dim)]">vs AI</span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onStart('ai', d)}
              autoFocus={d === defaultDifficulty}
              className="glass rounded-xl px-3 py-3 text-sm font-semibold transition
                         hover:bg-white/15 focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-[var(--focus)]"
            >
              {DIFFICULTIES[d].label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onStart('two', 'medium')}
        className="glass rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-white/15
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
      >
        Local 2-player
      </button>
    </div>
  );
}
