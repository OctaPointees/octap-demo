import { useState } from 'react';
import { ShieldCheck, User, Key, Cpu, Cube, FileText } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface ArchitectureDiagramProps {
  lang: Language;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ lang }) => {
  const a = DICTIONARY[lang].architecture;
  const [activeStep, setActiveStep] = useState<number>(0);

  const STEP_ICONS = [User, Key, Cpu, Cube, FileText];

  return (
    <section id="architecture" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--ground)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{a.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'System Topology' : 'Sơ Đồ Kiến Trúc'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {a.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {a.subtitle}
          </p>
        </div>

        {/* Visual Flow Timeline */}
        <div className="mt-12">
          {/* Desktop Flow Line */}
          <div className="hidden lg:grid grid-cols-5 gap-4 relative">
            {/* Connecting line */}
            <div className="absolute top-1/4 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-emerald-500 to-[#002b49] -z-0 opacity-40" />

            {a.steps.map((item, idx) => {
              const IconCmp = STEP_ICONS[idx] || Cpu;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`relative z-10 flex flex-col rounded-2xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-[var(--surface)] shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                      : 'border-[var(--line)] bg-[var(--surface)]/80 hover:border-black/20 hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-[var(--surface-2)] text-[var(--ink-2)]'
                      }`}
                    >
                      <IconCmp size={20} weight="bold" />
                    </div>
                    <span className="font-mono text-xs font-bold text-primary">
                      0{item.step}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase font-semibold">
                    {item.actor}
                  </span>
                  <h4 className="font-display text-sm font-bold text-[var(--ink)] mt-0.5 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile Flow List */}
          <div className="lg:hidden space-y-4">
            {a.steps.map((item, idx) => {
              const IconCmp = STEP_ICONS[idx] || Cpu;
              return (
                <div
                  key={idx}
                  className="flex gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xs"
                >
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <IconCmp size={20} weight="bold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">0{item.step}</span>
                      <span className="text-[10px] font-mono text-[var(--muted)] uppercase">
                        {item.actor}
                      </span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-[var(--ink)] mt-0.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[var(--ink-2)] mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Step Deep Dive Specimen Box */}
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">
                  Step 0{a.steps[activeStep].step} · Deep Dive
                </span>
                <span className="text-sm font-bold text-[var(--ink)]">
                  {a.steps[activeStep].title}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck size={14} weight="bold" />
                <span>Zero Trust Execution Boundary</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="font-mono text-[10px] uppercase text-[var(--muted)] font-semibold mb-1">
                  {lang === 'en' ? 'Input Identity & Consent' : 'Định Danh & Đồng Thuận'}
                </div>
                <div className="text-[var(--ink)] font-mono">
                  {activeStep === 0 && 'Customer Phone: +84 901 234 567 (POS Scan)'}
                  {activeStep === 1 && 'Enoki zkLogin JWT: sub=10829... / Phone Hash'}
                  {activeStep === 2 && 'OctaP Gas Station: sponsor_account_01 (Sponsored)'}
                  {activeStep === 3 && 'Sui Move VM: 0x8f2a...ltm::loyalty::mint_record'}
                  {activeStep === 4 && 'Ledger Checkpoint: #14829320 (Immutable)'}
                </div>
              </div>

              <div className="rounded-xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="font-mono text-[10px] uppercase text-[var(--muted)] font-semibold mb-1">
                  {lang === 'en' ? 'Cryptographic Guarantee' : 'Bảo Đảm Mật Mã'}
                </div>
                <div className="text-[var(--ink)] font-mono">
                  {activeStep === 0 && 'Strict merchant barcode nonce verification'}
                  {activeStep === 1 && 'Zero knowledge proof verifies without revealing PII'}
                  {activeStep === 2 && 'Multi-tenant authorization signature required'}
                  {activeStep === 3 && 'Object isolation prevents cross-tenant coin transfers'}
                  {activeStep === 4 && 'Byzantine Fault Tolerant consensus state'}
                </div>
              </div>

              <div className="rounded-xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="font-mono text-[10px] uppercase text-[var(--muted)] font-semibold mb-1">
                  {lang === 'en' ? 'Latency & Gas Cost' : 'Độ Trễ & Chi Phí Gas'}
                </div>
                <div className="text-[var(--ink)] font-mono">
                  {activeStep === 0 && '< 50ms in-store scan response'}
                  {activeStep === 1 && '< 120ms ZK-proof generation'}
                  {activeStep === 2 && '< 40ms rule engine evaluation'}
                  {activeStep === 3 && '382ms Sui consensus finality'}
                  {activeStep === 4 && '0 ₫ user fee · 0.0001 SUI sponsored'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
