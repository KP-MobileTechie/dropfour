'use client';

import type { StoredData } from '@/lib/storage';
import { DIFFICULTIES, type Difficulty } from '@/lib/engine/ai';

interface Props {
  data: StoredData;
  storageOk: boolean;
}

export function StatsPanel({ data, storageOk }: Props) {
  if (!storageOk) {
    return (
      <div className="glass rounded-2xl px-4 py-3 text-xs text-[var(--fg-dim)]">
        Stats unavailable — browser storage is disabled. Games still work.
      </div>
    );
  }
  const rows = (Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => ({
    label: DIFFICULTIES[d].label,
    ...data.stats[d],
  }));
  const tp = data.stats.twoPlayer;
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <h2 className="mb-2 text-xs uppercase tracking-widest text-[var(--fg-dim)]">Record</h2>
      <table className="text-sm">
        <thead>
          <tr className="text-[var(--fg-dim)]">
            <th className="pr-4 text-left font-normal">vs AI</th>
            <th className="px-2 font-normal">W</th>
            <th className="px-2 font-normal">L</th>
            <th className="px-2 font-normal">D</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="pr-4">{r.label}</td>
              <td className="px-2 text-center">{r.w}</td>
              <td className="px-2 text-center">{r.l}</td>
              <td className="px-2 text-center">{r.d}</td>
            </tr>
          ))}
          <tr className="text-[var(--fg-dim)]">
            <td className="pr-4 pt-1">2-player</td>
            <td className="px-2 pt-1 text-center">{tp.p1}</td>
            <td className="px-2 pt-1 text-center">{tp.p2}</td>
            <td className="px-2 pt-1 text-center">{tp.d}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
