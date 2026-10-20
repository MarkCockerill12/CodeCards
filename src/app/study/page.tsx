'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { SessionMode } from '@/lib/types';
import { useLibrary } from '@/lib/useLibrary';
import { useStore } from '@/lib/store';
import { buildQueue, CHECKPOINT_SIZE } from '@/lib/session';
import { TIER_NAME, TIERS, tierProgress, type Tier } from '@/lib/tiers';
import { SessionRunner } from '@/components/study/SessionRunner';
import { Button, Spinner } from '@/components/ui/primitives';

const MODES: SessionMode[] = ['review', 'topic', 'tier', 'weak', 'checkpoint'];

function StudyInner() {
  const params = useSearchParams();
  const requested = (params.get('mode') ?? 'review') as SessionMode;
  const topicParam = params.get('topic') ?? undefined;
  const tierParam = Number(params.get('tier'));
  const tier = TIERS.includes(tierParam as Tier) ? (tierParam as Tier) : undefined;
  // Tier sessions need a topic and a tier; anything malformed falls back to a review.
  const mode: SessionMode =
    !MODES.includes(requested) || ((requested === 'tier' || requested === 'checkpoint') && (!topicParam || !tier))
      ? 'review'
      : requested;

  const selected = useStore((s) => s.selectedTopics);
  const settings = useStore((s) => s.settings);
  const reviews = useStore((s) => s.reviews);
  const tagStats = useStore((s) => s.tagStats);
  const testedOut = useStore((s) => s.testedOutTiers);
  const hydrated = useStore((s) => s.hydrated);

  const topicIds = topicParam ? [topicParam] : selected;
  const { topics, cards, byId, graph, loading, error } = useLibrary(topicIds);

  const topicNames = useMemo(() => new Map(topics.map((t) => [t.id, t.name])), [topics]);

  const locked = useMemo(() => {
    if (!hydrated || (mode !== 'tier' && mode !== 'checkpoint') || cards.length === 0) return false;
    const tiers = tierProgress(cards, reviews, testedOut).get(topicParam ?? '');
    return !tiers?.find((t) => t.tier === tier)?.unlocked;
    // Lock state is judged once on entry, like the queue itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cards, mode, tier, topicParam]);

  const queue = useMemo(() => {
    if (!hydrated || cards.length === 0 || locked) return [];
    return buildQueue({
      cards,
      reviews,
      mode,
      limit: mode === 'checkpoint' ? CHECKPOINT_SIZE : settings.cardsPerSession,
      newLimit: settings.newPerSession,
      testedOut,
      tier,
      tagStats,
    });
    // Queue is intentionally built once per mount — re-shuffling mid-session would be chaos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cards, mode, tier, locked, settings.cardsPerSession, settings.newPerSession]);

  if (error) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <p className="mt-2 text-xs muted">Run `npm run content` to build the card library.</p>
      </div>
    );
  }

  if (!hydrated || loading) return <Spinner label="Shuffling the deck…" />;

  if (topicIds.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-lg">You have not picked any topics yet.</p>
        <Link href="/onboarding">
          <Button>Choose topics</Button>
        </Link>
      </div>
    );
  }

  const topicName = topics[0]?.name ?? 'Topic';
  const tierName = tier ? TIER_NAME[tier] : '';

  if (locked) {
    return (
      <div className="panel flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-lg">
          {topicName} · {tierName} is still locked.
        </p>
        <p className="text-sm muted">Clear or test out of the tier before it to open this one.</p>
        <Link href={`/path?topic=${topicParam}`}>
          <Button>Back to the path</Button>
        </Link>
      </div>
    );
  }

  const titles: Record<SessionMode, string> = {
    review: 'Review session',
    topic: topicName,
    tier: `${topicName} · ${tierName}`,
    weak: 'Weak spots',
    checkpoint: `Tier test · ${topicName} · ${tierName}`,
  };

  return (
    <SessionRunner
      queue={queue}
      cards={cards}
      byId={byId}
      graph={graph}
      mode={mode}
      topicIds={topicIds}
      topicNames={topicNames}
      title={titles[mode]}
      tier={tier}
    />
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<Spinner label="Loading session…" />}>
      <StudyInner />
    </Suspense>
  );
}
