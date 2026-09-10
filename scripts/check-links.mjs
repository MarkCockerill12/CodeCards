/**
 * Walks every resource URL in the content library and reports dead links.
 * Network-bound and slow, so it is not part of `npm run check` — run it on a schedule.
 *
 * Usage: node scripts/check-links.mjs [--concurrency 8]
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(root, 'content');
const argIdx = process.argv.indexOf('--concurrency');
const CONCURRENCY = argIdx > -1 ? Number(process.argv[argIdx + 1]) || 8 : 8;

async function head(url) {
  const opts = {
    redirect: 'follow',
    headers: { 'user-agent': 'CodeCards link checker' },
    signal: AbortSignal.timeout(12_000),
  };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    // A lot of docs hosts refuse HEAD but answer GET fine.
    if (res.status === 405 || res.status === 403) res = await fetch(url, { ...opts, method: 'GET' });
    return res.status;
  } catch (err) {
    return err.name === 'TimeoutError' ? 'timeout' : 'error';
  }
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  );

  /** @type {{url:string, cardId:string, topic:string}[]} */
  const targets = [];
  const seen = new Set();
  for (const file of files) {
    const topic = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    for (const mod of topic.modules ?? [])
      for (const card of mod.cards ?? [])
        for (const r of card.resources ?? []) {
          if (seen.has(r.url)) continue;
          seen.add(r.url);
          targets.push({ url: r.url, cardId: card.id, topic: topic.id });
        }
  }

  console.log(`checking ${targets.length} unique urls (concurrency ${CONCURRENCY})…`);
  const bad = [];
  let done = 0;

  const queue = [...targets];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const job = queue.pop();
      if (!job) return;
      const status = await head(job.url);
      done += 1;
      if (typeof status !== 'number' || status >= 400) bad.push({ ...job, status });
      if (done % 25 === 0) process.stdout.write(`  ${done}/${targets.length}\r`);
    }
  });
  await Promise.all(workers);

  if (bad.length === 0) {
    console.log(`\x1b[32mlinks ok\x1b[0m all ${targets.length} resources reachable`);
    return;
  }
  console.log(`\n\x1b[33m${bad.length} suspicious link(s)\x1b[0m`);
  for (const b of bad) console.log(`  [${b.status}] ${b.topic}/${b.cardId} → ${b.url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
