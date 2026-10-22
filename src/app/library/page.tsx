'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Lock, Play, Search } from 'lucide-react';
import { Badge, Button, Panel, Spinner } from '@/components/ui/primitives';
import { useIndex } from '@/lib/useLibrary';
import { allCards, loadTopic, CARD_TYPE_LABEL } from '@/lib/content';
import { useStore } from '@/lib/store';
import { maturity } from '@/lib/scheduler';
import { TIER_BLURB, TIER_COLOR, TIER_NAME, tierProgress } from '@/lib/tiers';
import type { Topic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Emoji } from '@/components/ui/Emoji';

export default function LibraryPage() {
  const { index, error } = useIndex();
  const selected = useStore((s) => s.selectedTopics);
  const toggleTopic = useStore((s) => s.toggleTopic);
  const setSelectedTopics = useStore((s) => s.setSelectedTopics);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    if (!q) return index.topics;
    return index.topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [index, query]);

  if (error) {
    return (
      <Panel className="text-center text-red-300">
        {error} — run `npm run content`.
      </Panel>
    );
  }
  if (!index) return <Spinner label="Loading library…" />;

  const categories = index.categories.filter((c) =>
    filtered.some((t) => c.topics.includes(t.id)),
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Library</h1>
          <p className="text-sm muted">
            {index.totalCards} cards · {index.topics.length} topics · {selected.length} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTopics(index.topics.map((t) => t.id))}>
            Select all
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedTopics([])}>
            Clear
          </Button>
        </div>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics…"
          className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-400/60"
        />
      </div>

      {categories.map((category) => (
        <section key={category.name}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest muted">
            {category.name}
          </h2>
          <div className="flex flex-col gap-2">
            {filtered
              .filter((t) => category.topics.includes(t.id))
              .map((topic) => (
                <div key={topic.id} className="panel overflow-hidden p-0">
                  <div className="flex items-center gap-3 p-4">
                    <Emoji char={topic.icon} className="text-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{topic.name}</h3>
                        <Badge color={topic.color}>{topic.cardCount} cards</Badge>
                        <Badge>{topic.moduleCount} modules</Badge>
                      </div>
                      <p className="mt-0.5 text-sm muted">{topic.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                          selected.includes(topic.id)
                            ? 'border-sky-400/50 bg-sky-500/15 text-sky-200'
                            : 'border-white/10 hover:bg-white/8',
                        )}
                      >
                        {selected.includes(topic.id) ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        ) : (
                          'Add'
                        )}
                      </button>
                      <button
                        onClick={() => setOpen(open === topic.id ? null : topic.id)}
                        className="rounded-lg p-2 hover:bg-white/8"
                        aria-label="Browse cards"
                      >
                        <ChevronDown
                          className={cn('h-4 w-4 transition-transform', open === topic.id && 'rotate-180')}
                        />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {open === topic.id ? <TopicDetail id={topic.id} /> : null}
                  </AnimatePresence>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TopicDetail({ id }: { id: string }) {
  const [topic, setTopic] = useState<Topic>();
  const reviews = useStore((s) => s.reviews);
  const testedOut = useStore((s) => s.testedOutTiers);

  const tiers = useMemo(
    () => (topic ? (tierProgress(allCards([topic]), reviews, testedOut).get(topic.id) ?? []) : []),
    [topic, reviews, testedOut],
  );
  const moduleNames = useMemo(() => new Map(topic?.modules.map((m) => [m.id, m.name])), [topic]);

  useEffect(() => {
    let live = true;
    loadTopic(id).then((t) => live && setTopic(t));
    return () => {
      live = false;
    };
  }, [id]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-white/8 bg-black/15"
    >
      {!topic ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {tiers.map((tier) => (
            <div key={tier.tier}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: TIER_COLOR[tier.tier] }}>
                    Tier {tier.tier} · {TIER_NAME[tier.tier]}{' '}
                    <span className="font-normal muted">({tier.cards.length})</span>
                  </h4>
                  <p className="text-xs muted">{TIER_BLURB[tier.tier]}</p>
                </div>
                {tier.unlocked ? (
                  <Link href={`/study?mode=tier&topic=${topic.id}&tier=${tier.tier}`}>
                    <Button size="sm" variant="ghost">
                      <Play className="h-3 w-3" /> Study {TIER_NAME[tier.tier]}
                    </Button>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs muted">
                    <Lock className="h-3 w-3" /> locked
                  </span>
                )}
              </div>
              <ul className="divide-y divide-white/5 rounded-xl border border-white/8">
                {tier.cards.map((card) => (
                  <li key={card.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-24 shrink-0 text-[0.65rem] uppercase tracking-wide muted">
                      {CARD_TYPE_LABEL[card.type]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{card.prompt}</span>
                    <span className="hidden max-w-40 shrink-0 truncate text-[0.65rem] muted sm:block">
                      {moduleNames.get(card.moduleId ?? '')}
                    </span>
                    <span className="w-16 shrink-0 text-right text-[0.65rem] uppercase muted">
                      {maturity(reviews[card.id])}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
