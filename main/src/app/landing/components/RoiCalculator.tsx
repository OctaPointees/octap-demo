import { useState } from 'react';
import { Calculator, Clock, ShieldCheck, Coins } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface RoiCalculatorProps {
  lang: Language;
}

export const RoiCalculator = ({ lang }: RoiCalculatorProps) => {
  const c = DICTIONARY[lang].calculator;
  const [members, setMembers] = useState<number>(30000);
  const [monthlyTxs, setMonthlyTxs] = useState<number>(90000);
  const [basketValue, setBasketValue] = useState<number>(280000);

  // Calculations
  // Total annual GMV passing through loyalty
  const annualGMV = monthlyTxs * 12 * basketValue;
  // Estimated fraud leakage in traditional systems (0.8% of loyalty liability or ~0.08% of GMV)
  const annualFraudSaved = Math.round(annualGMV * 0.0008);
  // Hours saved in accounting disputes between franchisees / audit teams
  const hoursReclaimed = Math.round((monthlyTxs / 5000) * 12 * 6);
  // Sponsored micro-gas subsidy provided by OctaP
  const gasSavingsVnd = Math.round(monthlyTxs * 12 * 25); // ~25 VND per tx sponsored

  const fmtVnd = (num: number) => {
    return (num).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <section id="calculator" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{c.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Value Metrics' : 'Giá Trị Kinh Tế'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {c.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {c.subtitle}
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-center">
          {/* Left Column: Sliders */}
          <div className="lg:col-span-6 space-y-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 sm:p-8">
            {/* Slider 1: Active Members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[var(--ink)] font-display">
                  {c.membersLabel}
                </label>
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                  {members.toLocaleString()} {lang === 'en' ? 'members' : 'thành viên'}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={members}
                onChange={(e) => setMembers(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--muted)] mt-1">
                <span>5,000</span>
                <span>250,000+</span>
              </div>
            </div>

            {/* Slider 2: Monthly Transactions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[var(--ink)] font-display">
                  {c.txsLabel}
                </label>
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                  {monthlyTxs.toLocaleString()} {lang === 'en' ? 'txs/month' : 'giao dịch/tháng'}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={monthlyTxs}
                onChange={(e) => setMonthlyTxs(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--muted)] mt-1">
                <span>10,000</span>
                <span>500,000+</span>
              </div>
            </div>

            {/* Slider 3: Average Basket Bill */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[var(--ink)] font-display">
                  {c.basketLabel}
                </label>
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                  {fmtVnd(basketValue)}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={basketValue}
                onChange={(e) => setBasketValue(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--muted)] mt-1">
                <span>50,000 ₫</span>
                <span>1,000,000 ₫</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Savings Results Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border-2 border-primary/20 bg-[var(--surface)] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-6">
                <div className="size-9 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Calculator size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                    {c.resultsTitle}
                  </h3>
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase">
                    OctaP CaaS Enterprise Impact
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {/* Result 1: Fraud Savings */}
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 font-display">
                      {c.fraudSavings}
                    </span>
                    <ShieldCheck size={16} className="text-emerald-600" weight="fill" />
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 my-1 tabular-nums">
                    {fmtVnd(annualFraudSaved)}
                  </div>
                  <span className="text-[11px] text-emerald-800/80 leading-tight block">
                    {c.fraudNote}
                  </span>
                </div>

                {/* Result 2: Audit Hours */}
                <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--line)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--ink)] font-display">
                      {c.auditSavings}
                    </span>
                    <Clock size={16} className="text-primary" weight="bold" />
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[var(--ink)] my-1 tabular-nums">
                    {hoursReclaimed.toLocaleString()} {lang === 'en' ? 'hrs/yr' : 'giờ/năm'}
                  </div>
                  <span className="text-[11px] text-[var(--muted)] leading-tight block">
                    {c.auditNote}
                  </span>
                </div>

                {/* Result 3: Sponsored Gas */}
                <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--line)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--ink)] font-display">
                      {c.gasSaved}
                    </span>
                    <Coins size={16} className="text-amber-600" weight="bold" />
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-600 my-1 tabular-nums">
                    {fmtVnd(gasSavingsVnd)}
                  </div>
                  <span className="text-[11px] text-[var(--muted)] leading-tight block">
                    {c.gasNote}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
