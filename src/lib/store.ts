'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Card,
  ChestReward,
  ChestTier,
  CosmeticCategory,
  DayStat,
  FlaggedCard,
  Grade,
  ReviewState,
  SessionSummary,
  TagStat,
} from './types';
import { emptyReview, grade as applyGrade, seedKnown } from './scheduler';
import { applyReview, medianByDifficulty } from './weakness';
import {
  CHECKPOINT_COINS,
  CHECKPOINT_XP,
  MODULE_COMPLETE_COINS,
  MODULE_COMPLETE_XP,
  SESSION_COMPLETE_XP,
  levelUpCoins,
  xpForReview,
} from './economy';
import { levelFromXp } from '@/data/levels';
import { DEFAULT_EQUIPPED, DEFAULT_OWNED, COSMETIC_BY_ID } from '@/data/cosmetics';
import { openChest, rollDropTier, shouldDropChest } from '@/data/chests';
import { dayKey } from './utils';

export type Consent = 'unset' | 'accepted' | 'session';

const CONSENT_KEY = 'cc.consent.v1';
const STATE_KEY = 'cc.state.v1';

export function readConsent(): Consent {
  if (typeof window === 'undefined') return 'unset';
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === 'accepted' || raw === 'session' ? raw : 'unset';
  } catch {
    return 'unset';
  }
}

export function writeConsent(value: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* private mode — the app still works, it just forgets on close */
  }
}

/**
 * Storage adapter honouring the consent choice.
 *
 * "Session only" swaps localStorage for an in-memory Map, so nothing is ever written
 * to disk and the tab starts clean next time. Nothing else in the app has to care.
 */
const memory = new Map<string, string>();

const consentAwareStorage: Storage = {
  get length() {
    return readConsent() === 'accepted' ? window.localStorage.length : memory.size;
  },
  clear() {
    if (readConsent() === 'accepted') window.localStorage.clear();
    memory.clear();
  },
  key(index: number) {
    return readConsent() === 'accepted'
      ? window.localStorage.key(index)
      : ([...memory.keys()][index] ?? null);
  },
  getItem(key: string) {
    if (readConsent() === 'accepted') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    }
    return memory.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    if (readConsent() === 'accepted') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        /* quota or private mode — fall through to memory */
      }
    }
    memory.set(key, value);
  },
  removeItem(key: string) {
    memory.delete(key);
    if (readConsent() === 'accepted') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  },
};

export interface Settings {
  cardsPerSession: number;
  newPerSession: number;
  soundEnabled: boolean;
  reduceMotion: boolean;
  autoRevealExplanation: boolean;
  showIntervalPreview: boolean;
  showTimer: boolean;
}

export interface RewardEvent {
  id: string;
  kind: 'levelup' | 'chest' | 'module' | 'checkpoint';
  level?: number;
  chest?: ChestReward;
  moduleName?: string;
  xp?: number;
  coins?: number;
}

export interface AppState {
  hydrated: boolean;
  consent: Consent;

  displayName: string;
  xp: number;
  coins: number;

  onboarded: boolean;
  calibrated: boolean;
  selectedTopics: string[];
  settings: Settings;

  reviews: Record<string, ReviewState>;
  tagStats: Record<string, TagStat>;
  dayStats: Record<string, DayStat>;
  timings: { difficulty: number; ms: number }[];

  owned: string[];
  equipped: Record<CosmeticCategory, string>;

  pendingChests: ChestTier[];
  chestHistory: ChestReward[];

  completedModules: string[];
  passedCheckpoints: string[];
  flagged: FlaggedCard[];
  sessions: SessionSummary[];

  /** Transient: reward popups waiting to be shown. Never persisted. */
  rewardQueue: RewardEvent[];

