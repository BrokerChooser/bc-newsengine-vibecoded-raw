import { useState, useMemo, useCallback } from 'react';
import type { BCNewsCategory } from '../types/newsapi';
import { dummyArticles, categoryMeta, getArticlesByCategory } from '../data/dummy-articles';
import CategoryNav from '../components/ui/CategoryNav';
import HeroCard from '../components/news/HeroCard';
import ArticleCard from '../components/news/ArticleCard';

export default function NewsHome() {
  const [activeCategory, setActiveCategory] = useState<BCNewsCategory | 'all'>('all');

  const handleCategoryChange = useCallback((cat: BCNewsCategory | 'all') => {
    setActiveCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const articles = useMemo(() => {
    if (activeCategory === 'all') return dummyArticles;
    return getArticlesByCategory(activeCategory);
  }, [activeCategory]);

  const heroArticle = articles[0];
  const topStories = articles.slice(1, 5);
  const remainingArticles = articles.slice(5);

  // Group remaining by category for the "all" view
  const categoryGroups = useMemo(() => {
    if (activeCategory !== 'all') return [];
    const cats: BCNewsCategory[] = ['broker-news', 'markets', 'regulation-safety', 'analysis-insights', 'guides'];
    return cats
      .map((cat) => ({
        category: cat,
        meta: categoryMeta[cat],
        articles: getArticlesByCategory(cat),
      }))
      .filter((g) => g.articles.length > 0);
  }, [activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Category Navigation */}
      <CategoryNav activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Breaking / Ticker bar */}
      <div className="flex items-center gap-3 py-3 border-b border-border mb-6 overflow-hidden">
        <span className="flex-shrink-0 bg-danger-500 text-white text-sm font-semibold px-3 py-1 rounded">
          LATEST
        </span>
        <p className="text-base text-muted-foreground truncate">
          {heroArticle?.title}
        </p>
      </div>

      {/* Hero Section */}
      {heroArticle && (
        <section className="mb-10" aria-label="Featured article">
          <HeroCard article={heroArticle} />
        </section>
      )}

      {/* Top Stories Grid — 4 cards */}
      {topStories.length > 0 && (
        <section className="mb-14" aria-label="Top stories">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Top Stories</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {topStories.map((article) => (
              <ArticleCard key={article.uri} article={article} variant="medium" />
            ))}
          </div>
        </section>
      )}

      {/* Category view — filtered results in grid */}
      {activeCategory !== 'all' && remainingArticles.length > 0 && (
        <section aria-label="More articles">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              More in {categoryMeta[activeCategory].label}
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.uri} article={article} variant="medium" />
            ))}
          </div>
        </section>
      )}

      {/* All view — grouped by category sections */}
      {activeCategory === 'all' && categoryGroups.map((group) => (
        <section key={group.category} className="mb-14" aria-label={group.meta.label}>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{group.meta.label}</h2>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => handleCategoryChange(group.category)}
              className="text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
            >
              View all →
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{group.meta.description}</p>

          {/* First article large + sidebar list */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <ArticleCard article={group.articles[0]} variant="large" />
            </div>
            <div className="lg:col-span-5 border border-border rounded-lg bg-card divide-y divide-border">
              {group.articles.slice(1, 5).map((article) => (
                <div key={article.uri} className="px-4">
                  <ArticleCard article={article} variant="small" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

    </div>
  );
}
