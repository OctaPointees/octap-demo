import {
  Stack,
  Fingerprint,
  Receipt,
  Cpu,
  FileCode,
  ShieldCheck,
  CheckCircle,
} from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface PillarsSectionProps {
  lang: Language;
}

export const PillarsSection = ({ lang }: PillarsSectionProps) => {
  const p = DICTIONARY[lang].pillars;

  const ICONS: Record<string, React.ElementType> = {
    isolation: Stack,
    zklogin: Fingerprint,
    pos: Receipt,
    mcp: Cpu,
    sdk: FileCode,
    audit: ShieldCheck,
  };

  return (
    <section id="pillars" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{p.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Core Capabilities' : 'Năng Lực Cốt Lõi'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {p.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((item) => {
            const IconCmp = ICONS[item.id] || Stack;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                      <IconCmp size={22} weight="bold" />
                    </div>
                    <span className="rounded-full bg-[var(--surface-2)] border border-[var(--line)] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--ink-2)]">
                      {item.badge}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold block mb-1">
                    {item.tag}
                  </span>

                  <h3 className="font-display text-lg font-bold text-[var(--ink)] tracking-tight mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 font-semibold">
                  <CheckCircle size={14} weight="fill" />
                  <span>{lang === 'en' ? 'Enterprise Ready' : 'Chuẩn Doanh Nghiệp'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
