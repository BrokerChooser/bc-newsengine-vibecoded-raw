import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug, dummyArticles, categoryMeta } from '../data/dummy-articles';
import Badge from '../components/ui/Badge';
import SentimentIndicator from '../components/ui/SentimentIndicator';
import BCTakeBox from '../components/news/BCTakeBox';
import ArticleCard from '../components/news/ArticleCard';
import TopBrokersBox from '../components/news/TopBrokersBox';
import RelatedBrokersSection from '../components/news/RelatedBrokersSection';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || '');

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Article not found</h1>
        <Link
          to="/news"
          className="text-sm text-secondary-600 hover:text-secondary-700 font-medium focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  const catLabel = categoryMeta[article.bcCategory].label;
  const dateStr = new Date(article.dateTimePub).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Related articles: same category, excluding current
  const relatedArticles = dummyArticles
    .filter((a) => a.bcCategory === article.bcCategory && a.uri !== article.uri)
    .slice(0, 4);

  // Split body into paragraphs
  const paragraphs = article.body.split('\n').filter((p) => p.trim());

  return (
    <article className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link
          to="/news"
          className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          News
        </Link>
        <span>/</span>
        <Link
          to="/news"
          className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
        >
          {catLabel}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-64">{article.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main content */}
        <div className="lg:col-span-8">
          {/* Article header */}
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge category={article.bcCategory}>{catLabel}</Badge>
              <SentimentIndicator sentiment={article.sentiment} />
              <span className="text-sm text-muted-foreground">{article.bcReadingTime} min read</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-foreground tracking-tight md:text-4xl mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-base text-muted-foreground">
              <span>{dateStr}</span>
              <span>·</span>
              <span>Source: {article.source.title}</span>
              {article.authors.length > 0 && (
                <>
                  <span>·</span>
                  <span>By {article.authors.map((a) => a.name).join(', ')}</span>
                </>
              )}
            </div>
          </header>

          {/* Hero image */}
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img
              src={article.image}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          {/* Article body */}
          <div className="max-w-none">
            {paragraphs.map((p, i) => (
              <div key={i}>
                <p className="text-lg leading-relaxed text-foreground mb-6">{p}</p>
                {/* Insert BC Take after the 2nd paragraph */}
                {i === 1 && <BCTakeBox take={article.bcTake} />}
              </div>
            ))}
          </div>

          {/* Related brokers */}
          {article.bcRelatedBrokers && article.bcRelatedBrokers.length > 0 && (
            <RelatedBrokersSection brokers={article.bcRelatedBrokers} />
          )}

          {/* Community Discussion CTA */}
          <div className="mt-8 rounded-lg border border-border bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-secondary-50 flex items-center justify-center">
                <svg className="h-5 w-5 text-secondary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 01-1.33 0l-1.713-3.293a.783.783 0 00-.642-.413 41.202 41.202 0 01-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-foreground mb-1">
                  Discuss this article in the BrokerChooser Community
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">{Math.floor(Math.random() * 12) + 3} comments</span>
                  {' '}· Join the conversation with fellow investors
                </p>

                {/* Latest comment preview */}
                <div className="rounded-lg bg-slate-50 border border-border px-4 py-3 mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-6 w-6 rounded-full bg-secondary-100 flex items-center justify-center text-xs font-medium text-secondary-700">
                      M
                    </span>
                    <span className="text-xs font-medium text-foreground">MarkTrader92</span>
                    <span className="text-xs text-muted-foreground">· 2h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    Great breakdown. I've been comparing fees across brokers for a while now — this change from IBKR really shakes things up for European traders.
                  </p>
                </div>

                <a
                  href={`https://community.brokerchooser.com/t/${article.bcSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary-600 px-4 py-2.5 text-sm font-medium text-secondary-600 hover:bg-secondary-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                >
                  Join the discussion
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4" aria-label="Sidebar">
          {/* Newsletter CTA */}
          <div className="rounded-lg border border-border bg-white p-5 mb-6">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex-shrink-0 h-9 w-9 rounded-lg bg-secondary-50 flex items-center justify-center">
                <svg className="h-5 w-5 text-secondary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-foreground">Stay informed</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get the latest broker news and market insights delivered to your inbox weekly.
            </p>
            <div className="space-y-2.5">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                aria-label="Email address"
              />
              <button className="w-full rounded-lg bg-secondary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-secondary-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
                Subscribe
              </button>
            </div>
          </div>

          {/* Top Brokers widget */}
          <div className="mb-6">
            <TopBrokersBox />
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                More in {catLabel}
              </h3>
              <div className="space-y-0">
                {relatedArticles.map((a) => (
                  <ArticleCard key={a.uri} article={a} variant="small" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Related Articles — full width at bottom (newspaper style) */}
      <section className="mt-16 border-t border-border pt-8" aria-label="Related articles">
        <h2 className="text-lg font-semibold text-foreground mb-6">Related Articles</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dummyArticles
            .filter((a) => a.uri !== article.uri)
            .slice(0, 4)
            .map((a) => (
              <ArticleCard key={a.uri} article={a} variant="medium" />
            ))}
        </div>
      </section>
    </article>
  );
}
