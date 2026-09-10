'use client';

import { AnimatePresence, motion, type Transition } from 'framer-motion';
import type { Card } from '@/lib/types';
import { CardBack, CardFront } from './CardFaces';
import { cn } from '@/lib/utils';

/**
 * The flashcard shell.
 *
 * Two rendering strategies: genuine 3D flips (front and back stacked in one grid cell so
 * the card sizes to whichever face is taller), and 2D transitions where only one face is
 * mounted at a time. Which one you get is a purchasable cosmetic.
 */

const THREE_D = new Set(['flip-standard', 'flip-vertical', 'flip-page']);

const SPRING: Transition = { type: 'spring', stiffness: 210, damping: 24 };

export function Flashcard({
  card,
  flipped,
  onFlip,
  showExplanation,
  animation = 'flip-standard',
  className,
}: {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  showExplanation: boolean;
  animation?: string;
  className?: string;
}) {
  const is3d = THREE_D.has(animation);
  const axis = animation === 'flip-vertical' ? 'rotateX' : 'rotateY';

  return (
    <div
      className={cn('w-full select-none', className)}
      style={{ perspective: 1600 }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Answer. Click to flip back.' : 'Question. Click to reveal.'}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      {is3d ? (
        <motion.div
          className="grid"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            [axis]: flipped ? 180 : 0,
            ...(animation === 'flip-page' ? { skewY: flipped ? -1.5 : 0 } : {}),
          }}
          transition={animation === 'flip-page' ? { duration: 0.65, ease: [0.4, 0, 0.2, 1] } : SPRING}
        >
          <Face gridStacked hidden={flipped} style={{ backfaceVisibility: 'hidden' }} back={false}>
            <CardFront card={card} />
          </Face>
          <Face
            gridStacked
            hidden={!flipped}
            style={{
              backfaceVisibility: 'hidden',
              transform: axis === 'rotateX' ? 'rotateX(180deg)' : 'rotateY(180deg)',
            }}
            back
          >
            <CardBack card={card} showExplanation={showExplanation} />
          </Face>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flipped ? 'back' : 'front'}
            initial={enter(animation)}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={exit(animation)}
            transition={animation === 'flip-glitch' ? { duration: 0.22 } : { duration: 0.3 }}
          >
            <Face back={flipped}>
              {flipped ? (
                <CardBack card={card} showExplanation={showExplanation} />
              ) : (
                <CardFront card={card} />
              )}
            </Face>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function enter(animation: string) {
  switch (animation) {
    case 'flip-dissolve':
      return { opacity: 0, filter: 'blur(8px)', scale: 0.98 };
    case 'flip-glitch':
      return { opacity: 0, x: -8, skewX: 12, filter: 'hue-rotate(90deg)' };
    case 'flip-shuffle':
      return { opacity: 0, x: 120, rotate: 4 };
    default:
      return { opacity: 0 };
  }
}

function exit(animation: string) {
  switch (animation) {
    case 'flip-dissolve':
      return { opacity: 0, filter: 'blur(8px)', scale: 1.02 };
    case 'flip-glitch':
      return { opacity: 0, x: 8, skewX: -12, filter: 'hue-rotate(-90deg)' };
    case 'flip-shuffle':
      return { opacity: 0, x: -120, rotate: -4 };
    default:
      return { opacity: 0 };
  }
}

function Face({
  children,
  back,
  hidden,
  style,
  gridStacked,
}: {
  children: React.ReactNode;
  back: boolean;
  hidden?: boolean;
  style?: React.CSSProperties;
  gridStacked?: boolean;
}) {
  return (
    <div
      className={cn(
        'flashcard min-h-[22rem] p-6 sm:p-8',
        !back && 'flashcard-face-front',
        back && 'flashcard-face-back',
        gridStacked && 'col-start-1 row-start-1',
      )}
      style={style}
      aria-hidden={hidden}
    >
      {children}
    </div>
  );
}
