'use client';

import { useMemo } from 'react';
import type { DayStat, ReviewState, TagStat } from '@/lib/types';
import { rollUp, tagLabel } from '@/lib/weakness';
import { dayKey } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Activity heatmap — a plain record of what you did, not a streak     */
/* ------------------------------------------------------------------ */
export function ActivityHeatmap({ days, weeks = 26 }: { days: Record<string, DayStat>; weeks?: number }) {
  const cells = useMemo(() => {
    const out: { key: string; count: number; xp: number }[] = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    // Align to the start of the week so columns read as weeks.
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < weeks * 7 + 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > today) break;
      const key = dayKey(d.getTime());
      const stat = days[key];
      out.push({ key, count: stat?.reviews ?? 0, xp: stat?.xp ?? 0 });
    }
    return out;
  }, [days, weeks]);

  const max = Math.max(1, ...cells.map((c) => c.count));
  const columns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((cell) => {
              const intensity = cell.count === 0 ? 0 : 0.2 + 0.8 * (cell.count / max);
              return (
                <div
                  key={cell.key}
                  title={`${cell.key}: ${cell.count} reviews · ${cell.xp} XP`}
                  className="h-3 w-3 rounded-[3px]"
                  style={{
                    background:
                      cell.count === 0
                        ? 'rgba(148,163,184,0.10)'
                        : `rgba(56,189,248,${intensity.toFixed(2)})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weakness radar — tag scores rolled up to their namespace            */
/* ------------------------------------------------------------------ */
export function WeaknessRadar({ stats, size = 280 }: { stats: Record<string, TagStat>; size?: number }) {
  const axes = useMemo(() => rollUp(stats).slice(0, 8), [stats]);

  if (axes.length < 3) {
    return (
      <p className="py-8 text-center text-sm muted">
        The radar needs at least three areas with reviews. Keep studying — it fills in fast.
      </p>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 42;
  const step = (Math.PI * 2) / axes.length;

  const point = (i: number, value: number) => {
    const angle = i * step - Math.PI / 2;
    return [cx + Math.cos(angle) * r * value, cy + Math.sin(angle) * r * value] as const;
  };

  const polygon = axes.map((a, i) => point(i, Math.max(0.06, a.score)).join(',')).join(' ');
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} className="mx-auto max-w-full">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => point(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="rgba(148,163,184,0.14)"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(148,163,184,0.12)" />;
      })}
      <polygon points={polygon} fill="rgba(56,189,248,0.22)" stroke="#38bdf8" strokeWidth={2} />
      {axes.map((axis, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={axis.tag}
            x={x}
            y={y}
            textAnchor={x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle'}
            dominantBaseline="middle"
            className="fill-slate-400"
            style={{ fontSize: 10 }}
          >
            {tagLabel(axis.tag).slice(0, 14)}
          </text>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Review forecast — what the next fortnight of work looks like        */
/* ------------------------------------------------------------------ */
export function ReviewForecast({ reviews, days = 14 }: { reviews: Record<string, ReviewState>; days?: number }) {
  const buckets = useMemo(() => {
    const now = Date.now();
    const out = Array.from({ length: days }, (_, i) => ({ day: i, count: 0 }));
    let overdue = 0;
    for (const state of Object.values(reviews)) {
      const delta = state.due - now;
      if (delta <= 0) {
        overdue += 1;
        continue;
      }
      const index = Math.floor(delta / 86_400_000);
      if (index < days) out[index].count += 1;
    }
    return { out, overdue };
  }, [reviews, days]);

  const max = Math.max(1, buckets.overdue, ...buckets.out.map((b) => b.count));

  return (
    <div className="flex items-end gap-1" style={{ height: 120 }}>
      <Bar height={buckets.overdue / max} label="now" count={buckets.overdue} overdue />
      {buckets.out.map((b) => (
        <Bar key={b.day} height={b.count / max} label={`+${b.day + 1}`} count={b.count} />
      ))}
    </div>
  );
}

function Bar({
  height,
  label,
  count,
  overdue,
}: {
  height: number;
  label: string;
  count: number;
  overdue?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1" title={`${count} cards`}>
      <div className="flex w-full flex-1 items-end">
        <div
          className="w-full rounded-t"
          style={{
            height: `${Math.max(2, height * 100)}%`,
            background: overdue ? 'var(--color-warn)' : 'var(--color-accent)',
            opacity: count === 0 ? 0.25 : 1,
          }}
        />
      </div>
      <span className="text-[0.55rem] muted">{label}</span>
    </div>
  );
}
