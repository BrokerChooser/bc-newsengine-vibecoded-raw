import { useState } from 'react';
import type { BrokerInfo } from '../../data/broker-data';

interface BrokerCardProps {
  broker: BrokerInfo;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'text-emerald-600' : 'text-slate-200'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ScoreStars({ score }: { score: number }) {
  const fullStars = Math.round(score);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= fullStars} />
      ))}
    </div>
  );
}

export default function BrokerCard({ broker }: BrokerCardProps) {
  const [activeTab, setActiveTab] = useState<'key-data' | 'fees'>('key-data');

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left column */}
        <div className="p-5 md:p-6">
          {/* Logo + Name + Badges */}
          <div className="flex items-start gap-3 mb-4">
            <span className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
              {broker.logo ? (
                <img
                  src={broker.logo}
                  alt={broker.name}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-base font-semibold text-slate-600">${broker.name.substring(0, 2).toUpperCase()}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-base font-semibold text-slate-600">
                  {broker.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <div>
              <h4 className="text-lg font-semibold text-foreground">{broker.name}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {broker.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5"
                  >
                    {badge.includes('Available') && (
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {badge.includes('Trusted') && (
                      <svg className="h-3 w-3 text-secondary-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {badge.includes('Tested') && (
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    )}
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Best for */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-foreground mb-1">Best for</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{broker.bestFor}</p>
          </div>

          {/* Visit CTA */}
          <a
            href={broker.visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-secondary-500 px-6 py-3 text-base font-medium text-white hover:bg-secondary-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            Visit {broker.name}
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        {/* Right column — Score + Key data */}
        <div className="border-t md:border-t-0 md:border-l border-border p-5 md:p-6 bg-slate-50">
          {/* Awarded badge + Score */}
          <div className="mb-4">
            {broker.awarded && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-white border border-border rounded-full px-2.5 py-1 mb-3">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 2a.75.75 0 01.65.375l1.543 2.688 3.032.65a.75.75 0 01.398 1.238l-2.063 2.266.336 3.094a.75.75 0 01-1.044.746L10 11.636l-2.852 1.421a.75.75 0 01-1.044-.746l.336-3.094-2.063-2.266a.75.75 0 01.398-1.238l3.032-.65L9.35 2.375A.75.75 0 0110 2z" clipRule="evenodd" />
                </svg>
                Awarded
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-foreground">{broker.score}</span>
              <div>
                <ScoreStars score={broker.score} />
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-muted-foreground">Overall score</span>
                  <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-3">
            <button
              onClick={() => setActiveTab('key-data')}
              className={`flex-1 pb-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
                activeTab === 'key-data'
                  ? 'text-foreground border-b-2 border-foreground bg-white rounded-t-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === 'key-data'}
            >
              Key data
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`flex-1 pb-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
                activeTab === 'fees'
                  ? 'text-foreground border-b-2 border-foreground bg-white rounded-t-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === 'fees'}
            >
              Benchmark fees
            </button>
          </div>

          {/* Data table */}
          <table className="w-full text-sm" role="table">
            <thead className="sr-only">
              <tr>
                <th>Data</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'key-data' ? (
                broker.keyData.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="py-2 text-muted-foreground">{row.label}:</td>
                    <td className={`py-2 text-right font-medium ${row.highlight ? 'text-secondary-600' : 'text-foreground'}`}>
                      {row.value}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">US stock fee:</td>
                    <td className="py-2 text-right font-medium text-foreground">$0 - $1</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">EUR/USD spread:</td>
                    <td className="py-2 text-right font-medium text-foreground">0.8 pips</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-muted-foreground">Withdrawal fee:</td>
                    <td className="py-2 text-right font-medium text-secondary-600">Free</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-muted-foreground">Deposit fee:</td>
                    <td className="py-2 text-right font-medium text-secondary-600">Free</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* Compare link */}
          <a
            href={broker.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-4 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM6 13.25V3.5h8v9.75a.75.75 0 01-1.064.681L10 12.576l-2.936 1.355A.75.75 0 016 13.25z" clipRule="evenodd" />
            </svg>
            Compare broker
          </a>
        </div>
      </div>
    </div>
  );
}
