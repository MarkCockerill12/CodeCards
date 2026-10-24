/**
 * Hand-drawn SVG artwork for backgrounds and card backs. Everything is generated as a string
 * and shipped as a data URI, so no image files and no network requests.
 *
 * Scenes (the Lo-fi Room, the Synthwave sun) are 1600×900 and drawn with `cover` sizing; any
 * overlay or mask that has to line up with a scene uses the same viewBox, size and position.
 */

export const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/** Deterministic PRNG (mulberry32), so the art is identical on every build and every load. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

const scene = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">${body}</svg>`;

/* ------------------------------------------------------------------ */
/* Lo-fi Room                                                          */
/* ------------------------------------------------------------------ */

/** The four panes of glass; the rain overlay is masked to exactly these. */
const PANES = [
  [884, 194, 202, 172],
  [1094, 194, 202, 172],
  [884, 374, 202, 172],
  [1094, 374, 202, 172],
] as const;

/** The plant on the sill stands in front of the glass, so it is also cut out of the rain mask. */
const SILL_PLANT =
  `<ellipse cx="948" cy="494" rx="9" ry="26" transform="rotate(-28 948 494)"/>` +
  `<ellipse cx="962" cy="484" rx="9" ry="30"/>` +
  `<ellipse cx="978" cy="496" rx="9" ry="24" transform="rotate(32 978 496)"/>`;
const SILL_POT = 'M936 518h52l-6 44h-40z';

