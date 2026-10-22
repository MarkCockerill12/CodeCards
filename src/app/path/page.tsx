'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Flag, Lock, Play, Star } from 'lucide-react';
import { Button, Panel, Ring, Spinner } from '@/components/ui/primitives';
import { useLibrary } from '@/lib/useLibrary';
import { useStore } from '@/lib/store';
import { CHECKPOINT_PASS, CHECKPOINT_SIZE, dueCount, newCount } from '@/lib/session';
import {
  TIER_BLURB,
  TIER_CLEAR_RATE,
  TIER_COLOR,
  TIER_NAME,
  currentTier,
  tierProgress,
  type TierProgress,
} from '@/lib/tiers';
import { allCards } from '@/lib/content';
import { cn, pct } from '@/lib/utils';
import type { Topic } from '@/lib/types';
import { Emoji } from '@/components/ui/Emoji';

function PathInner() {
  const params = useSearchParams();
  const { topics, loading } = useLibrary();
  const hydrated = useStore((s) => s.hydrated);
  const selected = useStore((s) => s.selectedTopics);
  const reviews = useStore((s) => s.reviews);
  const testedOut = useStore((s) => s.testedOutTiers);
  const [activeTopic, setActiveTopic] = useState<string | null>(params.get('topic'));

  const progress = useMemo(
    () => tierProgress(allCards(topics), reviews, testedOut),
    [topics, reviews, testedOut],
  );

  const current = useMemo(
    () => topics.find((t) => t.id === activeTopic) ?? topics[0],
    [topics, activeTopic],
  );

  if (!hydrated || loading) return <Spinner label="Drawing your path…" />;

  if (selected.length === 0) {
    return (
      <Panel className="text-center">
        <p>No topics selected.</p>
        <Link href="/library" className="mt-3 inline-block">
          <Button>Pick topics</Button>
        </Link>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Your path</h1>
        <p className="text-sm muted">
          Every topic climbs the same ladder: Basics → Fundamentals → Intermediate → Advanced →
          Expert. New cards only come from a topic&apos;s current tier. Clear a tier by seeing every
          card and keeping {pct(TIER_CLEAR_RATE)} of them recalled, or skip ahead by scoring{' '}
          {pct(CHECKPOINT_PASS)} on its tier test.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => {
          const tier = currentTier(progress.get(topic.id));
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                current?.id === topic.id
                  ? 'border-sky-400/50 bg-sky-500/15'
                  : 'border-white/8 bg-white/4 hover:bg-white/8',
              )}
            >
              <Emoji char={topic.icon} />
              {topic.name}
              {tier ? (
                <span className="text-[0.65rem] uppercase tracking-wide" style={{ color: TIER_COLOR[tier.tier] }}>
                  {TIER_NAME[tier.tier]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {current ? <TopicPath topic={current} tiers={progress.get(current.id) ?? []} /> : null}
    </div>
  );
}

function TopicPath({ topic, tiers }: { topic: Topic; tiers: TierProgress[] }) {
  const moduleNames = useMemo(() => new Map(topic.modules.map((m) => [m.id, m.name])), [topic]);

  return (
    <div className="relative flex flex-col gap-3">
      <div
        className="absolute inset-y-0 left-[38px] w-0.5 -translate-x-1/2 rounded bg-gradient-to-b from-white/15 via-white/8 to-transparent"
        aria-hidden
      />
      {tiers.map((tier, i) => (
        <TierNode
          key={tier.tier}
          topic={topic}
          tier={tier}
          previous={tiers[i - 1]}
          index={i}
          covers={[...new Set(tier.cards.map((c) => moduleNames.get(c.moduleId ?? '') ?? ''))].filter(Boolean)}
        />
      ))}
    </div>
  );
}

function TierNode({
  topic,
  tier,
  previous,
  index,
  covers,
}: {
  topic: Topic;
  tier: TierProgress;
  previous?: TierProgress;
  index: number;
  covers: string[];
}) {
  const reviews = useStore((s) => s.reviews);
  const total = tier.cards.length;
  const due = dueCount(tier.cards, reviews);
  const fresh = newCount(tier.cards, reviews);
  const recalledShare = total ? tier.recalled / total : 0;
  const name = TIER_NAME[tier.tier];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn('relative flex gap-4 rounded-2xl p-3', !tier.unlocked && 'opacity-55')}
    >
      <div className="relative z-10 shrink-0">
        <Ring value={recalledShare} size={76} stroke={7} color={tier.complete ? '#22c55e' : TIER_COLOR[tier.tier]}>
          {!tier.unlocked ? (
            <Lock className="h-5 w-5 muted" />
          ) : tier.complete ? (
            <Check className="h-6 w-6 text-emerald-400" />
          ) : (
            <span className="text-sm font-semibold">{Math.round(recalledShare * 100)}</span>
          )}
        </Ring>
      </div>

      <div className={cn('panel min-w-0 flex-1 p-4', tier.current && 'border-sky-400/40')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] uppercase tracking-widest muted">Tier {tier.tier}</span>
          <h3 className="text-base font-medium" style={{ color: TIER_COLOR[tier.tier] }}>
            {name}
          </h3>
          {tier.current ? (
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[0.65rem] text-sky-300">
              you are here
            </span>
          ) : null}
          {tier.cleared ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] text-emerald-300">
              cleared
            </span>
          ) : null}
          {tier.testedOut ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[0.65rem] text-amber-300">
              <Star className="h-3 w-3" /> tested out
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm muted">{TIER_BLURB[tier.tier]}</p>
        {covers.length > 0 ? (
          <p className="mt-1 text-xs muted">Covers: {covers.join(' · ')}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-3 text-xs muted">
          <span>{total} cards</span>
          <span>
            {tier.seen}/{total} seen
          </span>
          <span>{pct(recalledShare)} recalled</span>
          {due > 0 ? <span className="text-amber-300">{due} due</span> : null}
          {tier.unlocked && fresh > 0 ? <span>{fresh} new</span> : null}
        </div>

        {!tier.unlocked ? (
          <p className="mt-3 text-xs muted">
            Unlocks when {previous ? TIER_NAME[previous.tier] : 'the tier before'} is cleared or tested out.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/study?mode=tier&topic=${topic.id}&tier=${tier.tier}`}>
              <Button size="sm">
                <Play className="h-3.5 w-3.5" /> Study {name}
              </Button>
            </Link>
            {!tier.complete ? (
              <Link href={`/study?mode=checkpoint&topic=${topic.id}&tier=${tier.tier}`}>
                <Button size="sm" variant="outline" title={`${Math.min(CHECKPOINT_SIZE, total)} cards from this tier`}>
                  <Flag className="h-3.5 w-3.5" /> Test out
                </Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PathPage() {
  return (
    <Suspense fallback={<Spinner label="Drawing your path…" />}>
      <PathInner />
    </Suspense>
  );
}
