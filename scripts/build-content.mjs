/**
 * Content build step.
 *
 *   content/*.json  --(zod validate)--> --(shiki highlight)--> public/content/**
 *
 * Fails loudly on: schema violations, duplicate card ids, unresolvable prerequisite
 * ids, prerequisite cycles, a same-topic prerequisite in a higher tier than the card
 * needing it, a topic without a Basics tier, and unknown languages. Content is code;
 * it goes through a compiler.
 */
import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeToHtml } from 'shiki';
import { topicSchema } from './content-schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(root, 'content');
const OUT_DIR = path.join(root, 'public', 'content');

/** Category display order on the topic picker. */
const CATEGORY_ORDER = [
  'Start Here',
  'Languages',
  'Computer Science',
  'Data & Databases',
  'Web',
  'Systems & OS',
  'Networking',
  'Security',
  'Cloud & DevOps',
  'Architecture',
  'AI & Data',
  'Game Development',
  'Process & Craft',
];

/**
 * Syntax themes we sell in the shop. Shiki emits one CSS variable per theme per token,
 * so a single highlight pass powers every purchasable theme with no duplication.
 */
export const SYNTAX_THEMES = {
  default: 'github-dark',
  nord: 'nord',
  catppuccin: 'catppuccin-mocha',
  dracula: 'dracula',
  monokai: 'monokai',
  onedark: 'one-dark-pro',
  vitesse: 'vitesse-dark',
  tokyo: 'tokyo-night',
  solarized: 'solarized-dark',
  gruvbox: 'vitesse-black',
};

const LANG_ALIASES = {
  py: 'python',
  'c++': 'cpp',
  cs: 'csharp',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  tf: 'hcl',
  ps: 'powershell',
};

/** Every topic must open with at least this many tier-1 cards. */
const MIN_BASICS = 5;

const fail = (msg) => {
  console.error(`\x1b[31mcontent error\x1b[0m ${msg}`);
  process.exitCode = 1;
};

/** Depth-first search over the prerequisite edges of every card, returning each cycle found. */
function prerequisiteCycles(topics) {
  const parents = new Map();
  for (const topic of topics)
    for (const mod of topic.modules)
      for (const card of mod.cards) parents.set(card.id, card.prerequisites ?? []);

  const cycles = [];
  const state = new Map(); // 1 = on the current path, 2 = finished
  const path = [];
  const visit = (id) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      cycles.push([...path.slice(path.indexOf(id)), id]);
      return;
    }
    state.set(id, 1);
    path.push(id);
    for (const pre of parents.get(id) ?? []) visit(pre);
    path.pop();
    state.set(id, 2);
  };
  for (const id of parents.keys()) visit(id);
  return cycles;
}

