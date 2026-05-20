'use client';

interface Props {
  canUndo: boolean;
  hintEnabled: boolean;
  soundOn: boolean;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  onMenu: () => void;
}

const btn =
  'glass rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/15 ' +
  'disabled:opacity-40 disabled:hover:bg-transparent ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus)]';

export function ControlBar({
  canUndo, hintEnabled, soundOn, onUndo, onHint, onRestart, onToggleSound, onMenu,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button className={btn} onClick={onUndo} disabled={!canUndo}>↩ Undo</button>
      <button className={btn} onClick={onHint} disabled={!hintEnabled}>💡 Hint</button>
      <button className={btn} onClick={onRestart}>⟳ Restart</button>
      <button className={btn} onClick={onToggleSound} aria-pressed={soundOn}>
        {soundOn ? '🔊 Sound on' : '🔇 Muted'}
      </button>
      <button className={btn} onClick={onMenu}>← Menu</button>
    </div>
  );
}
