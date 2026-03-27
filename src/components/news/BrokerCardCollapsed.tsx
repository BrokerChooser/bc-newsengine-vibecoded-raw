import { useState } from 'react';
import type { BrokerInfo } from '../../data/broker-data';
import BrokerCard from './BrokerCard';

interface BrokerCardCollapsedProps {
  broker: BrokerInfo;
}

export default function BrokerCardCollapsed({ broker }: BrokerCardCollapsedProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-secondary-500"
        aria-expanded={expanded}
      >
        <span className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
          {broker.logo ? (
            <img
              src={broker.logo}
              alt={broker.name}
              className="h-10 w-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-sm font-semibold text-slate-600">${broker.name.substring(0, 2).toUpperCase()}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-sm font-semibold text-slate-600">
              {broker.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-base font-medium text-foreground">{broker.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {broker.badges.slice(0, 2).map((badge) => (
              <span key={badge} className="text-xs text-muted-foreground">{badge}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <span className="text-lg font-bold text-foreground">{broker.score}</span>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">
            <BrokerCard broker={broker} />
          </div>
        </div>
      </div>
    </div>
  );
}
