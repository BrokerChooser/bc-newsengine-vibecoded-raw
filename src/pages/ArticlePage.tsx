import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug, categoryMeta } from '../data/news-utils';
import { useArticles } from '../hooks/useArticles';
import Badge from '../components/ui/Badge';
import SentimentIndicator from '../components/ui/SentimentIndicator';
import ArticleCard from '../components/news/ArticleCard';
import RelatedBrokersSection from '../components/news/RelatedBrokersSection';
import { useSEO } from '../hooks/useSEO';
import {
  articleTitle,
  articleDescription,
  articleUrl,
  newsUrl,
  buildNewsArticleSchema,
} from '../utils/seo';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles, loading } = useArticles();

  const article = useMemo(
    () => getArticleBySlug(articles, slug || ''),
    [articles, slug]
  );

  const canonical = articleUrl(slug || '');

  const seoDescription = useMemo(
    () => (article ? articleDescription(article.body) : ''),
    [article]
  );

  const schema = useMemo(() => {
    if (!article) return undefined;
    const catLabel = categoryMeta[article.bcCategory].label;
    return buildNewsArticleSchema({
      title: article.title,
      description: seoDescription,
      url: canonical,
      image: article.image,
      datePublished: article.dateTimePub,
      dateModified: article.dateTimePub,
      authorName: article.authors[0]?.name,
      sourceName: article.source.title,
      sourceUrl: article.url,
      breadcrumbs: [{ name: catLabel, url: newsUrl() }],
    });
  }, [article, seoDescription, canonical]);

  useSEO({
    title: article ? articleTitle(article.title) : 'Article not found | BrokerChooser',
    description: seoDescription,
    canonical,
    ogImage: article?.image,
    ogType: 'article',
    publishedTime: article?.dateTimePub,
    schema,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-secondary-600 border-t-transparent animate-spin" />
      </div>
    );
  }

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

  // Strip [text](url) markdown link syntax from body
  const stripLinks = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const paragraphs = article.body.split('\n').filter((p) => p.trim()).map(stripLinks);

  const relatedArticles = articles.filter((a) => a.uri !== article.uri).slice(0, 4);

  return (
    <article className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb — semantic nav with schema.org itemscope */}
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        aria-label="Breadcrumb"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
          <Link
            to="/news"
            className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
            itemProp="item"
          >
            <span itemProp="name">News</span>
          </Link>
          <meta itemProp="position" content="1" />
        </span>
        <span>/</span>
        <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
          <Link
            to={`/news?category=${article.bcCategory}`}
            className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
            itemProp="item"
          >
            <span itemProp="name">{catLabel}</span>
          </Link>
          <meta itemProp="position" content="2" />
        </span>
        <span>/</span>
        <span
          className="text-foreground truncate max-w-64"
          itemScope
          itemType="https://schema.org/ListItem"
          itemProp="itemListElement"
        >
          <span itemProp="name">{article.title}</span>
          <meta itemProp="position" content="3" />
        </span>
      </nav>

      {/* Main content — centred, readable width */}
      <div className="max-w-3xl mx-auto">
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

          <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground">
            <time dateTime={article.dateTimePub}>{dateStr}</time>
            <span>·</span>
            <span>
              Source:{' '}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {article.source.title}
              </a>
            </span>
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
            src={article.image || 'https://brokerchooser.com/images/og-image.jpg'}
            alt={article.title}
            className="h-full w-full object-cover"
            loading="eager"
            width={1200}
            height={675}
          />
        </div>

        {/* Article body */}
        <div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground mb-6">
              {p}
            </p>
          ))}
        </div>

        {/* Related brokers */}
        {article.bcRelatedBrokers && article.bcRelatedBrokers.length > 0 && (
          <RelatedBrokersSection brokers={article.bcRelatedBrokers} />
        )}
      </div>

      {/* Related Articles — full width at bottom */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 border-t border-border pt-8" aria-label="Related articles">
          <h2 className="text-lg font-semibold text-foreground mb-6">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedArticles.map((a) => (
              <ArticleCard key={a.uri} article={a} variant="medium" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
