'use client';

import { useMemo } from 'react';
import type { DayStat, ReviewState, TagStat } from '@/lib/types';
import { MIN_REVIEWS_FOR_WEAK, WEAK_THRESHOLD, rollUp, tagLabel } from '@/lib/weakness';
import { dayKey, pct } from '@/lib/utils';

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
  // One stray review is not a signal, so an area needs the same minimum as a weak tag
  // before it earns an axis. Axes are sorted by name so they do not swap places as
  // review counts change.
  const axes = useMemo(
    () =>
      rollUp(stats)
        .filter((a) => a.reviews >= MIN_REVIEWS_FOR_WEAK)
        .slice(0, 8)
        .sort((a, b) => a.tag.localeCompare(b.tag)),
    [stats],
  );

  if (axes.length < 3) {
    return (
      <p className="py-8 text-center text-sm muted">
        The radar needs at least three areas with {MIN_REVIEWS_FOR_WEAK}+ reviews each. Keep
        studying — it fills in fast.
      </p>
    );
  }

  // Labels sit outside the plot, so the viewBox is wider than the plot itself —
  // otherwise the left and right labels are cut off at the SVG edge.
  const padX = 84;
  const padY = 26;
  const width = size + padX * 2;
  const height = size + padY * 2;
  const cx = width / 2;
  const cy = height / 2;
  const r = size / 2 - 24;
  const step = (Math.PI * 2) / axes.length;

  const point = (i: number, value: number) => {
    const angle = i * step - Math.PI / 2;
    return [cx + Math.cos(angle) * r * value, cy + Math.sin(angle) * r * value] as const;
  };

  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
  const polygon = axes.map((a, i) => point(i, Math.max(0.06, clamp01(a.score))).join(',')).join(' ');
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Score by area: ${axes.map((a) => `${tagLabel(a.tag)} ${pct(a.score)}`).join(', ')}`}
        className="mx-auto block w-full"
        style={{ maxWidth: width }}
      >
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
        <polygon
          points={axes.map((_, i) => point(i, WEAK_THRESHOLD).join(',')).join(' ')}
          fill="none"
          stroke="var(--color-bad)"
          strokeOpacity={0.55}
          strokeDasharray="3 4"
        />
        <polygon points={polygon} fill="rgba(56,189,248,0.22)" stroke="#38bdf8" strokeWidth={2} />
        {axes.map((axis, i) => {
          const score = clamp01(axis.score);
          const [px, py] = point(i, Math.max(0.06, score));
          const [x, y] = point(i, 1.14);
          const weak = score < WEAK_THRESHOLD;
          const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
          const label = tagLabel(axis.tag);
          return (
            <g key={axis.tag} data-radar-axis={axis.tag}>
              <title>
                {`${label}: ${pct(score)} over ${axis.reviews} reviews${weak ? ' (weak)' : ''}`}
              </title>
              <circle
                cx={px}
                cy={py}
                r={4}
                fill={weak ? 'var(--color-bad)' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth={2}
              />
              <circle cx={px} cy={py} r={12} fill="transparent" />
              <text x={x} y={y - 6} textAnchor={anchor} dominantBaseline="middle" style={{ fontSize: 11 }}>
                <tspan className="fill-slate-300">
                  {label.length > 14 ? `${label.slice(0, 13)}…` : label}
                </tspan>
                <tspan x={x} dy={13} className="fill-slate-400" style={{ fontSize: 10 }}>
                  {pct(score)}
                  {weak ? ' · weak' : ''}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs muted">
        Further out is stronger. Anything inside the dashed ring ({pct(WEAK_THRESHOLD)}) is a
        weak area. Shows your {axes.length} most-reviewed areas.
      </p>
    </div>
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
