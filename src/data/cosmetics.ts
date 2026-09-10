import type { Cosmetic, CosmeticCategory, Rarity } from '@/lib/types';

export const RARITY_PRICE: Record<Rarity, number> = {
  common: 250,
  rare: 600,
  epic: 1400,
  legendary: 3000,
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#94a3b8',
  rare: '#38bdf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
};

export const CATEGORY_LABEL: Record<CosmeticCategory, string> = {
  cardSkin: 'Card Skins',
  cardBack: 'Card Backs',
  flipAnimation: 'Flip Animations',
  syntaxTheme: 'Syntax Themes',
  background: 'Backgrounds',
  cursor: 'Cursors',
  soundPack: 'Sound Packs',
  mascot: 'Mascots',
  frame: 'Profile Frames',
  xpBar: 'XP Bars',
  chestSkin: 'Chest Skins',
  nameColor: 'Name Colours',
};

const c = (
  id: string,
  category: CosmeticCategory,
  name: string,
  description: string,
  rarity: Rarity,
  extra: Partial<Cosmetic> = {},
): Cosmetic => ({
  id,
  category,
  name,
  description,
  rarity,
  price: extra.price ?? RARITY_PRICE[rarity],
  ...extra,
});

/* ------------------------------------------------------------------ */
/* Card skins — the face of the flashcard                              */
/* ------------------------------------------------------------------ */
const cardSkins: Cosmetic[] = [
  c('skin-slate', 'cardSkin', 'Slate', 'The clean default. Nothing to prove.', 'common', {
    price: 0,
    swatch: 'linear-gradient(145deg,#1e293b,#0f172a)',
    vars: {
      '--card-bg': 'linear-gradient(145deg,#1e293b,#0f172a)',
      '--card-border': 'rgba(148,163,184,0.22)',
      '--card-fg': '#e2e8f0',
      '--card-accent': '#38bdf8',
      '--card-glow': '0 24px 60px -20px rgba(2,6,23,0.9)',
    },
  }),
  c('skin-paper', 'cardSkin', 'Index Card', 'Ruled paper, red margin, faint coffee ring.', 'common', {
    swatch: 'repeating-linear-gradient(#fdfaf1,#fdfaf1 22px,#dce6f2 23px)',
    vars: {
      '--card-bg':
        'repeating-linear-gradient(#fdfaf1,#fdfaf1 26px,#dbe6f3 27px), #fdfaf1',
      '--card-border': 'rgba(120,90,60,0.35)',
      '--card-fg': '#1f2937',
      '--card-accent': '#b91c1c',
      '--card-glow': '0 18px 40px -18px rgba(60,40,20,0.55)',
    },
  }),
  c('skin-crt', 'cardSkin', 'CRT Terminal', 'Phosphor green on black, scanlines included.', 'rare', {
    className: 'skin-crt',
    swatch: 'linear-gradient(#001b0d,#012616)',
    vars: {
      '--card-bg': 'linear-gradient(#00170c,#012a18)',
      '--card-border': 'rgba(34,197,94,0.5)',
      '--card-fg': '#7CFFB2',
      '--card-accent': '#22c55e',
      '--card-font': 'var(--font-mono)',
      '--card-glow': '0 0 40px -6px rgba(34,197,94,0.45)',
    },
  }),
  c('skin-glass', 'cardSkin', 'Frosted Glass', 'Translucent, blurred, weightless.', 'rare', {
    className: 'skin-glass',
    swatch: 'linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.08))',
    vars: {
      '--card-bg': 'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))',
      '--card-border': 'rgba(255,255,255,0.35)',
      '--card-fg': '#f8fafc',
      '--card-accent': '#a5f3fc',
      '--card-glow': '0 20px 60px -18px rgba(56,189,248,0.35)',
    },
  }),
  c('skin-blueprint', 'cardSkin', 'Blueprint', 'Drafting grid and cyan ink.', 'rare', {
    swatch: 'linear-gradient(#0b3d91,#082f6f)',
    vars: {
      '--card-bg':
        'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px),#0b3d91',
      '--card-bg-size': '22px 22px, 22px 22px, auto',
      '--card-border': 'rgba(191,219,254,0.5)',
      '--card-fg': '#dbeafe',
      '--card-accent': '#93c5fd',
      '--card-glow': '0 20px 50px -20px rgba(11,61,145,0.9)',
    },
  }),
  c('skin-sticky', 'cardSkin', 'Sticky Note', 'Highlighter yellow, slightly crooked.', 'common', {
    className: 'skin-sticky',
    swatch: 'linear-gradient(160deg,#fde68a,#fcd34d)',
    vars: {
      '--card-bg': 'linear-gradient(160deg,#fef3c7,#fcd34d)',
      '--card-border': 'rgba(180,120,20,0.35)',
      '--card-fg': '#3f3010',
      '--card-accent': '#b45309',
      '--card-glow': '0 16px 34px -16px rgba(120,80,10,0.6)',
    },
  }),
  c('skin-holo', 'cardSkin', 'Holographic', 'Shifting foil that catches the light.', 'epic', {
    className: 'skin-holo',
    swatch: 'linear-gradient(120deg,#a78bfa,#67e8f9,#fca5a5,#a78bfa)',
    vars: {
      '--card-bg':
        'linear-gradient(120deg,#4c1d95,#0e7490,#831843,#4c1d95)',
      '--card-border': 'rgba(233,213,255,0.6)',
      '--card-fg': '#f5f3ff',
      '--card-accent': '#e9d5ff',
      '--card-glow': '0 24px 70px -18px rgba(167,139,250,0.6)',
    },
  }),
  c('skin-carbon', 'cardSkin', 'Carbon Fibre', 'Woven matte black. Very fast, allegedly.', 'rare', {
    swatch: 'repeating-conic-gradient(#1c1c1c 0 25%, #2a2a2a 0 50%) 0 0/10px 10px',
    vars: {
      '--card-bg': 'repeating-conic-gradient(#181818 0 25%, #262626 0 50%) 0 0/12px 12px',
      '--card-border': 'rgba(255,255,255,0.16)',
      '--card-fg': '#f4f4f5',
      '--card-accent': '#ef4444',
      '--card-glow': '0 20px 46px -20px rgba(0,0,0,0.9)',
    },
  }),
  c('skin-vapor', 'cardSkin', 'Vaporwave', 'Sunset gradient, chrome edges, no regrets.', 'epic', {
    swatch: 'linear-gradient(160deg,#f472b6,#a855f7,#38bdf8)',
    vars: {
      '--card-bg': 'linear-gradient(160deg,#831843,#5b21b6 55%,#0c4a6e)',
      '--card-border': 'rgba(244,114,182,0.55)',
      '--card-fg': '#fdf4ff',
      '--card-accent': '#f0abfc',
      '--card-glow': '0 26px 70px -22px rgba(168,85,247,0.7)',
    },
  }),
  c('skin-obsidian', 'cardSkin', 'Obsidian', 'Volcanic glass with a molten seam.', 'legendary', {
    className: 'skin-obsidian',
    swatch: 'linear-gradient(150deg,#0a0a0a,#1c1917 60%,#7c2d12)',
    vars: {
      '--card-bg': 'linear-gradient(150deg,#09090b,#18181b 55%,#3f1206)',
      '--card-border': 'rgba(249,115,22,0.5)',
      '--card-fg': '#fafaf9',
      '--card-accent': '#fb923c',
      '--card-glow': '0 30px 80px -24px rgba(249,115,22,0.45)',
    },
  }),
];

