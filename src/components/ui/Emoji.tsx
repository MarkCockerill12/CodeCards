import ASSETS from '@/data/emoji-assets.json';
import { cn } from '@/lib/utils';

const assets: Record<string, string> = ASSETS;

/**
 * An emoji drawn from the bundled Fluent Emoji set (MIT, see public/emoji/LICENSE.txt), so it
 * looks the same on every OS instead of depending on the system emoji font. It is 1em square,
 * so it follows the surrounding font size exactly like the glyph it replaces. Glyphs without an
 * asset (∑, λ) fall back to plain text.
 */
export function Emoji({ char, className }: { char: string; className?: string }) {
  const slug = assets[char];
  if (!slug) return <span className={className}>{char}</span>;
  return (
    <img
      src={`/emoji/${slug}.svg`}
      alt=""
      draggable={false}
      className={cn('inline-block h-[1em] w-[1em] align-[-0.125em]', className)}
    />
  );
}
