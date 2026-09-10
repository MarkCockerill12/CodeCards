import type { Card, ReviewState, SessionMode, TagStat } from './types';
import { isDue, maturity } from './scheduler';
import { readiness } from './prereq';
import { shuffle } from './utils';
import { WEAK_THRESHOLD } from './weakness';

export interface QueueOptions {
  cards: Card[];
  reviews: Record<string, ReviewState>;
  mode: SessionMode;
  limit: number;
  newLimit: number;
  tagStats?: Record<string, TagStat>;
  now?: number;
}

/**
 * Builds the card order for a session.
 *
 * Priority: due reviews first (they are the ones actually decaying), then a capped
 * intake of new cards ordered by difficulty and prerequisite readiness, then weak-tag
 * top-ups if the queue is still short. Nothing here mutates state.
 */
export function buildQueue(opts: QueueOptions): Card[] {
  const { cards, reviews, mode, limit, newLimit, tagStats = {}, now = Date.now() } = opts;

  if (mode === 'calibration') return calibrationSet(cards, limit);
  if (mode === 'checkpoint') return shuffle(cards).slice(0, limit);

  const due = cards
    .filter((c) => isDue(reviews[c.id], now))
    .sort((a, b) => (reviews[a.id]?.due ?? 0) - (reviews[b.id]?.due ?? 0));

  const fresh = cards
    .filter((c) => !reviews[c.id] || reviews[c.id].reps === 0)
    .sort((a, b) => {
      const readyDelta = readiness(b, reviews) - readiness(a, reviews);
      if (Math.abs(readyDelta) > 0.001) return readyDelta;
      return a.difficulty - b.difficulty;
    });

  if (mode === 'weak') {
    const weak = new Set(
      Object.values(tagStats)
        .filter((t) => t.score < WEAK_THRESHOLD)
        .map((t) => t.tag),
    );
    const targeted = cards.filter((c) => c.tags.some((t) => weak.has(t)));
    const ordered = [
      ...targeted.filter((c) => isDue(reviews[c.id], now)),
      ...targeted.filter((c) => !isDue(reviews[c.id], now) && reviews[c.id]),
      ...targeted.filter((c) => !reviews[c.id]),
    ];
    return dedupe(ordered).slice(0, limit);
  }

  const queue: Card[] = due.slice(0, limit);
  const room = Math.max(0, limit - queue.length);
  queue.push(...fresh.slice(0, Math.min(newLimit, room)));

  if (queue.length < limit) {
    const weakest = Object.values(tagStats)
      .filter((t) => t.score < WEAK_THRESHOLD)
      .sort((a, b) => a.score - b.score)
      .map((t) => t.tag);
    const weakSet = new Set(weakest);
    const inQueue = new Set(queue.map((c) => c.id));
    const topUp = cards
      .filter((c) => !inQueue.has(c.id) && reviews[c.id] && c.tags.some((t) => weakSet.has(t)))
      .sort((a, b) => (reviews[a.id]?.due ?? 0) - (reviews[b.id]?.due ?? 0));
    queue.push(...topUp.slice(0, limit - queue.length));
  }

  // Still short? Pad with the least-recently-seen cards so a session is never empty.
  if (queue.length < limit) {
    const inQueue = new Set(queue.map((c) => c.id));
    const rest = cards
      .filter((c) => !inQueue.has(c.id))
      .sort((a, b) => (reviews[a.id]?.due ?? Infinity) - (reviews[b.id]?.due ?? Infinity));
    queue.push(...rest.slice(0, limit - queue.length));
  }

  return dedupe(queue);
}

function dedupe(cards: Card[]): Card[] {
  const seen = new Set<string>();
  return cards.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

/**
 * The calibration quiz: a spread across every difficulty band and, where possible,
 * every selected topic — so the first session already knows roughly where you sit.
 */
export function calibrationSet(cards: Card[], size = 15): Card[] {
  const byDifficulty = new Map<number, Card[]>();
  for (const card of cards) {
    const list = byDifficulty.get(card.difficulty) ?? [];
    list.push(card);
    byDifficulty.set(card.difficulty, list);
  }

  const perBand = Math.max(1, Math.floor(size / 5));
  const picked: Card[] = [];
  const topicsUsed = new Map<string, number>();

  for (const difficulty of [1, 2, 3, 4, 5]) {
    const pool = shuffle(byDifficulty.get(difficulty) ?? []).sort((a, b) => {
      const ua = topicsUsed.get(a.topicId ?? '') ?? 0;
      const ub = topicsUsed.get(b.topicId ?? '') ?? 0;
      return ua - ub;
    });
    for (const card of pool.slice(0, perBand)) {
      picked.push(card);
      topicsUsed.set(card.topicId ?? '', (topicsUsed.get(card.topicId ?? '') ?? 0) + 1);
    }
  }

  if (picked.length < size) {
    const chosen = new Set(picked.map((c) => c.id));
    picked.push(...shuffle(cards.filter((c) => !chosen.has(c.id))).slice(0, size - picked.length));
  }

  return picked.slice(0, size).sort((a, b) => a.difficulty - b.difficulty);
}

/** A module counts as complete once every card in it has left the "new" state. */
export function moduleComplete(cards: Card[], reviews: Record<string, ReviewState>): boolean {
  return cards.length > 0 && cards.every((c) => maturity(reviews[c.id]) !== 'new');
}

/** Fraction of a module's cards that are at least "young". Drives the path node rings. */
export function moduleMastery(cards: Card[], reviews: Record<string, ReviewState>): number {
  if (cards.length === 0) return 0;
  const scored = cards.reduce((sum, c) => {
    const m = maturity(reviews[c.id]);
    return sum + (m === 'mature' ? 1 : m === 'young' ? 0.65 : m === 'learning' ? 0.3 : 0);
  }, 0);
  return scored / cards.length;
}

export function dueCount(cards: Card[], reviews: Record<string, ReviewState>, now = Date.now()): number {
  return cards.filter((c) => isDue(reviews[c.id], now)).length;
}

export function newCount(cards: Card[], reviews: Record<string, ReviewState>): number {
  return cards.filter((c) => !reviews[c.id] || reviews[c.id].reps === 0).length;
}

export const CHECKPOINT_SIZE = 20;
export const CHECKPOINT_PASS = 0.85;