/* ------------------------------------------------------------------ */
/* Card backs — what you stare at before the flip                      */
/* ------------------------------------------------------------------ */
const cardBacks: Cosmetic[] = [
  c('back-plain', 'cardBack', 'Plain Back', 'Matches your card skin exactly.', 'common', {
    price: 0,
    swatch: 'linear-gradient(145deg,#1e293b,#0f172a)',
    vars: { '--card-back-pattern': 'none' },
  }),
  c('back-circuit', 'cardBack', 'Circuit Trace', 'PCB routing in soft copper.', 'common', {
    swatch: 'radial-gradient(#f59e0b 1px,transparent 1px) 0 0/12px 12px, #0f172a',
    vars: {
      '--card-back-pattern':
        'linear-gradient(90deg,rgba(245,158,11,0.18) 1px,transparent 1px),linear-gradient(rgba(245,158,11,0.18) 1px,transparent 1px)',
      '--card-back-size': '24px 24px',
    },
  }),
  c('back-binary', 'cardBack', 'Binary Rain', 'Ones and zeroes, drifting down.', 'rare', {
    className: 'back-binary',
    swatch: 'linear-gradient(#022c22,#064e3b)',
    vars: { '--card-back-pattern': 'none', '--card-back-tint': 'rgba(16,185,129,0.14)' },
  }),
  c('back-hex', 'cardBack', 'Hex Dump', 'Offsets and bytes, all the way down.', 'common', {
    swatch: 'linear-gradient(#111827,#1f2937)',
    vars: {
      '--card-back-pattern': 'repeating-linear-gradient(0deg,rgba(148,163,184,0.12) 0 1px,transparent 1px 18px)',
      '--card-back-size': 'auto',
    },
  }),
  c('back-tartan', 'cardBack', 'Tartan', 'Woven check, quietly smug.', 'rare', {
    swatch: 'repeating-linear-gradient(45deg,#7f1d1d 0 8px,#111827 8px 16px)',
    vars: {
      '--card-back-pattern':
        'repeating-linear-gradient(45deg,rgba(239,68,68,0.18) 0 10px,transparent 10px 20px),repeating-linear-gradient(-45deg,rgba(59,130,246,0.16) 0 10px,transparent 10px 20px)',
      '--card-back-size': 'auto',
    },
  }),
  c('back-runes', 'cardBack', 'Compiler Runes', 'Ancient symbols. Probably lifetimes.', 'epic', {
    swatch: 'radial-gradient(circle at 30% 30%,#7c3aed,#1e1b4b)',
    vars: {
      '--card-back-pattern': 'radial-gradient(circle at 30% 30%,rgba(167,139,250,0.35),transparent 60%)',
      '--card-back-size': 'auto',
    },
  }),
  c('back-starfield', 'cardBack', 'Starfield', 'Deep space with a slow parallax drift.', 'epic', {
    className: 'back-starfield',
    swatch: 'radial-gradient(circle,#fff 1px,transparent 1px) 0 0/14px 14px,#020617',
    vars: {
      '--card-back-pattern': 'radial-gradient(rgba(255,255,255,0.7) 1px,transparent 1px)',
      '--card-back-size': '26px 26px',
    },
  }),
  c('back-gold', 'cardBack', 'Gilded', 'Gold leaf. Purely for intimidation.', 'legendary', {
    swatch: 'linear-gradient(135deg,#fde68a,#b45309,#fde68a)',
    vars: {
      '--card-back-pattern':
        'linear-gradient(135deg,rgba(253,230,138,0.35),rgba(180,83,9,0.35),rgba(253,230,138,0.35))',
      '--card-back-size': 'auto',
    },
  }),
];

