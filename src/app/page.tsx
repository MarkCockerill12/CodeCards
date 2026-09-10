'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Compass, Flame, Gift, Layers, Play, Sparkles, Target } from 'lucide-react';
import { Button, Panel, Ring, Spinner, Stat } from '@/components/ui/primitives';
import { ChestOpener } from '@/components/game/ChestOpener';
import { useStore } from '@/lib/store';
import { useLibrary } from '@/lib/useLibrary';
import { dueCount, moduleMastery, newCount } from '@/lib/session';
import { weakTags, tagLabel } from '@/lib/weakness';
import { COSMETIC_BY_ID } from '@/data/cosmetics';
import { levelFromXp, titleForLevel } from '@/data/levels';
import { formatNumber } from '@/lib/economy';
import { pct } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.onboarded);
  const calibrated = useStore((s) => s.calibrated);
  const reviews = useStore((s) => s.reviews);
  const tagStats = useStore((s) => s.tagStats);
  const xp = useStore((s) => s.xp);
  const name = useStore((s) => s.displayName);
  const mascotId = useStore((s) => s.equipped.mascot);
  const selected = useStore((s) => s.selectedTopics);

  const { topics, cards, loading } = useLibrary();

  useEffect(() => {
    if (hydrated && !onboarded) router.replace('/onboarding');
  }, [hydrated, onboarded, router]);

  const stats = useMemo(() => {
    const due = dueCount(cards, reviews);
    const fresh = newCount(cards, reviews);
    const seen = cards.length - fresh;
    const mastery = moduleMastery(cards, reviews);
    return { due, fresh, seen, mastery };
  }, [cards, reviews]);

  const weak = useMemo(() => weakTags(tagStats, 6), [tagStats]);
  const level = levelFromXp(xp);
  const mascot = COSMETIC_BY_ID.get(mascotId)?.swatch ?? '🦆';

  if (!hydrated) return <Spinner label="Waking up…" />;
  if (!onboarded) return <Spinner label="Setting things up…" />;
  if (loading) return <Spinner label="Loading your decks…" />;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center gap-4">
        <span className="frame-ring grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl">
          {mascot}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">
            Welcome back, <span className="display-name">{name}</span>
          </h1>
          <p className="text-sm muted">
            Level {level.level} · {titleForLevel(level.level)} · {formatNumber(xp)} XP total
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {!calibrated ? (
            <Link href="/study?mode=calibration">
              <Button variant="outline">
                <Compass className="h-4 w-4" /> Calibrate
              </Button>
            </Link>
          ) : null}
          <Link href="/study?mode=review">
            <Button size="lg">
              <Play className="h-4 w-4" /> Study now
            </Button>
          </Link>
        </div>
      </section>

      {!calibrated ? (
        <Panel className="flex flex-wrap items-center gap-4 border-sky-400/25 bg-sky-500/5">
          <Compass className="h-6 w-6 text-sky-300" />
          <div className="min-w-0 flex-1">
            <div className="font-medium">Take the 15-card calibration quiz</div>
            <p className="text-sm muted">
              It samples every difficulty band across your topics so the scheduler starts from
              where you actually are — no crawling through fundamentals you already own.
            </p>
          </div>
          <Link href="/study?mode=calibration">
            <Button>Start</Button>
          </Link>
        </Panel>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Due now"
          value={stats.due}
          hint={stats.due > 0 ? 'These are decaying' : 'All caught up'}
          accent={stats.due > 0 ? 'var(--color-warn)' : 'var(--color-good)'}
        />
        <Stat label="Unseen cards" value={stats.fresh} hint={`${stats.seen} started`} />
        <Stat label="Selected topics" value={selected.length} hint={`${cards.length} cards in scope`} />
        <Stat label="Mastery" value={pct(stats.mastery)} accent="var(--color-accent)" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4 text-sky-300" /> Your decks
            </h2>
            <Link href="/library" className="text-xs text-sky-300 hover:underline">
              Manage topics
            </Link>
          </header>

          {topics.length === 0 ? (
            <p className="text-sm muted">
              No topics selected yet.{' '}
              <Link href="/library" className="underline">
                Pick some
              </Link>
              .
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => {
                const topicCards = topic.modules.flatMap((m) => m.cards);
                const due = dueCount(topicCards, reviews);
                const mastery = moduleMastery(topicCards, reviews);
                return (
                  <li key={topic.id}>
                    <Link
                      href={`/study?mode=topic&topic=${topic.id}`}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 transition-colors hover:bg-white/8"
                    >
                      <Ring value={mastery} size={44} stroke={5} color={topic.color}>
                        <span className="text-base">{topic.icon}</span>
                      </Ring>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{topic.name}</div>
                        <div className="text-xs muted">
                          {topicCards.length} cards · {pct(mastery)} mastered
                        </div>
                      </div>
                      {due > 0 ? (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
                          {due} due
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel id="chests">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Gift className="h-4 w-4 text-violet-300" /> Chests
            </h2>
            <ChestOpener />
          </Panel>

          <Panel>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Brain className="h-4 w-4 text-rose-300" /> Weak spots
            </h2>
            {weak.length === 0 ? (
              <p className="text-sm muted">
                Not enough data yet — weak spots appear after a few reviews per tag.
              </p>
            ) : (
              <ul className="space-y-2">
                {weak.map((tag) => (
                  <li key={tag.tag} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{tagLabel(tag.tag)}</span>
                      <span className="shrink-0 font-mono text-xs muted">{pct(tag.score)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-rose-400"
                        style={{ width: `${tag.score * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/study?mode=weak" className="mt-3 block">
              <Button variant="ghost" size="sm" className="w-full">
                <Target className="h-3.5 w-3.5" /> Drill weak spots
              </Button>
            </Link>
          </Panel>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/path"
          icon={<Flame className="h-4 w-4 text-orange-300" />}
          title="Follow the path"
          hint="Module-by-module progression with checkpoints"
        />
        <QuickLink
          href="/shop"
          icon={<Sparkles className="h-4 w-4 text-amber-300" />}
          title="Spend your coins"
          hint="Card skins, themes, cursors, mascots"
        />
        <QuickLink
          href="/stats"
          icon={<Target className="h-4 w-4 text-emerald-300" />}
          title="See the data"
          hint="Mastery, retention, weakness radar"
        />
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link href={href} className="panel flex items-center gap-3 p-4 transition-colors hover:bg-white/8">
      {icon}
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="truncate text-xs muted">{hint}</div>
      </div>
    </Link>
  );
}
