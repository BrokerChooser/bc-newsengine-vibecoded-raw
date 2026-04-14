import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { categoryMeta } from '../data/news-utils';
import { useArticles } from '../hooks/useArticles';
import { getBrokerInfo, SLUG_TO_NAME, SLUG_CANONICAL } from '../data/broker-data';
import ArticleCard from '../components/news/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { useSEO } from '../hooks/useSEO';
import {
  BASE_URL,
  brokerNewsUrl,
  brokerPageTitle,
  brokerPageDescription,
  buildBrokerPageSchema,
  articleUrl,
} from '../utils/seo';

const PAGE_SIZE = 20;

export default function BrokerNewsPage() {
  const { brokerSlug = '' } = useParams<{ brokerSlug: string }>();
  const { articles: allArticles, loading } = useArticles();
  const [searchParams] = useSearchParams();

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const canonicalSlug = SLUG_CANONICAL[brokerSlug] ?? brokerSlug;
  const brokerInfo = getBrokerInfo(brokerSlug);
  const brokerName = brokerInfo?.name ?? SLUG_TO_NAME[brokerSlug] ?? brokerSlug.replace(/-/g, ' ');

  const articles = useMemo(() => {
    const registryName = SLUG_TO_NAME[brokerSlug]?.toLowerCase() ?? brokerSlug.toLowerCase().replace(/-/g, ' ');
    // Brokers whose names appear too often as common English words — tag-only matching
    const TEXT_MATCH_DENYLIST = new Set(['stake', 'admiral', 'vanguard', 'ally', 'first']);
    const escaped = registryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundary = new RegExp(`\\b${escaped}\\b`, 'i');
    return allArticles.filter((article) => {
      if (article.bcRelatedBrokers?.includes(brokerSlug)) return true;
      // Text-match only for unambiguous names: longer than 4 chars and not in denylist
      if (registryName.length > 4 && !TEXT_MATCH_DENYLIST.has(brokerSlug)) {
        const haystack = article.title + ' ' + article.body.slice(0, 400);
        if (wordBoundary.test(haystack)) return true;
      }
      return false;
    });
  }, [allArticles, brokerSlug]);

  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const pagedArticles = articles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function buildHref(page: number): string {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/news/broker/${brokerSlug}${qs ? `?${qs}` : ''}`;
  }

  const canonical = currentPage === 1
    ? brokerNewsUrl(canonicalSlug)
    : `${BASE_URL}/news/broker/${canonicalSlug}?page=${currentPage}`;

  const description = brokerPageDescription(brokerName);

  const schema = useMemo(
    () =>
      buildBrokerPageSchema({
        brokerName,
        brokerSlug,
        description,
        articles: articles.map((a) => ({
          title: a.title,
          url: articleUrl(a.bcSlug),
          image: a.image ?? '',
          datePublished: a.dateTimePub,
        })),
      }),
    [brokerName, brokerSlug, description, articles]
  );

  const pageTitle = currentPage > 1
    ? `${brokerPageTitle(brokerName)} — Page ${currentPage}`
    : brokerPageTitle(brokerName);

  useSEO({
    title: pageTitle,
    description,
    canonical,
    ogImage: articles[0]?.image ?? undefined,
    schema: currentPage === 1 ? schema : undefined,
    prevUrl: currentPage > 1
      ? (currentPage === 2 ? brokerNewsUrl(brokerSlug) : `${BASE_URL}/news/broker/${brokerSlug}?page=${currentPage - 1}`)
      : undefined,
    nextUrl: currentPage < totalPages
      ? `${BASE_URL}/news/broker/${brokerSlug}?page=${currentPage + 1}`
      : undefined,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-secondary-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link to="/news" className="hover:text-foreground transition-colors">News</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{brokerName} News</span>
      </nav>

      {/* Page header */}
      <header className="mb-8">
        <div className="flex items-start gap-4">
          {brokerInfo?.logo && (
            <img
              src={brokerInfo.logo}
              alt={`${brokerName} logo`}
              className="w-12 h-12 rounded-lg object-contain border border-border bg-white p-1 flex-shrink-0"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              {brokerName} News
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        {brokerInfo && (
          <div className="mt-4">
            <a
              href={brokerInfo.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              Read our {brokerName} review →
            </a>
          </div>
        )}
      </header>

      {articles.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            No recent news articles found for {brokerName}.
          </p>
          <Link
            to="/news"
            className="text-sm font-medium text-secondary-600 hover:text-secondary-700"
          >
            ← Browse all news
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {articles.length} article{articles.length !== 1 ? 's' : ''} found
          </p>

          <section aria-label={`${brokerName} news`}>
            <div className="border border-border rounded-lg divide-y divide-border">
              {pagedArticles.map((article) => (
                <div key={article.uri} className="px-4">
                  <ArticleCard article={article} variant="small" />
                </div>
              ))}
            </div>
          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={buildHref}
          />
        </>
      )}

      <aside className="mt-16 border-t border-border pt-8">
        <h2 className="text-base font-semibold text-foreground mb-4">Browse by category</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <Link
              key={key}
              to={`/news?category=${key}`}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-secondary-400 hover:text-secondary-700 transition-colors"
            >
              {meta.label}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
