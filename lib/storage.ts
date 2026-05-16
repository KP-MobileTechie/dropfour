import type { Difficulty } from './engine/ai';

export const STORAGE_KEY = 'dropfour:v1';

export interface Record3 { w: number; l: number; d: number }
export interface TwoPlayerTally { p1: number; p2: number; d: number }

export interface StoredData {
  version: 1;
  stats: {
    easy: Record3;
    medium: Record3;
    hard: Record3;
    twoPlayer: TwoPlayerTally;
  };
  settings: {
    sound: boolean;
    difficulty: Difficulty;
  };
}

export type GameResult =
  | { mode: 'ai'; difficulty: Difficulty; outcome: 'win' | 'loss' | 'draw' }
  | { mode: 'two'; winner: 0 | 1 | 2 }; // 0 = draw

export function defaultData(): StoredData {
  return {
    version: 1,
    stats: {
      easy: { w: 0, l: 0, d: 0 },
      medium: { w: 0, l: 0, d: 0 },
      hard: { w: 0, l: 0, d: 0 },
      twoPlayer: { p1: 0, p2: 0, d: 0 },
    },
    settings: { sound: true, difficulty: 'medium' },
  };
}

export function isStorageAvailable(): boolean {
  try {
    const k = '__dropfour_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as StoredData;
    if (
      parsed?.version !== 1 ||
      !parsed.stats?.easy || !parsed.stats.medium || !parsed.stats.hard ||
      !parsed.stats.twoPlayer ||
      typeof parsed.settings?.sound !== 'boolean' || !parsed.settings.difficulty
    ) {
      return defaultData();
    }
    return parsed;
  } catch {
    return defaultData();
  }
}

export function saveData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — play on statelessly
  }
}

/** Pure: returns a new StoredData with the result folded in. */
export function recordResult(data: StoredData, result: GameResult): StoredData {
  const next: StoredData = structuredClone(data);
  if (result.mode === 'ai') {
    const rec = next.stats[result.difficulty];
    if (result.outcome === 'win') rec.w++;
    else if (result.outcome === 'loss') rec.l++;
    else rec.d++;
  } else {
    if (result.winner === 1) next.stats.twoPlayer.p1++;
    else if (result.winner === 2) next.stats.twoPlayer.p2++;
    else next.stats.twoPlayer.d++;
  }
  return next;
}
