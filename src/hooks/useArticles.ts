import { useState, useEffect } from 'react';
import type { BCEnrichedArticle } from '../types/newsapi';

let cache: BCEnrichedArticle[] | null = null;
let promise: Promise<BCEnrichedArticle[]> | null = null;

function loadArticles(): Promise<BCEnrichedArticle[]> {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = fetch('/data/articles.json')
      .then(res => {
        if (!res.ok) throw new Error(`articles.json: ${res.status}`);
        return res.json() as Promise<BCEnrichedArticle[]>;
      })
      .then(data => {
        cache = Array.isArray(data) ? data : [];
        return cache;
      })
      .catch(() => {
        promise = null; // allow retry on next mount
        return [] as BCEnrichedArticle[];
      });
  }
  return promise;
}

export function useArticles() {
  const [articles, setArticles] = useState<BCEnrichedArticle[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache !== null) return; // already loaded
    loadArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  return { articles, loading };
}
