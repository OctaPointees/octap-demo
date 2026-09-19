import React from 'react';
import { ArrowSquareOut, CheckCircle, Copy, ShieldCheck, X } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const SuiTxModal: React.FC = () => {
  const { language, selectedTxDigest, setSelectedTxDigest, showToast } = useLoyalty();

  if (!selectedTxDigest) return null;

  const fullDigest = `${selectedTxDigest}7Bv9Kq2M4wXp1Za5`;
  const checkpoint = 14892104;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDigest);
    showToast(
      language === 'vi'
        ? 'Đã sao chép mã giao dịch Sui'
        : 'Copied Sui transaction digest'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fadeIn">
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[#002b49] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-cyan-400" />
            <div>
              <h3 className="font-display font-bold text-base leading-tight">
                Sui Explorer · Verified Proof
              </h3>
              <span className="font-mono text-[10.5px] text-cyan-200 uppercase tracking-wider">
                Mainnet Protocol
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTxDigest(null)}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 font-semibold">
            <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
            <span>
              {language === 'vi'
                ? 'Giao dịch đã được xác nhận (Confirmed) và neo vĩnh viễn trên chuỗi khối Sui.'
                : 'Transaction confirmed and immutably anchored on the Sui blockchain.'}
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
            {/* Digest */}
            <div>
              <div className="flex justify-between items-center text-[var(--muted)] text-[11px] font-bold uppercase mb-1">
                <span>Transaction Digest</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[var(--brand)] hover:underline cursor-pointer"
                >
                  <Copy size={12} />
                  <span>{language === 'vi' ? 'Sao chép' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs font-semibold text-[var(--ink)] break-all bg-[var(--surface)] p-2 rounded-lg border border-[var(--line)]">
                {fullDigest}
              </div>
            </div>

            {/* Grid of metadata */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-[var(--surface)] p-2.5 border border-[var(--line)]">
                <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">
                  Checkpoint
                </span>
                <span className="font-mono text-xs font-bold text-[var(--ink)]">
                  #{checkpoint.toLocaleString()}
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface)] p-2.5 border border-[var(--line)]">
                <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">
                  Sponsored Gas Fee
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600">
                  0.000 SUI (Sponsored)
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface)] p-2.5 border border-[var(--line)]">
                <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">
                  Token Module
                </span>
                <span className="font-mono text-xs font-bold text-[var(--ink)]">
                  lotus_mart::points
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface)] p-2.5 border border-[var(--line)]">
                <span className="text-[10.5px] text-[var(--muted)] uppercase font-semibold block">
                  Consensus Time
                </span>
                <span className="font-mono text-xs font-bold text-[var(--ink)]">
                  420 ms
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11.5px] text-[var(--muted)] leading-relaxed">
            {language === 'vi'
              ? 'Tất cả điểm thưởng Lotus Mart được phát hành theo tiêu chuẩn Token/TreasuryCap riêng biệt trên Sui, bảo đảm doanh nghiệp không thể tự ý thay đổi số dư mà không có bằng chứng chữ ký.'
              : 'Lotus Mart points are minted under an isolated TreasuryCap contract on Sui, ensuring auditability and eliminating single-point ledger manipulation.'}
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setSelectedTxDigest(null)}
              className="h-10 rounded-xl bg-[var(--surface-2)] px-5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--line)] cursor-pointer"
            >
              {language === 'vi' ? 'Đóng cửa sổ' : 'Close window'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
