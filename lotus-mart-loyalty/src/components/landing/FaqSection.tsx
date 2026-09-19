import React, { useState } from 'react';
import { Plus } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { FAQS } from '../../data/initialData';

export const FaqSection: React.FC = () => {
  const { language } = useLoyalty();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
      }}
      className="py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold text-[var(--brand)]">05</span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {language === 'vi' ? 'Câu hỏi thường gặp' : 'Frequently asked'}
          </h2>
        </div>

        <p className="text-[var(--ink-2)] text-base mb-10">
          {language === 'vi'
            ? 'Giải đáp những thắc mắc phổ biến về điểm thưởng Sen và công nghệ chuỗi khối minh bạch.'
            : 'Answers to common questions about Petal loyalty points and blockchain verification.'}
        </p>

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={faq.id} className="py-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between gap-4 text-left font-display font-semibold text-base sm:text-lg text-[var(--ink)] hover:text-[var(--brand)] transition-colors cursor-pointer"
                >
                  <span>{language === 'vi' ? faq.qVi : faq.qEn}</span>
                  <span
                    style={{
                      color: 'var(--brand)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] transition-transform duration-200"
                  >
                    <Plus size={16} weight="bold" />
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)] sm:text-[15px] pr-8 animate-fadeIn">
                    {language === 'vi' ? faq.aVi : faq.aEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
