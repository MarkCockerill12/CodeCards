import type { Card, Grade, ReviewState } from './types';

/**
 * XP and coin rules. Deliberately simple and un-throttled: there is no anti-farm
 * mechanic, no daily cap and no streak multiplier. XP rewards *depth* (harder cards,
 * longer intervals) rather than volume.
 */

export const BASE_XP: Record<Grade, number> = {
  again: 2,
  hard: 8,
  good: 12,
  easy: 15,
};

export const SESSION_COMPLETE_XP = 40;
export const MODULE_COMPLETE_XP = 250;
export const MODULE_COMPLETE_COINS = 150;
export const CHECKPOINT_XP = 120;
export const CHECKPOINT_COINS = 60;

/** Difficulty scales linearly from 1.00 (trivial) to 2.00 (brutal). */
export function difficultyMultiplier(difficulty: number): number {
  return 1 + (difficulty - 1) * 0.25;
}

/** Long-interval cards pay a maturity bonus — remembering something for 6 months is worth more. */
export function maturityBonus(intervalDays: number): number {
  return Math.floor(Math.min(Math.max(intervalDays, 0), 180) / 30) * 3;
}

export function xpForReview(card: Card, g: Grade, next: ReviewState): number {
  const base = BASE_XP[g];
  const scaled = Math.round(base * difficultyMultiplier(card.difficulty));
  return scaled + maturityBonus(next.scheduledDays);
}

export function levelUpCoins(level: number): number {
  return 100 + 25 * level;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-GB');
}
