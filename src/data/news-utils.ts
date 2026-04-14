import type { BCEnrichedArticle } from '../types/newsapi';

export const categoryMeta: Record<string, { label: string; shortLabel: string; description: string }> = {
  'broker-news':       { label: 'Broker News',         shortLabel: 'Broker News', description: 'Latest updates from brokers and trading platforms' },
  'markets':           { label: 'Markets',             shortLabel: 'Markets',     description: 'Market analysis and financial news' },
  'regulation-safety': { label: 'Regulation & Safety', shortLabel: 'Regulatory',  description: 'Regulatory updates and investor protection' },
  'analysis-insights': { label: 'Analysis & Insights', shortLabel: 'Analysis',    description: 'Expert analysis and market insights' },
};

export function getArticlesByCategory(articles: BCEnrichedArticle[], category: string): BCEnrichedArticle[] {
  return articles.filter((a) => a.bcCategory === category);
}

export function getArticleBySlug(articles: BCEnrichedArticle[], slug: string): BCEnrichedArticle | undefined {
  return articles.find((a) => a.bcSlug === slug);
}
