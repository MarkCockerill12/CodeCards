'use client';

import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'coin';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-sky-500/90 text-slate-950 hover:bg-sky-400 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.8)]',
  ghost: 'bg-white/5 text-[var(--fg)] hover:bg-white/10',
  outline: 'border border-[var(--panel-border)] text-[var(--fg)] hover:bg-white/5',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
  coin: 'bg-amber-400/90 text-slate-950 hover:bg-amber-300',
};

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-xl gap-2',
  lg: 'text-base px-6 py-3 rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'disabled:opacity-40 disabled:pointer-events-none select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Panel({
  className,
  children,
  id,
  as: As = 'div',
}: {
  className?: string;
  children: ReactNode;
  id?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}) {
  return (
    <As id={id} className={cn('panel p-5', className)}>
      {children}
    </As>
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-medium',
        'border border-white/10 bg-white/5',
        className,
      )}
      style={color ? { color, borderColor: `${color}44`, background: `${color}18` } : undefined}
    >
      {children}
    </span>
  );
}

export function Progress({
  value,
  className,
  fillClassName,
  height = 10,
}: {
  value: number;
  className?: string;
  fillClassName?: string;
  height?: number;
}) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-white/8', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn('h-full rounded-full xp-fill', fillClassName)}
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 6,
  color = 'var(--color-accent)',
  track = 'rgba(148,163,184,0.18)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-[0.68rem] uppercase tracking-wider muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-xs muted">{hint}</div> : null}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd">{children}</span>;
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="text-3xl opacity-70">🗂️</div>
      <div className="text-lg font-medium">{title}</div>
      {hint ? <p className="max-w-md text-sm muted">{hint}</p> : null}
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
      {label ?? 'Loading…'}
    </div>
  );
}
