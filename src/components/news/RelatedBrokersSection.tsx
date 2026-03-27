import { getBrokerInfo } from '../../data/broker-data';
import BrokerCard from './BrokerCard';
import BrokerCardCollapsed from './BrokerCardCollapsed';

interface RelatedBrokersSectionProps {
  brokers: string[];
}

export default function RelatedBrokersSection({ brokers }: RelatedBrokersSectionProps) {
  const brokerInfos = brokers
    .map((name) => getBrokerInfo(name))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  if (brokerInfos.length === 0) return null;

  const [primary, ...rest] = brokerInfos;

  return (
    <section className="mt-10" aria-label="Related brokers">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold text-foreground">Related Brokers</h3>
        <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-slate-100 px-2 text-xs font-medium text-muted-foreground">
          {brokerInfos.length}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Primary broker — always expanded */}
      <div className="mb-3">
        <BrokerCard broker={primary} />
      </div>

      {/* Additional brokers — collapsed, expandable */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((broker) => (
            <BrokerCardCollapsed key={broker.name} broker={broker} />
          ))}
        </div>
      )}
    </section>
  );
}
