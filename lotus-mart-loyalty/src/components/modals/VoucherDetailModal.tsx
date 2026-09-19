import React from 'react';
import { Copy, QrCode, Ticket, X } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const VoucherDetailModal: React.FC = () => {
  const { language, selectedVoucher, setSelectedVoucher, showToast } = useLoyalty();

  if (!selectedVoucher) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedVoucher.code);
    showToast(
      language === 'vi'
        ? `Đã sao chép mã voucher: ${selectedVoucher.code}`
        : `Copied voucher code: ${selectedVoucher.code}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fadeIn">
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Top Perforated Design */}
        <div
          style={{
            background: 'var(--brand)',
            color: '#fff',
          }}
          className="p-6 text-center relative"
        >
          <button
            type="button"
            onClick={() => setSelectedVoucher(null)}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30 cursor-pointer"
          >
            <X size={18} />
          </button>

          <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider">
            {selectedVoucher.provider}
          </span>

          <h3 className="font-display mt-3 text-lg font-bold">
            {language === 'vi' ? selectedVoucher.titleVi : selectedVoucher.titleEn}
          </h3>

          <p className="mt-1 text-xs opacity-85">
            {language === 'vi' ? selectedVoucher.expiryVi : selectedVoucher.expiryEn}
          </p>
        </div>

        {/* Barcode / QR Section */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Simulated QR Code */}
          <div className="flex size-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] p-3 shadow-inner">
            <QrCode size={130} weight="bold" className="text-[var(--brand)]" />
            <span className="font-mono text-[10px] text-[var(--muted)] font-semibold mt-1">
              SCAN AT COUNTER
            </span>
          </div>

          {/* Voucher Code Box */}
          <div className="mt-5 flex w-full items-center justify-between rounded-xl bg-[var(--surface-2)] p-3 border border-[var(--line)]">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                {language === 'vi' ? 'Mã ưu đãi' : 'Voucher Code'}
              </span>
              <span className="font-mono text-base font-extrabold tracking-wider text-[var(--ink)]">
                {selectedVoucher.code}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)] cursor-pointer"
            >
              <Copy size={14} />
              <span>{language === 'vi' ? 'Sao chép' : 'Copy'}</span>
            </button>
          </div>

          {/* Instructions */}
          <p className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
            {language === 'vi'
              ? 'Đưa mã này cho nhân viên thu ngân tại quầy thanh toán hoặc quét trực tiếp tại máy POS liên kết OctaP.'
              : 'Show this code to the store cashier or scan at an OctaP-enabled POS terminal.'}
          </p>

          <button
            type="button"
            onClick={() => setSelectedVoucher(null)}
            style={{
              background: 'var(--brand)',
              color: '#fff',
            }}
            className="mt-5 h-10 w-full rounded-xl text-xs font-semibold shadow-xs hover:opacity-95 cursor-pointer"
          >
            {language === 'vi' ? 'Đóng' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
