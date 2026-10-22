import { SPRITE_SIZE, spriteRects, type SpriteName } from '@/data/sprites';
import { cn } from '@/lib/utils';

/**
 * A CodeCards pixel-art sprite (mascots, chest skins), `size` px square. Keep it a multiple of
 * 24 (24/48/72) so every art pixel lands on whole screen pixels.
 */
export function Sprite({ name, size, className }: { name: SpriteName; size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`}
      shapeRendering="crispEdges"
      aria-hidden
      className={cn('inline-block shrink-0', className)}
    >
      {spriteRects(name).map((r) => (
        <path key={r.fill} fill={r.fill} d={r.d} />
      ))}
    </svg>
  );
}
