import type { Card, ReviewState, SessionMode, TagStat } from './types';
import { isDue, maturity } from './scheduler';
import { introductionOrder, isRecalled, isUnlocked, tierOf, tierProgress, type Tier } from './tiers';
import { shuffle } from './utils';
import { weakTagNames } from './weakness';

export interface QueueOptions {
  /** Every card in scope, in authored order. */
  cards: Card[];
  reviews: Record<string, ReviewState>;
  mode: SessionMode;
  limit: number;
  newLimit: number;
  /** `tierKey`s the learner has tested out of. */
  testedOut?: readonly string[];
  /** For `tier` and `checkpoint` sessions: the tier being studied or tested. */
  tier?: Tier;
  tagStats?: Record<string, TagStat>;
  now?: number;
}

/**
 * Builds the card order for a session.
 *
 * Priority: due reviews first (they are the ones actually decaying), then a capped
 * intake of new cards from each topic's current tier, in authored order, then cards
 * already seen but not yet recalled, then the reviews coming due soonest. New cards
 * are never used as padding, and nothing above a topic's unlocked tiers is ever shown.
 * Nothing here mutates state.
 */
export function buildQueue(opts: QueueOptions): Card[] {
  const {
    cards,
    reviews,
    mode,
    limit,
    newLimit,
    testedOut = [],
    tier,
    tagStats = {},
    now = Date.now(),
  } = opts;

  const progress = tierProgress(cards, reviews, testedOut);

  if (mode === 'checkpoint') {
    // A tier test samples the whole tier, seen or not — that is how you test out of it.
    return shuffle(cards.filter((c) => tierOf(c) === tier && isUnlocked(c, progress))).slice(0, limit);
  }

  const scope = mode === 'tier' ? cards.filter((c) => tierOf(c) === tier) : cards;
  const seen = (c: Card) => Boolean(reviews[c.id] && reviews[c.id].reps > 0);

  const due = scope
    .filter((c) => isDue(reviews[c.id], now))
    .sort((a, b) => (reviews[a.id]?.due ?? 0) - (reviews[b.id]?.due ?? 0));

  const fresh = introductionOrder(progress, reviews, mode === 'tier' ? tier : undefined);

  if (mode === 'weak') {
    const weak = new Set(weakTagNames(tagStats));
    const targeted = (c: Card) => c.tags.some((t) => weak.has(t));
    const ordered = [
      ...due.filter(targeted),
      ...scope.filter((c) => targeted(c) && seen(c) && !isDue(reviews[c.id], now)),
      ...fresh.filter(targeted),
    ];
    return dedupe(ordered).slice(0, limit);
  }

  const queue: Card[] = due.slice(0, limit);
  const room = Math.max(0, limit - queue.length);
  queue.push(...fresh.slice(0, Math.min(newLimit, room)));

  // Still short? Revisit what has been seen: the misses first — getting those back is
  // what clears a tier — then weak tags, then whatever comes due soonest.
  if (queue.length < limit) {
    const weakSet = new Set(weakTagNames(tagStats));
    const inQueue = new Set(queue.map((c) => c.id));
    const rank = (c: Card) => (!isRecalled(reviews[c.id]) ? 0 : c.tags.some((t) => weakSet.has(t)) ? 1 : 2);
    const rest = scope
      .filter((c) => !inQueue.has(c.id) && seen(c))
      .sort((a, b) => rank(a) - rank(b) || reviews[a.id].due - reviews[b.id].due);
    queue.push(...rest.slice(0, limit - queue.length));
  }

  return dedupe(queue);
}

function dedupe(cards: Card[]): Card[] {
  const seen = new Set<string>();
  return cards.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

/** Fraction of a set of cards that are at least "young", weighted. Drives the mastery rings. */
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

/** A tier test: up to this many cards drawn from the tier, passed at CHECKPOINT_PASS. */
export const CHECKPOINT_SIZE = 20;
export const CHECKPOINT_PASS = 0.85;
