import type { BCAuthorTake } from '../../types/newsapi';

interface BCTakeBoxProps {
  take: BCAuthorTake;
  compact?: boolean;
}

export default function BCTakeBox({ take, compact = false }: BCTakeBoxProps) {
  if (compact) {
    return (
      <div className="border-l-4 border-primary-500 bg-primary-50 rounded-r-lg px-4 py-3 mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
            <img src={take.authorImage} alt="" className="h-full w-full object-cover" />
          </div>
          <span className="text-xs font-medium text-foreground">BC's Take</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
          {take.summary}
        </p>
      </div>
    );
  }

  return (
    <aside
      className="border-l-4 border-primary-500 bg-primary-50 rounded-r-xl p-6 my-8"
      aria-label="BrokerChooser's Take"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <svg
          className="h-5 w-5 text-primary-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2z" />
        </svg>
        <h3 className="text-base font-semibold text-foreground">BrokerChooser's Take</h3>
      </div>

      <div className="flex items-center gap-3 mb-4 mt-3">
        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-200">
          <img src={take.authorImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{take.authorName}</p>
          <p className="text-xs text-muted-foreground">{take.authorRole}</p>
        </div>
      </div>

      <blockquote className="text-sm leading-relaxed text-slate-700 mb-4 italic">
        "{take.summary}"
      </blockquote>

      <div className="bg-white/70 rounded-lg p-4 border border-primary-200">
        <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1">
          Key Takeaway
        </p>
        <p className="text-sm text-foreground leading-relaxed">{take.takeaway}</p>
      </div>
    </aside>
  );
}
