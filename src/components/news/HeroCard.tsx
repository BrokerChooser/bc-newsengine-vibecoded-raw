import { Link } from 'react-router-dom';
import type { BCEnrichedArticle } from '../../types/newsapi';
import Badge from '../ui/Badge';
import { categoryMeta } from '../../data/news-utils';

const FALLBACK_IMAGE = 'https://brokerchooser.com/images/og-image.jpg';

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

interface HeroCardProps {
  article: BCEnrichedArticle;
}

export default function HeroCard({ article }: HeroCardProps) {
  const catLabel = categoryMeta[article.bcCategory]?.shortLabel ?? article.bcCategory;

  return (
    <Link
      to={`/news/${article.bcSlug}`}
      className="group block"
      aria-label={`Read: ${article.title}`}
    >
      <article className="relative overflow-hidden rounded-lg bg-slate-900">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-video md:aspect-auto md:min-h-96 overflow-hidden">
            <img
              src={article.image || FALLBACK_IMAGE}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/40 hidden md:block" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-5 p-6 md:p-12">
            <div className="flex items-center gap-3">
              <Badge category={article.bcCategory}>{catLabel}</Badge>
              <span className="text-sm text-slate-400">
                {new Date(article.dateTimePub).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight text-white tracking-tight md:text-4xl group-hover:underline decoration-2 underline-offset-4 decoration-primary-500 transition-all">
              {article.title}
            </h2>

            <p className="text-base leading-relaxed text-slate-300 line-clamp-3">
              {stripLinks(article.body).slice(0, 220)}...
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm text-slate-400">{article.source.title}</span>
              <span className="text-sm text-slate-500">·</span>
              <span className="text-sm text-slate-400">{article.bcReadingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