async function main() {
  const started = Date.now();
  const files = (await readdir(CONTENT_DIR)).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  );

  if (files.length === 0) {
    fail('no topic files found in content/');
    return;
  }

  const topics = [];
  const seenCardIds = new Map();
  const allTags = new Set();

  for (const file of files) {
    const raw = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    const parsed = topicSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fail(`${file}: ${issue.path.join('.')} — ${issue.message}`);
      }
      continue;
    }
    const topic = parsed.data;
    if (path.basename(file, '.json') !== topic.id) {
      fail(`${file}: filename must match topic id "${topic.id}"`);
    }
    for (const mod of topic.modules) {
      for (const card of mod.cards) {
        if (seenCardIds.has(card.id)) {
          fail(`duplicate card id "${card.id}" (${file} and ${seenCardIds.get(card.id)})`);
        }
        seenCardIds.set(card.id, file);
        card.tags.forEach((t) => allTags.add(t));
      }
    }
    topics.push(topic);
  }

  // Prerequisites must resolve to real cards, and must not point at themselves.
  for (const topic of topics) {
    for (const mod of topic.modules) {
      for (const card of mod.cards) {
        for (const pre of card.prerequisites ?? []) {
          if (pre === card.id) fail(`${card.id}: card lists itself as a prerequisite`);
          else if (!seenCardIds.has(pre)) fail(`${card.id}: unknown prerequisite "${pre}"`);
        }
      }
    }
  }

  // ...and must form a DAG: a cycle would make every card in it permanently "not ready".
  for (const cycle of prerequisiteCycles(topics)) {
    fail(`prerequisite cycle: ${cycle.join(' -> ')}`);
  }

  // A card's difficulty is its tier, and tiers unlock in order — so a prerequisite in the
  // same topic must never sit in a later tier than the card that needs it. Every topic
  // must also open with Basics: what it is and what it is for.
  for (const topic of topics) {
    const tierOf = new Map(topic.modules.flatMap((m) => m.cards.map((c) => [c.id, c.difficulty])));
    const basics = [...tierOf.values()].filter((d) => d === 1).length;
    if (basics < MIN_BASICS) fail(`${topic.id}: needs at least ${MIN_BASICS} Basics (tier 1) cards, has ${basics}`);
    for (const mod of topic.modules) {
      for (const card of mod.cards) {
        for (const pre of card.prerequisites ?? []) {
          if (tierOf.has(pre) && tierOf.get(pre) > card.difficulty) {
            fail(`${card.id} (tier ${card.difficulty}) requires ${pre} from a later tier (${tierOf.get(pre)})`);
          }
        }
      }
    }
  }

  if (process.exitCode === 1) {
    console.error('\nbuild aborted — fix the errors above.');
    return;
  }

  // Highlight every snippet once, across every purchasable theme.
  let highlighted = 0;
  const themeEntries = Object.entries(SYNTAX_THEMES);
  for (const topic of topics) {
    for (const mod of topic.modules) {
      for (const card of mod.cards) {
        if (!card.code) continue;
        const lang = LANG_ALIASES[card.lang] ?? card.lang;
        try {
          card.codeHtml = await codeToHtml(card.code, {
            lang,
            themes: Object.fromEntries(themeEntries),
            defaultColor: 'default',
            cssVariablePrefix: '--s-',
          });
          highlighted += 1;
        } catch (err) {
          fail(`${card.id}: cannot highlight lang "${card.lang}" — ${err.message}`);
        }
      }
    }
  }

  if (process.exitCode === 1) return;

  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(path.join(OUT_DIR, 'topics'), { recursive: true });

  const summaries = [];
  for (const topic of topics) {
    const cardCount = topic.modules.reduce((n, m) => n + m.cards.length, 0);
    summaries.push({
      id: topic.id,
      name: topic.name,
      icon: topic.icon,
      category: topic.category,
      color: topic.color,
      description: topic.description,
      moduleCount: topic.modules.length,
      cardCount,
    });
    await writeFile(
      path.join(OUT_DIR, 'topics', `${topic.id}.json`),
      JSON.stringify(topic),
      'utf8',
    );
  }

  const known = new Set(summaries.map((s) => s.category));
  const ordered = CATEGORY_ORDER.filter((c) => known.has(c));
  for (const c of known) if (!ordered.includes(c)) ordered.push(c);

  const index = {
    categories: ordered.map((name) => ({
      name,
      topics: summaries.filter((s) => s.category === name).map((s) => s.id),
    })),
    topics: summaries.sort((a, b) => a.name.localeCompare(b.name)),
    totalCards: summaries.reduce((n, s) => n + s.cardCount, 0),
    builtAt: new Date().toISOString(),
  };
  await writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');
  await writeFile(
    path.join(OUT_DIR, 'tags.json'),
    JSON.stringify([...allTags].sort()),
    'utf8',
  );

  const byType = {};
  const byTier = [0, 0, 0, 0, 0];
  for (const topic of topics)
    for (const mod of topic.modules)
      for (const card of mod.cards) {
        byType[card.type] = (byType[card.type] ?? 0) + 1;
        byTier[card.difficulty - 1] += 1;
      }

  console.log(
    `\x1b[32mcontent ok\x1b[0m ${topics.length} topics · ${index.totalCards} cards · ` +
      `${highlighted} snippets · ${allTags.size} tags · ${Date.now() - started}ms`,
  );
  console.log(
    '  ' +
      Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => `${t}:${n}`)
        .join('  '),
  );
  console.log(
    '  ' +
      ['basics', 'fundamentals', 'intermediate', 'advanced', 'expert']
        .map((name, i) => `${name}:${byTier[i]}`)
        .join('  '),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
