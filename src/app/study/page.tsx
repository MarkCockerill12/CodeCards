'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { SessionMode } from '@/lib/types';
import { useLibrary } from '@/lib/useLibrary';
import { useStore } from '@/lib/store';
import { buildQueue, CHECKPOINT_SIZE } from '@/lib/session';
import { SessionRunner } from '@/components/study/SessionRunner';
import { Button, Spinner } from '@/components/ui/primitives';

const MODES: SessionMode[] = ['review', 'topic', 'module', 'weak', 'calibration', 'checkpoint'];

function StudyInner() {
  const params = useSearchParams();
  const mode = (params.get('mode') ?? 'review') as SessionMode;
  const topicParam = params.get('topic') ?? undefined;
  const moduleParam = params.get('module') ?? undefined;

  const selected = useStore((s) => s.selectedTopics);
  const settings = useStore((s) => s.settings);
  const reviews = useStore((s) => s.reviews);
  const tagStats = useStore((s) => s.tagStats);
  const hydrated = useStore((s) => s.hydrated);

  const topicIds = topicParam ? [topicParam] : selected;
  const { topics, cards, byId, graph, loading, error } = useLibrary(topicIds);

  const scope = useMemo(() => {
    if (!moduleParam) return { cards, title: topicParam ? topics[0]?.name : 'Review session' };
    for (const topic of topics) {
      const mod = topic.modules.find((m) => m.id === moduleParam);
      if (mod) return { cards: mod.cards, title: `${topic.name} · ${mod.name}`, moduleName: mod.name };
    }
    return { cards: [], title: 'Module' };
  }, [cards, moduleParam, topicParam, topics]);

  const queue = useMemo(() => {
    if (!hydrated || scope.cards.length === 0) return [];
    const limit =
      mode === 'calibration' ? 15 : mode === 'checkpoint' ? CHECKPOINT_SIZE : settings.cardsPerSession;
    return buildQueue({
      cards: scope.cards,
      reviews,
      mode: MODES.includes(mode) ? mode : 'review',
      limit,
      newLimit: settings.newPerSession,
      tagStats,
    });
    // Queue is intentionally built once per mount — re-shuffling mid-session would be chaos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, scope.cards, mode, settings.cardsPerSession, settings.newPerSession]);

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

  const titles: Record<SessionMode, string> = {
    review: 'Review session',
    topic: scope.title ?? 'Topic session',
    module: scope.title ?? 'Module',
    weak: 'Weak spots',
    calibration: 'Calibration quiz',
    checkpoint: `Checkpoint · ${scope.title ?? ''}`,
  };

  return (
    <SessionRunner
      queue={queue}
      byId={byId}
      graph={graph}
      mode={MODES.includes(mode) ? mode : 'review'}
      topicIds={topicIds}
      title={titles[mode] ?? 'Study'}
      moduleId={moduleParam}
      moduleName={scope.moduleName}
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
