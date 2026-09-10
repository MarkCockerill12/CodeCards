'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Card, ContentIndex, Topic } from './types';
import { allCards, buildCardIndex, loadIndex, loadTopics } from './content';
import { buildGraph, type PrereqGraph } from './prereq';
import { useStore } from './store';

interface Library {
  index?: ContentIndex;
  topics: Topic[];
  cards: Card[];
  byId: Map<string, Card>;
  graph: PrereqGraph;
  loading: boolean;
  error?: string;
}

const EMPTY_GRAPH: PrereqGraph = { parents: new Map(), children: new Map() };

/** Loads the content index plus whichever topics the caller asks for. */
export function useLibrary(topicIds?: string[]): Library {
  const selected = useStore((s) => s.selectedTopics);
  const ids = topicIds ?? selected;
  const key = [...ids].sort().join(',');

  const [index, setIndex] = useState<ContentIndex>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let live = true;
    loadIndex()
      .then((value) => live && setIndex(value))
      .catch((err: Error) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    const list = key ? key.split(',') : [];
    if (list.length === 0) {
      setTopics([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadTopics(list)
      .then((loaded) => {
        if (!live) return;
        setTopics(loaded);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!live) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [key]);

  return useMemo(() => {
    const cards = allCards(topics);
    return {
      index,
      topics,
      cards,
      byId: buildCardIndex(topics),
      graph: cards.length ? buildGraph(cards) : EMPTY_GRAPH,
      loading,
      error,
    };
  }, [topics, index, loading, error]);
}

/** Just the index — for pickers and overviews that do not need card bodies. */
export function useIndex(): { index?: ContentIndex; error?: string } {
  const [index, setIndex] = useState<ContentIndex>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let live = true;
    loadIndex()
      .then((value) => live && setIndex(value))
      .catch((err: Error) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, []);
  return { index, error };
}