  setConsent: (value: Consent) => void;
  setHydrated: () => void;
  setDisplayName: (name: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setSelectedTopics: (ids: string[]) => void;
  toggleTopic: (id: string) => void;
  completeOnboarding: () => void;

  reviewCard: (
    card: Card,
    g: Grade,
    ms: number,
    opts?: { allowRewards?: boolean },
  ) => { xp: number; next: ReviewState };
  seedCalibration: (cardId: string, days: number) => void;
  finishCalibration: () => void;

  finishSession: (summary: Omit<SessionSummary, 'xp' | 'coins'> & { xp: number; coins: number }) => void;
  completeModule: (moduleId: string, moduleName: string) => void;
  passCheckpoint: (moduleId: string) => void;

  grantChest: (tier: ChestTier) => void;
  openPendingChest: () => ChestReward | null;

  buy: (cosmeticId: string) => boolean;
  equip: (cosmeticId: string) => void;

  flagCard: (cardId: string, reason: string) => void;
  unflagCard: (cardId: string) => void;

  pushReward: (event: Omit<RewardEvent, 'id'>) => void;
  shiftReward: () => void;

  exportData: () => string;
  importData: (json: string) => boolean;
  resetProgress: () => void;
  resetEverything: () => void;
}

const defaultSettings: Settings = {
  cardsPerSession: 20,
  newPerSession: 12,
  soundEnabled: true,
  reduceMotion: false,
  autoRevealExplanation: true,
  showIntervalPreview: true,
  showTimer: true,
};

const initial = {
  hydrated: false,
  consent: 'unset' as Consent,
  displayName: 'Learner',
  xp: 0,
  coins: 0,
  onboarded: false,
  calibrated: false,
  selectedTopics: [] as string[],
  settings: defaultSettings,
  reviews: {} as Record<string, ReviewState>,
  tagStats: {} as Record<string, TagStat>,
  dayStats: {} as Record<string, DayStat>,
  timings: [] as { difficulty: number; ms: number }[],
  owned: DEFAULT_OWNED,
  equipped: DEFAULT_EQUIPPED,
  pendingChests: [] as ChestTier[],
  chestHistory: [] as ChestReward[],
  completedModules: [] as string[],
  passedCheckpoints: [] as string[],
  flagged: [] as FlaggedCard[],
  sessions: [] as SessionSummary[],
  rewardQueue: [] as RewardEvent[],
};

let rewardId = 0;
const nextRewardId = () => `r${(rewardId += 1)}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      setHydrated: () => set({ hydrated: true }),

      setConsent: (value) => {
        writeConsent(value);
        // Setting state also triggers a persist write, so accepting immediately flushes
        // whatever the learner did before they answered the banner.
        set({ consent: value });
      },

      setDisplayName: (displayName) => set({ displayName: displayName.slice(0, 24) || 'Learner' }),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      setSelectedTopics: (ids) => set({ selectedTopics: ids }),

      toggleTopic: (id) =>
        set((s) => ({
          selectedTopics: s.selectedTopics.includes(id)
            ? s.selectedTopics.filter((t) => t !== id)
            : [...s.selectedTopics, id],
        })),

      completeOnboarding: () => set({ onboarded: true }),

      /* ---------------------------------------------------------------- */

      reviewCard: (card, g, ms, opts) => {
        const state = get();
        const now = Date.now();
        const prev = state.reviews[card.id] ?? emptyReview(card.id, now);
        const next = applyGrade(prev, g, ms, now);
        const gained = xpForReview(card, g, next);

        const medians = medianByDifficulty(state.timings);
        const tagStats = applyReview(state.tagStats, card, g, ms, medians[card.difficulty]);

        const key = dayKey(now);
        const day = state.dayStats[key] ?? { date: key, reviews: 0, xp: 0, correct: 0, ms: 0 };

        const beforeLevel = levelFromXp(state.xp).level;
        const xp = state.xp + gained;
        const afterLevel = levelFromXp(xp).level;

        const rewards: RewardEvent[] = [];
        let coins = state.coins;
        const pendingChests = [...state.pendingChests];

        if (afterLevel > beforeLevel) {
          for (let lvl = beforeLevel + 1; lvl <= afterLevel; lvl += 1) {
            const bonus = levelUpCoins(lvl);
            coins += bonus;
            pendingChests.push('rare');
            rewards.push({ id: nextRewardId(), kind: 'levelup', level: lvl, coins: bonus });
          }
        }

        if (opts?.allowRewards !== false && g !== 'again' && shouldDropChest()) {
          pendingChests.push(rollDropTier());
        }

        set({
          reviews: { ...state.reviews, [card.id]: next },
          tagStats,
          timings: [...state.timings, { difficulty: card.difficulty, ms }].slice(-200),
          dayStats: {
            ...state.dayStats,
            [key]: {
              ...day,
              reviews: day.reviews + 1,
              xp: day.xp + gained,
              correct: day.correct + (g === 'again' ? 0 : 1),
              ms: day.ms + ms,
            },
          },
          xp,
          coins,
          pendingChests,
          rewardQueue: [...state.rewardQueue, ...rewards],
        });

        return { xp: gained, next };
      },

      seedCalibration: (cardId, days) =>
        set((s) => ({ reviews: { ...s.reviews, [cardId]: seedKnown(cardId, days) } })),

      finishCalibration: () => set({ calibrated: true }),

      finishSession: (summary) =>
        set((s) => ({
          xp: s.xp + SESSION_COMPLETE_XP,
          sessions: [...s.sessions, summary as SessionSummary].slice(-60),
        })),

      completeModule: (moduleId, moduleName) => {
        const s = get();
        if (s.completedModules.includes(moduleId)) return;
        set({
          completedModules: [...s.completedModules, moduleId],
          xp: s.xp + MODULE_COMPLETE_XP,
          coins: s.coins + MODULE_COMPLETE_COINS,
          pendingChests: [...s.pendingChests, 'epic'],
          rewardQueue: [
            ...s.rewardQueue,
            {
              id: nextRewardId(),
              kind: 'module',
              moduleName,
              xp: MODULE_COMPLETE_XP,
              coins: MODULE_COMPLETE_COINS,
            },
          ],
        });
      },

      passCheckpoint: (moduleId) => {
        const s = get();
        if (s.passedCheckpoints.includes(moduleId)) return;
        set({
          passedCheckpoints: [...s.passedCheckpoints, moduleId],
          xp: s.xp + CHECKPOINT_XP,
          coins: s.coins + CHECKPOINT_COINS,
          rewardQueue: [
            ...s.rewardQueue,
            { id: nextRewardId(), kind: 'checkpoint', xp: CHECKPOINT_XP, coins: CHECKPOINT_COINS },
          ],
        });
      },

      /* ---------------------------------------------------------------- */

      grantChest: (tier) => set((s) => ({ pendingChests: [...s.pendingChests, tier] })),

      openPendingChest: () => {
        const s = get();
        const [tier, ...rest] = s.pendingChests;
        if (!tier) return null;
        const reward = openChest(tier, s.owned);
        set({
          pendingChests: rest,
          coins: s.coins + reward.coins + (reward.bonusCoins ?? 0),
          owned: reward.cosmeticId ? [...s.owned, reward.cosmeticId] : s.owned,
          chestHistory: [...s.chestHistory, reward].slice(-50),
        });
        return reward;
      },

      buy: (cosmeticId) => {
        const s = get();
        const item = COSMETIC_BY_ID.get(cosmeticId);
        if (!item || item.chestOnly || s.owned.includes(cosmeticId) || s.coins < item.price) {
          return false;
        }
        set({ coins: s.coins - item.price, owned: [...s.owned, cosmeticId] });
        return true;
      },

      equip: (cosmeticId) => {
        const item = COSMETIC_BY_ID.get(cosmeticId);
        if (!item) return;
        const s = get();
        if (!s.owned.includes(cosmeticId)) return;
        set({ equipped: { ...s.equipped, [item.category]: cosmeticId } });
      },

      /* ---------------------------------------------------------------- */

      flagCard: (cardId, reason) =>
        set((s) => ({
          flagged: s.flagged.some((f) => f.cardId === cardId)
            ? s.flagged
            : [...s.flagged, { cardId, reason, at: Date.now() }],
        })),

      unflagCard: (cardId) =>
        set((s) => ({ flagged: s.flagged.filter((f) => f.cardId !== cardId) })),

      pushReward: (event) =>
        set((s) => ({ rewardQueue: [...s.rewardQueue, { ...event, id: nextRewardId() }] })),

      shiftReward: () => set((s) => ({ rewardQueue: s.rewardQueue.slice(1) })),

      /* ---------------------------------------------------------------- */

      exportData: () => {
        const s = get();
        const { rewardQueue: _rq, hydrated: _h, ...rest } = s;
        const payload = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => typeof v !== 'function'),
        );
        return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: payload }, null, 2);
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          const incoming = parsed?.state ?? parsed;
          if (!incoming || typeof incoming !== 'object') return false;
          // Only accept keys we know about — never trust an imported file blindly.
          const allowed = Object.keys(initial) as (keyof typeof initial)[];
          const patch: Record<string, unknown> = {};
          for (const key of allowed) {
            if (key in incoming) patch[key] = incoming[key];
          }
          patch.hydrated = true;
          patch.rewardQueue = [];
          set(patch as Partial<AppState>);
          return true;
        } catch {
          return false;
        }
      },

      resetProgress: () =>
        set({
          xp: 0,
          coins: 0,
          reviews: {},
          tagStats: {},
          dayStats: {},
          timings: [],
          pendingChests: [],
          chestHistory: [],
          completedModules: [],
          passedCheckpoints: [],
          sessions: [],
          flagged: [],
          calibrated: false,
          rewardQueue: [],
        }),

      resetEverything: () => {
        try {
          window.localStorage.removeItem(STATE_KEY);
        } catch {
          /* ignore */
        }
        memory.clear();
        set({ ...initial, hydrated: true, consent: get().consent });
      },
    }),
    {
      name: STATE_KEY,
      storage: createJSONStorage(() => consentAwareStorage),
      version: 1,
      partialize: (s) => {
        const { rewardQueue: _rq, hydrated: _h, ...rest } = s;
        return rest as AppState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/** Convenience selectors — keep component subscriptions narrow. */
export const useLevel = () => useStore((s) => levelFromXp(s.xp));
export const useHydrated = () => useStore((s) => s.hydrated);
