/**
 * Executes every card that carries a `verify` block and asserts the stored answer.
 *
 * This is the reason CodeCards content cannot silently rot: a `predict-output` card
 * whose snippet no longer produces the documented output fails the build.
 *
 * Runtimes that are not installed are reported as skipped, never as failures.
 */
import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(root, 'content');
const TMP = path.join(root, 'scripts', 'tmp');

const RUNTIMES = {
  node: { candidates: [['node', ['--version']]], ext: 'mjs', run: (f) => ['node', [f]] },
  python: {
    candidates: [
      ['python', ['--version']],
      ['python3', ['--version']],
      ['py', ['--version']],
    ],
    ext: 'py',
    run: (f, bin) => [bin, [f]],
  },
};

/** Spawns without a shell first; Windows needs one only for .cmd/.bat shims. */
function run(bin, args, opts = {}) {
  const direct = spawnSync(bin, args, { encoding: 'utf8', ...opts });
  if (!direct.error) return direct;
  if (process.platform !== 'win32') return direct;
  return spawnSync(`"${bin}"`, args, { encoding: 'utf8', shell: true, ...opts });
}

function resolveRuntime(name) {
  const spec = RUNTIMES[name];
  for (const [bin, args] of spec.candidates) {
    const probe = run(bin, args);
    if (probe.status === 0) return bin;
  }
  return null;
}

const normalise = (s) =>
  s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  );

  const jobs = [];
  for (const file of files) {
    const topic = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    for (const mod of topic.modules ?? []) {
      for (const card of mod.cards ?? []) {
        if (card.verify) jobs.push({ card, topic: topic.id });
      }
    }
  }

  if (jobs.length === 0) {
    console.log('verify: no cards carry a verify block yet.');
    return;
  }

  const resolved = {};
  for (const name of Object.keys(RUNTIMES)) resolved[name] = resolveRuntime(name);

  await mkdir(TMP, { recursive: true });

  let pass = 0;
  const skipped = [];
  const failures = [];

  for (const { card, topic } of jobs) {
    const spec = RUNTIMES[card.verify.runtime];
    const bin = resolved[card.verify.runtime];
    if (!bin) {
      skipped.push(`${card.id} (${card.verify.runtime} not installed)`);
      continue;
    }
    const file = path.join(TMP, `${card.id}.${spec.ext}`);
    await writeFile(file, card.code, 'utf8');
    const [cmd, args] = spec.run(file, bin);
    const res = run(cmd, args, { timeout: 10_000 });

    const actual = normalise(`${res.stdout ?? ''}${res.stderr ?? ''}`);
    const expected = normalise(card.verify.expectedOutput);

    if (actual === expected) pass += 1;
    else failures.push({ id: card.id, topic, expected, actual });
  }

  await rm(TMP, { recursive: true, force: true });

  for (const f of failures) {
    console.error(`\x1b[31mFAIL\x1b[0m ${f.topic}/${f.id}`);
    console.error(`  expected: ${JSON.stringify(f.expected)}`);
    console.error(`  actual:   ${JSON.stringify(f.actual)}`);
  }
  if (skipped.length) {
    console.log(`\x1b[33mskipped\x1b[0m ${skipped.length}: ${skipped.slice(0, 4).join(', ')}${skipped.length > 4 ? ' …' : ''}`);
  }
  console.log(
    failures.length
      ? `\x1b[31mverify failed\x1b[0m ${pass}/${jobs.length - skipped.length} passed`
      : `\x1b[32mverify ok\x1b[0m ${pass} executable cards produce their documented output`,
  );
  if (failures.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
