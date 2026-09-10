'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Activity, Brain, CalendarDays, Flag, Layers, Trophy } from 'lucide-react';
import { Button, Panel, Ring, Spinner, Stat } from '@/components/ui/primitives';
import { ActivityHeatmap, ReviewForecast, WeaknessRadar } from '@/components/stats/charts';
import { useStore } from '@/lib/store';
import { useLibrary } from '@/lib/useLibrary';
import { maturity, retrievability } from '@/lib/scheduler';
import { moduleMastery } from '@/lib/session';
import { strongTags, tagLabel, weakTags } from '@/lib/weakness';
import { levelFromXp, titleForLevel } from '@/data/levels';
import { formatNumber } from '@/lib/economy';
import { COSMETICS } from '@/data/cosmetics';
import { formatDuration, pct } from '@/lib/utils';

export default function StatsPage() {
  const hydrated = useStore((s) => s.hydrated);
  const xp = useStore((s) => s.xp);
  const coins = useStore((s) => s.coins);
  const reviews = useStore((s) => s.reviews);
  const tagStats = useStore((s) => s.tagStats);
  const dayStats = useStore((s) => s.dayStats);
  const sessions = useStore((s) => s.sessions);
  const owned = useStore((s) => s.owned);
  const flagged = useStore((s) => s.flagged);
  const unflagCard = useStore((s) => s.unflagCard);
  const name = useStore((s) => s.displayName);

  const { topics, loading } = useLibrary();

  const totals = useMemo(() => {
    const states = Object.values(reviews);
    const counts = { new: 0, learning: 0, young: 0, mature: 0 };
    let retention = 0;
    for (const state of states) {
      counts[maturity(state)] += 1;
      retention += retrievability(state);
    }
    const totalReviews = Object.values(dayStats).reduce((n, d) => n + d.reviews, 0);
    const totalCorrect = Object.values(dayStats).reduce((n, d) => n + d.correct, 0);
    const totalMs = Object.values(dayStats).reduce((n, d) => n + d.ms, 0);
    return {
      counts,
      retention: states.length ? retention / states.length : 0,
      totalReviews,
      accuracy: totalReviews ? totalCorrect / totalReviews : 0,
      totalMs,
      tracked: states.length,
    };
  }, [reviews, dayStats]);

  const level = levelFromXp(xp);
  const weak = weakTags(tagStats, 8);
  const strong = strongTags(tagStats, 5);

  if (!hydrated) return <Spinner />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">
          <span className="display-name">{name}</span>
          <span className="ml-2 text-base font-normal muted">
            Lv {level.level} · {titleForLevel(level.level)}
          </span>
        </h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total XP" value={formatNumber(xp)} accent="var(--color-accent)" />
        <Stat label="Coins" value={formatNumber(coins)} accent="var(--color-coin)" />
        <Stat
          label="Reviews"
          value={formatNumber(totals.totalReviews)}
          hint={`${pct(totals.accuracy)} correct`}
        />
        <Stat label="Time studied" value={formatDuration(totals.totalMs)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-emerald-300" /> Predicted retention
          </h2>
          <div className="flex justify-center">
            <Ring value={totals.retention} size={150} stroke={11} color="var(--color-good)">
              <div className="text-center">
                <div className="text-2xl font-bold">{pct(totals.retention)}</div>
                <div className="text-[0.6rem] uppercase tracking-wider muted">right now</div>
              </div>
            </Ring>
          </div>
          <p className="mt-3 text-xs muted">
            The FSRS forgetting curve applied across every card you have seen — the chance you
            would recall an average tracked card if asked this second.
          </p>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-sky-300" /> Next fortnight
          </h2>
          <ReviewForecast reviews={reviews} />
          <p className="mt-3 text-xs muted">
            Cards falling due per day. Spikes flatten themselves out as you review — FSRS
            reschedules on every answer.
          </p>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-rose-300" /> Weakness radar
          </h2>
          <WeaknessRadar stats={tagStats} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-3 text-sm font-semibold">Card maturity</h2>
            <div className="space-y-2">
              {(['new', 'learning', 'young', 'mature'] as const).map((key) => {
                const value = totals.counts[key];
                const total = Math.max(1, totals.tracked);
                const colors = {
                  new: '#64748b',
                  learning: '#f59e0b',
                  young: '#38bdf8',
                  mature: '#22c55e',
                };
                return (
                  <div key={key} className="flex items-center gap-3 text-xs">
                    <span className="w-16 capitalize" style={{ color: colors[key] }}>
                      {key}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(value / total) * 100}%`, background: colors[key] }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono muted">{value}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-3 text-sm font-semibold">Strongest / weakest</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-[0.65rem] uppercase tracking-wider text-emerald-300">
                  Strong
                </div>
                <ul className="space-y-1 text-xs">
                  {strong.length === 0 ? <li className="muted">Not enough data</li> : null}
                  {strong.map((t) => (
                    <li key={t.tag} className="flex justify-between gap-2">
                      <span className="truncate">{tagLabel(t.tag)}</span>
                      <span className="font-mono muted">{pct(t.score)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 text-[0.65rem] uppercase tracking-wider text-rose-300">Weak</div>
                <ul className="space-y-1 text-xs">
                  {weak.length === 0 ? <li className="muted">Nothing flagged yet</li> : null}
                  {weak.map((t) => (
                    <li key={t.tag} className="flex justify-between gap-2">
                      <span className="truncate">{tagLabel(t.tag)}</span>
                      <span className="font-mono muted">{pct(t.score)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-sky-300" /> Activity
        </h2>
        <ActivityHeatmap days={dayStats} />
        <p className="mt-3 text-xs muted">
          {sessions.length} sessions recorded. No streaks here — study when it suits you.
        </p>
      </Panel>

      <Panel>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-violet-300" /> Mastery by topic
        </h2>
        {loading ? (
          <Spinner />
        ) : topics.length === 0 ? (
          <p className="text-sm muted">No topics selected.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {topics.map((topic) => {
              const cards = topic.modules.flatMap((m) => m.cards);
              return (
                <div key={topic.id} className="flex flex-col items-center gap-2 text-center">
                  <Ring value={moduleMastery(cards, reviews)} size={72} stroke={7} color={topic.color}>
                    <span className="text-xl">{topic.icon}</span>
                  </Ring>
                  <div className="text-xs">
                    <div className="truncate font-medium">{topic.name}</div>
                    <div className="muted">{pct(moduleMastery(cards, reviews))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-amber-300" /> Collection
          </h2>
          <div className="flex items-center gap-4">
            <Ring value={owned.length / COSMETICS.length} size={72} stroke={7} color="var(--color-coin)">
              <span className="text-xs font-semibold">
                {Math.round((owned.length / COSMETICS.length) * 100)}%
              </span>
            </Ring>
            <div className="text-sm">
              <div>
                {owned.length} of {COSMETICS.length} cosmetics unlocked
              </div>
              <Link href="/shop" className="text-xs text-sky-300 hover:underline">
                Go shopping
              </Link>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Flag className="h-4 w-4 text-rose-300" /> Flagged cards
          </h2>
          {flagged.length === 0 ? (
            <p className="text-sm muted">
              Nothing flagged. Press <span className="kbd">F</span> during a session to mark a card
              as wrong or unclear.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {flagged.map((f) => (
                <li key={f.cardId} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{f.cardId}</span>
                  <Button size="sm" variant="ghost" onClick={() => unflagCard(f.cardId)}>
                    Clear
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}
