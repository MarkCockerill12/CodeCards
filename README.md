# CodeCards 🃏

A gamified, spaced-repetition study platform for software engineering. 492 cards across 47
topics — languages, computer science, databases, web, systems, networking, security, cloud,
architecture, AI, game development and process — scheduled by FSRS-5 so you revise each card
just before you would have forgotten it.

**No server. No database. No account. No tracking.** The whole thing is a static export and
every byte of your progress lives in your own browser.

---

## What it does

- **Real spaced repetition.** FSRS-5 (via `ts-fsrs`), not a naive right/wrong queue. Grade
  each card Again / Hard / Good / Easy and the scheduler adapts.
- **Seven card types, all reveal-then-self-grade** — no typing, no multiple choice:
  concept flip, predict-the-output, spot-the-bug, fill-the-blank, compare, complexity, scenario.
- **Calibration quiz** on day one samples every difficulty band so experts skip the basics.
- **Weakness detection per tag**, including a fluency signal — a "Good" that took far longer
  than your usual counts for less.
- **Prerequisite graph.** Fail a card and its unmastered foundations are injected into the
  same session, right where they help most.
- **Every card carries its own explanation plus external resources**, so a dead link never
  kills a card.
- **XP, levels, coins, chests and a cosmetics-only shop** — 86 cosmetics across card skins,
  card backs, flip animations, syntax themes, backgrounds, cursors, sound packs (synthesised,
  zero audio files), mascots, frames, XP bars, chest skins and name colours.
- **Keyboard-first study**: `Space` flip, `1-4` grade, `R` resources, `E` explanation, `F` flag.
- **PWA + offline**, dark by default, mobile tab bar.

Deliberately absent, by design: streaks, daily quests, leaderboards and XP throttling.

## Content is code

`content/*.json` is the source of truth, and it goes through a compiler:

```
content/*.json ──▶ zod schema validation
               ──▶ prerequisite + duplicate-id resolution
               ──▶ Shiki highlighting for every purchasable syntax theme
               ──▶ public/content/**  (fetched lazily, one file per topic)
```

The part worth stealing: **`npm run verify` executes every `predict-output` card** in Node or
Python and asserts the documented output still matches. A card whose answer drifts fails CI.
It has already caught one wrong answer in this repo.

## Getting started

```bash
npm install
npm run dev        # builds content, then starts Next.js on :3000
```

| Command | What it does |
|---|---|
| `npm run content` | Validate + highlight the card library into `public/content` |
| `npm run verify` | Execute every self-verifying card and assert its output |
| `npm run links` | HEAD every resource URL (slow, network-bound) |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | All of the above |
| `npm run e2e` | Real-browser journey test (needs `npx serve out -l 4173` running) |
| `npm run build` | Static export to `out/` |

Deploy `out/` anywhere that serves files — Vercel, Cloudflare Pages, S3, a USB stick.

## Adding cards

Add to the relevant `content/<topic>.json`, or create a new topic file (filename must match
the topic `id`). The schema lives in `scripts/content-schema.mjs`; `npm run content` will tell
you precisely what is wrong. A card needs at minimum:

```jsonc
{
  "id": "kebab-case-unique",
  "type": "flip",              // or predict-output | spot-bug | cloze | compare | complexity | scenario
  "difficulty": 3,             // 1-5
  "tags": ["python.generators"],
  "prompt": "…",
  "answer": "…",
  "explanation": "Must stand on its own without the link.",
  "resources": [{ "title": "…", "url": "https://…", "kind": "docs" }]
}
```

Add `"verify": { "runtime": "python", "expectedOutput": "…" }` to any card with runnable code
and CI will keep it honest.

## Stack

Next.js 15 (App Router, `output: 'export'`) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Framer Motion · Zustand + persist · ts-fsrs · Shiki (build time) · Zod (build time) · oxlint.

## Privacy

The app sets no cookies and makes no network requests beyond loading its own static content
files. Progress is kept in `localStorage`; the consent banner offers a session-only mode that
uses an in-memory store and writes nothing to disk. Settings has export, import and erase.
