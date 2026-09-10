'use client';

import { ArrowRight, Clock, HardDrive, Bug, Terminal } from 'lucide-react';
import type { Card } from '@/lib/types';
import { CARD_TYPE_LABEL, DIFFICULTY_LABEL } from '@/lib/content';
import { ClozePrompt, RichText } from './RichText';
import { Badge } from '@/components/ui/primitives';

export function CodeBlock({ card }: { card: Card }) {
  if (!card.codeHtml) {
    return card.code ? (
      <pre className="shiki overflow-x-auto bg-slate-950/60">
        <code>{card.code}</code>
      </pre>
    ) : null;
  }
  // Built by Shiki at build time from content we author — never user input.
  return <div dangerouslySetInnerHTML={{ __html: card.codeHtml }} />;
}

export function CardHeader({ card }: { card: Card }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Badge color="var(--card-accent)">{CARD_TYPE_LABEL[card.type]}</Badge>
      <Badge>{DIFFICULTY_LABEL[card.difficulty]}</Badge>
      <span className="ml-auto font-mono text-[0.65rem] opacity-50">
        {card.tags[0]}
      </span>
    </div>
  );
}

/** The prompt side. Every type resolves to "something to think about", never an input. */
export function CardFront({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col">
      <CardHeader card={card} />

      {card.type === 'cloze' ? (
        <div className="text-xl leading-relaxed">
          <ClozePrompt text={card.prompt} />
        </div>
      ) : (
        <div className="text-xl leading-relaxed font-medium">
          <RichText text={card.prompt} />
        </div>
      )}

      {card.type === 'spot-bug' ? (
        <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
          <Bug className="h-3.5 w-3.5" /> Something in here is wrong.
        </div>
      ) : null}

      {card.code ? (
        <div className="mt-4 min-w-0">
          <CodeBlock card={card} />
        </div>
      ) : null}

      {card.type === 'predict-output' ? (
        <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
          <Terminal className="h-3.5 w-3.5" /> What lands on stdout?
        </div>
      ) : null}

      {card.type === 'compare' && card.columns ? (
        <div className="mt-4 flex items-center gap-3 text-sm opacity-80">
          <span className="font-medium">{card.columns.left.title}</span>
          <ArrowRight className="h-4 w-4 opacity-50" />
          <span className="font-medium">{card.columns.right.title}</span>
        </div>
      ) : null}
    </div>
  );
}

/** The reveal side: the answer, then the why, then the type-specific extras. */
export function CardBack({ card, showExplanation }: { card: Card; showExplanation: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <CardHeader card={card} />

      {card.type === 'compare' && card.columns ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <ComparePane title={card.columns.left.title} points={card.columns.left.points} />
          <ComparePane title={card.columns.right.title} points={card.columns.right.points} />
        </div>
      ) : card.type === 'complexity' && card.complexity ? (
        <div className="flex flex-wrap gap-3">
          <ComplexityChip icon={<Clock className="h-4 w-4" />} label="Time" value={card.complexity.time} />
          {card.complexity.space ? (
            <ComplexityChip
              icon={<HardDrive className="h-4 w-4" />}
              label="Space"
              value={card.complexity.space}
            />
          ) : null}
        </div>
      ) : card.type === 'predict-output' ? (
        <pre className="shiki whitespace-pre-wrap bg-slate-950/70 text-[0.9rem]">
          <code>{card.answer}</code>
        </pre>
      ) : (
        <div className="text-lg font-medium leading-relaxed">
          <RichText text={card.answer} />
        </div>
      )}

      {(card.type === 'compare' || card.type === 'complexity') && card.answer ? (
        <div className="mt-3 text-sm font-medium opacity-90">
          <RichText text={card.answer} />
        </div>
      ) : null}

      {showExplanation ? (
        <div className="mt-4 border-t border-[color:var(--card-border)] pt-3 text-sm opacity-90">
          <RichText text={card.explanation} />
        </div>
      ) : null}
    </div>
  );
}

function ComparePane({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-xl border border-[color:var(--card-border)] bg-black/15 p-3">
      <div className="mb-2 text-sm font-semibold" style={{ color: 'var(--card-accent)' }}>
        {title}
      </div>
      <ul className="space-y-1.5 text-sm">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="opacity-40">›</span>
            <span>
              <RichText text={p} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComplexityChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--card-border)] bg-black/20 px-3 py-2">
      <span className="opacity-70">{icon}</span>
      <span className="text-xs uppercase tracking-wider opacity-60">{label}</span>
      <span className="font-mono text-base font-semibold" style={{ color: 'var(--card-accent)' }}>
        {value}
      </span>
    </div>
  );
}
