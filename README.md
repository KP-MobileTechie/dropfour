# dropfour

Connect Four with a real opponent: minimax + alpha-beta pruning at three difficulty levels.

<!-- TODO(manual): record demo GIF with ScreenToGif and replace this line -->

**Live demo:** https://dropfour-eta.vercel.app

## Features

- 🤖 **vs AI** — Easy (depth 2, 30% blunders), Medium (depth 4), Hard (depth 7)
- 👥 **Local 2-player** pass-and-play
- ↩ **Undo** (rolls back the AI's reply too), 💡 **hints** powered by the Hard search
- 📊 W/L/D record per difficulty, persisted in localStorage
- 🔊 Synthesized sounds (WebAudio — zero audio assets), mute toggle
- ♿ Keyboard playable (←/→ + Enter), focus rings, `prefers-reduced-motion` respected

## How it works

The AI is a classic **minimax search with alpha-beta pruning** (`lib/engine/minimax.ts`).
Move ordering tries center columns first (`[3,2,4,1,5,0,6]`) — strongest-first ordering is
what makes pruning effective: a depth-7 search typically visits **~20–160k nodes instead of
~800k+** (the search reports `nodesSearched`, so you can verify this yourself). Leaf
positions are scored by `lib/engine/evaluate.ts`: center-column occupancy plus weighted
open twos/threes, with opponent threats weighted slightly heavier than own threats so the
AI blocks before it builds.

The engine is pure TypeScript with no React or DOM dependencies — every module is
unit-tested in isolation (tactical must-win / must-block positions included).

## Decisions

- **Sync search over a Web Worker** — depth 7 with good move ordering resolves in well under
  two seconds even on hostile positions; a worker would add bundling + async complexity for
  a problem that doesn't exist at this scale.
- **Readable arrays over bitboards** — a BigInt bitboard engine is ~10× faster but write-only;
  this codebase is meant to be explainable line-by-line.
- **Blunder-rate Easy over depth-1 Easy** — pure shallow search never makes *obvious* mistakes,
  it just plays short-sighted. A 30% random-move rate is what actually makes a beatable,
  fun bottom tier.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Vitest

## Run locally

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # engine test suite
```

## License

MIT
