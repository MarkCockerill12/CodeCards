/**
 * Shared domain types. Mirrors scripts/content-schema.mjs — if you change one, change both.
 */

export type CardType =
  | 'flip'
  | 'predict-output'
  | 'spot-bug'
  | 'cloze'
  | 'compare'
  | 'complexity'
  | 'scenario';

export type ResourceKind = 'docs' | 'article' | 'video' | 'spec' | 'book' | 'tool';

export interface Resource {
  title: string;
  url: string;
  kind: ResourceKind;
}

export interface CompareColumns {
  left: { title: string; points: string[] };
  right: { title: string; points: string[] };
}

export interface Card {
  id: string;
  type: CardType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  prompt: string;
  answer: string;
  explanation: string;
  code?: string;
  lang?: string;
  /** Injected by scripts/build-content.mjs — Shiki output, already themed. */
  codeHtml?: string;
  columns?: CompareColumns;
  complexity?: { time: string; space?: string };
  prerequisites?: string[];
  resources: Resource[];
  verify?: { runtime: 'node' | 'python'; expectedOutput: string };
  verifiedAt?: string;
  /** Injected at load time so a card always knows where it lives. */
  topicId?: string;
  moduleId?: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  cards: Card[];
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description: string;
  modules: Module[];
}

export interface TopicSummary {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description: string;
  moduleCount: number;
  cardCount: number;
}

export interface ContentIndex {
  categories: { name: string; topics: string[] }[];
  topics: TopicSummary[];
  totalCards: number;
  builtAt: string;
}

/* ------------------------------------------------------------------ */
/* Learner state                                                       */
/* ------------------------------------------------------------------ */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export type Maturity = 'new' | 'learning' | 'young' | 'mature';

export interface ReviewState {
  cardId: string;
  /** FSRS memory state */
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  /** ts-fsrs State enum value (0 New, 1 Learning, 2 Review, 3 Relearning) */
  state: number;
  due: number;
  lastReview?: number;
  /** Rolling history, newest last, capped to the most recent 12 entries. */
  history: { at: number; grade: Grade; ms: number }[];
}

export interface TagStat {
  tag: string;
  score: number;
  reviews: number;
  correct: number;
}

export interface DayStat {
  /** YYYY-MM-DD */
  date: string;
  reviews: number;
  xp: number;
  correct: number;
  ms: number;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type CosmeticCategory =
  | 'cardSkin'
  | 'cardBack'
  | 'flipAnimation'
  | 'syntaxTheme'
  | 'background'
  | 'cursor'
  | 'soundPack'
  | 'mascot'
  | 'frame'
  | 'xpBar'
  | 'chestSkin'
  | 'nameColor';

export interface Cosmetic {
  id: string;
  category: CosmeticCategory;
  name: string;
  description: string;
  rarity: Rarity;
  price: number;
  /** Chest-only cosmetics cannot be bought outright. */
  chestOnly?: boolean;
  /** CSS custom properties applied to <html> when equipped. */
  vars?: Record<string, string>;
  /** Extra class toggled on <html> when equipped (for keyframe-driven looks). */
  className?: string;
  /** Small inline preview swatch (CSS background value). */
  swatch?: string;
}

export type ChestTier = 'common' | 'rare' | 'epic';

export interface ChestReward {
  tier: ChestTier;
  coins: number;
  cosmeticId?: string;
  bonusCoins?: number;
}

export interface FlaggedCard {
  cardId: string;
  reason: string;
  at: number;
}

export interface SessionCardResult {
  cardId: string;
  grade: Grade;
  ms: number;
  xp: number;
}

export interface SessionSummary {
  startedAt: number;
  endedAt: number;
  results: SessionCardResult[];
  xp: number;
  coins: number;
  topicIds: string[];
  mode: SessionMode;
}

export type SessionMode = 'review' | 'topic' | 'module' | 'weak' | 'calibration' | 'checkpoint';