const lofiRoom = () => {
  const rand = rng(7);

  const drops = Array.from({ length: 34 }, () => {
    const [x, y, w, h] = PANES[Math.floor(rand() * PANES.length)];
    const cx = r1(x + 8 + rand() * (w - 16));
    const cy = r1(y + 8 + rand() * (h - 16));
    const rx = r1(1.2 + rand() * 1.8);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r1(rx * 1.5)}"/>`;
  }).join('');

  // City skyline across the bottom of the glass, with a few lit windows.
  let skyline = 'M884 546';
  let lit = '';
  for (let x = 884; x < 1296; ) {
    const w = 22 + Math.floor(rand() * 34);
    const top = 440 + Math.floor(rand() * 70);
    skyline += `V${top}H${Math.min(x + w, 1296)}`;
    for (let wy = top + 8; wy < 538; wy += 12) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (rand() < 0.22) lit += `<rect x="${wx}" y="${wy}" width="4" height="5"/>`;
      }
    }
    x += w;
  }
  skyline += 'V546Z';

  // String lights: bulbs along a sagging quadratic from (90,92) to (1510,104), control (800,190).
  const bulbs = Array.from({ length: 22 }, (_, i) => {
    const t = (i + 0.5) / 22;
    const x = r1((1 - t) ** 2 * 90 + 2 * (1 - t) * t * 800 + t ** 2 * 1510);
    const y = r1((1 - t) ** 2 * 92 + 2 * (1 - t) * t * 190 + t ** 2 * 104 + 9);
    return `<circle cx="${x}" cy="${y}" r="16" fill="url(#bulb)"/><circle cx="${x}" cy="${y}" r="4.5" fill="#ffd28a"/>`;
  }).join('');

  const shelfBooks = [
    [112, 46, '#7a3b2e'],
    [128, 52, '#2f4a5c'],
    [146, 40, '#8c6a2f'],
    [160, 50, '#4b3a5c'],
    [178, 44, '#3f5a3a'],
    [194, 54, '#6b2f3a'],
  ]
    .map(([x, h, c]) => `<rect x="${x}" y="${300 - (h as number)}" width="14" height="${h}" fill="${c}"/>`)
    .join('');

  const code = [
    [1024, 590, 70, '#7dd3fc'],
    [1036, 604, 110, '#f0abfc'],
    [1036, 618, 84, '#fcd34d'],
    [1048, 632, 120, '#86efac'],
    [1036, 646, 64, '#7dd3fc'],
    [1024, 660, 40, '#f0abfc'],
  ]
    .map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${c}" opacity=".75"/>`)
    .join('');

  return scene(
    `<defs>` +
      `<radialGradient id="wall" gradientUnits="userSpaceOnUse" cx="360" cy="500" r="1250">` +
      `<stop offset="0" stop-color="#7a4421"/><stop offset=".28" stop-color="#3f2213"/>` +
      `<stop offset=".7" stop-color="#1b120c"/><stop offset="1" stop-color="#0d0907"/></radialGradient>` +
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#0b1326"/><stop offset=".7" stop-color="#1f2a4a"/>` +
      `<stop offset="1" stop-color="#3a3554"/></linearGradient>` +
      `<radialGradient id="bulb"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/>` +
      `<stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="lamp"><stop offset="0" stop-color="#ffd59a" stop-opacity=".5"/>` +
      `<stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#ffd59a" stop-opacity=".32"/>` +
      `<stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="screen"><stop offset="0" stop-color="#7dd3fc" stop-opacity=".22"/>` +
      `<stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="vignette" cx=".5" cy=".45" r=".75">` +
      `<stop offset=".55" stop-color="#000" stop-opacity="0"/>` +
      `<stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>` +
      `</defs>` +
      `<rect width="1600" height="900" fill="url(#wall)"/>` +
      // Wall shelf with books
      `<rect x="96" y="300" width="230" height="10" fill="#3b2618"/>${shelfBooks}` +
      `<rect x="232" y="270" width="34" height="30" rx="4" fill="#8a4b2a"/>` +
      `<path d="M249 270c-14-24-4-40 0-44c4 4 14 20 0 44z" fill="#4f7a43"/>` +
      // Window: curtains, frame, sky, moon, skyline, panes, sill
      `<rect x="780" y="146" width="620" height="8" rx="4" fill="#2a1a10"/>` +
      `<path d="M792 150h82v500c-30 6-60 6-90 0c10-160 16-330 8-500z" fill="#5a2a1c"/>` +
      `<path d="M1306 150h82c-8 170-2 340 8 500c-30 6-60 6-90 0z" fill="#5a2a1c"/>` +
      `<path d="M812 150v496M842 150v500M1336 150v500M1366 150v496" stroke="#3e1c12" stroke-width="6"/>` +
      `<rect x="864" y="174" width="452" height="392" rx="6" fill="#24150d"/>` +
      `<rect x="884" y="194" width="412" height="352" fill="url(#sky)"/>` +
      `<circle cx="1222" cy="252" r="64" fill="#e8e6d9" opacity=".07"/>` +
      `<circle cx="1222" cy="252" r="26" fill="#e8e6d9" opacity=".85"/>` +
      `<path d="${skyline}" fill="#0a0f1e"/><g fill="#f5c46b" opacity=".7">${lit}</g>` +
      `<g fill="#b8c8e8" opacity=".38">${drops}</g>` +
      `<rect x="1086" y="194" width="8" height="352" fill="#24150d"/>` +
      `<rect x="884" y="366" width="412" height="8" fill="#24150d"/>` +
      `<rect x="846" y="562" width="488" height="18" rx="3" fill="#3b2618"/>` +
      // Plant on the sill
      `<path d="${SILL_POT}" fill="#8a4b2a"/><g fill="#4f7a43">${SILL_PLANT}</g>` +
      // String lights
      `<path d="M90 92Q800 190 1510 104" fill="none" stroke="#1a110b" stroke-width="2"/>${bulbs}` +
      // Lamp glow, beam, shade and stem
      `<circle cx="360" cy="520" r="300" fill="url(#lamp)"/>` +
      `<path d="M284 528h152l110 196h-372z" fill="url(#beam)"/>` +
      `<rect x="355" y="520" width="10" height="196" fill="#2a1d14"/>` +
      `<ellipse cx="360" cy="716" rx="56" ry="10" fill="#1d130d"/>` +
      `<path d="M318 428h84l38 100h-160z" fill="#c9783a"/>` +
      `<path d="M280 528h160" stroke="#e9a45c" stroke-width="4"/>` +
      // Desk and what is on it
      `<rect y="720" width="1600" height="180" fill="#1f140e"/>` +
      `<rect y="718" width="1600" height="10" fill="#3b2618"/>` +
      `<rect x="520" y="690" width="132" height="28" rx="2" fill="#7a3b2e"/>` +
      `<rect x="530" y="666" width="118" height="24" rx="2" fill="#2f4a5c"/>` +
      `<rect x="516" y="644" width="124" height="22" rx="2" fill="#8c6a2f"/>` +
      `<rect x="704" y="664" width="48" height="54" rx="7" fill="#d9cbb5"/>` +
      `<path d="M752 676c18 0 18 28 0 28" fill="none" stroke="#d9cbb5" stroke-width="7"/>` +
      `<path d="M718 652c-8-12 8-18 0-30M738 652c-8-12 8-18 0-30" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>` +
      // Laptop with code on screen
      `<circle cx="1110" cy="630" r="200" fill="url(#screen)"/>` +
      `<path d="M1000 566h232v148h-232z" fill="#1c1c24"/>` +
      `<rect x="1010" y="576" width="212" height="128" fill="#0f1420"/>${code}` +
      `<path d="M972 714h288l-14 10h-260z" fill="#2b2b33"/>` +
      `<rect width="1600" height="900" fill="url(#vignette)"/>`,
  );
};