/* ------------------------------------------------------------------ */
/* Flip animations                                                     */
/* ------------------------------------------------------------------ */
const flips: Cosmetic[] = [
  c('flip-standard', 'flipAnimation', '3D Flip', 'A clean horizontal rotation.', 'common', {
    price: 0,
  }),
  c('flip-vertical', 'flipAnimation', 'Vertical Flip', 'Top over bottom, like a notepad.', 'common'),
  c('flip-dissolve', 'flipAnimation', 'Dissolve', 'Crossfade with a soft blur.', 'common'),
  c('flip-glitch', 'flipAnimation', 'Glitch', 'Datamosh the answer into existence.', 'rare'),
  c('flip-shuffle', 'flipAnimation', 'Deck Shuffle', 'The card slides out and back.', 'rare'),
  c('flip-page', 'flipAnimation', 'Page Turn', 'Curls over like paper.', 'epic'),
];

/* ------------------------------------------------------------------ */
/* Syntax themes — keys must match SYNTAX_THEMES in build-content.mjs   */
/* ------------------------------------------------------------------ */
const syntax: Cosmetic[] = [
  c('default', 'syntaxTheme', 'GitHub Dark', 'The one everybody already knows.', 'common', {
    price: 0,
    swatch: '#24292e',
  }),
  c('nord', 'syntaxTheme', 'Nord', 'Arctic, muted, easy on the eyes.', 'common', { swatch: '#2e3440' }),
  c('catppuccin', 'syntaxTheme', 'Catppuccin Mocha', 'Pastel warmth on a dark base.', 'common', {
    swatch: '#1e1e2e',
  }),
  c('dracula', 'syntaxTheme', 'Dracula', 'Purple night, high contrast.', 'common', { swatch: '#282a36' }),
  c('monokai', 'syntaxTheme', 'Monokai', 'The classic. Pink keywords forever.', 'rare', {
    swatch: '#272822',
  }),
  c('onedark', 'syntaxTheme', 'One Dark Pro', 'Atom heritage, still undefeated.', 'rare', {
    swatch: '#282c34',
  }),
  c('vitesse', 'syntaxTheme', 'Vitesse Dark', 'Low saturation, high focus.', 'rare', {
    swatch: '#121212',
  }),
  c('tokyo', 'syntaxTheme', 'Tokyo Night', 'Neon signs reflected in wet asphalt.', 'epic', {
    swatch: '#1a1b26',
  }),
  c('solarized', 'syntaxTheme', 'Solarized Dark', 'Scientifically fussed-over contrast.', 'epic', {
    swatch: '#002b36',
  }),
  c('gruvbox', 'syntaxTheme', 'Vitesse Black', 'Pitch black with warm accents.', 'legendary', {
    swatch: '#000000',
  }),
];

