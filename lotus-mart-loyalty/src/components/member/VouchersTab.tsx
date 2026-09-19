import React from 'react';
import { Copy, QrCode, Ticket } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { VoucherItem } from '../../types';

export const VouchersTab: React.FC = () => {
  const {
    language,
    vouchers,
    setSelectedVoucher,
    setSelectedTxDigest,
    showToast,
    setActiveTab,
  } = useLoyalty();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(
      language === 'vi'
        ? `Đã sao chép mã voucher: ${code}`
        : `Copied voucher code: ${code}`
    );
  };

  const getStatusBadge = (status: VoucherItem['status']) => {
    switch (status) {
      case 'ready':
        return {
          labelVi: 'Sẵn sàng',
          labelEn: 'Ready',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'expiring':
        return {
          labelVi: 'Sắp hết hạn',
          labelEn: 'Expiring',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'used':
      default:
        return {
          labelVi: 'Đã dùng',
          labelEn: 'Used',
          className: 'bg-slate-200 text-slate-700 border-slate-300 opacity-80',
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--ink)]">
            {language === 'vi' ? 'Voucher của tôi' : 'My vouchers'}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {language === 'vi'
              ? 'Xuất trình mã QR hoặc mã voucher này cho thu ngân khi thanh toán để áp dụng ưu đãi.'
              : 'Present this QR or code to the cashier at checkout to apply your reward.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('redeem')}
          style={{
            background: 'var(--brand)',
            color: '#fff',
          }}
          className="flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-opacity hover:opacity-95 cursor-pointer"
        >
          <Ticket size={16} />
          <span>{language === 'vi' ? 'Đổi thêm quà' : 'Redeem more'}</span>
        </button>
      </div>

      {vouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] py-16 text-center">
          <Ticket size={48} className="text-[var(--muted)] opacity-50 mb-3" />
          <p className="font-semibold text-[var(--ink)]">
            {language === 'vi' ? 'Bạn chưa có voucher nào' : 'No vouchers in your wallet yet'}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
            {language === 'vi'
              ? 'Dùng Sen tích luỹ được để đổi lấy phiếu mua hàng, vé xem phim hoặc combo đồ uống.'
              : 'Spend your earned Petals to unlock supermarket discounts, cinema tickets, or cafe treats.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((v) => {
            const badge = getStatusBadge(v.status);
            const isUsed = v.status === 'used';

            return (
              <div
                key={v.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                }}
                className={`relative flex overflow-hidden rounded-2xl shadow-xs transition-all hover:shadow-md ${
                  isUsed ? 'opacity-70 grayscale-[20%]' : ''
                }`}
              >
                {/* Perforated Stub Left Visual */}
                <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-dashed border-[var(--line)] bg-[var(--surface-2)] p-2 text-[var(--brand)]">
                  <Ticket size={28} weight={isUsed ? 'regular' : 'fill'} />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--muted)] mt-1 text-center font-bold">
                    {v.provider}
                  </span>
                </div>

                {/* Voucher Details */}
                <div className="flex flex-1 flex-col justify-between p-4.5 gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-base text-[var(--ink)] leading-snug">
                        {language === 'vi' ? v.titleVi : v.titleEn}
                      </h4>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${badge.className}`}
                      >
                        {language === 'vi' ? badge.labelVi : badge.labelEn}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {v.provider} · {language === 'vi' ? v.expiryVi : v.expiryEn}
                    </div>
                  </div>

                  {/* Code and Action Buttons */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[var(--ink)] bg-[var(--surface-2)] px-2.5 py-1.5 rounded-lg">
                      <span>{v.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(v.code)}
                        className="text-[var(--muted)] hover:text-[var(--brand)] cursor-pointer"
                        title="Copy"
                      >
                        <Copy size={13} />
                      </button>
                    </div>

                    {!isUsed && (
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(v)}
                        className="flex items-center gap-1 rounded-lg border border-[var(--brand)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer"
                      >
                        <QrCode size={14} />
                        <span>{language === 'vi' ? 'Mở mã' : 'Show QR'}</span>
                      </button>
                    )}
                  </div>

                  {v.suiTxDigest && (
                    <div className="flex justify-between items-center text-[10.5px] font-mono text-[var(--muted)] pt-1">
                      <span>Sui Mint Digest:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTxDigest(v.suiTxDigest!)}
                        className="text-[var(--brand)] hover:underline cursor-pointer"
                      >
                        {v.suiTxDigest.slice(0, 10)}… ↗
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