export const LOFI_ROOM = lofiRoom();

/** Opaque where the glass is: masks the rain overlay to the window panes, minus the plant. */
export const LOFI_WINDOW_MASK = scene(
  `<mask id="m">` +
    PANES.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`).join('') +
    `<g fill="#000"><path d="${SILL_POT}"/>${SILL_PLANT}</g></mask>` +
    `<rect width="1600" height="900" fill="#fff" mask="url(#m)"/>`,
);

/** Lo-fi crops to the window side on narrow screens instead of the middle of the room. */
export const LOFI_POSITION = '70% 100%';

/** Rain streaks, one 110×220 tile; the `rain` keyframe moves exactly one tile height. */
export const RAIN_STREAKS = (() => {
  const rand = rng(11);
  const lines = Array.from({ length: 14 }, () => {
    const x = r1(rand() * 110);
    const y = r1(rand() * 220);
    const len = r1(14 + rand() * 22);
    // Streaks that run off the bottom are repeated at the top, so the tile wraps seamlessly.
    const seg = (dy: number) =>
      `<path d="M${x} ${r1(y + dy)}v${len}" stroke-opacity="${r1(0.3 + rand() * 0.4)}"/>`;
    return seg(0) + (y + len > 220 ? seg(-220) : '');
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="220"><g stroke="#cfdcf5" stroke-width="1.3" stroke-linecap="round">${lines}</g></svg>`;
})();

/* ------------------------------------------------------------------ */
/* Matrix Rain                                                         */
/* ------------------------------------------------------------------ */

// Half-width katakana (as in the film), digits and a few operators.
const MATRIX_CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ0123456789=+*<>:';

/**
 * One tile of falling glyph columns, each a bright head with a fading trail. Rows wrap around
 * the tile height, so the `rain` keyframe (one tile height) loops without a seam.
 */