/* ------------------------------------------------------------------ */
/* Backgrounds                                                         */
/* ------------------------------------------------------------------ */
const backgrounds: Cosmetic[] = [
  c('bg-midnight', 'background', 'Midnight', 'Deep navy with a soft vignette.', 'common', {
    price: 0,
    swatch: 'radial-gradient(circle at 50% 0%,#1e293b,#020617)',
    vars: { '--app-bg': 'radial-gradient(120% 90% at 50% -10%,#16233b 0%,#020617 60%)' },
  }),
  c('bg-aurora', 'background', 'Aurora', 'Slow northern lights.', 'rare', {
    className: 'bg-anim-aurora',
    swatch: 'linear-gradient(120deg,#065f46,#1e3a8a,#4c1d95)',
    vars: {
      '--app-bg':
        'linear-gradient(130deg,#031a2c 0%,#052e2b 35%,#1e1b4b 70%,#020617 100%)',
    },
  }),
  c('bg-matrix', 'background', 'Matrix Rain', 'Falling glyphs, subtle enough to study over.', 'epic', {
    className: 'bg-anim-matrix',
    swatch: 'linear-gradient(#000,#022c22)',
    vars: { '--app-bg': 'linear-gradient(#000000,#01130c)' },
  }),
  c('bg-starfield', 'background', 'Deep Field', 'A quiet sky full of stars.', 'rare', {
    className: 'bg-anim-stars',
    swatch: 'radial-gradient(circle,#fff 1px,transparent 1px) 0 0/12px 12px,#000',
    vars: { '--app-bg': 'radial-gradient(120% 100% at 50% 0%,#0b1020,#000000 70%)' },
  }),
  c('bg-grid', 'background', 'Wireframe Grid', 'Perspective grid receding to the horizon.', 'common', {
    className: 'bg-anim-grid',
    swatch: 'linear-gradient(#0f172a,#1e1b4b)',
    vars: { '--app-bg': 'linear-gradient(#05070f,#160f2e)' },
  }),
  c('bg-lofi', 'background', 'Lo-fi Room', 'Warm lamp light and a rainy window.', 'epic', {
    swatch: 'linear-gradient(160deg,#7c2d12,#1c1917)',
    vars: { '--app-bg': 'radial-gradient(90% 80% at 70% 10%,#3b1d0f 0%,#120d0b 65%)' },
  }),
  c('bg-paper', 'background', 'Graph Paper', 'Light mode, for the brave.', 'common', {
    swatch: 'linear-gradient(#f8fafc,#e2e8f0)',
    vars: {
      '--app-bg':
        'linear-gradient(rgba(37,99,235,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.08) 1px,transparent 1px),#f8fafc',
      '--app-bg-size': '24px 24px,24px 24px,auto',
      '--fg': '#0f172a',
      '--fg-muted': '#475569',
      '--panel': 'rgba(255,255,255,0.75)',
      '--panel-border': 'rgba(15,23,42,0.12)',
    },
  }),
  c('bg-synthwave', 'background', 'Synthwave Sunset', 'Chrome sun over a neon grid.', 'epic', {
    className: 'bg-anim-grid',
    swatch: 'linear-gradient(#4c1d95,#f472b6)',
    vars: { '--app-bg': 'linear-gradient(#150b2e 0%,#3b0764 55%,#831843 100%)' },
  }),
  c('bg-nebula', 'background', 'Nebula', 'Clouds of gas, gently rotating.', 'legendary', {
    className: 'bg-anim-nebula',
    swatch: 'radial-gradient(circle at 30% 40%,#7c3aed,#0f172a)',
    vars: {
      '--app-bg':
        'radial-gradient(60% 50% at 25% 30%,rgba(124,58,237,0.35),transparent 60%),radial-gradient(50% 45% at 75% 60%,rgba(6,182,212,0.28),transparent 60%),#020617',
    },
  }),
  c('bg-terminal', 'background', 'Bare Terminal', 'Black. Just black.', 'common', {
    swatch: '#000000',
    vars: { '--app-bg': '#000000' },
  }),
];

