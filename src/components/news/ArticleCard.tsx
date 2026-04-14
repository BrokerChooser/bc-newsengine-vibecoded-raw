import { Link } from 'react-router-dom';
import type { BCEnrichedArticle } from '../../types/newsapi';
import Badge from '../ui/Badge';
import SentimentIndicator from '../ui/SentimentIndicator';
import { categoryMeta } from '../../data/news-utils';

const FALLBACK_IMAGE = 'https://brokerchooser.com/images/og-image.jpg';

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
}

interface ArticleCardProps {
  article: BCEnrichedArticle;
  variant?: 'large' | 'medium' | 'small';
}

export default function ArticleCard({ article, variant = 'medium' }: ArticleCardProps) {
  const catLabel = categoryMeta[article.bcCategory]?.shortLabel ?? article.bcCategory;
  const dateStr = new Date(article.dateTimePub).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (variant === 'small') {
    return (
      <Link
        to={`/news/${article.bcSlug}`}
        className="group flex gap-4 py-4 border-b border-border last:border-b-0"
        aria-label={`Read: ${article.title}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge category={article.bcCategory}>{catLabel}</Badge>
            <span className="text-sm text-muted-foreground">{dateStr}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-secondary-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {stripLinks(article.body).slice(0, 100)}...
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{article.source.title}</span>
            <span className="text-sm text-slate-300">·</span>
            <span className="text-sm text-muted-foreground">{article.bcReadingTime} min</span>
            <SentimentIndicator sentiment={article.sentiment} />
          </div>
        </div>
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={article.image || FALLBACK_IMAGE}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={handleImgError}
          />
        </div>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link
        to={`/news/${article.bcSlug}`}
        className="group block h-full"
        aria-label={`Read: ${article.title}`}
      >
        <article className="overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition-shadow h-full flex flex-col">
          <div className="aspect-video overflow-hidden">
            <img
              src={article.image || FALLBACK_IMAGE}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={handleImgError}
            />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge category={article.bcCategory}>{catLabel}</Badge>
              <span className="text-sm text-muted-foreground">{dateStr}</span>
              <SentimentIndicator sentiment={article.sentiment} />
            </div>
            <h3 className="text-2xl font-bold leading-snug text-foreground group-hover:text-secondary-600 transition-colors mb-3 tracking-tight">
              {article.title}
            </h3>
            <p className="text-base text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {stripLinks(article.body).slice(0, 200)}...
            </p>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{article.source.title}</span>
                <span className="text-sm text-slate-300">·</span>
                <span className="text-sm text-muted-foreground">{article.bcReadingTime} min read</span>
              </div>
              {article.bcRelatedBrokers && article.bcRelatedBrokers.length > 0 && (
                <div className="flex gap-1">
                  {article.bcRelatedBrokers.slice(0, 2).map((b) => (
                    <Badge key={b} variant="outline">{b}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // medium (default)
  return (
    <Link
      to={`/news/${article.bcSlug}`}
      className="group block h-full"
      aria-label={`Read: ${article.title}`}
    >
      <article className="overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image || FALLBACK_IMAGE}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={handleImgError}
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge category={article.bcCategory}>{catLabel}</Badge>
            <span className="text-sm text-muted-foreground">{dateStr}</span>
            <SentimentIndicator sentiment={article.sentiment} />
          </div>
          <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-secondary-600 transition-colors line-clamp-3 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
            {stripLinks(article.body).slice(0, 200)}...
          </p>
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{article.source.title}</span>
            <span className="text-sm text-slate-300">·</span>
            <span className="text-sm text-muted-foreground">{article.bcReadingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
