import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BCNewsCategory } from '../types/newsapi';
import { categoryMeta, getArticlesByCategory } from '../data/news-utils';
import { useArticles } from '../hooks/useArticles';
import CategoryNav from '../components/ui/CategoryNav';
import HeroCard from '../components/news/HeroCard';
import ArticleCard from '../components/news/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { useSEO } from '../hooks/useSEO';
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  BASE_URL,
  articleUrl,
  buildHomePageSchema,
} from '../utils/seo';

const PAGE_SIZE = 20;

function buildHref(page: number, category: BCNewsCategory | 'all'): string {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `/news${qs ? `?${qs}` : ''}`;
}

function buildCanonical(page: number, category: BCNewsCategory | 'all'): string {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `${BASE_URL}/news${qs ? `?${qs}` : ''}`;
}

export default function NewsHome() {
  const { articles: allArticles, loading } = useArticles();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get('category');
  const activeCategory: BCNewsCategory | 'all' = rawCategory ? (rawCategory as BCNewsCategory) : 'all';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') return allArticles;
    return getArticlesByCategory(allArticles, activeCategory);
  }, [activeCategory, allArticles]);

  // Page 1 "all": hero + 4 top stories + 15 grid = 20
  // Page 1 category / page 2+: straight grid of PAGE_SIZE
  const isFirstAllPage = activeCategory === 'all' && currentPage === 1;

  const pagedArticles = useMemo(() => {
    if (isFirstAllPage) return filteredArticles.slice(0, PAGE_SIZE);
    const offset = (currentPage - 1) * PAGE_SIZE;
    return filteredArticles.slice(offset, offset + PAGE_SIZE);
  }, [filteredArticles, currentPage, isFirstAllPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE)),
    [filteredArticles]
  );

  const homeSchema = useMemo(
    () =>
      buildHomePageSchema(
        allArticles.slice(0, 10).map((a) => ({
          title: a.title,
          url: articleUrl(a.bcSlug),
          image: a.image ?? '',
          datePublished: a.dateTimePub,
        }))
      ),
    [allArticles]
  );

  const pageTitle =
    activeCategory === 'all'
      ? currentPage > 1
        ? `${DEFAULT_TITLE} — Page ${currentPage}`
        : DEFAULT_TITLE
      : currentPage > 1
        ? `${categoryMeta[activeCategory]?.label} News | BrokerChooser — Page ${currentPage}`
        : `${categoryMeta[activeCategory]?.label} News | BrokerChooser`;

  useSEO({
    title: pageTitle,
    description: DEFAULT_DESCRIPTION,
    canonical: buildCanonical(currentPage, activeCategory),
    schema: currentPage === 1 ? homeSchema : undefined,
    prevUrl: currentPage > 1 ? buildCanonical(currentPage - 1, activeCategory) : undefined,
    nextUrl: currentPage < totalPages ? buildCanonical(currentPage + 1, activeCategory) : undefined,
  });

  function handleCategoryChange(cat: BCNewsCategory | 'all') {
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    setSearchParams(params, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const heroArticle = isFirstAllPage ? pagedArticles[0] : undefined;
  const topStories = isFirstAllPage ? pagedArticles.slice(1, 5) : [];
  const gridArticles = isFirstAllPage ? pagedArticles.slice(5) : pagedArticles;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-secondary-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <CategoryNav activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Latest ticker */}
      <div className="flex items-center gap-3 py-3 border-b border-border mb-6 overflow-hidden">
        <span className="flex-shrink-0 bg-danger-500 text-white text-sm font-semibold px-3 py-1 rounded">
          LATEST
        </span>
        <p className="text-base text-muted-foreground truncate">
          {filteredArticles[0]?.title}
        </p>
      </div>

      {/* Hero — page 1 "all" only */}
      {heroArticle && (
        <section className="mb-10" aria-label="Featured article">
          <HeroCard article={heroArticle} />
        </section>
      )}

      {/* Top Stories — page 1 "all" only */}
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

      {/* Article grid */}
      {gridArticles.length > 0 && (
        <section aria-label={activeCategory === 'all' ? 'More articles' : `${categoryMeta[activeCategory]?.label} articles`}>
          {(activeCategory !== 'all' || currentPage > 1) && (
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {activeCategory === 'all'
                  ? `All News — Page ${currentPage}`
                  : categoryMeta[activeCategory]?.label}
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          {isFirstAllPage && gridArticles.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">More News</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gridArticles.map((article) => (
              <ArticleCard key={article.uri} article={article} variant="medium" />
            ))}
          </div>
        </section>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(page) => buildHref(page, activeCategory)}
      />
    </div>
  );
}
