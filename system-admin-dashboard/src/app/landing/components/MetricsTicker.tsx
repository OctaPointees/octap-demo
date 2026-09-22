import type { Language } from '../types';
import { DICTIONARY } from '../content';
import { ShieldCheck, Timer, Coins, LockKey, Code } from 'phosphor-react';

interface MetricsTickerProps {
  lang: Language;
}

export const MetricsTicker = ({ lang }: MetricsTickerProps) => {
  const m = DICTIONARY[lang].metrics;

  const items = [
    {
      value: m.isolationVal,
      label: m.isolationLbl,
      sub: m.isolationSub,
      icon: ShieldCheck,
      color: 'text-primary',
    },
    {
      value: m.finalityVal,
      label: m.finalityLbl,
      sub: m.finalitySub,
      icon: Timer,
      color: 'text-emerald-600',
    },
    {
      value: m.gasVal,
      label: m.gasLbl,
      sub: m.gasSub,
      icon: Coins,
      color: 'text-amber-600',
    },
    {
      value: m.fraudVal,
      label: m.fraudLbl,
      sub: m.fraudSub,
      icon: LockKey,
      color: 'text-sky-600',
    },
    {
      value: m.integrationVal,
      label: m.integrationLbl,
      sub: m.integrationSub,
      icon: Code,
      color: 'text-purple-600',
    },
  ];

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, idx) => {
            const IconCmp = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col border-l-2 border-[var(--line)] pl-4 first:border-0 sm:first:border-l-0 lg:first:border-0"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <IconCmp size={16} className={item.color} weight="bold" />
                  <span className="font-mono text-2xl font-bold tracking-tight text-[var(--ink)] tabular-nums">
                    {item.value}
                  </span>
                </div>
                <span className="font-display text-xs font-bold text-[var(--ink)]">
                  {item.label}
                </span>
                <span className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
                  {item.sub}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
