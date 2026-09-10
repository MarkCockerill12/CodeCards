import type { ChestReward, ChestTier, Cosmetic, Rarity } from '@/lib/types';
import { COSMETICS } from './cosmetics';

export const CHEST_META: Record<
  ChestTier,
  { name: string; coins: [number, number]; cosmeticChance: number; color: string; emoji: string }
> = {
  common: { name: 'Common Chest', coins: [40, 80], cosmeticChance: 0.2, color: '#94a3b8', emoji: '📦' },
  rare: { name: 'Rare Chest', coins: [120, 220], cosmeticChance: 0.55, color: '#38bdf8', emoji: '🎁' },
  epic: { name: 'Epic Chest', coins: [300, 600], cosmeticChance: 1, color: '#c084fc', emoji: '💎' },
};

/** Rarity weighting of the cosmetic a chest can contain. */
const RARITY_TABLE: Record<ChestTier, [Rarity, number][]> = {
  common: [
    ['common', 0.85],
    ['rare', 0.15],
  ],
  rare: [
    ['common', 0.45],
    ['rare', 0.45],
    ['epic', 0.1],
  ],
  epic: [
    ['rare', 0.4],
    ['epic', 0.5],
    ['legendary', 0.1],
  ],
};

/** Tier weighting for the random in-session drop. */
const DROP_TABLE: [ChestTier, number][] = [
  ['common', 0.8],
  ['rare', 0.18],
  ['epic', 0.02],
];

export const DROP_CHANCE = 0.06;

function weightedPick<T>(table: [T, number][], rng: () => number): T {
  const roll = rng();
  let acc = 0;
  for (const [value, weight] of table) {
    acc += weight;
    if (roll <= acc) return value;
  }
  return table[table.length - 1][0];
}

export function rollDropTier(rng: () => number = Math.random): ChestTier {
  return weightedPick(DROP_TABLE, rng);
}

export function shouldDropChest(rng: () => number = Math.random): boolean {
  return rng() < DROP_CHANCE;
}

/**
 * Opens a chest. `owned` prevents duplicate cosmetics: if the learner already owns every
 * cosmetic of the rolled rarity, the chest pays bonus coins instead of nothing.
 */
export function openChest(
  tier: ChestTier,
  owned: string[],
  rng: () => number = Math.random,
): ChestReward {
  const meta = CHEST_META[tier];
  const [lo, hi] = meta.coins;
  const coins = Math.round(lo + rng() * (hi - lo));
  const reward: ChestReward = { tier, coins };

  if (rng() > meta.cosmeticChance) return reward;

  const ownedSet = new Set(owned);
  const rarity = weightedPick(RARITY_TABLE[tier], rng);

  const pickFrom = (r: Rarity): Cosmetic[] =>
    COSMETICS.filter((x) => x.rarity === r && x.price > 0 && !ownedSet.has(x.id));

  // Fall back through rarities so a chest is never empty while anything is unowned.
  const order: Rarity[] = [rarity, 'legendary', 'epic', 'rare', 'common'];
  for (const r of order) {
    const pool = pickFrom(r);
    if (pool.length > 0) {
      reward.cosmeticId = pool[Math.floor(rng() * pool.length)].id;
      return reward;
    }
  }

  reward.bonusCoins = Math.round(coins * 1.5);
  return reward;
}
