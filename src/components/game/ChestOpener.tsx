'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Gift } from 'lucide-react';
import { Button, Panel } from '@/components/ui/primitives';
import { useStore } from '@/lib/store';
import { CHEST_META } from '@/data/chests';
import { COSMETIC_BY_ID, CATEGORY_LABEL, RARITY_COLOR } from '@/data/cosmetics';
import type { ChestReward } from '@/lib/types';
import { play } from '@/lib/sound';
import { formatNumber } from '@/lib/economy';

/** The chest queue: one card per unopened chest, opened with a shake-and-burst. */
export function ChestOpener({ compact = false }: { compact?: boolean }) {
  const pending = useStore((s) => s.pendingChests);
  const openPendingChest = useStore((s) => s.openPendingChest);
  const chestSkin = useStore((s) => s.equipped.chestSkin);
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<ChestReward | null>(null);

  const skinEmoji = COSMETIC_BY_ID.get(chestSkin)?.swatch ?? '📦';
  const next = pending[0];

  const open = () => {
    if (!next || opening) return;
    setOpening(true);
    play('chest');
    window.setTimeout(() => {
      const result = openPendingChest();
      setReward(result);
      setOpening(false);
    }, 900);
  };

  if (!next && !reward) {
    if (compact) return null;
    return (
      <Panel className="flex items-center gap-3 text-sm muted">
        <Gift className="h-5 w-5 opacity-60" />
        No chests waiting. Level up, finish a module, or get lucky mid-session.
      </Panel>
    );
  }

  const meta = next ? CHEST_META[next] : null;

  return (
    <Panel className="flex flex-col items-center gap-4 text-center">
      <AnimatePresence mode="wait">
        {reward ? (
          <motion.div
            key="reward"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-5xl">{CHEST_META[reward.tier].emoji}</div>
            <div className="text-xs uppercase tracking-widest muted">
              {CHEST_META[reward.tier].name}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-amber-300">
              <Coins className="h-5 w-5" /> +{formatNumber(reward.coins + (reward.bonusCoins ?? 0))}
            </div>
            {reward.bonusCoins ? (
              <p className="text-xs muted">
                You already own everything at that rarity — paid out as bonus coins instead.
              </p>
            ) : null}
            {reward.cosmeticId ? <UnlockedCosmetic id={reward.cosmeticId} /> : null}
            <Button className="mt-2" onClick={() => setReward(null)}>
              {pending.length > 0 ? `Open next (${pending.length})` : 'Nice'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="chest"
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              onClick={open}
              className="text-6xl"
              aria-label={`Open ${meta?.name}`}
              animate={
                opening
                  ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.06, 1.1, 1.06, 1.2, 0.9] }
                  : { y: [0, -6, 0] }
              }
              transition={
                opening
                  ? { duration: 0.9, ease: 'easeInOut' }
                  : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              {skinEmoji}
            </motion.button>
            <div>
              <div className="font-medium" style={{ color: meta?.color }}>
                {meta?.name}
              </div>
              <div className="text-xs muted">
                {pending.length} chest{pending.length === 1 ? '' : 's'} waiting
              </div>
            </div>
            <Button onClick={open} disabled={opening} size="sm">
              {opening ? 'Opening…' : 'Open'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function UnlockedCosmetic({ id }: { id: string }) {
  const cosmetic = COSMETIC_BY_ID.get(id);
  const equip = useStore((s) => s.equip);
  if (!cosmetic) return null;
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="mt-2 w-full rounded-xl border p-3"
      style={{
        borderColor: `${RARITY_COLOR[cosmetic.rarity]}55`,
        background: `${RARITY_COLOR[cosmetic.rarity]}12`,
      }}
    >
      <div className="text-[0.65rem] uppercase tracking-widest" style={{ color: RARITY_COLOR[cosmetic.rarity] }}>
        {cosmetic.rarity} · {CATEGORY_LABEL[cosmetic.category]}
      </div>
      <div className="mt-1 font-medium">{cosmetic.name}</div>
      <div className="text-xs muted">{cosmetic.description}</div>
      <Button size="sm" variant="ghost" className="mt-2" onClick={() => equip(cosmetic.id)}>
        Equip now
      </Button>
    </motion.div>
  );
}
