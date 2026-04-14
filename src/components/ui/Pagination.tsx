import { Link } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 py-8">
      {currentPage > 1 ? (
        <Link
          to={buildHref(currentPage - 1)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Previous page"
        >
          ‹
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground/40 cursor-not-allowed" aria-disabled="true">
          ‹
        </span>
      )}

      {pages.map((page, idx) =>
        page === '…' ? (
          <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-9 h-9 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Link
            key={page}
            to={buildHref(page)}
            className={`flex items-center justify-center w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-border text-foreground hover:bg-accent transition-colors'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          to={buildHref(currentPage + 1)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Next page"
        >
          ›
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground/40 cursor-not-allowed" aria-disabled="true">
          ›
        </span>
      )}
    </nav>
  );
}
