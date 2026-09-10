'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Coins,
  Gift,
  Home,
  Map,
  Settings,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { levelFromXp, titleForLevel } from '@/data/levels';
import { COSMETIC_BY_ID } from '@/data/cosmetics';
import { Progress } from '@/components/ui/primitives';
import { formatNumber } from '@/lib/economy';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/path', label: 'Path', icon: Map },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const xp = useStore((s) => s.xp);
  const coins = useStore((s) => s.coins);
  const chests = useStore((s) => s.pendingChests.length);
  const name = useStore((s) => s.displayName);
  const mascotId = useStore((s) => s.equipped.mascot);
  const hydrated = useStore((s) => s.hydrated);

  const level = levelFromXp(xp);
  const mascot = COSMETIC_BY_ID.get(mascotId)?.swatch ?? '🦆';
  const isStudy = pathname?.startsWith('/study');

  if (isStudy) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--panel-border)] bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="text-xl">🃏</span>
            <span className="hidden sm:inline">CodeCards</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    active ? 'bg-white/10 text-white' : 'muted hover:bg-white/5',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {chests > 0 ? (
              <Link
                href="/shop#chests"
                className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-violet-200 ring-1 ring-violet-400/30"
              >
                <Gift className="h-3.5 w-3.5" />
                {chests}
              </Link>
            ) : null}

            <span className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/25">
              <Coins className="h-3.5 w-3.5" />
              {hydrated ? formatNumber(coins) : '—'}
            </span>

            <Link href="/stats" className="hidden items-center gap-2 sm:flex">
              <div className="text-right">
                <div className="display-name text-xs font-semibold leading-tight">{name}</div>
                <div className="text-[0.65rem] leading-tight muted">
                  Lv {level.level} · {titleForLevel(level.level)}
                </div>
              </div>
              <span className="frame-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-lg">
                {mascot}
              </span>
            </Link>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-2">
          <Sparkles className="h-3 w-3 text-sky-300" />
          <Progress value={hydrated ? level.ratio : 0} height={6} className="flex-1" />
          <span className="w-24 text-right font-mono text-[0.65rem] muted">
            {hydrated ? `${formatNumber(level.intoLevel)}/${formatNumber(level.needed)}` : ''}
          </span>
        </div>
      </header>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--panel-border)] bg-slate-950/90 backdrop-blur-xl md:hidden">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.6rem]',
                active ? 'text-sky-300' : 'muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