/* ------------------------------------------------------------------ */
/* Cursors — inline SVG data URIs, no asset files needed               */
/* ------------------------------------------------------------------ */
const svgCursor = (svg: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 4 4, auto`;

const cursors: Cosmetic[] = [
  c('cursor-default', 'cursor', 'System', 'Your operating system knows best.', 'common', {
    price: 0,
    vars: { '--app-cursor': 'auto' },
  }),
  c('cursor-crosshair', 'cursor', 'Crosshair', 'Precision targeting.', 'common', {
    vars: { '--app-cursor': 'crosshair' },
  }),
  c('cursor-pointer-pixel', 'cursor', 'Pixel Arrow', '16-bit nostalgia.', 'rare', {
    vars: {
      '--app-cursor': svgCursor(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shape-rendering="crispEdges"><path d="M4 2h2v2H4zM4 4h2v2H4zM6 4h2v2H6zM4 6h2v2H4zM6 6h2v2H6zM8 6h2v2H8zM4 8h2v2H4zM6 8h2v2H6zM8 8h2v2H8zM10 8h2v2h-2zM4 10h2v2H4zM6 10h2v2H6zM8 10h2v2H8zM10 10h2v2h-2zM12 10h2v2h-2zM4 12h2v2H4zM6 12h2v2H6zM8 12h2v2H8zM4 14h2v2H4zM6 14h2v2H6z" fill="%23ffffff" stroke="%23000000" stroke-width="0.5"/></svg>',
      ),
    },
  }),
  c('cursor-terminal', 'cursor', 'Block Caret', 'A fat terminal cursor that follows you.', 'rare', {
    vars: {
      '--app-cursor': svgCursor(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22"><rect x="2" y="2" width="10" height="18" fill="%2322c55e" opacity="0.85"/></svg>',
      ),
    },
  }),
  c('cursor-duck', 'cursor', 'Rubber Duck', 'It will listen to your bug.', 'epic', {
    vars: {
      '--app-cursor': svgCursor(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><text y="22" font-size="22">🦆</text></svg>',
      ),
    },
  }),
  c('cursor-sword', 'cursor', 'Merge Sword', 'For resolving conflicts decisively.', 'legendary', {
    vars: {
      '--app-cursor': svgCursor(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><text y="22" font-size="22">🗡️</text></svg>',
      ),
    },
  }),
];

/* ------------------------------------------------------------------ */
/* Sound packs — synthesised in sound.ts, no audio files shipped       */
/* ------------------------------------------------------------------ */
const sounds: Cosmetic[] = [
  c('sound-off', 'soundPack', 'Silent', 'Study in peace.', 'common', { price: 0 }),
  c('sound-soft', 'soundPack', 'Soft Chime', 'Gentle sine tones.', 'common', { price: 0 }),
  c('sound-mech', 'soundPack', 'Mechanical', 'Tactile keyboard clacks.', 'rare'),
  c('sound-arcade', 'soundPack', 'Arcade', 'Square-wave coin blips.', 'rare'),
  c('sound-zen', 'soundPack', 'Zen', 'Singing bowl resonance.', 'epic'),
];

/* ------------------------------------------------------------------ */
/* Mascots, frames, xp bars, chests, name colours                      */
/* ------------------------------------------------------------------ */
const mascots: Cosmetic[] = [
  c('mascot-duck', 'mascot', 'Rubber Duck', 'The original debugger.', 'common', {
    price: 0,
    swatch: '🦆',
  }),
  c('mascot-gopher', 'mascot', 'Gopher', 'Small, fast, garbage collected.', 'common', { swatch: '🐹' }),
  c('mascot-crab', 'mascot', 'Ferris', 'Memory safe and pleased about it.', 'rare', { swatch: '🦀' }),
  c('mascot-snake', 'mascot', 'Serpent', 'Indentation enthusiast.', 'common', { swatch: '🐍' }),
  c('mascot-robot', 'mascot', 'Little Robot', 'Runs your CI in its head.', 'rare', { swatch: '🤖' }),
  c('mascot-cat', 'mascot', 'Terminal Cat', 'Sits on the keyboard. Always.', 'epic', { swatch: '🐈‍⬛' }),
  c('mascot-dragon', 'mascot', 'Compiler Dragon', 'Hoards optimisations.', 'epic', { swatch: '🐉' }),
  c('mascot-ghost', 'mascot', 'Null Pointer', 'It was never there.', 'legendary', { swatch: '👻' }),
];

const frames: Cosmetic[] = [
  c('frame-none', 'frame', 'No Frame', 'Unadorned.', 'common', {
    price: 0,
    vars: { '--frame-ring': 'rgba(148,163,184,0.35)', '--frame-glow': 'none' },
  }),
  c('frame-bronze', 'frame', 'Bronze Ring', 'A modest achievement.', 'common', {
    vars: { '--frame-ring': '#b45309', '--frame-glow': '0 0 0 3px rgba(180,83,9,0.25)' },
  }),
  c('frame-silver', 'frame', 'Silver Ring', 'Polished.', 'rare', {
    vars: { '--frame-ring': '#cbd5e1', '--frame-glow': '0 0 0 3px rgba(203,213,225,0.28)' },
  }),
  c('frame-gold', 'frame', 'Gold Ring', 'Unsubtle by design.', 'epic', {
    vars: { '--frame-ring': '#fbbf24', '--frame-glow': '0 0 18px rgba(251,191,36,0.45)' },
  }),
  c('frame-neon', 'frame', 'Neon Halo', 'Buzzing cyan.', 'epic', {
    className: 'frame-pulse',
    vars: { '--frame-ring': '#22d3ee', '--frame-glow': '0 0 22px rgba(34,211,238,0.6)' },
  }),
  c('frame-prism', 'frame', 'Prism', 'Rotating spectrum.', 'legendary', {
    className: 'frame-prism',
    vars: { '--frame-ring': '#a855f7', '--frame-glow': '0 0 26px rgba(168,85,247,0.55)' },
  }),
];

const xpBars: Cosmetic[] = [
  c('xp-default', 'xpBar', 'Sky', 'Clean cyan fill.', 'common', {
    price: 0,
    swatch: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
    vars: { '--xp-fill': 'linear-gradient(90deg,#0ea5e9,#22d3ee)' },
  }),
  c('xp-ember', 'xpBar', 'Ember', 'Molten orange.', 'common', {
    swatch: 'linear-gradient(90deg,#f97316,#facc15)',
    vars: { '--xp-fill': 'linear-gradient(90deg,#ea580c,#facc15)' },
  }),
  c('xp-forest', 'xpBar', 'Forest', 'Deep greens.', 'common', {
    swatch: 'linear-gradient(90deg,#15803d,#4ade80)',
    vars: { '--xp-fill': 'linear-gradient(90deg,#15803d,#4ade80)' },
  }),
  c('xp-candy', 'xpBar', 'Candy', 'Pink to violet.', 'rare', {
    swatch: 'linear-gradient(90deg,#ec4899,#8b5cf6)',
    vars: { '--xp-fill': 'linear-gradient(90deg,#ec4899,#8b5cf6)' },
  }),
  c('xp-liquid', 'xpBar', 'Liquid Metal', 'Chrome with a moving sheen.', 'epic', {
    className: 'xp-shimmer',
    swatch: 'linear-gradient(90deg,#94a3b8,#f8fafc,#94a3b8)',
    vars: { '--xp-fill': 'linear-gradient(90deg,#64748b,#f1f5f9,#64748b)' },
  }),
  c('xp-rainbow', 'xpBar', 'Spectrum', 'All of them at once.', 'legendary', {
    className: 'xp-shimmer',
    swatch: 'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7)',
    vars: {
      '--xp-fill': 'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7)',
    },
  }),
];

const chestSkins: Cosmetic[] = [
  c('chest-wood', 'chestSkin', 'Wooden Chest', 'Standard issue.', 'common', {
    price: 0,
    swatch: '📦',
  }),
  c('chest-crate', 'chestSkin', 'Supply Crate', 'Airdropped, mid-match.', 'rare', { swatch: '🎁' }),
  c('chest-vault', 'chestSkin', 'Bank Vault', 'Heavy door, satisfying spin.', 'epic', { swatch: '🔐' }),
  c('chest-cake', 'chestSkin', 'The Cake', 'It is, allegedly, a lie.', 'legendary', { swatch: '🎂' }),
];

const nameColors: Cosmetic[] = [
  c('name-default', 'nameColor', 'Plain', 'Just your name.', 'common', {
    price: 0,
    swatch: '#e2e8f0',
    vars: { '--name-fill': '#e2e8f0' },
  }),
  c('name-cyan', 'nameColor', 'Cyan', 'Cool and readable.', 'common', {
    swatch: '#22d3ee',
    vars: { '--name-fill': '#22d3ee' },
  }),
  c('name-amber', 'nameColor', 'Amber', 'Warm highlight.', 'common', {
    swatch: '#fbbf24',
    vars: { '--name-fill': '#fbbf24' },
  }),
  c('name-sunset', 'nameColor', 'Sunset Gradient', 'Orange bleeding into pink.', 'rare', {
    swatch: 'linear-gradient(90deg,#f97316,#ec4899)',
    vars: { '--name-fill': 'linear-gradient(90deg,#f97316,#ec4899)', '--name-clip': 'text' },
  }),
  c('name-matrix', 'nameColor', 'Matrix Green', 'Phosphor glow.', 'rare', {
    swatch: '#22c55e',
    vars: { '--name-fill': '#22c55e', '--name-shadow': '0 0 12px rgba(34,197,94,0.7)' },
  }),
  c('name-holo', 'nameColor', 'Holo', 'Iridescent shifting text.', 'epic', {
    className: 'name-holo',
    swatch: 'linear-gradient(90deg,#a78bfa,#67e8f9,#fca5a5)',
    vars: {
      '--name-fill': 'linear-gradient(90deg,#a78bfa,#67e8f9,#fca5a5,#a78bfa)',
      '--name-clip': 'text',
    },
  }),
  c('name-root', 'nameColor', 'root@localhost', 'Red, and slightly alarming.', 'legendary', {
    swatch: '#ef4444',
    vars: { '--name-fill': '#ef4444', '--name-shadow': '0 0 14px rgba(239,68,68,0.65)' },
  }),
];

export const COSMETICS: Cosmetic[] = [
  ...cardSkins,
  ...cardBacks,
  ...flips,
  ...syntax,
  ...backgrounds,
  ...cursors,
  ...sounds,
  ...mascots,
  ...frames,
  ...xpBars,
  ...chestSkins,
  ...nameColors,
];

export const COSMETIC_BY_ID = new Map(COSMETICS.map((x) => [x.id, x]));

/** Everything priced at 0 is owned from the first launch. */
export const DEFAULT_OWNED = COSMETICS.filter((x) => x.price === 0).map((x) => x.id);

export const DEFAULT_EQUIPPED: Record<CosmeticCategory, string> = {
  cardSkin: 'skin-slate',
  cardBack: 'back-plain',
  flipAnimation: 'flip-standard',
  syntaxTheme: 'default',
  background: 'bg-midnight',
  cursor: 'cursor-default',
  soundPack: 'sound-soft',
  mascot: 'mascot-duck',
  frame: 'frame-none',
  xpBar: 'xp-default',
  chestSkin: 'chest-wood',
  nameColor: 'name-default',
};

export const CATEGORY_ORDER: CosmeticCategory[] = [
  'cardSkin',
  'cardBack',
  'flipAnimation',
  'syntaxTheme',
  'background',
  'cursor',
  'soundPack',
  'mascot',
  'frame',
  'xpBar',
  'chestSkin',
  'nameColor',
];
