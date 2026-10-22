import type { Cosmetic, CosmeticCategory, Rarity } from '@/lib/types';
import { spriteSvg } from './sprites';

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

/**
 * Each visual category starts from a full set of "off" values. Every look lives in these
 * variables — none in classes — so the nearest element that sets them wins: a shop preview box
 * shows exactly its own item even while a different one is equipped on <html>.
 * Keep the values in sync with the :root defaults in globals.css (first paint, pre-hydration).
 */
const withBase =
  (base: Record<string, string>) =>
  (vars: Record<string, string>): Record<string, string> => ({ ...base, ...vars });

const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/* ------------------------------------------------------------------ */
/* Card skins — the face of the flashcard                              */
/* ------------------------------------------------------------------ */
const skin = withBase({
  '--card-font': 'var(--font-sans)',
  '--card-bg-size': 'auto',
  '--card-radius': '1.25rem',
  '--card-transform': 'none',
  '--card-backdrop': 'none',
  '--card-anim': 'none',
  '--card-overlay': 'none',
  '--card-overlay-size': 'auto',
  '--card-overlay-blend': 'normal',
  '--card-overlay-anim': 'none',
});

const cardSkins: Cosmetic[] = [
  c('skin-slate', 'cardSkin', 'Slate', 'The clean default. Nothing to prove.', 'common', {
    price: 0,
    vars: skin({
      '--card-bg': 'linear-gradient(145deg,#1e293b,#0f172a)',
      '--card-border': 'rgba(148,163,184,0.22)',
      '--card-fg': '#e2e8f0',
      '--card-accent': '#38bdf8',
      '--card-glow': '0 24px 60px -20px rgba(2,6,23,0.9)',
    }),
  }),
  c('skin-paper', 'cardSkin', 'Index Card', 'Ruled paper, red margin, faint coffee ring.', 'common', {
    vars: skin({
      '--card-bg':
        'repeating-linear-gradient(#fdfaf1,#fdfaf1 26px,#dbe6f3 27px), #fdfaf1',
      '--card-border': 'rgba(120,90,60,0.35)',
      '--card-fg': '#1f2937',
      '--card-accent': '#b91c1c',
      '--card-glow': '0 18px 40px -18px rgba(60,40,20,0.55)',
    }),
  }),
  c('skin-crt', 'cardSkin', 'CRT Terminal', 'Phosphor green on black, scanlines included.', 'rare', {
    vars: skin({
      '--card-bg': 'linear-gradient(#00170c,#012a18)',
      '--card-border': 'rgba(34,197,94,0.5)',
      '--card-fg': '#7CFFB2',
      '--card-accent': '#22c55e',
      '--card-font': 'var(--font-mono)',
      '--card-glow': '0 0 40px -6px rgba(34,197,94,0.45)',
      '--card-overlay': 'repeating-linear-gradient(rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)',
      '--card-overlay-blend': 'multiply',
    }),
  }),
  c('skin-glass', 'cardSkin', 'Frosted Glass', 'Translucent, blurred, weightless.', 'rare', {
    vars: skin({
      '--card-bg': 'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))',
      '--card-border': 'rgba(255,255,255,0.35)',
      '--card-fg': '#f8fafc',
      '--card-accent': '#a5f3fc',
      '--card-glow': '0 20px 60px -18px rgba(56,189,248,0.35)',
      '--card-backdrop': 'blur(18px) saturate(160%)',
    }),
  }),
  c('skin-blueprint', 'cardSkin', 'Blueprint', 'Drafting grid and cyan ink.', 'rare', {
    vars: skin({
      '--card-bg':
        'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px),#0b3d91',
      '--card-bg-size': '22px 22px, 22px 22px, auto',
      '--card-border': 'rgba(191,219,254,0.5)',
      '--card-fg': '#dbeafe',
      '--card-accent': '#93c5fd',
      '--card-glow': '0 20px 50px -20px rgba(11,61,145,0.9)',
    }),
  }),
  c('skin-sticky', 'cardSkin', 'Sticky Note', 'Highlighter yellow, slightly crooked.', 'common', {
    vars: skin({
      '--card-bg': 'linear-gradient(160deg,#fef3c7,#fcd34d)',
      '--card-border': 'rgba(180,120,20,0.35)',
      '--card-fg': '#3f3010',
      '--card-accent': '#b45309',
      '--card-glow': '0 16px 34px -16px rgba(120,80,10,0.6)',
      '--card-radius': '0.25rem',
      '--card-transform': 'rotate(-0.6deg)',
    }),
  }),
  c('skin-holo', 'cardSkin', 'Holographic', 'Shifting foil that catches the light.', 'epic', {
    vars: skin({
      '--card-bg':
        'linear-gradient(120deg,#4c1d95,#0e7490,#831843,#4c1d95)',
      '--card-bg-size': '300% 300%',
      '--card-border': 'rgba(233,213,255,0.6)',
      '--card-fg': '#f5f3ff',
      '--card-accent': '#e9d5ff',
      '--card-glow': '0 24px 70px -18px rgba(167,139,250,0.6)',
      '--card-anim': 'holo-shift 9s ease-in-out infinite',
    }),
  }),
  c('skin-carbon', 'cardSkin', 'Carbon Fibre', 'Woven matte black. Very fast, allegedly.', 'rare', {
    vars: skin({
      '--card-bg': 'repeating-conic-gradient(#181818 0 25%, #262626 0 50%)',
      // Tile size must go here: .flashcard sets background-size after the shorthand.
      '--card-bg-size': '12px 12px',
      '--card-border': 'rgba(255,255,255,0.16)',
      '--card-fg': '#f4f4f5',
      '--card-accent': '#ef4444',
      '--card-glow': '0 20px 46px -20px rgba(0,0,0,0.9)',
    }),
  }),
  c('skin-vapor', 'cardSkin', 'Vaporwave', 'Sunset gradient, chrome edges, no regrets.', 'epic', {
    vars: skin({
      '--card-bg': 'linear-gradient(160deg,#831843,#5b21b6 55%,#0c4a6e)',
      '--card-border': 'rgba(244,114,182,0.55)',
      '--card-fg': '#fdf4ff',
      '--card-accent': '#f0abfc',
      '--card-glow': '0 26px 70px -22px rgba(168,85,247,0.7)',
    }),
  }),
  c('skin-obsidian', 'cardSkin', 'Obsidian', 'Volcanic glass with a molten seam.', 'legendary', {
    vars: skin({
      '--card-bg': 'linear-gradient(150deg,#09090b,#18181b 55%,#3f1206)',
      '--card-border': 'rgba(249,115,22,0.5)',
      '--card-fg': '#fafaf9',
      '--card-accent': '#fb923c',
      '--card-glow': '0 30px 80px -24px rgba(249,115,22,0.45)',
      '--card-overlay':
        'linear-gradient(120deg, transparent 45%, rgba(249,115,22,0.35) 50%, transparent 55%)',
      '--card-overlay-size': '250% 250%',
      '--card-overlay-anim': 'holo-shift 7s linear infinite',
    }),
  }),
];

