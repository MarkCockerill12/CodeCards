'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Sparkles, Trophy, Flag } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { useStore } from '@/lib/store';
import { titleForLevel } from '@/data/levels';
import { play } from '@/lib/sound';
import { formatNumber } from '@/lib/economy';

/** Full-screen celebration for level-ups, module completions and checkpoint passes. */
export function RewardOverlay() {
  const event = useStore((s) => s.rewardQueue[0]);
  const shiftReward = useStore((s) => s.shiftReward);

  useEffect(() => {
    if (!event) return;
    play(event.kind === 'levelup' ? 'levelup' : 'complete');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        shiftReward();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, shiftReward]);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          key={event.id}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={shiftReward}
        >
          <motion.div
            className="panel relative w-full max-w-sm overflow-hidden p-8 text-center"
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Burst />
            {event.kind === 'levelup' ? (
              <>
                <Trophy className="mx-auto h-10 w-10 text-amber-300" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] muted">Level up</div>
                <div className="mt-1 text-5xl font-bold">{event.level}</div>
                <div className="mt-1 text-sm text-sky-300">{titleForLevel(event.level ?? 1)}</div>
              </>
            ) : event.kind === 'module' ? (
              <>
                <Sparkles className="mx-auto h-10 w-10 text-violet-300" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] muted">Module complete</div>
                <div className="mt-1 text-2xl font-semibold">{event.moduleName}</div>
              </>
            ) : (
              <>
                <Flag className="mx-auto h-10 w-10 text-emerald-300" />
                <div className="mt-3 text-xs uppercase tracking-[0.2em] muted">Checkpoint passed</div>
                <div className="mt-1 text-2xl font-semibold">Nicely done</div>
              </>
            )}

            <div className="mt-5 flex items-center justify-center gap-4 text-sm">
              {event.xp ? (
                <span className="inline-flex items-center gap-1.5 text-sky-300">
                  <Sparkles className="h-4 w-4" /> +{formatNumber(event.xp)} XP
                </span>
              ) : null}
              {event.coins ? (
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <Coins className="h-4 w-4" /> +{formatNumber(event.coins)}
                </span>
              ) : null}
            </div>

            {event.kind === 'levelup' || event.kind === 'module' ? (
              <p className="mt-3 text-xs muted">
                A {event.kind === 'module' ? 'epic' : 'rare'} chest is waiting for you.
              </p>
            ) : null}

            <Button className="mt-6 w-full" onClick={shiftReward}>
              Continue
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Burst() {
  const rays = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
      {rays.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-sky-300/70"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0.4],
            x: Math.cos((i / rays.length) * Math.PI * 2) * 140,
            y: Math.sin((i / rays.length) * Math.PI * 2) * 140,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.1, delay: 0.05 * (i % 5), ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
