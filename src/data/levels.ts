/**
 * Level curve. `requirement(L)` is the XP needed to go from level L to L+1.
 * Deliberately shallow early (fast first hour) and steep later (long tail).
 */
export function requirement(level: number): number {
  return Math.round(80 * Math.pow(level, 1.45));
}

/** Cumulative XP needed to *reach* a level (level 1 starts at 0). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) total += requirement(l);
  return total;
}

export interface LevelProgress {
  level: number;
  intoLevel: number;
  needed: number;
  ratio: number;
}

export function levelFromXp(xp: number): LevelProgress {
  let level = 1;
  let remaining = xp;
  for (;;) {
    const need = requirement(level);
    if (remaining < need) {
      return { level, intoLevel: remaining, needed: need, ratio: remaining / need };
    }
    remaining -= need;
    level += 1;
    // Hard ceiling keeps the loop finite even for absurd XP values.
    if (level > 999) return { level, intoLevel: 0, needed: requirement(level), ratio: 0 };
  }
}

/** Cosmetic titles awarded purely by level — flavour, no mechanical effect. */
export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: 'Hello, World' },
  { level: 3, title: 'Script Kiddie' },
  { level: 5, title: 'Junior Dev' },
  { level: 8, title: 'Stack Tracer' },
  { level: 12, title: 'Refactorer' },
  { level: 16, title: 'Systems Thinker' },
  { level: 20, title: 'Senior Engineer' },
  { level: 25, title: 'Architect' },
  { level: 30, title: 'Kernel Whisperer' },
  { level: 40, title: 'Principal' },
  { level: 50, title: 'Distinguished' },
  { level: 65, title: 'Compiler' },
  { level: 80, title: 'Singularity' },
  { level: 100, title: 'Root' },
];

export function titleForLevel(level: number): string {
  let title = LEVEL_TITLES[0].title;
  for (const entry of LEVEL_TITLES) if (level >= entry.level) title = entry.title;
  return title;
}