/* ------------------------------------------------------------------ */
/* Card backs — the pattern behind the answer side                     */
/* ------------------------------------------------------------------ */
const back = withBase({
  '--card-back-pattern': 'none',
  '--card-back-size': 'auto',
  '--card-back-tint': 'transparent',
  '--card-back-opacity': '0.9',
  '--card-back-anim': 'none',
});

const BINARY_GLYPHS =
  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="55" font-family="monospace" font-size="12" fill="#34d399"><text x="4" y="12">1</text><text x="34" y="23" opacity=".5">0</text><text x="18" y="37" opacity=".7">0</text><text x="46" y="50">1</text></svg>';

const cardBacks: Cosmetic[] = [
  c('back-plain', 'cardBack', 'Plain Back', 'Matches your card skin exactly.', 'common', {
    price: 0,
    vars: back({}),
  }),
  c('back-circuit', 'cardBack', 'Circuit Trace', 'PCB routing in soft copper.', 'common', {
    vars: back({
      '--card-back-pattern':
        'linear-gradient(90deg,rgba(245,158,11,0.18) 1px,transparent 1px),linear-gradient(rgba(245,158,11,0.18) 1px,transparent 1px)',
      '--card-back-size': '24px 24px',
    }),
  }),
  c('back-binary', 'cardBack', 'Binary Rain', 'Ones and zeroes, drifting down.', 'rare', {
    vars: back({
      '--card-back-pattern': svgUrl(BINARY_GLYPHS),
      // 55px tile: the 220px `rain` keyframe is exactly four tiles, so the loop is seamless.
      '--card-back-size': '60px 55px',
      '--card-back-tint': 'rgba(16,185,129,0.14)',
      '--card-back-opacity': '0.55',
      '--card-back-anim': 'rain 8s linear infinite',
    }),
  }),
  c('back-hex', 'cardBack', 'Hex Dump', 'Offsets and bytes, all the way down.', 'common', {
    vars: back({
      '--card-back-pattern':
        'repeating-linear-gradient(0deg,rgba(148,163,184,0.12) 0 1px,transparent 1px 18px)',
    }),
  }),
  c('back-tartan', 'cardBack', 'Tartan', 'Woven check, quietly smug.', 'rare', {
    vars: back({
      '--card-back-pattern':
        'repeating-linear-gradient(45deg,rgba(239,68,68,0.18) 0 10px,transparent 10px 20px),repeating-linear-gradient(-45deg,rgba(59,130,246,0.16) 0 10px,transparent 10px 20px)',
    }),
  }),
  c('back-runes', 'cardBack', 'Compiler Runes', 'Ancient symbols. Probably lifetimes.', 'epic', {
    vars: back({
      '--card-back-pattern':
        'radial-gradient(circle at 30% 30%,rgba(167,139,250,0.35),transparent 60%)',
    }),
  }),
  c('back-starfield', 'cardBack', 'Starfield', 'Deep space with a slow parallax drift.', 'epic', {
    vars: back({
      '--card-back-pattern': 'radial-gradient(rgba(255,255,255,0.7) 1px,transparent 1px)',
      '--card-back-size': '26px 26px',
      '--card-back-anim': 'drift 24s linear infinite',
    }),
  }),
  c('back-gold', 'cardBack', 'Gilded', 'Gold leaf. Purely for intimidation.', 'legendary', {
    vars: back({
      '--card-back-pattern':
        'linear-gradient(135deg,rgba(253,230,138,0.35),rgba(180,83,9,0.35),rgba(253,230,138,0.35))',
    }),
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
  }),
  c('nord', 'syntaxTheme', 'Nord', 'Arctic, muted, easy on the eyes.', 'common'),
  c('catppuccin', 'syntaxTheme', 'Catppuccin Mocha', 'Pastel warmth on a dark base.', 'common'),
  c('dracula', 'syntaxTheme', 'Dracula', 'Purple night, high contrast.', 'common'),
  c('monokai', 'syntaxTheme', 'Monokai', 'The classic. Pink keywords forever.', 'rare'),
  c('onedark', 'syntaxTheme', 'One Dark Pro', 'Atom heritage, still undefeated.', 'rare'),
  c('vitesse', 'syntaxTheme', 'Vitesse Dark', 'Low saturation, high focus.', 'rare'),
  c('tokyo', 'syntaxTheme', 'Tokyo Night', 'Neon signs reflected in wet asphalt.', 'epic'),
  c('solarized', 'syntaxTheme', 'Solarized Dark', 'Scientifically fussed-over contrast.', 'epic'),
  c('gruvbox', 'syntaxTheme', 'Vitesse Black', 'Pitch black with warm accents.', 'legendary'),
];

