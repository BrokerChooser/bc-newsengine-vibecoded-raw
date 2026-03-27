import { useState } from 'react';

const BROKERS = [
  {
    rank: 1,
    name: 'Interactive Brokers',
    logo: 'https://brokerchooser.com/storage/2514/interactive-brokers-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/interactive-brokers-review',
  },
  {
    rank: 2,
    name: 'Saxo',
    logo: 'https://brokerchooser.com/storage/2542/saxo-bank-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/saxo-bank-review',
  },
  {
    rank: 3,
    name: 'XTB',
    logo: 'https://brokerchooser.com/storage/2566/xtb-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/xtb-review',
  },
  {
    rank: 4,
    name: 'eToro',
    logo: 'https://brokerchooser.com/storage/2490/etoro-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/etoro-review',
  },
  {
    rank: 5,
    name: 'Capital.com',
    logo: 'https://brokerchooser.com/storage/2475/capitalcom-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/capital-com-review',
  },
  {
    rank: 6,
    name: 'Lightyear',
    logo: 'https://brokerchooser.com/storage/2518/lightyear-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/lightyear-review',
  },
  {
    rank: 7,
    name: 'Trading 212',
    logo: 'https://brokerchooser.com/storage/2560/trading-212-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/trading-212-review',
  },
  {
    rank: 8,
    name: 'Plus500 CFD',
    logo: 'https://brokerchooser.com/storage/2533/plus500-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/plus500-review',
  },
  {
    rank: 9,
    name: 'CMC Markets',
    logo: 'https://brokerchooser.com/storage/2478/cmc-markets-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/cmc-markets-review',
  },
  {
    rank: 10,
    name: 'Oanda',
    logo: 'https://brokerchooser.com/storage/2530/oanda-review.png',
    reviewUrl: 'https://brokerchooser.com/broker-reviews/oanda-review',
  },
];

export default function TopBrokersBox() {
  const [activeTab, setActiveTab] = useState<'1-5' | '6-10'>('1-5');

  const visibleBrokers =
    activeTab === '1-5' ? BROKERS.slice(0, 5) : BROKERS.slice(5, 10);

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Top online brokers
      </h3>

      {/* Tabs */}
      <div className="flex border-b border-border mb-1">
        <button
          onClick={() => setActiveTab('1-5')}
          className={`flex-1 pb-2.5 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
            activeTab === '1-5'
              ? 'text-secondary-600 border-b-2 border-secondary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-selected={activeTab === '1-5'}
          role="tab"
        >
          1-5
        </button>
        <button
          onClick={() => setActiveTab('6-10')}
          className={`flex-1 pb-2.5 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 ${
            activeTab === '6-10'
              ? 'text-secondary-600 border-b-2 border-secondary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-selected={activeTab === '6-10'}
          role="tab"
        >
          6-10
        </button>
      </div>

      {/* Broker list */}
      <ul className="divide-y divide-border" role="list">
        {visibleBrokers.map((broker) => (
          <li key={broker.rank}>
            <a
              href={broker.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-4 group hover:bg-slate-50 -mx-2 px-2 rounded transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500"
            >
              <span className="w-6 text-base font-medium text-muted-foreground text-right flex-shrink-0">
                {broker.rank}
              </span>
              <span className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
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
              </span>
              <span className="text-base font-medium text-foreground group-hover:text-secondary-600 transition-colors flex-1">
                {broker.name}
              </span>
              <svg
                className="h-5 w-5 text-slate-400 group-hover:text-secondary-500 transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2.5">
          Get your personalized toplist:
        </p>
        <a
          href="https://brokerchooser.com/find-my-broker"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full rounded-lg border-2 border-secondary-600 px-6 py-3 text-sm font-semibold text-secondary-600 uppercase tracking-wider hover:bg-secondary-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          Find my broker
        </a>
      </div>
    </div>
  );
}
