import type { Card, ContentIndex, Module, Topic, TopicSummary } from './types';

/**
 * Content loader.
 *
 * The library is a set of static JSON files emitted by `scripts/build-content.mjs`.
 * Topics are fetched lazily and cached for the lifetime of the tab, so a learner who
 * only studies Rust never downloads the Kubernetes deck.
 */

const indexCache: { value?: ContentIndex; promise?: Promise<ContentIndex> } = {};
const topicCache = new Map<string, Topic>();
const topicPromises = new Map<string, Promise<Topic>>();

const base = '/content';

export async function loadIndex(): Promise<ContentIndex> {
  if (indexCache.value) return indexCache.value;
  indexCache.promise ??= fetch(`${base}/index.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`content index ${r.status} — run "npm run content"`);
      return r.json() as Promise<ContentIndex>;
    })
    .then((value) => {
      indexCache.value = value;
      return value;
    });
  return indexCache.promise;
}

export async function loadTopic(id: string): Promise<Topic> {
  const cached = topicCache.get(id);
  if (cached) return cached;

  let promise = topicPromises.get(id);
  if (!promise) {
    promise = fetch(`${base}/topics/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`topic "${id}" ${r.status}`);
        return r.json() as Promise<Topic>;
      })
      .then((topic) => {
        // Stamp provenance onto every card so a card is always self-locating.
        for (const mod of topic.modules) {
          for (const card of mod.cards) {
            card.topicId = topic.id;
            card.moduleId = mod.id;
          }
        }
        topicCache.set(id, topic);
        return topic;
      });
    topicPromises.set(id, promise);
  }
  return promise;
}

export async function loadTopics(ids: string[]): Promise<Topic[]> {
  return Promise.all(ids.map(loadTopic));
}

export function cachedTopic(id: string): Topic | undefined {
  return topicCache.get(id);
}

export function allCards(topics: Topic[]): Card[] {
  return topics.flatMap((t) => t.modules.flatMap((m) => m.cards));
}

export function cardsOfModule(topic: Topic, moduleId: string): Card[] {
  return topic.modules.find((m) => m.id === moduleId)?.cards ?? [];
}

export function findModule(topics: Topic[], moduleId: string): { topic: Topic; module: Module } | undefined {
  for (const topic of topics) {
    const module = topic.modules.find((m) => m.id === moduleId);
    if (module) return { topic, module };
  }
  return undefined;
}

export function buildCardIndex(topics: Topic[]): Map<string, Card> {
  const map = new Map<string, Card>();
  for (const card of allCards(topics)) map.set(card.id, card);
  return map;
}

export function topicSummary(index: ContentIndex, id: string): TopicSummary | undefined {
  return index.topics.find((t) => t.id === id);
}

export const CARD_TYPE_LABEL: Record<Card['type'], string> = {
  flip: 'Concept',
  'predict-output': 'Predict the output',
  'spot-bug': 'Spot the bug',
  cloze: 'Fill the blank',
  compare: 'Compare',
  complexity: 'Complexity',
  scenario: 'Scenario',
};

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Intro',
  2: 'Easy',
  3: 'Core',
  4: 'Hard',
  5: 'Brutal',
};
