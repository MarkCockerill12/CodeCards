'use client';

import { useEffect } from 'react';
import { COSMETIC_BY_ID } from '@/data/cosmetics';
import { useStore } from '@/lib/store';
import { setMuted, setSoundPack } from '@/lib/sound';
import type { Cosmetic } from '@/lib/types';

/**
 * Applies every equipped cosmetic as CSS custom properties + marker classes on <html>.
 *
 * Doing it at the document root (rather than threading props through components) means a
 * cosmetic can restyle anything — cards, backgrounds, the cursor — without any component
 * knowing cosmetics exist.
 */
export function CosmeticProvider({ children }: { children: React.ReactNode }) {
  const equipped = useStore((s) => s.equipped);
  const soundEnabled = useStore((s) => s.settings.soundEnabled);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    const root = document.documentElement;
    const items = Object.values(equipped)
      .map((id) => COSMETIC_BY_ID.get(id))
      .filter(Boolean) as Cosmetic[];

    const appliedVars: string[] = [];
    const appliedClasses: string[] = [];

    for (const item of items) {
      for (const [key, value] of Object.entries(item.vars ?? {})) {
        root.style.setProperty(key, value);
        appliedVars.push(key);
      }
      if (item.className) {
        root.classList.add(item.className);
        appliedClasses.push(item.className);
      }
    }

    root.dataset.syntax = equipped.syntaxTheme ?? 'default';

    const nameCosmetic = COSMETIC_BY_ID.get(equipped.nameColor);
    if (nameCosmetic?.vars?.['--name-clip'] === 'text') root.dataset.nameclip = 'text';
    else delete root.dataset.nameclip;

    return () => {
      for (const key of appliedVars) root.style.removeProperty(key);
      for (const cls of appliedClasses) root.classList.remove(cls);
    };
  }, [equipped]);

  useEffect(() => {
    setSoundPack(equipped.soundPack ?? 'sound-off');
    setMuted(!soundEnabled);
  }, [equipped.soundPack, soundEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.ready = 'true';
  }, [hydrated]);

  return <>{children}</>;
}
