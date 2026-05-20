'use client';

import { useEffect, useState } from 'react';
import { useGame, type Mode } from '@/hooks/useGame';
import { chooseMove, getHint, type Difficulty } from '@/lib/engine/ai';
import { ModeMenu } from '@/components/ModeMenu';
import { GameBoard } from '@/components/GameBoard';
import { ControlBar } from '@/components/ControlBar';

const AI_DELAY_MS = 450; // lets the human's drop animation land first

export default function Home() {
  const [state, dispatch] = useGame();
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [hintCol, setHintCol] = useState<number | null>(null);

  const isHumanTurn =
    state.status === 'playing' && !state.aiThinking &&
    (state.mode === 'two' || state.current === 1);

  // AI takes its turn whenever it's P2's move in ai mode.
  // We deliberately exclude aiThinking from deps: dispatching AI_START inside
  // the effect would otherwise trigger a re-render → cleanup → clearTimeout,
  // cancelling the scheduled move before it fires.
  useEffect(() => {
    if (state.mode !== 'ai' || state.status !== 'playing' || state.current !== 2) return;
    dispatch({ type: 'AI_START' });
    const board = state.board;
    const difficulty = state.difficulty;
    const t = setTimeout(() => {
      const col = chooseMove(board, 2, difficulty);
      dispatch({ type: 'AI_DROP', col });
    }, AI_DELAY_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.status, state.current, state.board, state.difficulty, dispatch]);

  // Any move or restart clears a showing hint.
  useEffect(() => { setHintCol(null); }, [state.moveCount]);

  function start(mode: Mode, difficulty: Difficulty) {
    dispatch({ type: 'NEW_GAME', mode, difficulty });
    setStarted(true);
  }

  function showHint() {
    if (!isHumanTurn) return;
    setHintCol(getHint(state.board, state.current));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      {!started ? (
        <ModeMenu onStart={start} defaultDifficulty={state.difficulty} />
      ) : (
        <>
          <div className="text-sm text-[var(--fg-dim)]" aria-live="polite">
            {state.status === 'playing'
              ? state.aiThinking
                ? 'AI is thinking…'
                : state.mode === 'two'
                  ? `Player ${state.current}'s turn`
                  : 'Your turn'
              : null}
          </div>
          <GameBoard
            board={state.board}
            current={state.current}
            win={state.win}
            disabled={!isHumanTurn || state.status !== 'playing'}
            lastDrop={state.lastDrop}
            hintCol={hintCol}
            onDrop={(col) => dispatch({ type: 'DROP', col })}
            onIllegal={() => {}}
          />
          <ControlBar
            canUndo={state.history.length > 0 && !state.aiThinking}
            hintEnabled={isHumanTurn}
            soundOn={soundOn}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onHint={showHint}
            onRestart={() => dispatch({ type: 'NEW_GAME', mode: state.mode, difficulty: state.difficulty })}
            onToggleSound={() => setSoundOn((s) => !s)}
            onMenu={() => setStarted(false)}
          />
        </>
      )}
    </main>
  );
}
