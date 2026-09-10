/**
 * End-to-end smoke test of the real user journey in a real browser.
 *
 *   npm run build
 *   npx serve out -l 4173
 *   npx playwright install chromium   # first run only
 *   npm run e2e
 *
 * Covers: consent -> onboarding -> study session (keyboard) -> reward overlay ->
 * persistence -> shop purchase and equip -> reload -> remaining routes.
 * Fails on any console error or uncaught page error.
 */
import { chromium } from 'playwright';

const BASE = process.env.CC_BASE_URL ?? 'http://localhost:4173';
const errors = [];
const step = (msg) => console.log(`  ${msg}`);
const num = (s) => Number(String(s).replace(/[^0-9]/g, ''));

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

// ---- 1. First visit: consent banner, then onboarding redirect ----
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Accept & remember/i }).click();
await page.waitForURL('**/onboarding/**', { timeout: 10000 });
step('consent accepted -> redirected to onboarding');

// ---- 2. Onboarding: name -> topics -> goals ----
await page.getByPlaceholder('Your name').fill('Mark');
await page.getByRole('button', { name: /^Next/ }).click();
await page.getByRole('button', { name: 'Select all' }).first().click();
await page.waitForTimeout(300);
const picker = await page.locator('text=cards selected').first().innerText();
step(`topic picker: ${picker.trim()}`);
await page.getByRole('button', { name: /^Next/ }).click();
await page.getByRole('button', { name: 'Skip calibration' }).click();
await page.waitForURL(`${BASE}/`, { timeout: 10000 });
step('onboarding completed -> dashboard');

// ---- 3. Dashboard renders real stats ----
await page.waitForSelector('text=Welcome back', { timeout: 15000 });
const decks = await page.locator('text=Your decks').count();
step(`dashboard rendered (deck panel present: ${decks > 0})`);

// ---- 4. Study session: keyboard flip + grade ----
await page.goto(`${BASE}/study/?mode=review`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Reveal answer', { timeout: 20000 });
let graded = 0;
let overlaysSeen = 0;
const dismissOverlay = async () => {
  const cont = page.getByRole('button', { name: 'Continue' });
  if (await cont.isVisible().catch(() => false)) {
    // While this is open the session must ignore the keyboard entirely.
    await page.keyboard.press(' ');
    await page.waitForTimeout(150);
    const flippedUnderneath = await page.locator('button:has-text("Good")').isVisible().catch(() => false);
    if (flippedUnderneath) throw new Error('reward overlay leaked Space through to the card');
    await cont.click();
    await page.waitForTimeout(400);
    overlaysSeen += 1;
  }
};

for (let i = 0; i < 12; i++) {
  await dismissOverlay();
  await page.keyboard.press(' ');
  await page.waitForSelector('button:has-text("Good")', { timeout: 8000 });
  await page.keyboard.press('3');
  graded += 1;
  await page.waitForTimeout(350);
}
await dismissOverlay();
step(`graded ${graded} cards via keyboard; dismissed ${overlaysSeen} reward overlay(s) with no key leakage`);

// ---- 5. XP persisted into the store ----
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('cc.state.v1')).state);
if (!(stored.xp > 0)) throw new Error('XP did not persist');
if (Object.keys(stored.reviews).length !== graded) {
  throw new Error(`expected ${graded} review records, got ${Object.keys(stored.reviews).length}`);
}
const firstReview = Object.values(stored.reviews)[0];
if (!(firstReview.due > Date.now())) throw new Error('FSRS did not schedule a future due date');
step(`store: ${stored.xp} XP, ${Object.keys(stored.reviews).length} FSRS review records, next due scheduled`);

// ---- 6. Stats page reflects it ----
await page.goto(`${BASE}/stats/`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Total XP', { timeout: 15000 });
const totalXp = num(await page.locator('text=Total XP').locator('..').innerText());
if (totalXp !== stored.xp) throw new Error(`stats shows ${totalXp}, store has ${stored.xp}`);
step(`stats page agrees with the store (${totalXp} XP)`);

// ---- 7. Shop: buy then equip a cosmetic ----
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem('cc.state.v1'));
  raw.state.coins = 5000;
  localStorage.setItem('cc.state.v1', JSON.stringify(raw));
});
await page.goto(`${BASE}/shop/`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Card Skins', { timeout: 15000 });
const ownedBefore = await page.evaluate(
  () => JSON.parse(localStorage.getItem('cc.state.v1')).state.owned.length,
);
await page.locator('button:has-text("250")').first().click();
await page.waitForTimeout(400);
const ownedAfter = await page.evaluate(
  () => JSON.parse(localStorage.getItem('cc.state.v1')).state.owned.length,
);
if (ownedAfter !== ownedBefore + 1) throw new Error('purchase did not add a cosmetic');
await page.getByRole('button', { name: 'Equip', exact: true }).first().click();
await page.waitForTimeout(400);
if ((await page.locator('button:has-text("Equipped")').count()) < 1) {
  throw new Error('cosmetic did not equip');
}
const coinsLeft = await page.evaluate(
  () => JSON.parse(localStorage.getItem('cc.state.v1')).state.coins,
);
step(`shop: bought a cosmetic (owned ${ownedBefore} -> ${ownedAfter}), equipped it, ${coinsLeft} coins left`);

// ---- 8. Reload: state survives ----
await page.goto(`${BASE}/stats/`, { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=Total XP', { timeout: 15000 });
const afterReload = num(await page.locator('text=Total XP').locator('..').innerText());
if (afterReload !== totalXp) throw new Error(`XP changed across reload: ${totalXp} -> ${afterReload}`);
step(`state survives a reload (${afterReload} XP)`);

// ---- 9. Remaining routes render ----
for (const path of ['/path/', '/library/', '/settings/']) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}
step('path, library and settings rendered');

await browser.close();

if (errors.length) {
  const unique = [...new Set(errors)];
  console.log(`\n${unique.length} unique browser error(s):`);
  for (const e of unique.slice(0, 10)) console.log(`  ! ${e}`);
  process.exit(1);
}
console.log('\nE2E OK — full flow works, no console or page errors');