const matrixTile = (seed: number, width: number, cols: number, size: number) => {
  const rand = rng(seed);
  const rows = 10;
  const step = 220 / rows;
  const pitch = width / cols;
  let glyphs = '';
  for (let c = 0; c < cols; c++) {
    const head = Math.floor(rand() * rows);
    const trail = 3 + Math.floor(rand() * 5);
    for (let k = 0; k <= trail; k++) {
      const row = (head - k + rows) % rows;
      const ch = MATRIX_CHARS[Math.floor(rand() * MATRIX_CHARS.length)];
      const fill = k === 0 ? '#d1fae5' : '#22c55e';
      const op = k === 0 ? 1 : r1(1 - k / (trail + 1));
      glyphs += `<text x="${r1(c * pitch + pitch / 2)}" y="${r1(row * step + size)}" fill="${fill}" opacity="${op}">${ch}</text>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="220" font-family="MS Gothic,Yu Gothic,monospace" font-size="${size}" text-anchor="middle">${glyphs}</svg>`;
};

export const MATRIX_GLYPHS = [matrixTile(3, 168, 7, 17), matrixTile(5, 130, 6, 13)];

/* ------------------------------------------------------------------ */
/* Synthwave Sunset                                                    */
/* ------------------------------------------------------------------ */

/** A striped chrome sun sitting on the horizon, with a mountain silhouette in front. */
export const SYNTHWAVE_SUN = (() => {
  // Gaps get taller towards the bottom of the sun, as in every 1984 album cover.
  const gaps = [0, 1, 2, 3, 4, 5]
    .map((i) => `<rect x="560" y="${468 + i * 22}" width="480" height="${3 + i * 2.4}" fill="#000"/>`)
    .join('');
  return scene(
    `<defs>` +
      `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#fde68a"/><stop offset=".45" stop-color="#fb923c"/>` +
      `<stop offset="1" stop-color="#db2777"/></linearGradient>` +
      `<radialGradient id="halo"><stop offset=".35" stop-color="#f472b6" stop-opacity=".35"/>` +
      `<stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient>` +
      `<mask id="cut"><rect width="1600" height="900" fill="#fff"/>${gaps}</mask>` +
      `</defs>` +
      `<circle cx="800" cy="440" r="330" fill="url(#halo)"/>` +
      `<circle cx="800" cy="440" r="200" fill="url(#sun)" mask="url(#cut)"/>` +
      `<path d="M0 600L170 520L260 556L420 452L560 560L660 520L800 600L940 528L1060 566L1200 470L1340 548L1450 512L1600 580V600Z" fill="#1e0b3a"/>` +
      `<path d="M0 600L170 520L260 556L420 452L560 560L660 520L800 600L940 528L1060 566L1200 470L1340 548L1450 512L1600 580" fill="none" stroke="#e879f9" stroke-opacity=".5" stroke-width="2"/>` +
      `<rect y="598" width="1600" height="302" fill="#12051f"/>` +
      `<rect y="597" width="1600" height="3" fill="#f0abfc" opacity=".8"/>`,
  );
})();

/* ------------------------------------------------------------------ */
/* Card back tiles                                                     */
/* ------------------------------------------------------------------ */

/** Scattered stars of mixed size and brightness. Height must divide the `parallax` keyframe. */
const starTile = (seed: number, width: number, height: number, count: number, size: number) => {
  const rand = rng(seed);
  const stars = Array.from({ length: count }, () => {
    const r = r1(size * (0.5 + rand() * 0.7));
    return `<circle cx="${r1(rand() * width)}" cy="${r1(rand() * height)}" r="${r}" fill-opacity="${r1(0.35 + rand() * 0.6)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="#fff">${stars}</svg>`;
};

/** Near layer (130px tall, 4 tiles per loop) and far layer (87px tall, 3 tiles per loop). */
export const STARS_NEAR = starTile(31, 170, 130, 7, 1.6);
export const STARS_FAR = starTile(37, 110, 87, 9, 0.9);

/** xxd-style rows: offset, eight byte pairs, then the ASCII gutter. */
export const HEX_DUMP = (() => {
  const rand = rng(21);
  const rows = Array.from({ length: 8 }, (_, i) => {
    const bytes = Array.from({ length: 8 }, () =>
      Math.floor(rand() * 256)
        .toString(16)
        .padStart(2, '0'),
    );
    const ascii = bytes.map((b) => {
      const n = parseInt(b, 16);
      return n > 32 && n < 127 && !'<>&"\''.includes(String.fromCharCode(n)) ? String.fromCharCode(n) : '.';
    });
    const off = (i * 16).toString(16).padStart(8, '0');
    const y = 16 + i * 20;
    return (
      `<text x="6" y="${y}" fill="#64748b">${off}:</text>` +
      `<text x="86" y="${y}">${bytes.join(' ')}</text>` +
      `<text x="290" y="${y}" fill="#64748b">${ascii.join('')}</text>`
    );
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="370" height="160" font-family="Consolas,monospace" font-size="11" fill="#94a3b8" xml:space="preserve">${rows}</svg>`;
})();

/** Copper PCB traces with 45° bends, vias and pads; edges meet the neighbouring tiles. */
export const CIRCUIT_TRACES =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
  '<g fill="none" stroke="#f59e0b" stroke-opacity=".38" stroke-width="2">' +
  '<path d="M0 20H40L60 40H120"/><path d="M0 80H24L44 100V120"/><path d="M44 0V12L72 40"/>' +
  '<path d="M90 0V20L104 34V80L120 96"/><path d="M60 40V70L80 90H120"/><path d="M0 100H14"/>' +
  '</g><g fill="#f59e0b" fill-opacity=".5">' +
  '<circle cx="60" cy="70" r="4"/><circle cx="104" cy="80" r="3.5"/><circle cx="14" cy="100" r="4"/>' +
  '<rect x="24" y="52" width="14" height="10" rx="1.5"/></g>' +
  '<circle cx="60" cy="70" r="1.6" fill="#000" fill-opacity=".6"/></svg>';

/** Elder Futhark-ish runes drawn as strokes, plus the odd Rust lifetime. */
export const COMPILER_RUNES = (() => {
  const runes = [
    'M0 0v28M0 6l10-6M0 14l10-6', // fehu
    'M0 0v28M0 0l10 8v20', // uruz
    'M0 0v28M0 8l9 6-9 6', // thurisaz
    'M5 0v28M0 4l5 6 5-6', // algiz
    'M0 0l10 14L0 28M10 0L0 14l10 14', // dagaz-ish
    'M0 0v28M10 0v28M0 10l10 8', // naudiz
    'M5 0v28M0 8l10 12', // naudhiz
    'M0 0l10 10L0 20l10 8', // sowilo
  ];
  const at = [
    [14, 12],
    [64, 30],
    [112, 8],
    [28, 72],
    [90, 82],
    [140, 56],
    [52, 124],
    [124, 128],
  ];
  const strokes = runes
    .map((d, i) => `<path transform="translate(${at[i][0]} ${at[i][1]})" d="${d}"/>`)
    .join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="170" height="170">' +
    `<g fill="none" stroke="#c4b5fd" stroke-opacity=".32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>` +
    `<g font-family="Consolas,monospace" font-size="12" fill="#a78bfa" fill-opacity=".3">` +
    `<text x="100" y="40">'a</text><text x="10" y="150">&amp;mut</text><text x="140" y="106">::&lt;&gt;</text></g></svg>`
  );
})();
