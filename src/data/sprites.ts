/**
 * CodeCards' own pixel art: mascots, chest skins and the pixel cursors.
 *
 * Each sprite is a character grid ('.' = transparent) plus a palette. The renderer adds a 1px
 * outline around the silhouette and centres the art on a 24×24 canvas, so the grids only need
 * the drawing itself. Shown at 24/48/72px every art pixel lands on whole screen pixels.
 *
 * Self-contained (no imports) so scripts can render it directly with Node.
 */

export interface Sprite {
  /** One character per pixel; '.' is transparent. Rows may be ragged. */
  rows: string[];
  palette: Record<string, string>;
  /** Colour of the auto-drawn 1px outline. Dark by default; lighter for dark art. */
  outline?: string;
}

export const SPRITE_SIZE = 24;
const DEFAULT_OUTLINE = '#0b0d17';

export const SPRITES = {
  duck: {
    palette: {
      Y: '#fcd34d',
      y: '#f59e0b',
      L: '#fef3c7',
      O: '#fb923c',
      o: '#ea580c',
      E: '#1f2937',
      W: '#ffffff',
    },
    rows: [
      '.......LLLL',
      '.....LLYYYYY',
      '....LYYYYYYYY',
      '....YYYEWYYYY',
      '....YYYEEYYYy',
      'OOOOYYYYYYYYy',
      '.OOOYYYYYYYy',
      '..ooyYYYYYy',
      '.....yYYYYy.......YY',
      '....LLYYYYYYYYYYYYYY',
      '..LLYYYYYYYYYYYYYYYy',
      '.LYYYYYYYYYYYYYYYYYy',
      '.YYYYYYYyyyyYYYYYYYy',
      '.YYYYYYYYYYYyyYYYYYy',
      '.yYYYYYYYYYYYYyYYYYy',
      '..yYYYYYYYYYYYYYYYy',
      '...yyYYYYYYYYYYYyy',
      '.....yyyyyyyyyyy',
    ],
  },

  gopher: {
    palette: {
      B: '#79d4e6',
      b: '#4fb6cc',
      W: '#ffffff',
      K: '#0f172a',
      S: '#f0c99a',
      N: '#3f2a22',
      T: '#ffffff',
    },
    rows: [
      '..BB............BB',
      '.BbbB..........BbbB',
      '.BBBBBBBBBBBBBBBBBB',
      'BBBWWWBBBBBBBBWWWBBB',
      'BBWWWWWBBBBBBWWWWWBB',
      'BBWWKKWBBBBBBWKKWWBB',
      'BBWWKKWBBBBBBWKKWWBB',
      'BBBWWWBBSSSSBBWWWBBB',
      'BBBBBBBSSNNSSBBBBBBB',
      'BBBBBBBSSSSSSBBBBBBB',
      'BBBBBBBBSTTSBBBBBBBB',
      'BBBBBBBBBTTBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'SBBBBBBBBBBBBBBBBBBS',
      'SBBBBBBBBBBBBBBBBBBS',
      'BBBBBBBBBBBBBBBBBBBB',
      'bBBBBBBBBBBBBBBBBBBb',
      '.bBBBBBBBBBBBBBBBBb',
      '..bbbBBBBBBBBBBbbb',
      '..SSSbbbbbbbbbbSSS',
    ],
  },

  crab: {
    palette: { R: '#f97316', r: '#c2410c', H: '#fdba74', W: '#ffffff', K: '#0f172a' },
    rows: [
      '.RRR..............RRR.',
      'RRHR..............RHRR',
      'RR......WW..WW......RR',
      'RR.RR...WK..KW...RR.RR',
      '.RRRR....R..R....RRRR.',
      '...RR....R..R....RR...',
      '....RRRRRRRRRRRRRR....',
      '..RRHHHRRRRRRRRRRRRR..',
      '.RRRRRRRRRRRRRRRRRRRR.',
      '.RRRRRRRRKRRKRRRRRRRR.',
      '.RRRRRRRRRKKRRRRRRRRR.',
      '.rRRRRRRRRRRRRRRRRRRr.',
      '..rrrrrrrrrrrrrrrrrr..',
      '...r.r.r......r.r.r...',
      '..r.r.r........r.r.r..',
    ],
  },

  snake: {
    palette: {
      P: '#3d7cc9',
      p: '#2a5a9a',
      Y: '#ffd43b',
      W: '#ffffff',
      K: '#0f172a',
      T: '#ef4444',
    },
    rows: [
      '...............PPP',
      '..............PPPPP',
      '.............PPPPWKP',
      '.............YPPPPPPPT',
      '..............PPPPPYY',
      '.....PP.......PPPPY',
      '...PPPPPP.....PPPP',
      '..PPPpPPPP....PpPP',
      '..PPPPPPPPP...PPPP',
      '.PPPPYPPPPPP..PPPP',
      '.PPPY.YPPpPP.PPPPP',
      '.PPY...YPPPPPPPPPP',
      'PPP.....PPPPPpPPPY',
      'PPY.....YPPPPPPPY',
      'YY.......YYPPPPY',
      '...........YYYY',
    ],
  },

  robot: {
    palette: {
      G: '#cbd5e1',
      g: '#94a3b8',
      D: '#475569',
      C: '#22d3ee',
      R: '#ef4444',
      Y: '#facc15',
      M: '#0f172a',
    },
    rows: [
      '.........RR',
      '.........DD',
      '....GGGGGGGGGGGG',
      '...GGGGGGGGGGGGGG',
      '...GGDDDDDDDDDDGG',
      '.DDGGDCCDDDDCCDGGDD',
      '.DDGGDCCDDDDCCDGGDD',
      '...GGDDDDDDDDDDGG',
      '...GGGGGGGGGGGGGG',
      '...GGGGMMMMMMGGGG',
      '...gggggggggggggg',
      '........DDDD',
      '..GGGGGGGGGGGGGGGG',
      'ggGGGDDDDDDDDDDGGGgg',
      'ggGGGDRDCDYDDDDGGGgg',
      'ggGGGDDDDDDDDDDGGGgg',
      'ggGGGGGGGGGGGGGGGGgg',
      'DDgggggggggggggggggDD',
      '.....DDD....DDD',
      '....DDDD....DDDD',
    ],
  },

  /** Terminal Cat: a black cat sitting on a keyboard. Lighter outline so it reads on dark UI. */
  cat: {
    outline: '#5b5f7a',
    palette: {
      K: '#1c1c26',
      E: '#a3e635',
      p: '#0b0b0f',
      n: '#f472b6',
      C: '#334155',
      k: '#e2e8f0',
      d: '#94a3b8',
    },
    rows: [
      '...KK.......KK',
      '...KKK.....KKK',
      '...KKKKKKKKKKK',
      '..KKKKKKKKKKKKK',
      '..KKEEKKKKKEEKK',
      '..KKEpKKKKKpEKK',
      '..KKKKKKnKKKKKK',
      '...KKKKKKKKKKK',
      '....KKKKKKKKK.......K',
      '...KKKKKKKKKKK......K',
      '..KKKKKKKKKKKKK....KK',
      '..KKKKKKKKKKKKK...KK',
      '.KKKKKKKKKKKKKKKKKK',
      'CCCCKKKCCCKKKCCCCCCCCC',
      'CkkCkkCkkCkkCkkCkkCkkC',
      'CddCddCddCddCddCddCddC',
      'CCkkCkkCkkCkkCkkCkkCCC',
      'CCddCddCddCddCddCddCCC',
      'CkkCkkkkkkkkkkkkCkkkCC',
      'CddCddddddddddddCdddCC',
      'CCCCCCCCCCCCCCCCCCCCCC',
    ],
  },

  dragon: {
    palette: {
      G: '#22c55e',
      g: '#15803d',
      L: '#bbf7d0',
      V: '#166534',
      E: '#facc15',
      K: '#0f172a',
      H: '#fde68a',
    },
    rows: [
      '...V',
      '...VV..........HH',
      '...VVV........GGGG',
      '...VVVV......GGGGGG',
      '...VVVVV....GGGGEKGG',
      '...VVVVVV...GGGGGGGGGG',
      '....VVVVVV...GGGGGGGg',
      '.....VVVVV...GGGGGg',
      '......VVVGGGGGGGGG',
      '.......GGGGLLLGGGG',
      '......GGGGLLLLLGGG',
      '.....GGGGGLLLLLGGG',
      '.....GGGGGLLLLLGG',
      '....gGGGGGGLLLGGG',
      'GG..gGGGGGGGGGGGg',
      '.GG.ggGGGGGGGGGgg',
      '..GGGgggggggggggg',
      '.......gg...gg',
    ],
  },

  ghost: {
    palette: { W: '#f8fafc', w: '#cbd5e1', K: '#0f172a', B: '#f9a8d4' },
    rows: [
      '......WWWWWW',
      '....WWWWWWWWWW',
      '...WWWWWWWWWWWW',
      '..WWWWWWWWWWWWWW',
      '..WWWWWWWWWWWWWW',
      '.WWWWKKWWWWKKWWWW',
      '.WWWWKKWWWWKKWWWW',
      '.WWWWKKWWWWKKWWWW',
      '.WWBBWWWWWWWWBBWW',
      '.WWWWWWWKKWWWWWWW',
      '.WWWWWWWKKWWWWWWW',
      '.WWWWWWWWWWWWWWWW',
      '.WWWWWWWWWWWWWWWW',
      '.wWWWWWWWWWWWWWWw',
      '.wwWWWWWWWWWWWWww',
      '.wwwww.wwww.wwwww',
      '..www...ww...www',
    ],
  },

  chest: {
    palette: { O: '#b45309', o: '#78350f', Y: '#facc15', y: '#d97706', K: '#1f2937' },
    rows: [
      '...oooooooooooooooo',
      '..oOOOOOOOOOOOOOOOOo',
      '.oOOYOOOOOOOOOOOOYOOo',
      '.oOOYOOOOOOOOOOOOYOOo',
      '.oOOYOOOOOOOOOOOOYOOo',
      'oYYYYYYYYYYYYYYYYYYYYo',
      'oyyyyyyyyyYYyyyyyyyyyo',
      'oOOOYOOOOYYYYOOOOYOOOo',
      'oOOOYOOOOYKKYOOOOYOOOo',
      'oOOOYOOOOYYYYOOOOYOOOo',
      'oOOOYOOOOOOOOOOOOYOOOo',
      'oOOOYOOOOOOOOOOOOYOOOo',
      'oooooooooooooooooooooo',
    ],
  },

  crate: {
    palette: {
      R: '#ef4444',
      P: '#f8fafc',
      s: '#94a3b8',
      G: '#65a30d',
      g: '#365314',
      L: '#a3e635',
    },
    rows: [
      '......RRRPPPPRRR',
      '....RRRRRPPPPRRRRR',
      '...PPRRRRPPPPRRRRPP',
      '..PPPRRRRPPPPRRRRPPP',
      '..PPPRRRRPPPPRRRRPPP',
      '...s......ss......s',
      '....s.....ss.....s',
      '.....s....ss....s',
      '......s...ss...s',
      '.......s..ss..s',
      '.....gggggggggggg',
      '.....gGGGGGGGGGGg',
      '.....gGLGGGGGGLGg',
      '.....gGGLGGGGLGGg',
      '.....gGGGLGGLGGGg',
      '.....gGGGGLLGGGGg',
      '.....gGGGLGGLGGGg',
      '.....gGGLGGGGLGGg',
      '.....gGLGGGGGGLGg',
      '.....gggggggggggg',
    ],
  },

  vault: {
    palette: {
      D: '#334155',
      s: '#64748b',
      S: '#94a3b8',
      L: '#e2e8f0',
      Y: '#facc15',
    },
    rows: [
      'DDDDDDDDDDDDDDDDDDDDDD',
      'DssssssssssssssssssssD',
      'DsSSSSSSSSSSSSSSSSSSsD',
      'DsSSSSSSSSSSSSSSSSSSsD',
      'YsSSSSSSSSSSSSSSSSSSsD',
      'YsSSSSSSDDDDDDSSSSSSsD',
      'DsSSSSSDLLYYLLDSSSSSsD',
      'DsSSSSDLLLYYLLLDSSSSsD',
      'DsSSSSDLLLYYLLLDSSSSsD',
      'DsSSSSDYYYDDYYYDSSSSsD',
      'DsSSSSDYYYDDYYYDSSSSsD',
      'DsSSSSDLLLYYLLLDSSSSsD',
      'DsSSSSDLLLYYLLLDSSSSsD',
      'DsSSSSSDLLYYLLDSSSSSsD',
      'YsSSSSSSDDDDDDSSSSSSsD',
      'YsSSSSSSSSSSSSSSSSSSsD',
      'DsSSSSSSSSSSSSSSSSSSsD',
      'DsSSSSSSSSSSSSSSSSSSsD',
      'DssssssssssssssssssssD',
      'DDDDDDDDDDDDDDDDDDDDDD',
    ],
  },

  cake: {
    palette: {
      C: '#6b4226',
      c: '#4a2c19',
      W: '#fef3c7',
      R: '#dc2626',
      r: '#991b1b',
      Y: '#facc15',
      O: '#f97316',
      L: '#f8fafc',
      P: '#cbd5e1',
    },
    rows: [
      '..........YY',
      '.........YOOY',
      '..........OO',
      '..........LL',
      '..........RR',
      '...RR.....LL.....RR',
      '...rr.WW..RR..WW.rr',
      '.WWWWWWWWWWWWWWWWWWWW',
      '.WWWWWWWWWWWWWWWWWWWW',
      '.CWWCCWWCCWWCCWWCCWWC',
      '.CCCCCCCCCCCCCCCCCCCC',
      '.CCCCCCCCCCCCCCCCCCCC',
      '.WWWWWWWWWWWWWWWWWWWW',
      '.CCCCCCCCCCCCCCCCCCCC',
      '.CCCCCCCCCCCCCCCCCCCC',
      '.cccccccccccccccccccc',
      'PPPPPPPPPPPPPPPPPPPPPP',
    ],
  },

  sword: {
    palette: { B: '#f1f5f9', b: '#94a3b8', G: '#facc15', g: '#b45309', H: '#7c2d12', h: '#9a3412' },
    rows: [
      'Bb',
      'bBb',
      '.bBb',
      '..bBb',
      '...bBb',
      '....bBb',
      '.....bBb',
      '......bBb',
      '.......bBb....Gg',
      '........bBb..Gg',
      '.........bBbGg',
      '...........Gg',
      '..........GgHh',
      '.........Gg..Hh',
      '........Gg....Hh',
      '...............GG',
      '...............GG',
    ],
  },
} satisfies Record<string, Sprite>;

