import type { BCNewsCategory } from '../../types/newsapi';
import { categoryMeta } from '../../data/news-utils';
import { categoryColors } from '../../data/category-colors';

interface CategoryNavProps {
  activeCategory: BCNewsCategory | 'all';
  onCategoryChange: (category: BCNewsCategory | 'all') => void;
}

const categories: (BCNewsCategory | 'all')[] = [
  'all',
  'broker-news',
  'markets',
  'regulation-safety',
  'analysis-insights',
];

const activeBorderClass: Record<BCNewsCategory | 'all', string> = {
  'all': 'border-primary-500',
  'broker-news': categoryColors['broker-news'].border,
  'markets': categoryColors['markets'].border,
  'regulation-safety': categoryColors['regulation-safety'].border,
  'analysis-insights': categoryColors['analysis-insights'].border,
};

const activeTextClass: Record<BCNewsCategory | 'all', string> = {
  'all': 'text-foreground',
  'broker-news': 'text-secondary-600',
  'markets': 'text-emerald-700',
  'regulation-safety': 'text-amber-700',
  'analysis-insights': 'text-violet-700',
};

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="border-b border-border overflow-x-auto" aria-label="News categories">
      <div className="flex gap-0">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          const label = cat === 'all' ? 'All News' : categoryMeta[cat].label;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-5 py-4 text-base font-medium transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-secondary-500 ${
                isActive
                  ? `${activeBorderClass[cat]} ${activeTextClass[cat]}`
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
