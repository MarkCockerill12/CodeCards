import type { Card, ReviewState } from './types';

/**
 * Tiered progression.
 *
 * A card's `difficulty` is its tier. Every topic is climbed one tier at a time:
 * Basics (what the thing is and what it is for) before Fundamentals, Fundamentals
 * before Intermediate, and so on. New cards are only ever introduced from a topic's
 * *current* tier — the lowest one not yet complete — so nobody meets SSA form before
 * they know what a compiler is.
 *
 * A tier is complete when it is either
 *   - cleared by study: every card seen, and at least TIER_CLEAR_RATE of them currently
 *     recalled (latest grade not "Again"), or
 *   - tested out of: a tier test passed at CHECKPOINT_PASS (see session.ts).
 *
 * Reviews of cards already learned keep flowing regardless of tier — forgetting does
 * not wait for progression.
 */

export type Tier = 1 | 2 | 3 | 4 | 5;

export const TIERS: Tier[] = [1, 2, 3, 4, 5];

export const TIER_NAME: Record<Tier, string> = {
  1: 'Basics',
  2: 'Fundamentals',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const TIER_BLURB: Record<Tier, string> = {
  1: 'What it is, what it is for, and the words everyone uses.',
  2: 'The core rules and everyday tools you cannot work without.',
  3: 'How it really behaves, and the patterns practitioners rely on.',
  4: 'Internals, trade-offs and the bugs that bite in production.',
  5: 'Deep edge cases and expert-level reasoning.',
};

export const TIER_COLOR: Record<Tier, string> = {
  1: '#22c55e',
  2: '#38bdf8',
  3: '#a78bfa',
  4: '#f59e0b',
  5: '#ef4444',
};

/** Share of a tier's cards that must currently be recalled for it to count as cleared. */
export const TIER_CLEAR_RATE = 0.8;

export const tierKey = (topicId: string, tier: Tier) => `${topicId}:${tier}`;

export const tierOf = (card: Card): Tier => card.difficulty;

/** Studied at least once, and the most recent answer was not "Again". */
export function isRecalled(state: ReviewState | undefined): boolean {
  if (!state || state.reps === 0) return false;
  const last = state.history[state.history.length - 1];
  return !last || last.grade !== 'again';
}

const isSeen = (state: ReviewState | undefined) => Boolean(state && state.reps > 0);

export interface TierProgress {
  topicId: string;
  tier: Tier;
  /** In authored order (module order, then card order). */
  cards: Card[];
  seen: number;
  recalled: number;
  cleared: boolean;
  testedOut: boolean;
  complete: boolean;
  unlocked: boolean;
  /** The lowest unlocked tier that is not yet complete — where new cards come from. */
  current: boolean;
}

/**
 * Groups cards by topic, then by tier, and works out what is unlocked. `cards` must be
 * in authored order (as `allCards()` returns them). Empty tiers are omitted, so a topic
 * with no Expert cards simply has four tiers.
 */
export function tierProgress(
  cards: Card[],
  reviews: Record<string, ReviewState>,
  testedOut: readonly string[],
): Map<string, TierProgress[]> {
  const byTopic = new Map<string, Map<Tier, Card[]>>();
  for (const card of cards) {
    const topicId = card.topicId ?? '';
    const tiers = byTopic.get(topicId) ?? new Map<Tier, Card[]>();
    const list = tiers.get(tierOf(card)) ?? [];
    list.push(card);
    tiers.set(tierOf(card), list);
    byTopic.set(topicId, tiers);
  }

  const passed = new Set(testedOut);
  const out = new Map<string, TierProgress[]>();
  for (const [topicId, tiers] of byTopic) {
    const list: TierProgress[] = [];
    let previousComplete = true;
    let currentFound = false;
    for (const tier of TIERS) {
      const tierCards = tiers.get(tier);
      if (!tierCards) continue;
      const seen = tierCards.filter((c) => isSeen(reviews[c.id])).length;
      const recalled = tierCards.filter((c) => isRecalled(reviews[c.id])).length;
      const cleared = seen === tierCards.length && recalled / tierCards.length >= TIER_CLEAR_RATE;
      const tested = passed.has(tierKey(topicId, tier));
      const complete = cleared || tested;
      const unlocked: boolean = previousComplete;
      const current = unlocked && !complete && !currentFound;
      if (current) currentFound = true;
      list.push({
        topicId,
        tier,
        cards: tierCards,
        seen,
        recalled,
        cleared,
        testedOut: tested,
        complete,
        unlocked,
        current,
      });
      previousComplete = unlocked && complete;
    }
    out.set(topicId, list);
  }
  return out;
}

/** The tier a topic is currently working through, or the top tier once all are complete. */
export function currentTier(tiers: TierProgress[] | undefined): TierProgress | undefined {
  if (!tiers || tiers.length === 0) return undefined;
  return tiers.find((t) => t.current) ?? tiers[tiers.length - 1];
}

/**
 * Orders a tier's unseen cards so that a card always comes after any unseen
 * prerequisite from the same tier, otherwise keeping authored order.
 */
function prerequisiteOrder(cards: Card[], reviews: Record<string, ReviewState>): Card[] {
  const pending = cards.filter((c) => !isSeen(reviews[c.id]));
  const ids = new Set(pending.map((c) => c.id));
  const byId = new Map(pending.map((c) => [c.id, c]));
  const placed = new Set<string>();
  const out: Card[] = [];
  const visit = (card: Card, path: Set<string>) => {
    if (placed.has(card.id) || path.has(card.id)) return;
    path.add(card.id);
    for (const pre of card.prerequisites ?? []) {
      if (ids.has(pre)) visit(byId.get(pre)!, path);
    }
    path.delete(card.id);
    placed.add(card.id);
    out.push(card);
  };
  for (const card of pending) visit(card, new Set());
  return out;
}

/**
 * The order new cards should be introduced in.
 *
 * Each topic contributes the unseen cards of its current tier (or of `onlyTier`, when
 * the learner picked a specific unlocked tier). Topics are then interleaved round-robin,
 * so a mixed session opens with the first idea of every topic — "what is Python",
 * "what is Git", "what is SQL" — before any of them goes deeper.
 */
export function introductionOrder(
  progress: Map<string, TierProgress[]>,
  reviews: Record<string, ReviewState>,
  onlyTier?: Tier,
): Card[] {
  const lanes: Card[][] = [];
  for (const tiers of progress.values()) {
    const source =
      onlyTier !== undefined
        ? tiers.find((t) => t.tier === onlyTier && t.unlocked)
        : tiers.find((t) => t.current);
    if (source) lanes.push(prerequisiteOrder(source.cards, reviews));
  }
  const out: Card[] = [];
  const longest = Math.max(0, ...lanes.map((l) => l.length));
  for (let i = 0; i < longest; i += 1) {
    for (const lane of lanes) if (i < lane.length) out.push(lane[i]);
  }
  return out;
}

/** True when the card belongs to a tier its topic has unlocked. */
export function isUnlocked(card: Card, progress: Map<string, TierProgress[]>): boolean {
  const tiers = progress.get(card.topicId ?? '');
  return Boolean(tiers?.find((t) => t.tier === tierOf(card))?.unlocked);
}
