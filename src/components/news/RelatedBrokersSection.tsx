import { Link } from 'react-router-dom';
import { getBrokerInfo } from '../../data/broker-data';
import BrokerCard from './BrokerCard';
import BrokerCardCollapsed from './BrokerCardCollapsed';

interface RelatedBrokersSectionProps {
  brokers: string[];  // broker slugs
}

export default function RelatedBrokersSection({ brokers }: RelatedBrokersSectionProps) {
  // brokers is an array of slugs; pair each with its info + slug
  const brokerEntries = brokers
    .map((slug) => ({ slug, info: getBrokerInfo(slug) }))
    .filter((e): e is { slug: string; info: NonNullable<ReturnType<typeof getBrokerInfo>> } => e.info !== undefined);

  if (brokerEntries.length === 0) return null;

  const [primary, ...rest] = brokerEntries;

  return (
    <section className="mt-10" aria-label="Related brokers">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold text-foreground">Related Brokers</h3>
        <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-slate-100 px-2 text-xs font-medium text-muted-foreground">
          {brokerEntries.length}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Primary broker — always expanded */}
      <div className="mb-3">
        <BrokerCard broker={primary.info} />
        <Link
          to={`/news/broker/${primary.slug}`}
          className="mt-2 inline-block text-xs text-secondary-600 hover:text-secondary-700 hover:underline"
        >
          See all {primary.info.name} news →
        </Link>
      </div>

      {/* Additional brokers — collapsed, expandable */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map(({ slug, info }) => (
            <div key={info.name}>
              <BrokerCardCollapsed broker={info} />
              <Link
                to={`/news/broker/${slug}`}
                className="mt-1 inline-block text-xs text-secondary-600 hover:text-secondary-700 hover:underline"
              >
                See all {info.name} news →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
