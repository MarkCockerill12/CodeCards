# CodeCards 🃏

A gamified, spaced-repetition study platform for software engineering. 1,694 cards across 59
topics — programming foundations, languages, computer science, databases, web, systems, networking, security, cloud,
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
- **Tiered progression, Basics → Expert.** Every topic climbs five tiers: Basics (what it is
  and what it is for), Fundamentals, Intermediate, Advanced, Expert. New cards only come from a
  topic's current tier, in authored order, interleaved across topics — so a first session meets
  "what is Python", "what is Git" and "what is SQL" before anything detailed. A tier unlocks the
  next once every card is seen and 80% are recalled; already know it? Pass its tier test (85%).
- **Start Here topic.** Programming Foundations covers what programming is, the building blocks
  every language shares, and what each major language is used for.
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
               ──▶ prerequisite resolution, cycle and duplicate-id checks
               ──▶ tier checks: every topic opens with Basics, and no prerequisite sits
                   in a later tier than the card that needs it
               ──▶ Shiki highlighting for every purchasable syntax theme
               ──▶ public/content/**  (fetched lazily, one file per topic)
```

The part worth stealing: **`npm run verify` executes every self-verifying card** — in Node,
Python, Go, Rust, Java, C#, PHP, Kotlin or C — and asserts the documented output still matches.
A card whose answer drifts fails CI. It has caught wrong answers in this repo more than once.

## Getting started

```bash
npm install
npm run dev        # builds content, then starts Next.js on :3000
```

| Command | What it does |
|---|---|
| `npm run content` | Validate + highlight the card library into `public/content` |
| `npm run verify` | Execute every self-verifying card and assert its output |
| `npm run links` | Check every resource URL (slow, network-bound; runs nightly in CI) |
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
  "difficulty": 3,             // tier: 1 Basics, 2 Fundamentals, 3 Intermediate, 4 Advanced, 5 Expert
  "tags": ["python.generators"],
  "prompt": "…",
  "answer": "…",
  "explanation": "Must stand on its own without the link.",
  "resources": [{ "title": "…", "url": "https://…", "kind": "docs" }]
}
```

Add `"verify": { "runtime": "python", "expectedOutput": "…" }` to any card with runnable code
and CI will keep it honest. Runtimes: `node`, `python`, `go`, `rust`, `java`, `csharp`, `php`,
`kotlin`, `c` (gcc). Locally, missing toolchains are skipped; in CI a missing one fails the run.

## Stack

Next.js 15 (App Router, `output: 'export'`) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Framer Motion · Zustand + persist · ts-fsrs · Shiki (build time) · Zod (build time) · oxlint.

Emoji are Microsoft's [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT), bundled as
SVGs in `public/emoji` so they look the same on every OS. Add new topic icons there and to
`src/data/emoji-assets.json`; the content build fails on an emoji without one. Mascots, chest
skins and the duck/sword cursors are CodeCards' own pixel art in `src/data/sprites.ts`.

## Privacy

The app sets no cookies and makes no network requests beyond loading its own static content
files. Progress is kept in `localStorage`; the consent banner offers a session-only mode that
uses an in-memory store and writes nothing to disk. Settings has export, import and erase.
