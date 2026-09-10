'use client';

import { Fragment, type ReactNode } from 'react';

/**
 * Deliberately tiny inline formatter — `code`, **bold**, *italic*, bullet lists and
 * paragraph breaks. Content is authored by us and validated at build time, so there is
 * no untrusted HTML anywhere and no need for a full markdown dependency.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split('\n').filter((line) => line.trim().length > 0);
  const out: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length === 0) return;
    out.push(
      <ul key={key}>
        {bullets.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  blocks.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      bullets.push(trimmed.slice(2));
      return;
    }
    flush(`ul-${i}`);
    out.push(<p key={`p-${i}`}>{inline(trimmed)}</p>);
  });
  flush('ul-end');

  return <div className={`answer-prose ${className ?? ''}`}>{out}</div>;
}

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function inline(text: string): ReactNode {
  const parts = text.split(TOKEN).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Renders a cloze prompt, styling the ___ blank so it reads as a gap, not a typo. */
export function ClozePrompt({ text }: { text: string }) {
  const parts = text.split('___');
  return (
    <span>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {inline(part)}
          {i < parts.length - 1 ? (
            <span className="mx-1 inline-block min-w-16 border-b-2 border-dashed border-[var(--card-accent)] align-middle" />
          ) : null}
        </Fragment>
      ))}
    </span>
  );
}
