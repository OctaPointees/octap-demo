import { useState } from 'react';
import { CaretDown, CaretUp } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection = ({ lang }: FaqSectionProps) => {
  const f = DICTIONARY[lang].faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--ground)] py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{f.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Knowledge Base' : 'Giải Đáp Thắc Mắc'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {f.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {f.subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-12 space-y-3">
          {f.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-black/[0.01]"
                >
                  <span className="font-display text-sm sm:text-base font-bold text-[var(--ink)] pr-4">
                    {item.q}
                  </span>
                  <div className="size-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-2)] shrink-0">
                    {isOpen ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--line)] px-5 pb-5 pt-3 animate-fadeIn">
                    <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
