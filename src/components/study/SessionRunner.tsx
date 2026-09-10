'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BookMarked, Flag, Info, X, Zap } from 'lucide-react';
import type { Card, Grade, SessionCardResult, SessionMode } from '@/lib/types';
import { Flashcard } from '@/components/cards/Flashcard';
import { Button, Kbd, Progress } from '@/components/ui/primitives';
import { useStore } from '@/lib/store';
import { GRADES, GRADE_COLOR, GRADE_HINT, GRADE_LABEL, previewIntervals } from '@/lib/scheduler';
import { emptyReview } from '@/lib/scheduler';
import { remedialFor, type PrereqGraph } from '@/lib/prereq';
import { play } from '@/lib/sound';
import { formatDuration } from '@/lib/utils';
import { SessionSummaryView } from './SessionSummaryView';

interface Props {
  queue: Card[];
  byId: Map<string, Card>;
  graph: PrereqGraph;
  mode: SessionMode;
  topicIds: string[];
  title: string;
  moduleId?: string;
  moduleName?: string;
}

export function SessionRunner({
  queue,
  byId,
  graph,
  mode,
  topicIds,
  title,
  moduleId,
  moduleName,
}: Props) {
  const settings = useStore((s) => s.settings);
  const reviews = useStore((s) => s.reviews);
  const reviewCard = useStore((s) => s.reviewCard);
  const seedCalibration = useStore((s) => s.seedCalibration);
  const finishCalibration = useStore((s) => s.finishCalibration);
  const finishSession = useStore((s) => s.finishSession);
  const passCheckpoint = useStore((s) => s.passCheckpoint);
  const flagCard = useStore((s) => s.flagCard);
  const flipAnimation = useStore((s) => s.equipped.flipAnimation);

  const [cards, setCards] = useState<Card[]>(queue);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(settings.autoRevealExplanation);
  const [showResources, setShowResources] = useState(false);
  const [results, setResults] = useState<SessionCardResult[]>([]);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const startedAt = useRef(Date.now());
  const cardShownAt = useRef(Date.now());
  const injected = useRef(new Set<string>());

  const card = cards[position];

  useEffect(() => {
    setCards(queue);
    setPosition(0);
    setResults([]);
    setDone(false);
    startedAt.current = Date.now();
    cardShownAt.current = Date.now();
  }, [queue]);

  useEffect(() => {
    cardShownAt.current = Date.now();
    setFlipped(false);
    setShowResources(false);
    setShowExplanation(settings.autoRevealExplanation);
  }, [position, settings.autoRevealExplanation]);

  useEffect(() => {
    if (done || !settings.showTimer) return;
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 1000);
    return () => window.clearInterval(id);
  }, [done, settings.showTimer]);

  const intervals = useMemo(() => {
    if (!card || !settings.showIntervalPreview) return null;
    return previewIntervals(reviews[card.id] ?? emptyReview(card.id));
  }, [card, reviews, settings.showIntervalPreview]);

  const finish = useCallback(
    (finalResults: SessionCardResult[]) => {
      const summary = {
        startedAt: startedAt.current,
        endedAt: Date.now(),
        results: finalResults,
        xp: finalResults.reduce((n, r) => n + r.xp, 0),
        coins: 0,
        topicIds,
        mode,
      };
      finishSession(summary);
      if (mode === 'calibration') finishCalibration();
      if (mode === 'checkpoint' && moduleId) {
        const correct = finalResults.filter((r) => r.grade !== 'again').length;
        if (finalResults.length > 0 && correct / finalResults.length >= 0.85) {
          passCheckpoint(moduleId);
        }
      }
      play('complete');
      setDone(true);
    },
    [finishCalibration, finishSession, mode, moduleId, passCheckpoint, topicIds],
  );

  const answer = useCallback(
    (g: Grade) => {
      if (!card || done) return;
      const ms = Date.now() - cardShownAt.current;
      play(`grade-${g}` as const);

      let gained = 0;
      if (mode === 'calibration' && g === 'easy') {
        // An instant "easy" during calibration means: do not drag me through this.
        seedCalibration(card.id, 5);
        gained = 6;
      } else {
        gained = reviewCard(card, g, ms, { allowRewards: mode !== 'calibration' }).xp;
      }

      const result: SessionCardResult = { cardId: card.id, grade: g, ms, xp: gained };
      const nextResults = [...results, result];
      setResults(nextResults);
      setCombo((n) => (g === 'again' ? 0 : n + 1));

      // Remedial injection: a failed card pulls its unmastered foundations in behind it.
      let nextCards = cards;
      if (g === 'again' && mode !== 'calibration') {
        const remedial = remedialFor(card.id, graph, reviews, 2)
          .filter((id) => !injected.current.has(id) && byId.has(id))
          .filter((id) => !cards.slice(position + 1).some((c) => c.id === id));
        if (remedial.length > 0) {
          remedial.forEach((id) => injected.current.add(id));
          nextCards = [
            ...cards.slice(0, position + 1),
            ...remedial.map((id) => byId.get(id)!),
            ...cards.slice(position + 1),
          ];
          setCards(nextCards);
        }
      }

      if (position + 1 >= nextCards.length) finish(nextResults);
      else setPosition((p) => p + 1);
    },
    [
      byId,
      card,
      cards,
      done,
      finish,
      graph,
      mode,
      position,
      results,
      reviewCard,
      reviews,
      seedCalibration,
    ],
  );

  const flip = useCallback(() => {
    if (!flipped) play('flip');
    setFlipped((f) => !f);
  }, [flipped]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flip();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        if (!flipped) return;
        e.preventDefault();
        answer(GRADES[Number(e.key) - 1]);
      } else if (e.key.toLowerCase() === 'r') {
        setShowResources((v) => !v);
      } else if (e.key.toLowerCase() === 'e') {
        setShowExplanation((v) => !v);
      } else if (e.key.toLowerCase() === 'f' && card) {
        flagCard(card.id, 'Flagged during study');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, card, done, flagCard, flip, flipped]);

  if (done) {
    return (
      <SessionSummaryView
        results={results}
        byId={byId}
        startedAt={startedAt.current}
        mode={mode}
        moduleId={moduleId}
        moduleName={moduleName}
        topicIds={topicIds}
      />
    );
  }

  if (!card) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg">Nothing to study here right now.</p>
        <Link href="/" className="mt-4 inline-block underline muted">
          Back to the dashboard
        </Link>
      </div>
    );
  }

  const progress = position / Math.max(1, cards.length);
  const sessionXp = results.reduce((n, r) => n + r.xp, 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="End session" className="rounded-lg p-2 hover:bg-white/10">
          <X className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium">{title}</span>
            <span className="shrink-0 font-mono text-xs muted">
              {position + 1}/{cards.length}
            </span>
          </div>
          <Progress value={progress} height={6} className="mt-1.5" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs muted">
        <span className="inline-flex items-center gap-1 text-sky-300">
          <Zap className="h-3.5 w-3.5" /> {sessionXp} XP
        </span>
        {combo >= 3 ? (
          <motion.span
            key={combo}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-orange-300"
          >
            🔥 {combo} in a row
          </motion.span>
        ) : null}
        {settings.showTimer ? <span className="ml-auto font-mono">{formatDuration(elapsed)}</span> : null}
      </div>

      <Flashcard
        card={card}
        flipped={flipped}
        onFlip={flip}
        showExplanation={showExplanation}
        animation={flipAnimation}
      />

      <AnimatePresence mode="wait">
        {flipped ? (
          <motion.div
            key="grades"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {GRADES.map((g, i) => (
              <button
                key={g}
                onClick={() => answer(g)}
                className="group flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:bg-white/10"
                style={{ borderColor: `${GRADE_COLOR[g]}40` }}
              >
                <span className="text-sm font-semibold" style={{ color: GRADE_COLOR[g] }}>
                  {GRADE_LABEL[g]}
                </span>
                {intervals ? (
                  <span className="font-mono text-[0.65rem] muted">{intervals[g]}</span>
                ) : null}
                <span className="hidden text-[0.6rem] muted sm:block">{GRADE_HINT[g]}</span>
                <Kbd>{i + 1}</Kbd>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div key="flip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button className="w-full" size="lg" onClick={flip}>
              Reveal answer <Kbd>Space</Kbd>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setShowResources((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 muted hover:bg-white/5"
        >
          <BookMarked className="h-3.5 w-3.5" /> Resources <Kbd>R</Kbd>
        </button>
        <button
          onClick={() => setShowExplanation((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 muted hover:bg-white/5"
        >
          <Info className="h-3.5 w-3.5" /> Explanation <Kbd>E</Kbd>
        </button>
        <button
          onClick={() => flagCard(card.id, 'Flagged during study')}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 muted hover:bg-white/5"
        >
          <Flag className="h-3.5 w-3.5" /> Flag <Kbd>F</Kbd>
        </button>
      </div>

      <AnimatePresence>
        {showResources ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel overflow-hidden p-4"
          >
            <div className="mb-2 text-xs uppercase tracking-widest muted">Learn more</div>
            <ul className="space-y-2">
              {card.resources.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-sm text-sky-300 hover:underline"
                  >
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.6rem] uppercase muted">
                      {r.kind}
                    </span>
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
