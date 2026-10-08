import { useState } from 'react';
import { Link } from 'react-router';
import {
  Lightning,
  ArrowRight,
  DeviceMobile,
  Code,
  Sparkle,
  CheckCircle,
  Cube,
} from 'phosphor-react';
import type { Language, SuiDigestDetail } from '../types';
import { DICTIONARY, PARTNER_BRANDS } from '../content';

interface HeroSectionProps {
  lang: Language;
  onInspectDigest: (digest: SuiDigestDetail) => void;
}

const INITIAL_DIGESTS: SuiDigestDetail[] = [
  {
    digest: '8FkQ7xAmW3zL9b2pC4yD1m8n6K5jH2vF9a4s7Q',
    checkpoint: 14829314,
    epoch: 382,
    timestamp: 'Just now',
    sender: '0x99fe...381a',
    packageId: '0x8f2a9c41...b72',
    module: '0x8f2a...ltm::loyalty::mint',
    action: 'mint_isolated_points',
    merchant: 'Lotus Mart (LTM)',
    tokenSymbol: 'LTM',
    amount: 52,
    sponsoredGasSui: 0.000,
    gasPayer: '0xoctap_sponsor_relayer_01',
    status: 'FINALIZED',
  },
  {
    digest: 'C3vLp9Rt7YxM4k8wE2bQ5n1z8J6hD3sF7g9a1W',
    checkpoint: 14829312,
    epoch: 382,
    timestamp: '12s ago',
    sender: '0x44bb...1290',
    packageId: '0x3c7e...pcp::loyalty',
    module: '0x3c7e...pcp::loyalty::mint',
    action: 'mint_isolated_points',
    merchant: 'Phố Cà Phê (PCP)',
    tokenSymbol: 'PCP',
    amount: 15,
    sponsoredGasSui: 0.000,
    gasPayer: '0xoctap_sponsor_relayer_01',
    status: 'FINALIZED',
  },
  {
    digest: 'B4nM7xQ8w1zP9k2rC3yD6v5jH8a4s7F9m2L5k1',
    checkpoint: 14829309,
    epoch: 382,
    timestamp: '35s ago',
    sender: '0x12a8...771e',
    packageId: '0x991f...sgb::loyalty',
    module: '0x991f...sgb::loyalty::burn_voucher',
    action: 'burn_for_voucher',
    merchant: 'Sài Gòn Books (SGB)',
    tokenSymbol: 'SGB',
    amount: 300,
    sponsoredGasSui: 0.000,
    gasPayer: '0xoctap_sponsor_relayer_01',
    status: 'FINALIZED',
  },
];

