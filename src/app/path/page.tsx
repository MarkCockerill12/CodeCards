'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Flag, Lock, Play, Star } from 'lucide-react';
import { Button, Panel, Ring, Spinner } from '@/components/ui/primitives';
import { useLibrary } from '@/lib/useLibrary';
import { useStore } from '@/lib/store';
import { dueCount, moduleMastery, newCount } from '@/lib/session';
import { cn, pct } from '@/lib/utils';
import type { Module, Topic } from '@/lib/types';

const UNLOCK_THRESHOLD = 0.4;

export default function PathPage() {
  const { topics, loading } = useLibrary();
  const hydrated = useStore((s) => s.hydrated);
  const selected = useStore((s) => s.selectedTopics);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const current = useMemo(
    () => topics.find((t) => t.id === (activeTopic ?? topics[0]?.id)),
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
          Modules unlock as the one before reaches {pct(UNLOCK_THRESHOLD)} mastery. Clear every
          card in a module to bank 250 XP and an epic chest.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => (
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
            <span>{topic.icon}</span>
            {topic.name}
          </button>
        ))}
      </div>

      {current ? <TopicPath topic={current} /> : null}
    </div>
  );
}

function TopicPath({ topic }: { topic: Topic }) {
  const reviews = useStore((s) => s.reviews);
  const completedModules = useStore((s) => s.completedModules);
  const passedCheckpoints = useStore((s) => s.passedCheckpoints);

  let previousMastery = 1;

  return (
    <div className="relative flex flex-col gap-3">
      <div
        className="absolute inset-y-0 left-[38px] w-0.5 -translate-x-1/2 rounded bg-gradient-to-b from-white/15 via-white/8 to-transparent"
        aria-hidden
      />
      {topic.modules.map((mod, i) => {
        const mastery = moduleMastery(mod.cards, reviews);
        const locked = previousMastery < UNLOCK_THRESHOLD;
        const unlockedBy = previousMastery;
        previousMastery = mastery;
        return (
          <ModuleNode
            key={mod.id}
            module={mod}
            topic={topic}
            index={i}
            mastery={mastery}
            locked={locked}
            unlockedBy={unlockedBy}
            complete={completedModules.includes(mod.id)}
            checkpointPassed={passedCheckpoints.includes(mod.id)}
          />
        );
      })}
    </div>
  );
}

function ModuleNode({
  module: mod,
  topic,
  index,
  mastery,
  locked,
  unlockedBy,
  complete,
  checkpointPassed,
}: {
  module: Module;
  topic: Topic;
  index: number;
  mastery: number;
  locked: boolean;
  unlockedBy: number;
  complete: boolean;
  checkpointPassed: boolean;
}) {
  const reviews = useStore((s) => s.reviews);
  const due = dueCount(mod.cards, reviews);
  const fresh = newCount(mod.cards, reviews);
  const canCheckpoint = mastery >= 0.6;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn('relative flex gap-4 rounded-2xl p-3', locked && 'opacity-55')}
    >
      <div className="relative z-10 shrink-0">
        <Ring value={mastery} size={76} stroke={7} color={complete ? '#22c55e' : topic.color}>
          {locked ? (
            <Lock className="h-5 w-5 muted" />
          ) : complete ? (
            <Check className="h-6 w-6 text-emerald-400" />
          ) : (
            <span className="text-sm font-semibold">{Math.round(mastery * 100)}</span>
          )}
        </Ring>
      </div>

      <div className="panel min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-medium">{mod.name}</h3>
          {complete ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] text-emerald-300">
              complete
            </span>
          ) : null}
          {checkpointPassed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[0.65rem] text-amber-300">
              <Star className="h-3 w-3" /> checkpoint
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm muted">{mod.description}</p>

        <div className="mt-2 flex flex-wrap gap-3 text-xs muted">
          <span>{mod.cards.length} cards</span>
          {due > 0 ? <span className="text-amber-300">{due} due</span> : null}
          {fresh > 0 ? <span>{fresh} new</span> : null}
        </div>

        {locked ? (
          <p className="mt-3 text-xs muted">
            Reach {pct(UNLOCK_THRESHOLD)} on the previous module to unlock (currently{' '}
            {pct(unlockedBy)}).
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/study?mode=module&topic=${topic.id}&module=${mod.id}`}>
              <Button size="sm">
                <Play className="h-3.5 w-3.5" /> Study
              </Button>
            </Link>
            {canCheckpoint ? (
              <Link href={`/study?mode=checkpoint&topic=${topic.id}&module=${mod.id}`}>
                <Button size="sm" variant="outline">
                  <Flag className="h-3.5 w-3.5" /> Checkpoint
                </Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}
