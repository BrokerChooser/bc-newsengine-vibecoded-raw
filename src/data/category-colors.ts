import type { BCNewsCategory } from '../types/newsapi';

/**
 * Category color tokens for pill badges and nav indicators.
 * Uses Tailwind classes only — no hex values.
 */
export const categoryColors: Record<BCNewsCategory, {
  bg: string;
  text: string;
  border: string;
}> = {
  'broker-news': {
    bg: 'bg-secondary-500',
    text: 'text-white',
    border: 'border-secondary-500',
  },
  'markets': {
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-600',
  },
  'regulation-safety': {
    bg: 'bg-amber-500',
    text: 'text-slate-900',
    border: 'border-amber-500',
  },
  'analysis-insights': {
    bg: 'bg-violet-600',
    text: 'text-white',
    border: 'border-violet-600',
  },
};

export function getCategoryColor(category: BCNewsCategory) {
  return categoryColors[category];
}