export const HeroSection = ({ lang, onInspectDigest }: HeroSectionProps) => {
  const t = DICTIONARY[lang].hero;
  const [selectedMerchant, setSelectedMerchant] = useState<string>(PARTNER_BRANDS[0].id);
  const [customerPhone, setCustomerPhone] = useState('0901 234 567');
  const [billAmount, setBillAmount] = useState('350000');
  const [isMinting, setIsMinting] = useState(false);
  const [streamDigests, setStreamDigests] = useState<SuiDigestDetail[]>(INITIAL_DIGESTS);
  const [latestMintResult, setLatestMintResult] = useState<{
    points: number;
    symbol: string;
    brandName: string;
    digest: string;
  } | null>(null);

  const brand = PARTNER_BRANDS.find((b) => b.id === selectedMerchant) || PARTNER_BRANDS[0];

  const handleSimulateMint = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    const billNum = parseInt(billAmount.replace(/\D/g, ''), 10) || 100000;
    // Calculate simulated points: 10,000 VND = 1 point roughly
    const calculatedPoints = Math.max(1, Math.floor(billNum / 10000));
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newDigestStr = `${randomHex}SuiTx${Date.now().toString(36).toUpperCase()}`;

    setTimeout(() => {
      const newDigest: SuiDigestDetail = {
        digest: newDigestStr,
        checkpoint: 14829315 + Math.floor(Math.random() * 10),
        epoch: 382,
        timestamp: 'Just now',
        sender: '0x' + Math.random().toString(16).substring(2, 10) + '...zkLogin',
        packageId: brand.moveModule,
        module: `${brand.moveModule}::mint`,
        action: 'mint_isolated_points',
        merchant: `${brand.name} (${brand.symbol})`,
        tokenSymbol: brand.symbol,
        amount: calculatedPoints,
        sponsoredGasSui: 0.000,
        gasPayer: '0xoctap_sponsor_relayer_01',
        status: 'FINALIZED',
      };

      setStreamDigests((prev) => [newDigest, ...prev.slice(0, 3)]);
      setLatestMintResult({
        points: calculatedPoints,
        symbol: brand.symbol,
        brandName: brand.name,
        digest: newDigestStr,
      });
      setIsMinting(false);
    }, 650);
  };

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--ground)] py-12 md:py-20 lg:py-24">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[500px] rounded-full bg-[#002b49]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Vision & Pitch */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-medium text-primary mb-6 shadow-xs">
              <Sparkle size={14} weight="fill" className="text-primary" />
              <span>{t.badge}</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.08] text-balance">
              {t.h1Lead}{' '}
              <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-2">
                {t.h1Accent}
              </span>{' '}
              {t.h1Tail}
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-base sm:text-lg text-[var(--ink-2)] leading-relaxed max-w-xl">
              {t.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-[#830250] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t.ctaPrimary}</span>
                <ArrowRight size={16} weight="bold" />
              </Link>

              <Link
                to="/wallet"
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--ink)] hover:border-primary hover:text-primary transition-all shadow-xs"
              >
                <DeviceMobile size={17} />
                <span>{t.ctaSecondary}</span>
              </Link>

              <a
                href="#developers"
                className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-mono font-medium text-[var(--muted)] hover:text-primary transition-colors"
              >
                <Code size={16} />
                <span>{t.ctaDocs}</span>
              </a>
            </div>

            {/* Micro value props */}
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
              <CheckCircle size={14} className="text-emerald-500" weight="fill" />
              <span>{t.subtext}</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Dual-Pane Simulator */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xl overflow-hidden">
              {/* Card Window Titlebar */}
              <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-red-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-xs font-semibold text-[var(--ink-2)]">
                    {t.liveSimulatorTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sui Network Active</span>
                </div>
              </div>

              {/* Simulation Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Form Controls */}
                <form onSubmit={handleSimulateMint} className="space-y-4">
                  {/* Merchant Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1.5">
                      {t.merchantSelectLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PARTNER_BRANDS.slice(0, 3).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedMerchant(item.id)}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                            selectedMerchant === item.id
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-black/20'
                          }`}
                        >
                          <div
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="truncate">
                            <span className="block text-xs font-bold leading-tight truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted)]">
                              {item.symbol}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Phone & Bill Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                        {t.customerPhoneLabel}
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                        {t.billAmountLabel}
                      </label>
                      <input
                        type="text"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:border-primary focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#830250] transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {isMinting ? (
                      <>
                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t.minting}</span>
                      </>
                    ) : (
                      <>
                        <Lightning size={15} weight="fill" />
                        <span>{t.btnSimulate}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Minting Success Banner */}
                {latestMintResult && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <CheckCircle size={18} weight="bold" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          +{latestMintResult.points} {latestMintResult.symbol} ({latestMintResult.brandName})
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700">
                          {t.resultIssued} · {t.sponsoredTag}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onInspectDigest({
                          digest: latestMintResult.digest,
                          checkpoint: 14829320,
                          epoch: 382,
                          timestamp: 'Just now',
                          sender: '0x' + Math.random().toString(16).substring(2, 10),
                          packageId: brand.moveModule,
                          module: `${brand.moveModule}::mint`,
                          action: 'mint_isolated_points',
                          merchant: brand.name,
                          tokenSymbol: brand.symbol,
                          amount: latestMintResult.points,
                          sponsoredGasSui: 0.0,
                          gasPayer: '0xoctap_sponsor_relayer_01',
                          status: 'FINALIZED',
                        })
                      }
                      className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
                    >
                      {lang === 'en' ? 'Inspect Proof' : 'Tra cứu'}
                    </button>
                  </div>
                )}

                {/* Live Sui Ledger Activity Feed */}
                <div className="border-t border-[var(--line)] pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      {t.suiTxStreamTitle}
                    </span>
                    <span className="text-[10px] font-mono text-primary font-semibold">
                      {t.clickToVerify}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {streamDigests.map((item) => (
                      <div
                        key={item.digest}
                        onClick={() => onInspectDigest(item)}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs transition-all hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Cube size={16} className="text-primary shrink-0 group-hover:rotate-12 transition-transform" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--ink)]">
                              <span>{item.merchant}</span>
                              <span className="text-emerald-600 font-bold">+{item.amount}</span>
                            </div>
                            <div className="font-mono text-[10px] text-[var(--muted)] truncate max-w-[200px] sm:max-w-[260px]">
                              Digest: {item.digest}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-700">
                            Gas: 0 SUI
                          </span>
                          <span className="block text-[9px] font-mono text-[var(--muted)] mt-0.5">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
