import type { Card, ReviewState } from './types';
import { maturity } from './scheduler';

/**
 * Prerequisite graph.
 *
 * Cards declare the ideas they depend on. When a learner fails a card we walk *down*
 * the graph and inject the unmastered foundations into the same session — the moment
 * they are most receptive to them.
 */

export interface PrereqGraph {
  /** cardId -> direct prerequisites */
  parents: Map<string, string[]>;
  /** cardId -> cards that depend on it */
  children: Map<string, string[]>;
}

export function buildGraph(cards: Card[]): PrereqGraph {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const card of cards) {
    const pres = card.prerequisites ?? [];
    parents.set(card.id, pres);
    for (const pre of pres) {
      children.set(pre, [...(children.get(pre) ?? []), card.id]);
    }
  }
  return { parents, children };
}

const isMastered = (state: ReviewState | undefined): boolean => {
  const m = maturity(state);
  return m === 'young' || m === 'mature';
};

/**
 * Walks up to `depth` levels of prerequisites, returning the unmastered ones nearest
 * the failed card first. Cycle-safe.
 */
export function remedialFor(
  cardId: string,
  graph: PrereqGraph,
  reviews: Record<string, ReviewState>,
  limit = 2,
  depth = 2,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>([cardId]);
  let frontier = graph.parents.get(cardId) ?? [];

  for (let d = 0; d < depth && out.length < limit; d += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      if (!isMastered(reviews[id])) {
        out.push(id);
        if (out.length >= limit) break;
      }
      next.push(...(graph.parents.get(id) ?? []));
    }
    frontier = next;
  }
  return out;
}

/**
 * How ready a learner is for a card: 1 when every prerequisite is mastered, 0 when
 * none are. Cards with no prerequisites are always ready.
 */
export function readiness(
  card: Card,
  reviews: Record<string, ReviewState>,
): number {
  const pres = card.prerequisites ?? [];
  if (pres.length === 0) return 1;
  const mastered = pres.filter((id) => isMastered(reviews[id])).length;
  return mastered / pres.length;
}

/** Detects cycles at runtime as a safety net; the build script also rejects them. */
export function findCycles(graph: PrereqGraph): string[][] {
  const cycles: string[][] = [];
  const colour = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];

  const visit = (id: string) => {
    const state = colour.get(id) ?? 0;
    if (state === 1) {
      const start = stack.indexOf(id);
      if (start > -1) cycles.push([...stack.slice(start), id]);
      return;
    }
    if (state === 2) return;
    colour.set(id, 1);
    stack.push(id);
    for (const parent of graph.parents.get(id) ?? []) visit(parent);
    stack.pop();
    colour.set(id, 2);
  };

  for (const id of graph.parents.keys()) visit(id);
  return cycles;
}