/* ------------------------------------------------------------------ */
/* Backgrounds — the page fill plus an optional animated overlay layer  */
/* ------------------------------------------------------------------ */
const bg = withBase({
  '--app-bg-size': 'auto',
  '--fg': '#e2e8f0',
  '--fg-muted': '#94a3b8',
  '--panel': 'rgba(15,23,42,0.62)',
  '--panel-border': 'rgba(148,163,184,0.16)',
  '--nav-bg': 'rgba(2,6,23,0.7)',
  '--nav-bg-strong': 'rgba(2,6,23,0.9)',
  '--app-overlay': 'none',
  '--app-overlay-size': 'auto',
  '--app-overlay-position': '0 0',
  '--app-overlay-opacity': '1',
  '--app-overlay-transform': 'none',
  '--app-overlay-origin': 'center',
  '--app-overlay-anim': 'none',
});

const GRID_OVERLAY = {
  '--app-overlay':
    'linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)',
  '--app-overlay-size': '60px 60px',
  '--app-overlay-opacity': '0.5',
  '--app-overlay-transform': 'perspective(400px) rotateX(58deg) translateY(20%)',
  '--app-overlay-origin': 'bottom',
  '--app-overlay-anim': 'grid-run 14s linear infinite',
};

const backgrounds: Cosmetic[] = [
  c('bg-midnight', 'background', 'Midnight', 'Deep navy with a soft vignette.', 'common', {
    price: 0,
    vars: bg({ '--app-bg': 'radial-gradient(120% 90% at 50% -10%,#16233b 0%,#020617 60%)' }),
  }),
  c('bg-aurora', 'background', 'Aurora', 'Slow northern lights.', 'rare', {
    vars: bg({
      '--app-bg':
        'linear-gradient(130deg,#031a2c 0%,#052e2b 35%,#1e1b4b 70%,#020617 100%)',
      '--app-overlay':
        'radial-gradient(40% 30% at 20% 20%, rgba(16,185,129,0.22), transparent 70%), radial-gradient(35% 28% at 75% 35%, rgba(99,102,241,0.22), transparent 70%)',
      '--app-overlay-anim': 'aurora 22s ease-in-out infinite alternate',
    }),
  }),
  c('bg-matrix', 'background', 'Matrix Rain', 'Falling glyphs, subtle enough to study over.', 'epic', {
    vars: bg({
      '--app-bg': 'linear-gradient(#000000,#01130c)',
      '--app-overlay':
        'repeating-linear-gradient(180deg, rgba(34,197,94,0.16) 0 2px, transparent 2px 14px)',
      '--app-overlay-size': '100% 220px',
      '--app-overlay-opacity': '0.35',
      '--app-overlay-anim': 'rain 6s linear infinite',
    }),
  }),
  c('bg-starfield', 'background', 'Deep Field', 'A quiet sky full of stars.', 'rare', {
    vars: bg({
      '--app-bg': 'radial-gradient(120% 100% at 50% 0%,#0b1020,#000000 70%)',
      '--app-overlay':
        'radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
      '--app-overlay-size': '120px 120px, 60px 60px',
      '--app-overlay-position': '0 0, 30px 30px',
      '--app-overlay-opacity': '0.6',
      '--app-overlay-anim': 'stars-drift 90s linear infinite',
    }),
  }),
  c('bg-grid', 'background', 'Wireframe Grid', 'Perspective grid receding to the horizon.', 'common', {
    vars: bg({ '--app-bg': 'linear-gradient(#05070f,#160f2e)', ...GRID_OVERLAY }),
  }),
  c('bg-lofi', 'background', 'Lo-fi Room', 'Warm lamp light and a rainy window.', 'epic', {
    vars: bg({ '--app-bg': 'radial-gradient(90% 80% at 70% 10%,#3b1d0f 0%,#120d0b 65%)' }),
  }),
  c('bg-paper', 'background', 'Graph Paper', 'Light mode, for the brave.', 'common', {
    vars: bg({
      '--app-bg':
        'linear-gradient(rgba(37,99,235,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.08) 1px,transparent 1px),#f8fafc',
      '--app-bg-size': '24px 24px,24px 24px,auto',
      '--fg': '#0f172a',
      '--fg-muted': '#475569',
      '--panel': 'rgba(255,255,255,0.75)',
      '--panel-border': 'rgba(15,23,42,0.12)',
      '--nav-bg': 'rgba(248,250,252,0.8)',
      '--nav-bg-strong': 'rgba(248,250,252,0.92)',
    }),
  }),
  c('bg-synthwave', 'background', 'Synthwave Sunset', 'Chrome sun over a neon grid.', 'epic', {
    vars: bg({ '--app-bg': 'linear-gradient(#150b2e 0%,#3b0764 55%,#831843 100%)', ...GRID_OVERLAY }),
  }),
  c('bg-nebula', 'background', 'Nebula', 'Clouds of gas, gently rotating.', 'legendary', {
    vars: bg({
      '--app-bg':
        'radial-gradient(60% 50% at 25% 30%,rgba(124,58,237,0.35),transparent 60%),radial-gradient(50% 45% at 75% 60%,rgba(6,182,212,0.28),transparent 60%),#020617',
      '--app-overlay':
        'radial-gradient(35% 30% at 30% 40%, rgba(168,85,247,0.25), transparent 70%), radial-gradient(30% 25% at 70% 60%, rgba(34,211,238,0.2), transparent 70%)',
      '--app-overlay-anim': 'aurora 30s ease-in-out infinite alternate',
    }),
  }),
  c('bg-terminal', 'background', 'Bare Terminal', 'Black. Just black.', 'common', {
    vars: bg({ '--app-bg': '#000000' }),
  }),
];

