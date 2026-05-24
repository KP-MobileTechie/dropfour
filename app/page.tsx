'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame, type Mode } from '@/hooks/useGame';
import { chooseMove, getHint, type Difficulty } from '@/lib/engine/ai';
import {
  loadData, saveData, recordResult, isStorageAvailable, type StoredData,
} from '@/lib/storage';
import { playDrop, playIllegal, playWin } from '@/lib/sound';
import { ModeMenu } from '@/components/ModeMenu';
import { GameBoard } from '@/components/GameBoard';
import { ControlBar } from '@/components/ControlBar';
import { StatsPanel } from '@/components/StatsPanel';
import { GameOverOverlay } from '@/components/GameOverOverlay';

const AI_DELAY_MS = 450; // lets the human's drop animation land first

export default function Home() {
  const [state, dispatch] = useGame();
  const [started, setStarted] = useState(false);
  const [hintCol, setHintCol] = useState<number | null>(null);
  const [data, setData] = useState<StoredData | null>(null); // null until client mount
  const [storageOk, setStorageOk] = useState(true);
  // True once this game's first finish has been recorded. Undoing a decided
  // game and replaying does NOT record again — the first outcome stands.
  const recordedThisGame = useRef(false);

  // Hydrate persisted data on mount (storage is client-only).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from localStorage
    setStorageOk(isStorageAvailable());
    setData(loadData());
  }, []);

  const soundOn = data?.settings.sound ?? true;

  function updateData(next: StoredData) {
    setData(next);
    saveData(next);
  }

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

  // Sounds + hint clearing on every move.
  useEffect(() => {
    if (state.moveCount === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a move invalidates any shown hint
    setHintCol(null);
    if (!soundOn) return;
    if (state.status === 'won') playWin();
    else playDrop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.moveCount]);

  // Record result exactly once per finished game.
  useEffect(() => {
    if (state.status === 'playing' || !data) return;
    if (recordedThisGame.current) return;
    recordedThisGame.current = true;
    if (state.mode === 'ai') {
      const outcome = state.status === 'draw' ? 'draw' : state.win!.player === 1 ? 'win' : 'loss';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recording a finished game is a one-shot sync
      updateData(recordResult(data, { mode: 'ai', difficulty: state.difficulty, outcome }));
    } else {
      const winner = state.status === 'draw' ? 0 : state.win!.player;
      updateData(recordResult(data, { mode: 'two', winner }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  function start(mode: Mode, difficulty: Difficulty) {
    if (data) updateData({ ...data, settings: { ...data.settings, difficulty } });
    recordedThisGame.current = false;
    dispatch({ type: 'NEW_GAME', mode, difficulty });
    setStarted(true);
  }

  function restart() {
    recordedThisGame.current = false;
    dispatch({ type: 'NEW_GAME', mode: state.mode, difficulty: state.difficulty });
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      {!started ? (
        <div className="flex flex-col items-center gap-4">
          <ModeMenu onStart={start} defaultDifficulty={data?.settings.difficulty ?? 'medium'} />
          {data && <StatsPanel data={data} storageOk={storageOk} />}
        </div>
      ) : (
        <>
          <div className="h-5 text-sm text-[var(--fg-dim)]" aria-live="polite">
            {state.status === 'playing' &&
              (state.aiThinking
                ? 'AI is thinking…'
                : state.mode === 'two'
                  ? `Player ${state.current}'s turn`
                  : 'Your turn')}
          </div>
          <GameBoard
            board={state.board}
            current={state.current}
            win={state.win}
            disabled={!isHumanTurn || state.status !== 'playing'}
            lastDrop={state.lastDrop}
            hintCol={hintCol}
            onDrop={(col) => dispatch({ type: 'DROP', col })}
            onIllegal={() => soundOn && playIllegal()}
          />
          {state.status !== 'playing' && (
            <GameOverOverlay state={state} onRematch={restart} onMenu={() => setStarted(false)} />
          )}
          <ControlBar
            canUndo={state.history.length > 0 && !state.aiThinking}
            hintEnabled={isHumanTurn}
            soundOn={soundOn}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onHint={() => isHumanTurn && setHintCol(getHint(state.board, state.current))}
            onRestart={restart}
            onToggleSound={() =>
              data && updateData({ ...data, settings: { ...data.settings, sound: !soundOn } })}
            onMenu={() => setStarted(false)}
          />
        </>
      )}
    </main>
  );
}
