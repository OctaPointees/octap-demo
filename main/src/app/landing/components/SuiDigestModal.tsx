import { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Copy, Check } from 'phosphor-react';
import type { SuiDigestDetail, Language } from '../types';

interface SuiDigestModalProps {
  digest: SuiDigestDetail | null;
  onClose: () => void;
  lang: Language;
}

export const SuiDigestModal = ({ digest, onClose, lang }: SuiDigestModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!digest) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-[var(--ink)]">
                  {lang === 'en' ? 'Sui On-Chain Proof Verification' : 'Xác Thực Bằng Chứng Chuỗi Sui'}
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
                  {digest.status}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {lang === 'en'
                  ? 'Cryptographic consensus proof anchored to Sui blockchain'
                  : 'Bằng chứng đồng thuận mật mã ghi nhận trực tiếp trên Sui'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Digest Hash banner */}
        <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-3 border border-[var(--line)] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase text-[var(--muted)]">
              {lang === 'en' ? 'Transaction Digest' : 'Mã Băm Giao Dịch'}
            </div>
            <div className="font-mono text-xs font-semibold text-[var(--ink)] truncate">
              {digest.digest}
            </div>
          </div>
          <button
            onClick={() => handleCopy(digest.digest)}
            className="flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-mono text-[var(--ink-2)] hover:border-primary hover:text-primary transition-colors shrink-0"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copied ? (lang === 'en' ? 'Copied' : 'Đã chép') : (lang === 'en' ? 'Copy' : 'Chép')}</span>
          </button>
        </div>

        {/* Audit Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-[var(--line)] p-2.5 bg-[var(--surface)]">
            <span className="text-[10px] font-mono text-[var(--muted)] block">Checkpoint / Epoch</span>
            <span className="font-mono font-semibold text-[var(--ink)]">
              #{digest.checkpoint.toLocaleString()} · Epoch {digest.epoch}
            </span>
          </div>

          <div className="rounded-lg border border-[var(--line)] p-2.5 bg-[var(--surface)]">
            <span className="text-[10px] font-mono text-[var(--muted)] block">
              {lang === 'en' ? 'Consensus Finality' : 'Thời Gian Đồng Thuận'}
            </span>
            <span className="font-mono font-semibold text-emerald-600">382 ms (BFT finalized)</span>
          </div>

          <div className="rounded-lg border border-[var(--line)] p-2.5 bg-[var(--surface)]">
            <span className="text-[10px] font-mono text-[var(--muted)] block">
              {lang === 'en' ? 'Isolated Move Module' : 'Hợp Đồng Move Cô Lập'}
            </span>
            <span className="font-mono font-semibold text-[var(--ink)] truncate block">{digest.module}</span>
          </div>

          <div className="rounded-lg border border-[var(--line)] p-2.5 bg-[var(--surface)]">
            <span className="text-[10px] font-mono text-[var(--muted)] block">
              {lang === 'en' ? 'Target Merchant Treasury' : 'Kho Quỹ Doanh Nghiệp'}
            </span>
            <span className="font-mono font-semibold text-primary">{digest.merchant}</span>
          </div>

          <div className="rounded-lg border border-[var(--line)] p-2.5 bg-[var(--surface)] col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--muted)]">
                {lang === 'en' ? 'Gas Sponsorship Relayer' : 'Tài Trợ Phí Gas (Sponsored Gas)'}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">100% SPONSORED</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--ink-2)] truncate max-w-[280px]">Payer: {digest.gasPayer}</span>
              <span className="font-bold text-[var(--ink)]">0.000 SUI (Customer)</span>
            </div>
          </div>
        </div>

        {/* Verification Footer Note */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-mono">
            <CheckCircle size={15} className="text-emerald-500" weight="fill" />
            <span>{lang === 'en' ? 'Tamper-Proof Sui Object' : 'Đối tượng Move bất biến trên Sui'}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--ink)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors"
          >
            {lang === 'en' ? 'Close Inspector' : 'Đóng Bảng Tra Cứu'}
          </button>
        </div>
      </div>
    </div>
  );
};