/* ------------------------------------------------------------------ */
/* Cursors — inline SVG data URIs                                      */
/* ------------------------------------------------------------------ */

/** `x y` is the hotspot — the pixel of the image that actually clicks. */
const svgCursor = (svg: string, x = 4, y = 4) => `${svgUrl(svg)} ${x} ${y}, auto`;

/** Shop preview: the cursor artwork itself, centred; the preview layers it over its stage. */
const cursorSwatch = (svg: string) => `${svgUrl(svg)} center / 44px 44px no-repeat`;

/** Turns a bitmap (`#` outline, `o` fill) into 2px-per-cell SVG, inset by 1px. */
const pixelArt = (rows: string[], size: number) => {
  const cells = (ch: string) =>
    rows
      .flatMap((row, y) =>
        [...row].map((c, x) => (c === ch ? `M${1 + x * 2} ${1 + y * 2}h2v2h-2z` : '')),
      )
      .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path d="${cells('#')}" fill="#000000"/><path d="${cells('o')}" fill="#ffffff"/></svg>`;
};

const PIXEL_ARROW = [
  '#',
  '##',
  '#o#',
  '#oo#',
  '#ooo#',
  '#oooo#',
  '#ooooo#',
  '#oooo###',
  '#o#oo#',
  '## #oo#',
  '    ###',
];

// Colours are written as plain `#rrggbb`: svgUrl() does the escaping. A pre-escaped
// `%23` gets escaped twice and the browser silently paints the shape black.
const CURSOR_ART = {
  system:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 3v16l4.5-4 2.8 6.2 2.6-1.2-2.8-6.1H18z" fill="#ffffff" stroke="#000000" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  crosshair:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 3v7M12 14v7M3 12h7M14 12h7" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/></svg>',
  pixel: pixelArt(PIXEL_ARROW, 24),
  terminal:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22"><rect x="2" y="2" width="10" height="18" fill="#22c55e" opacity="0.85"/></svg>',
  // Pinned top-left (not centred) so the hotspots below stay on the beak and the blade tip.
  duck: spriteSvg('duck', 'top-left'),
  sword: spriteSvg('sword', 'top-left'),
};

const cursors: Cosmetic[] = [
  c('cursor-default', 'cursor', 'System', 'Your operating system knows best.', 'common', {
    price: 0,
    swatch: cursorSwatch(CURSOR_ART.system),
    vars: { '--app-cursor': 'auto' },
  }),
  c('cursor-crosshair', 'cursor', 'Crosshair', 'Precision targeting.', 'common', {
    swatch: cursorSwatch(CURSOR_ART.crosshair),
    vars: { '--app-cursor': 'crosshair' },
  }),
  c('cursor-pointer-pixel', 'cursor', 'Pixel Arrow', '16-bit nostalgia.', 'rare', {
    swatch: cursorSwatch(CURSOR_ART.pixel),
    vars: { '--app-cursor': svgCursor(CURSOR_ART.pixel, 1, 1) },
  }),
  c('cursor-terminal', 'cursor', 'Block Caret', 'A fat terminal cursor that follows you.', 'rare', {
    swatch: cursorSwatch(CURSOR_ART.terminal),
    vars: { '--app-cursor': svgCursor(CURSOR_ART.terminal, 7, 11) },
  }),
  c('cursor-duck', 'cursor', 'Rubber Duck', 'It will listen to your bug.', 'epic', {
    swatch: cursorSwatch(CURSOR_ART.duck),
    vars: { '--app-cursor': svgCursor(CURSOR_ART.duck, 1, 6) },
  }),
  c('cursor-sword', 'cursor', 'Merge Sword', 'For resolving conflicts decisively.', 'legendary', {
    swatch: cursorSwatch(CURSOR_ART.sword),
    vars: { '--app-cursor': svgCursor(CURSOR_ART.sword, 1, 1) },
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
/* Mascots and chests are CodeCards' own pixel art (data/sprites.ts).   */
/* ------------------------------------------------------------------ */
const mascots: Cosmetic[] = [
  c('mascot-duck', 'mascot', 'Rubber Duck', 'The original debugger.', 'common', {
    price: 0,
    sprite: 'duck',
  }),
  c('mascot-gopher', 'mascot', 'Gopher', 'Small, fast, garbage collected.', 'common', { sprite: 'gopher' }),
  c('mascot-crab', 'mascot', 'Ferris', 'Memory safe and pleased about it.', 'rare', { sprite: 'crab' }),
  c('mascot-snake', 'mascot', 'Serpent', 'Indentation enthusiast.', 'common', { sprite: 'snake' }),
  c('mascot-robot', 'mascot', 'Little Robot', 'Runs your CI in its head.', 'rare', { sprite: 'robot' }),
  c('mascot-cat', 'mascot', 'Terminal Cat', 'Sits on the keyboard. Always.', 'epic', { sprite: 'cat' }),
  c('mascot-dragon', 'mascot', 'Compiler Dragon', 'Hoards optimisations.', 'epic', { sprite: 'dragon' }),
  c('mascot-ghost', 'mascot', 'Null Pointer', 'It was never there.', 'legendary', { sprite: 'ghost' }),
];

const frame = withBase({ '--frame-anim': 'none' });

const frames: Cosmetic[] = [
  c('frame-none', 'frame', 'No Frame', 'Unadorned.', 'common', {
    price: 0,
    vars: frame({ '--frame-ring': 'rgba(148,163,184,0.35)', '--frame-glow': 'none' }),
  }),
  c('frame-bronze', 'frame', 'Bronze Ring', 'A modest achievement.', 'common', {
    vars: frame({ '--frame-ring': '#b45309', '--frame-glow': '0 0 0 3px rgba(180,83,9,0.25)' }),
  }),
  c('frame-silver', 'frame', 'Silver Ring', 'Polished.', 'rare', {
    vars: frame({ '--frame-ring': '#cbd5e1', '--frame-glow': '0 0 0 3px rgba(203,213,225,0.28)' }),
  }),
  c('frame-gold', 'frame', 'Gold Ring', 'Unsubtle by design.', 'epic', {
    vars: frame({ '--frame-ring': '#fbbf24', '--frame-glow': '0 0 18px rgba(251,191,36,0.45)' }),
  }),
  c('frame-neon', 'frame', 'Neon Halo', 'Buzzing cyan.', 'epic', {
    vars: frame({
      '--frame-ring': '#22d3ee',
      '--frame-glow': '0 0 22px rgba(34,211,238,0.6)',
      '--frame-anim': 'pulse-ring 2.4s ease-in-out infinite',
    }),
  }),
  c('frame-prism', 'frame', 'Prism', 'Rotating spectrum.', 'legendary', {
    vars: frame({
      '--frame-ring': '#a855f7',
      '--frame-glow': '0 0 26px rgba(168,85,247,0.55)',
      '--frame-anim': 'prism 4s linear infinite',
    }),
  }),
];

const xp = withBase({ '--xp-anim': 'none' });

const xpBars: Cosmetic[] = [
  c('xp-default', 'xpBar', 'Sky', 'Clean cyan fill.', 'common', {
    price: 0,
    vars: xp({ '--xp-fill': 'linear-gradient(90deg,#0ea5e9,#22d3ee)' }),
  }),
  c('xp-ember', 'xpBar', 'Ember', 'Molten orange.', 'common', {
    vars: xp({ '--xp-fill': 'linear-gradient(90deg,#ea580c,#facc15)' }),
  }),
  c('xp-forest', 'xpBar', 'Forest', 'Deep greens.', 'common', {
    vars: xp({ '--xp-fill': 'linear-gradient(90deg,#15803d,#4ade80)' }),
  }),
  c('xp-candy', 'xpBar', 'Candy', 'Pink to violet.', 'rare', {
    vars: xp({ '--xp-fill': 'linear-gradient(90deg,#ec4899,#8b5cf6)' }),
  }),
  c('xp-liquid', 'xpBar', 'Liquid Metal', 'Chrome with a moving sheen.', 'epic', {
    vars: xp({
      '--xp-fill': 'linear-gradient(90deg,#64748b,#f1f5f9,#64748b)',
      '--xp-anim': 'shimmer 2.6s linear infinite',
    }),
  }),
  c('xp-rainbow', 'xpBar', 'Spectrum', 'All of them at once.', 'legendary', {
    vars: xp({
      '--xp-fill': 'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7)',
      '--xp-anim': 'shimmer 2.6s linear infinite',
    }),
  }),
];

const chestSkins: Cosmetic[] = [
  c('chest-wood', 'chestSkin', 'Wooden Chest', 'Standard issue.', 'common', {
    price: 0,
    sprite: 'chest',
  }),
  c('chest-crate', 'chestSkin', 'Supply Crate', 'Airdropped, mid-match.', 'rare', { sprite: 'crate' }),
  c('chest-vault', 'chestSkin', 'Bank Vault', 'Heavy door, satisfying spin.', 'epic', { sprite: 'vault' }),
  c('chest-cake', 'chestSkin', 'The Cake', 'It is, allegedly, a lie.', 'legendary', { sprite: 'cake' }),
];

/**
 * Solid names set `--name-fill`; gradient names set a transparent fill plus `--name-gradient`,
 * which .display-name clips to the text.
 */
const name = withBase({
  '--name-gradient': 'none',
  '--name-size': 'auto',
  '--name-shadow': 'none',
  '--name-anim': 'none',
});

const nameColors: Cosmetic[] = [
  c('name-default', 'nameColor', 'Plain', 'Just your name.', 'common', {
    price: 0,
    // Follows the text colour, so it stays readable on the light Graph Paper background.
    vars: name({ '--name-fill': 'var(--fg)' }),
  }),
  c('name-cyan', 'nameColor', 'Cyan', 'Cool and readable.', 'common', {
    vars: name({ '--name-fill': '#22d3ee' }),
  }),
  c('name-amber', 'nameColor', 'Amber', 'Warm highlight.', 'common', {
    vars: name({ '--name-fill': '#fbbf24' }),
  }),
  c('name-sunset', 'nameColor', 'Sunset Gradient', 'Orange bleeding into pink.', 'rare', {
    vars: name({
      '--name-fill': 'transparent',
      '--name-gradient': 'linear-gradient(90deg,#f97316,#ec4899)',
    }),
  }),
  c('name-matrix', 'nameColor', 'Matrix Green', 'Phosphor glow.', 'rare', {
    vars: name({ '--name-fill': '#22c55e', '--name-shadow': '0 0 12px rgba(34,197,94,0.7)' }),
  }),
  c('name-holo', 'nameColor', 'Holo', 'Iridescent shifting text.', 'epic', {
    vars: name({
      '--name-fill': 'transparent',
      '--name-gradient': 'linear-gradient(90deg,#a78bfa,#67e8f9,#fca5a5,#a78bfa)',
      '--name-size': '300% 100%',
      '--name-anim': 'shimmer 5s linear infinite',
    }),
  }),
  c('name-root', 'nameColor', 'root@localhost', 'Red, and slightly alarming.', 'legendary', {
    vars: name({ '--name-fill': '#ef4444', '--name-shadow': '0 0 14px rgba(239,68,68,0.65)' }),
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

/**
 * The neutral stage every preview starts from: each visual category's default item. A preview
 * applies these and then the previewed item's own variables, so nothing equipped on <html> shows
 * through. The cursor is left out on purpose: it is the viewer's own pointer.
 */
export const PREVIEW_STAGE_VARS: Record<string, string> = Object.assign(
  {},
  ...(['cardSkin', 'cardBack', 'background', 'frame', 'xpBar', 'nameColor'] as const).map(
    (category) => COSMETIC_BY_ID.get(DEFAULT_EQUIPPED[category])?.vars ?? {},
  ),
);

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
