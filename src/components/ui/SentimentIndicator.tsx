interface SentimentIndicatorProps {
  sentiment: number | null;
}

export default function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  if (sentiment === null) return null;

  const label =
    sentiment > 0.3 ? 'Positive' : sentiment < -0.3 ? 'Negative' : 'Neutral';
  const colorClass =
    sentiment > 0.3
      ? 'text-success-600 bg-success-500/10'
      : sentiment < -0.3
        ? 'text-danger-600 bg-danger-500/10'
        : 'text-slate-600 bg-slate-100';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          sentiment > 0.3
            ? 'bg-success-500'
            : sentiment < -0.3
              ? 'bg-danger-500'
              : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
}
