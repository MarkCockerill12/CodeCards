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
    // Many hosts mishandle HEAD (405, 403, even 404) but answer GET fine, so confirm any
    // client error with a real GET before calling the link dead.
    if (res.status >= 400 && res.status < 500) res = await fetch(url, { ...opts, method: 'GET' });
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
  // Bot protection (Cloudflare, Medium, Stack Overflow) answers automated requests with
  // these even though the page exists — report them, but do not fail the run on them.
  const BLOCKED = new Set([401, 403, 406, 429]);
  const blocked = [];
  let done = 0;

  const queue = [...targets];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const job = queue.pop();
      if (!job) return;
      const status = await head(job.url);
      done += 1;
      if (BLOCKED.has(status)) blocked.push({ ...job, status });
      else if (typeof status !== 'number' || status >= 400) bad.push({ ...job, status });
      if (done % 25 === 0) process.stdout.write(`  ${done}/${targets.length}\r`);
    }
  });
  await Promise.all(workers);

  if (blocked.length) {
    console.log(`\n\x1b[33m${blocked.length} link(s) refused automated access\x1b[0m (check by hand)`);
    for (const b of blocked) console.log(`  [${b.status}] ${b.topic}/${b.cardId} → ${b.url}`);
  }
  if (bad.length === 0) {
    console.log(`\x1b[32mlinks ok\x1b[0m ${targets.length - blocked.length}/${targets.length} resources reachable`);
    return;
  }
  console.log(`\n\x1b[31m${bad.length} dead link(s)\x1b[0m`);
  for (const b of bad) console.log(`  [${b.status}] ${b.topic}/${b.cardId} → ${b.url}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
