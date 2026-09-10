import {
  Rating,
  State,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card as FsrsCard,
  type Grade as FsrsGrade,
} from 'ts-fsrs';
import type { Grade, Maturity, ReviewState } from './types';

/**
 * FSRS-5 wrapper.
 *
 * The rest of the app never touches ts-fsrs directly — it speaks in `ReviewState`
 * (plain JSON, serialisable into localStorage) and the four grades.
 */

const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
  request_retention: 0.9,
  maximum_interval: 3650,
});

const engine = fsrs(params);

export const GRADE_TO_RATING: Record<Grade, FsrsGrade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export const GRADES: Grade[] = ['again', 'hard', 'good', 'easy'];

export const GRADE_LABEL: Record<Grade, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

export const GRADE_HINT: Record<Grade, string> = {
  again: 'No idea — show me soon',
  hard: 'Got there, but it hurt',
  good: 'Knew it',
  easy: 'Instant. Push it out',
};

export const GRADE_COLOR: Record<Grade, string> = {
  again: '#ef4444',
  hard: '#f59e0b',
  good: '#22c55e',
  easy: '#38bdf8',
};

function toFsrs(state: ReviewState): FsrsCard {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state as State,
    last_review: state.lastReview ? new Date(state.lastReview) : undefined,
  };
}

function fromFsrs(cardId: string, card: FsrsCard, history: ReviewState['history']): ReviewState {
  return {
    cardId,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    due: card.due.getTime(),
    lastReview: card.last_review ? card.last_review.getTime() : undefined,
    history,
  };
}

export function emptyReview(cardId: string, now = Date.now()): ReviewState {
  return fromFsrs(cardId, createEmptyCard(new Date(now)), []);
}

/** Applies a grade and returns the next scheduling state. Pure. */
export function grade(
  state: ReviewState,
  g: Grade,
  ms: number,
  now = Date.now(),
): ReviewState {
  const result = engine.next(toFsrs(state), new Date(now), GRADE_TO_RATING[g]);
  const history = [...state.history, { at: now, grade: g, ms }].slice(-12);
  return fromFsrs(state.cardId, result.card, history);
}

/** What the next interval would be for each grade — shown under the grade buttons. */
export function previewIntervals(state: ReviewState, now = Date.now()): Record<Grade, string> {
  const log = engine.repeat(toFsrs(state), new Date(now));
  const out = {} as Record<Grade, string>;
  for (const g of GRADES) {
    const item = log[GRADE_TO_RATING[g]];
    out[g] = formatInterval(item.card.due.getTime() - now);
  }
  return out;
}

/**
 * Seeds a card as "already known" — used by the calibration quiz so experts are not
 * force-marched through fundamentals they answered instantly.
 */
export function seedKnown(cardId: string, days: number, now = Date.now()): ReviewState {
  const base = emptyReview(cardId, now);
  return {
    ...base,
    stability: Math.max(days, 1),
    difficulty: 5,
    scheduledDays: days,
    elapsedDays: 0,
    reps: 1,
    state: State.Review,
    due: now + days * 86_400_000,
    lastReview: now,
    history: [{ at: now, grade: 'easy', ms: 0 }],
  };
}

export function isDue(state: ReviewState | undefined, now = Date.now()): boolean {
  if (!state) return false;
  return state.due <= now;
}

export function maturity(state: ReviewState | undefined): Maturity {
  if (!state || state.reps === 0) return 'new';
  if (state.scheduledDays < 1) return 'learning';
  if (state.scheduledDays < 21) return 'young';
  return 'mature';
}

/** FSRS-5 forgetting curve: probability the learner still recalls this right now. */
const FSRS_FACTOR = 19 / 81;
const FSRS_DECAY = -0.5;

export function retrievability(state: ReviewState | undefined, now = Date.now()): number {
  if (!state || state.reps === 0 || state.stability <= 0) return 0;
  const elapsedDays = Math.max(0, (now - (state.lastReview ?? now)) / 86_400_000);
  return Math.pow(1 + (FSRS_FACTOR * elapsedDays) / state.stability, FSRS_DECAY);
}

export function formatInterval(ms: number): string {
  const mins = ms / 60_000;
  if (mins < 1) return '<1m';
  if (mins < 60) return `${Math.round(mins)}m`;
  const hours = mins / 60;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  const months = days / 30.44;
  if (months < 12) return `${months.toFixed(months < 3 ? 1 : 0)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function formatDue(due: number, now = Date.now()): string {
  const delta = due - now;
  if (delta <= 0) return 'due now';
  return `in ${formatInterval(delta)}`;
}
