'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Coins, Repeat, Target, Timer, Zap } from 'lucide-react';
import type { Card, SessionCardResult, SessionMode } from '@/lib/types';
import { Button, Panel, Ring, Stat } from '@/components/ui/primitives';
import { useStore } from '@/lib/store';
import { GRADE_COLOR, GRADE_LABEL, formatDue, maturity } from '@/lib/scheduler';
import { moduleComplete } from '@/lib/session';
import { tagLabel } from '@/lib/weakness';
import { formatDuration, pct } from '@/lib/utils';
import { SESSION_COMPLETE_XP } from '@/lib/economy';

export function SessionSummaryView({
  results,
  byId,
  startedAt,
  mode,
  moduleId,
  moduleName,
  topicIds,
}: {
  results: SessionCardResult[];
  byId: Map<string, Card>;
  startedAt: number;
  mode: SessionMode;
  moduleId?: string;
  moduleName?: string;
  topicIds: string[];
}) {
  const reviews = useStore((s) => s.reviews);
  const completeModule = useStore((s) => s.completeModule);
  const chests = useStore((s) => s.pendingChests.length);

  const total = results.length;
  const correct = results.filter((r) => r.grade !== 'again').length;
  const accuracy = total > 0 ? correct / total : 0;
  const xp = results.reduce((n, r) => n + r.xp, 0) + SESSION_COMPLETE_XP;
  const duration = Date.now() - startedAt;

  // Module completion is checked here, once, rather than after every single grade.
  useEffect(() => {
    if (!moduleId) return;
    const moduleCards = [...byId.values()].filter((c) => c.moduleId === moduleId);
    if (moduleCards.length > 0 && moduleComplete(moduleCards, reviews)) {
      completeModule(moduleId, moduleName ?? 'Module');
    }
  }, [byId, completeModule, moduleId, moduleName, reviews]);

  const weakest = useMemo(() => {
    const scores = new Map<string, { hits: number; misses: number }>();
    for (const r of results) {
      const card = byId.get(r.cardId);
      if (!card) continue;
      for (const tag of card.tags) {
        const entry = scores.get(tag) ?? { hits: 0, misses: 0 };
        if (r.grade === 'again' || r.grade === 'hard') entry.misses += 1;
        else entry.hits += 1;
        scores.set(tag, entry);
      }
    }
    return [...scores.entries()]
      .filter(([, v]) => v.misses > 0)
      .sort((a, b) => b[1].misses - a[1].misses || a[1].hits - b[1].hits)
      .slice(0, 4);
  }, [results, byId]);

  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { again: 0, hard: 0, good: 0, easy: 0 };
    for (const r of results) counts[r.grade] += 1;
    return counts;
  }, [results]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
    >
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] muted">
          {mode === 'calibration' ? 'Calibration complete' : 'Session complete'}
        </div>
        <h1 className="mt-1 text-3xl font-semibold">
          {accuracy >= 0.9
            ? 'Sharp.'
            : accuracy >= 0.7
              ? 'Solid work.'
              : accuracy >= 0.5
                ? 'Progress is progress.'
                : 'Rough one — that is the point.'}
        </h1>
      </div>

      <Panel className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <Ring value={accuracy} size={132} stroke={10} color="var(--color-good)">
          <div className="text-center">
            <div className="text-2xl font-bold">{pct(accuracy)}</div>
            <div className="text-[0.65rem] uppercase tracking-wider muted">accuracy</div>
          </div>
        </Ring>
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Stat label="XP earned" value={`+${xp}`} accent="var(--color-accent)" />
          <Stat label="Cards" value={total} hint={`${correct} correct`} />
          <Stat label="Time" value={formatDuration(duration)} hint={`${Math.round(duration / Math.max(1, total) / 1000)}s per card`} />
          <Stat label="Chests waiting" value={chests} accent="var(--color-coin)" />
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-amber-300" /> Grade spread
          </h2>
          <div className="space-y-2">
            {(['again', 'hard', 'good', 'easy'] as const).map((g) => (
              <div key={g} className="flex items-center gap-3 text-xs">
                <span className="w-12" style={{ color: GRADE_COLOR[g] }}>
                  {GRADE_LABEL[g]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${total ? (gradeCounts[g] / total) * 100 : 0}%`,
                      background: GRADE_COLOR[g],
                    }}
                  />
                </div>
                <span className="w-6 text-right font-mono muted">{gradeCounts[g]}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Repeat className="h-4 w-4 text-sky-300" /> Shakiest ideas here
          </h2>
          {weakest.length === 0 ? (
            <p className="text-sm muted">Nothing stumbled on. Every card came back clean.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {weakest.map(([tag, v]) => (
                <li key={tag} className="flex items-center justify-between gap-2">
                  <span className="truncate">{tagLabel(tag)}</span>
                  <span className="shrink-0 font-mono text-xs muted">
                    {v.misses} miss{v.misses === 1 ? '' : 'es'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/study?mode=weak"
            className="mt-3 inline-flex items-center gap-1 text-xs text-sky-300 hover:underline"
          >
            Drill weak spots <ArrowRight className="h-3 w-3" />
          </Link>
        </Panel>
      </div>

      <Panel>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Timer className="h-4 w-4 text-violet-300" /> When these come back
        </h2>
        <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2 text-sm">
          {results.map((r, i) => {
            const card = byId.get(r.cardId);
            const state = reviews[r.cardId];
            return (
              <li key={`${r.cardId}-${i}`} className="flex items-center gap-3">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: GRADE_COLOR[r.grade] }}
                />
                <span className="min-w-0 flex-1 truncate">{card?.prompt ?? r.cardId}</span>
                <span className="shrink-0 text-[0.65rem] uppercase muted">
                  {maturity(state)}
                </span>
                <span className="w-20 shrink-0 text-right font-mono text-xs muted">
                  {state ? formatDue(state.due) : '—'}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to dashboard
          </Button>
        </Link>
        {chests > 0 ? (
          <Link href="/shop#chests" className="flex-1">
            <Button variant="coin" className="w-full">
              <Coins className="h-4 w-4" /> Open {chests} chest{chests === 1 ? '' : 's'}
            </Button>
          </Link>
        ) : null}
        <Link
          href={`/study?mode=${mode === 'calibration' ? 'review' : mode}${topicIds.length === 1 ? `&topic=${topicIds[0]}` : ''}`}
          className="flex-1"
        >
          <Button className="w-full">
            <Zap className="h-4 w-4" /> Another round
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
