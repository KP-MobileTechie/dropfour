import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadData, saveData, recordResult, defaultData, STORAGE_KEY,
} from '@/lib/storage';

beforeEach(() => localStorage.clear());

describe('loadData', () => {
  it('returns defaults when storage is empty', () => {
    expect(loadData()).toEqual(defaultData());
  });

  it('returns defaults when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadData()).toEqual(defaultData());
  });

  it('returns defaults when version is unknown', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }));
    expect(loadData()).toEqual(defaultData());
  });

  it('returns defaults when stored data is structurally incomplete', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, stats: {}, settings: { sound: true, difficulty: 'medium' } }),
    );
    expect(loadData()).toEqual(defaultData());
  });

  it('round-trips saved data', () => {
    const data = defaultData();
    data.settings.sound = false;
    data.settings.difficulty = 'hard';
    saveData(data);
    expect(loadData()).toEqual(data);
  });
});

describe('recordResult', () => {
  it('increments win/loss/draw per difficulty', () => {
    let data = defaultData();
    data = recordResult(data, { mode: 'ai', difficulty: 'medium', outcome: 'win' });
    data = recordResult(data, { mode: 'ai', difficulty: 'medium', outcome: 'loss' });
    data = recordResult(data, { mode: 'ai', difficulty: 'hard', outcome: 'draw' });
    expect(data.stats.medium).toEqual({ w: 1, l: 1, d: 0 });
    expect(data.stats.hard).toEqual({ w: 0, l: 0, d: 1 });
  });

  it('tallies 2-player games', () => {
    let data = defaultData();
    data = recordResult(data, { mode: 'two', winner: 1 });
    data = recordResult(data, { mode: 'two', winner: 2 });
    data = recordResult(data, { mode: 'two', winner: 0 });
    expect(data.stats.twoPlayer).toEqual({ p1: 1, p2: 1, d: 1 });
  });
});