export type SpriteName = keyof typeof SPRITES;

export interface SpriteRect {
  fill: string;
  d: string;
}

const cache = new Map<string, SpriteRect[]>();

/**
 * Path data per colour, one horizontal run per `M…h…v1h…z`; every canvas cell has exactly one
 * colour, so paths never overlap. `anchor: 'top-left'` keeps the art at (1,1) instead of
 * centring it, for cursors whose hotspot must stay put.
 */
export function spriteRects(name: SpriteName, anchor: 'center' | 'top-left' = 'center'): SpriteRect[] {
  const key = `${name}:${anchor}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const sprite: Sprite = SPRITES[name];
  const rows = sprite.rows;
  const width = Math.max(...rows.map((r) => r.length));
  const at = (x: number, y: number) => rows[y]?.[x] ?? '.';

  let minX = width;
  let maxX = -1;
  let minY = rows.length;
  let maxY = -1;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }),
  );
  const offX = anchor === 'top-left' ? 1 - minX : Math.floor((SPRITE_SIZE - (maxX - minX + 1)) / 2) - minX;
  const offY = anchor === 'top-left' ? 1 - minY : Math.floor((SPRITE_SIZE - (maxY - minY + 1)) / 2) - minY;

  // Resolve every canvas cell to a colour: art first, then the outline around it.
  const grid: (string | null)[][] = Array.from({ length: SPRITE_SIZE }, () => Array(SPRITE_SIZE).fill(null));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const ch = at(x, y);
      if (ch !== '.') grid[y + offY][x + offX] = sprite.palette[ch] ?? '#ff00ff';
    }
  }
  const outline = sprite.outline ?? DEFAULT_OUTLINE;
  const filled = grid.map((row) => row.map((c) => c !== null));
  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < SPRITE_SIZE; x++) {
      if (filled[y][x]) continue;
      const touches = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].some(([nx, ny]) => filled[ny]?.[nx]);
      if (touches) grid[y][x] = outline;
    }
  }

  const byColour = new Map<string, string>();
  grid.forEach((row, y) => {
    let x = 0;
    while (x < SPRITE_SIZE) {
      const colour = row[x];
      let end = x + 1;
      while (end < SPRITE_SIZE && row[end] === colour) end++;
      if (colour) byColour.set(colour, `${byColour.get(colour) ?? ''}M${x} ${y}h${end - x}v1h-${end - x}z`);
      x = end;
    }
  });
  const rects = [...byColour].map(([fill, d]) => ({ fill, d }));
  cache.set(key, rects);
  return rects;
}

/** Standalone SVG markup, for cursors (data URIs) and scripts. */
export function spriteSvg(name: SpriteName, anchor: 'center' | 'top-left' = 'center', px = SPRITE_SIZE): string {
  const paths = spriteRects(name, anchor)
    .map((r) => `<path fill="${r.fill}" d="${r.d}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}" shape-rendering="crispEdges">${paths}</svg>`;
}
