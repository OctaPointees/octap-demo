import type { ElementType } from 'react';
import { Link } from 'react-router';
import { Storefront, ShieldCheck, ArrowSquareOut, Coffee, BookOpen, Barbell, HouseLine } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY, PARTNER_BRANDS } from '../content';

interface EcosystemSectionProps {
  lang: Language;
}

export const EcosystemSection = ({ lang }: EcosystemSectionProps) => {
  const e = DICTIONARY[lang].ecosystem;

  const ICONS: Record<string, ElementType> = {
    'lotus-mart': Storefront,
    'pho-ca-phe': Coffee,
    'saigon-books': BookOpen,
    'mekong-fitness': Barbell,
    'sunrise-hotels': HouseLine,
  };

  return (
    <section id="ecosystem" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--ground)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{e.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Enterprise Multi-Tenancy' : 'Hệ Sinh Thái Đa Doanh Nghiệp'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {e.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {e.subtitle}
          </p>
        </div>

        {/* Tenant Isolation Banner */}
        <div className="mt-8 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs font-mono text-primary shadow-xs">
          <ShieldCheck size={18} weight="bold" className="shrink-0" />
          <span>{e.tenantNotice}</span>
        </div>

        {/* 5 Partner Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNER_BRANDS.map((item) => {
            const IconCmp = ICONS[item.id] || Storefront;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className="size-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      <IconCmp size={22} weight="bold" />
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                        {e.badgeActive}
                      </span>
                      <span className="block font-mono text-[10px] text-[var(--muted)] mt-0.5">
                        Token: ${item.symbol}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                    {item.name}
                  </h3>
                  <span className="text-xs font-mono text-[var(--muted)] block mb-3">
                    {lang === 'en' ? item.category : item.categoryVi}
                  </span>

                  <p className="text-xs text-[var(--ink-2)] leading-relaxed mb-4">
                    {lang === 'en' ? item.description : item.descriptionVi}
                  </p>

                  <div className="space-y-2 rounded-xl bg-[var(--surface-2)] p-3 border border-[var(--line)] text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">
                        {lang === 'en' ? 'Locations:' : 'Quy mô chi nhánh:'}
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {item.stores} {lang === 'en' ? 'stores' : 'điểm'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">
                        {lang === 'en' ? 'Active Members:' : 'Hội viên hoạt động:'}
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {item.activeMembers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">
                        {lang === 'en' ? 'Earn Rate:' : 'Tỷ lệ tích điểm:'}
                      </span>
                      <span className="font-semibold text-primary">
                        {lang === 'en' ? item.pointsRate : item.pointsRateVi}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--muted)] truncate max-w-[150px]">
                    {item.moveModule}
                  </span>
                  <Link
                    to={item.id === 'lotus-mart' ? '/login?email=owner@lotusmart.vn' : '/wallet'}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-[#830250] transition-colors"
                  >
                    <span>{e.btnTestStore}</span>
                    <ArrowSquareOut size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
