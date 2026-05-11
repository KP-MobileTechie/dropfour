# dropfour — Design Spec

**Date:** 2026-06-06
**Status:** Approved (brainstorming session)
**Repo:** `D:\Projects\dropfour` · Deploy target: Vercel · Public GitHub repo (`KP-MobileTechie/dropfour`)

## Summary

Connect Four with a Minimax + alpha-beta pruning AI as the centerpiece. Two modes: vs AI (three difficulty levels) and local pass-and-play 2-player. Glassmorphism visual identity, Framer Motion drop physics, win-line glow. Score tracking, undo, move hints, and synthesized sound effects round out the polish layer. All persistence in localStorage — no backend.

Portfolio goals: a real, whiteboard-explainable algorithm (minimax + alpha-beta + positional evaluation), pure-function engine design with tactical unit tests, and a distinctive visual identity that contrasts keyflow's terminal aesthetic. Second project in the six-project portfolio plan.

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| AI architecture | Sync minimax on main thread (Approach A) | Depth 7 with alpha-beta + center-first ordering runs in tens of ms; Web Worker (B) is YAGNI, bitboards (C) are write-only code that's hard to defend in interviews. |
| Difficulty design | Depth + randomness blend | Easy: depth 2 + 30% random legal moves (genuinely blunders). Medium: depth 4 pure. Hard: depth 7. Each level is a distinct talking point. |
| Game modes | vs AI + local 2-player | 2-player is nearly free once the board works. No online multiplayer, no AI-vs-AI spectate. |
| Visual style | Glassmorphism | Frosted-glass board over indigo→violet gradient. Distinctive vs keyflow's terminal look. Contrast risk mitigated explicitly (see Visuals). |
| Extras | Stats (W/L/D per difficulty), undo, hints, sounds | Hints reuse the minimax; sounds are WebAudio-synthesized (no assets); all cheap on top of the engine. |
| Persistence | localStorage only | Zero backend/env keys; one-step Vercel deploy. Same versioned-schema + safe-wrapper pattern as keyflow. |
| Stack | Next.js App Router + TypeScript + Tailwind + shadcn/ui + Framer Motion + Vitest | Consistent with rest of portfolio. |
| State | Single `useReducer` game hook | One game + settings; no state library (YAGNI). |

## Architecture

```
app/
  layout.tsx            # fonts, metadata, OG image, gradient backdrop
  page.tsx              # view state: menu ⇄ game ⇄ (game-over overlay)
lib/engine/             # PURE TypeScript — no React, no DOM
  board.ts              # Board type (7 cols × 6 rows, immutable), dropDisc, legalMoves,
                        # checkWin (returns winning cell coords), isDraw
  evaluate.ts           # positional scoring: center-column weight, open 2s/3s, threat counting
  minimax.ts            # alpha-beta + center-first move ordering;
                        # returns { column, score, nodesSearched }
  ai.ts                 # difficulty presets: easy (d2 + 30% random), medium (d4), hard (d7);
                        # also powers the hint feature; randomness injectable/seedable
lib/storage.ts          # localStorage: W/L/D per difficulty + 2-player tally, settings
                        # (sound on/off, last difficulty); versioned schema, safe wrapper
lib/sound.ts            # WebAudio synth (no audio assets): drop "plink", win chord, illegal-move
                        # tick; lazy AudioContext on first user gesture; respects mute
hooks/useGame.ts        # reducer: board, mode, current player, status, history stack (undo),
                        # aiThinking / animating flags
components/
  GameBoard.tsx         # glass board, spring drop animation, win-line glow,
                        # column hover ghost disc + keyboard column cursor
  ModeMenu.tsx          # vs AI (difficulty picker) | local 2-player
  ControlBar.tsx        # undo, hint, restart, sound toggle
  StatsPanel.tsx        # W/L/D record per difficulty from storage
  GameOverOverlay.tsx   # result + rematch; confetti flourish on a win vs Hard
```

**Data flow:** click/keyboard → reducer validates move via `board.ts` → disc animates in → if vs AI and game live, `setTimeout(0)` → `ai.ts` picks a column → same reducer path. `checkWin` returns the winning cell coordinates so `GameBoard` glows exactly those cells. The engine never touches the DOM; the UI never computes game logic.

**Unit boundaries:** every `lib/engine` module is pure and independently testable. `storage.ts` is the only module touching `window.localStorage`; `sound.ts` is the only module touching WebAudio.

## The algorithm (interview centerpiece)

- Minimax with alpha-beta pruning. Move ordering tries center columns first (`[3,2,4,1,5,0,6]`) — the strongest columns first maximizes pruning in Connect Four.
- `evaluate.ts` leaf scoring: ±∞ for win/loss; otherwise center-column occupancy bonus plus weighted open-ended 2-in-a-rows and 3-in-a-rows for us, symmetric negatives for opponent threats.
- Easy = depth 2 with 30% of moves replaced by a random legal move; Medium = depth 4 pure; Hard = depth 7.
- Hint = run the Hard search for the human's position and pulse the recommended column.
- `nodesSearched` is returned from the search and quoted in the README's "How it works" section as pruning evidence.

## Key behaviors

- Hovering a column shows a ghost disc at its landing cell; clicking (or ←/→ + Enter) drops
- Drop animates with a Framer Motion spring from above the board, small bounce on landing
- Win highlights the exact winning cells with a pulsing glow; game-over overlay offers rematch
- Undo: in vs-AI pops two plies (AI reply + your move); in 2-player pops one; disabled mid-AI-think and at move 0
- Stats panel updates W/L/D per difficulty (and a 2-player tally) after each finished game
- Sound: synthesized drop plink / win chord / illegal tick, mute toggle persisted in settings

## Visuals (glassmorphism, with guardrails)

- Backdrop: deep indigo → violet gradient; board: frosted-glass panel (`backdrop-blur`, translucent white border); empty cells: darker glass wells
- Discs: amber vs rose saturated gradients with opacity chosen to pass contrast on the glass; **discs also differ by an inset ring/icon so player state never relies on color alone**
- Visible focus ring on the keyboard column cursor; `prefers-reduced-motion` disables spring/bounce/confetti (instant placement, static win highlight)

## Error handling / edge cases

- localStorage unavailable or corrupt → fully playable, stats panel shows a notice, no crashes
- Full-column click/keypress → rejected with a small shake, no state change
- Input ignored while `aiThinking` or `animating` (no double-drop races); AI never moves after game end
- AudioContext created lazily on first user gesture (autoplay policy); sound failures are silent no-ops

## Testing (Vitest)

- `board.ts`: drops and stacking, all four win directions, draw detection, illegal-move rejection
- `minimax.ts`: must-block (opponent has open 3) and must-win (we have open 3) tactical positions; alpha-beta result matches plain minimax on fixed positions; deeper search ≥ shallower on tactical correctness
- `ai.ts`: all presets return legal moves; Easy's randomness is injected/seeded for determinism
- `storage.ts`: corrupt/missing data falls back cleanly
- Target ~25–30 tests; GitHub Actions CI (test + build), same as keyflow

## Out of scope (v2 candidates)

Online multiplayer, AI-vs-AI spectate mode, online leaderboards, bitboard engine, iterative-deepening time budget, quotes from famous games.

## Delivery

Public repo `KP-MobileTechie/dropfour`, Vercel deploy with OG image + metadata + favicon, README with demo GIF (placeholder until manually recorded), "How it works" (minimax + pruning, with `nodesSearched` numbers), and "Decisions" (3 trade-off bullets). Lighthouse ≥ 95 target. Commit dates: 11–24 May 2026 per project owner's instruction.
