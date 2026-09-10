import type { Card, Grade, TagStat } from './types';

/**
 * Per-tag weakness tracking.
 *
 * Cards are too granular to reason about ("you're bad at card py-142" is useless) and
 * topics are too coarse ("you're bad at Python"). Tags — `python.generators`,
 * `js.event-loop` — are the level at which a remedy actually exists.
 */

export const GRADE_VALUE: Record<Grade, number> = {
  again: 0,
  hard: 0.45,
  good: 0.85,
  easy: 1,
};

/** A `good` that took far longer than usual is "correct but not fluent". */
export const SLOW_GOOD_VALUE = 0.6;
export const SLOW_FACTOR = 2.5;

const ALPHA = 0.2;
export const WEAK_THRESHOLD = 0.6;
export const MIN_REVIEWS_FOR_WEAK = 4;

export function gradeValue(g: Grade, ms: number, medianMs: number | undefined): number {
  if (g === 'good' && medianMs && ms > medianMs * SLOW_FACTOR) return SLOW_GOOD_VALUE;
  return GRADE_VALUE[g];
}

export function applyReview(
  stats: Record<string, TagStat>,
  card: Card,
  g: Grade,
  ms: number,
  medianMs?: number,
): Record<string, TagStat> {
  const value = gradeValue(g, ms, medianMs);
  const next = { ...stats };
  for (const tag of card.tags) {
    const prev = next[tag] ?? { tag, score: 0.7, reviews: 0, correct: 0 };
    next[tag] = {
      tag,
      score: prev.reviews === 0 ? value : prev.score * (1 - ALPHA) + value * ALPHA,
      reviews: prev.reviews + 1,
      correct: prev.correct + (g === 'again' ? 0 : 1),
    };
  }
  return next;
}

export function weakTags(stats: Record<string, TagStat>, limit = 6): TagStat[] {
  return Object.values(stats)
    .filter((s) => s.reviews >= MIN_REVIEWS_FOR_WEAK && s.score < WEAK_THRESHOLD)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

export function strongTags(stats: Record<string, TagStat>, limit = 6): TagStat[] {
  return Object.values(stats)
    .filter((s) => s.reviews >= MIN_REVIEWS_FOR_WEAK)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Rolls tag scores up to their namespace (`python.generators` -> `python`). */
export function rollUp(stats: Record<string, TagStat>): TagStat[] {
  const buckets = new Map<string, { total: number; reviews: number; correct: number }>();
  for (const stat of Object.values(stats)) {
    const key = stat.tag.split('.')[0];
    const bucket = buckets.get(key) ?? { total: 0, reviews: 0, correct: 0 };
    bucket.total += stat.score * stat.reviews;
    bucket.reviews += stat.reviews;
    bucket.correct += stat.correct;
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .map(([tag, b]) => ({
      tag,
      score: b.reviews > 0 ? b.total / b.reviews : 0,
      reviews: b.reviews,
      correct: b.correct,
    }))
    .sort((a, b) => b.reviews - a.reviews);
}

/** Median answer time per difficulty band, used for the fluency signal. */
export function medianByDifficulty(
  samples: { difficulty: number; ms: number }[],
): Record<number, number> {
  const byDifficulty: Record<number, number[]> = {};
  for (const s of samples) {
    (byDifficulty[s.difficulty] ??= []).push(s.ms);
  }
  const out: Record<number, number> = {};
  for (const [d, list] of Object.entries(byDifficulty)) {
    if (list.length < 5) continue;
    const sorted = [...list].sort((a, b) => a - b);
    out[Number(d)] = sorted[Math.floor(sorted.length / 2)];
  }
  return out;
}

export function tagLabel(tag: string): string {
  return tag
    .split('.')
    .map((part) =>
      part
        .split('-')
        .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
        .join(' '),
    )
    .join(' › ');
}
