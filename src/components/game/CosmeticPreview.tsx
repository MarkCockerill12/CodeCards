'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { CardFlip } from '@/components/cards/Flashcard';
import { Sprite } from '@/components/ui/Sprite';
import { Progress } from '@/components/ui/primitives';
import { COSMETIC_BY_ID } from '@/data/cosmetics';
import { useStore } from '@/lib/store';
import { previewPack } from '@/lib/sound';
import type { Cosmetic } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * What a cosmetic actually looks (or sounds) like, in a fixed-size box: used by the shop and by
 * chest rewards. The box carries the item's own CSS variables, which override the equipped
 * item's variables on <html> for everything inside it, so the preview is the real styling.
 */
export function CosmeticPreview({ item, className }: { item: Cosmetic; className?: string }) {
  const cursor = item.category === 'cursor' ? item.vars?.['--app-cursor'] : undefined;
  return (
    <div
      className={cn(
        'relative grid h-28 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]',
        className,
      )}
      style={{ ...(item.vars as CSSProperties), cursor, background: item.swatch }}
      data-cursor-preview={cursor ? item.id : undefined}
    >
      <PreviewBody item={item} />
    </div>
  );
}

function Hint({ children }: { children: string }) {
  return (
    <span className="absolute bottom-1 right-2 text-[0.6rem] uppercase tracking-wider muted">
      {children}
    </span>
  );
}

function PreviewBody({ item }: { item: Cosmetic }) {
  const name = useStore((s) => s.displayName);
  const mascotId = useStore((s) => s.equipped.mascot);
  const mascot = COSMETIC_BY_ID.get(mascotId)?.sprite ?? 'duck';

  switch (item.category) {
    case 'cardSkin':
      return (
        <div className="flashcard w-44 px-3 py-2.5 text-left">
          <div
            className="text-[0.55rem] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--card-accent)' }}
          >
            Concept
          </div>
          <div className="mt-1 text-xs font-semibold leading-snug">What does a closure capture?</div>
        </div>
      );
    case 'cardBack':
      // Drawn over your equipped skin, the way you will see it after a flip.
      return (
        <div className="flashcard flashcard-face-back w-44 px-3 py-2.5 text-left">
          <div className="text-[0.55rem] font-semibold uppercase tracking-wider opacity-70">Answer</div>
          <div className="mt-1 text-xs leading-snug">The variables of the scope it was created in.</div>
        </div>
      );
    case 'flipAnimation':
      return <FlipPreview animation={item.id} />;
    case 'syntaxTheme':
      return <SyntaxPreview theme={item.id} />;
    case 'background':
      return (
        <div className="bg-preview grid place-items-center">
          <div className="panel relative z-10 w-36 px-3 py-2 text-left">
            <div className="text-xs font-semibold">Welcome back</div>
            <div className="text-[0.6rem] muted">12 cards due today</div>
          </div>
        </div>
      );
    case 'cursor':
      return <Hint>Hover to try</Hint>;
    case 'soundPack':
      return <SoundPreview pack={item.id} />;
    case 'mascot':
    case 'chestSkin':
      return item.sprite ? <Sprite name={item.sprite} size={72} /> : null;
    case 'frame':
      return (
        <span className="frame-ring grid h-14 w-14 place-items-center rounded-full bg-white/5">
          <Sprite name={mascot} size={48} />
        </span>
      );
    case 'xpBar':
      return (
        <div className="w-3/4">
          <Progress value={0.65} height={10} />
        </div>
      );
    case 'nameColor':
      return <span className="display-name text-2xl font-semibold">{name || 'Your name'}</span>;
    default:
      return null;
  }
}

function FlipPreview({ animation }: { animation: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ perspective: 600 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="w-28">
        <CardFlip
          flipped={flipped}
          animation={animation}
          faceClassName="grid h-16 place-items-center text-sm font-semibold"
          front="Q"
          back="A"
        />
      </div>
      <Hint>Hover to flip</Hint>
    </div>
  );
}

let samples: Promise<Record<string, string>> | undefined;

/** Single-theme renders of one snippet, emitted by build-content.mjs. Fetched once per tab. */
function loadSamples() {
  samples ??= fetch('/content/syntax-samples.json')
    .then((r) => r.json() as Promise<Record<string, string>>)
    .catch((err) => {
      samples = undefined;
      throw err;
    });
  return samples;
}

function SyntaxPreview({ theme }: { theme: string }) {
  const [html, setHtml] = useState<string>();
  useEffect(() => {
    let live = true;
    loadSamples()
      .then((all) => live && setHtml(all[theme]))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [theme]);
  if (!html) return <span className="text-xs muted">Loading…</span>;
  // Our own build output for a fixed snippet, not user content.
  return <div className="w-full px-2" dangerouslySetInnerHTML={{ __html: html }} />;
}

function SoundPreview({ pack }: { pack: string }) {
  const silent = pack === 'sound-off';
  return (
    <button
      type="button"
      disabled={silent}
      onClick={() => previewPack(pack)}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-60"
    >
      {silent ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {silent ? 'No sound' : 'Preview'}
    </button>
  );
}
