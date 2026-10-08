import { CheckCircle, XCircle, Sparkle } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface WhyOctaPSectionProps {
  lang: Language;
}

export const WhyOctaPSection = ({ lang }: WhyOctaPSectionProps) => {
  const w = DICTIONARY[lang].why;

  return (
    <section id="why" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--ground)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{w.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Market Comparison' : 'So Sánh Thị Trường'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {w.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {w.subtitle}
          </p>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                  <th className="py-4 px-5 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold w-1/4">
                    {w.colFeature}
                  </th>
                  <th className="py-4 px-4 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold w-1/5">
                    {w.colTrad}
                  </th>
                  <th className="py-4 px-4 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold w-1/5">
                    {w.colUrbox}
                  </th>
                  <th className="py-4 px-4 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold w-1/5">
                    {w.colTalon}
                  </th>
                  <th className="py-4 px-5 font-mono text-[11px] uppercase tracking-wider text-primary font-bold w-1/4 bg-primary/5 border-l border-primary/20">
                    <div className="flex items-center gap-1.5">
                      <Sparkle size={14} weight="fill" />
                      <span>{w.colOctap}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {w.features.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01] transition-colors">
                    <td className="py-4 px-5 font-display font-bold text-[var(--ink)]">
                      {feat.name}
                    </td>
                    <td className="py-4 px-4 text-[var(--muted)]">
                      <div className="flex items-start gap-1.5">
                        <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{feat.trad}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[var(--muted)]">
                      <div className="flex items-start gap-1.5">
                        <XCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat.urbox}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[var(--muted)]">
                      <div className="flex items-start gap-1.5">
                        <XCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat.talon}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium text-[var(--ink)] bg-primary/[0.02] border-l border-primary/20">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="font-semibold text-primary">{feat.octap}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
