'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, Gift, Lock } from 'lucide-react';
import { Button, Panel } from '@/components/ui/primitives';
import { ChestOpener } from '@/components/game/ChestOpener';
import { useStore } from '@/lib/store';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  COSMETICS,
  RARITY_COLOR,
} from '@/data/cosmetics';
import type { Cosmetic, CosmeticCategory } from '@/lib/types';
import { formatNumber } from '@/lib/economy';
import { play } from '@/lib/sound';
import { cn } from '@/lib/utils';

export default function ShopPage() {
  const coins = useStore((s) => s.coins);
  const owned = useStore((s) => s.owned);
  const equipped = useStore((s) => s.equipped);
  const buy = useStore((s) => s.buy);
  const equip = useStore((s) => s.equip);
  const hydrated = useStore((s) => s.hydrated);
  const [category, setCategory] = useState<CosmeticCategory>('cardSkin');

  const items = useMemo(() => COSMETICS.filter((c) => c.category === category), [category]);
  const ownedCount = owned.length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Shop</h1>
          <p className="text-sm muted">
            Cosmetics only — nothing here changes XP, scheduling or difficulty. {ownedCount} of{' '}
            {COSMETICS.length} unlocked.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-2 text-amber-300 ring-1 ring-amber-400/25">
          <Coins className="h-4 w-4" />
          <span className="font-semibold">{hydrated ? formatNumber(coins) : '—'}</span>
        </div>
      </header>

      <Panel id="chests" className="scroll-mt-24">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Gift className="h-4 w-4 text-violet-300" /> Chests
        </h2>
        <ChestOpener />
      </Panel>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
              category === cat
                ? 'border-sky-400/50 bg-sky-500/15'
                : 'border-white/8 bg-white/4 hover:bg-white/8',
            )}
          >
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ShopItem
            key={item.id}
            item={item}
            owned={owned.includes(item.id)}
            equipped={equipped[item.category] === item.id}
            affordable={coins >= item.price}
            onBuy={() => {
              if (buy(item.id)) play('purchase');
            }}
            onEquip={() => equip(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ShopItem({
  item,
  owned,
  equipped,
  affordable,
  onBuy,
  onEquip,
}: {
  item: Cosmetic;
  owned: boolean;
  equipped: boolean;
  affordable: boolean;
  onBuy: () => void;
  onEquip: () => void;
}) {
  const rarity = RARITY_COLOR[item.rarity];
  const isEmoji = item.swatch && item.swatch.length <= 4;

  return (
    <motion.div
      layout
      className="panel flex flex-col gap-3 p-4"
      style={{ borderColor: equipped ? `${rarity}66` : undefined }}
    >
      <div
        className="grid h-20 place-items-center overflow-hidden rounded-xl border border-white/10"
        style={isEmoji ? undefined : { background: item.swatch ?? 'rgba(255,255,255,0.04)' }}
      >
        {isEmoji ? <span className="text-4xl">{item.swatch}</span> : null}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.name}</span>
          <span
            className="ml-auto shrink-0 text-[0.6rem] uppercase tracking-widest"
            style={{ color: rarity }}
          >
            {item.rarity}
          </span>
        </div>
        <p className="mt-0.5 text-xs muted">{item.description}</p>
      </div>

      {equipped ? (
        <Button size="sm" variant="ghost" disabled className="w-full">
          <Check className="h-3.5 w-3.5" /> Equipped
        </Button>
      ) : owned ? (
        <Button size="sm" variant="outline" className="w-full" onClick={onEquip}>
          Equip
        </Button>
      ) : item.chestOnly ? (
        <Button size="sm" variant="ghost" disabled className="w-full">
          <Lock className="h-3.5 w-3.5" /> Chests only
        </Button>
      ) : (
        <Button
          size="sm"
          variant={affordable ? 'coin' : 'ghost'}
          className="w-full"
          disabled={!affordable}
          onClick={onBuy}
        >
          <Coins className="h-3.5 w-3.5" /> {formatNumber(item.price)}
        </Button>
      )}
    </motion.div>
  );
}
