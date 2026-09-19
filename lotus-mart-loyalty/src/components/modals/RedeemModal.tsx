import React from 'react';
import { ArrowRight, CheckCircle, Gift, Sparkle, Ticket, X } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const RedeemModal: React.FC = () => {
  const {
    language,
    redeemModalReward,
    setRedeemModalReward,
    user,
    redeemReward,
    setCurrentView,
    setActiveTab,
    setSelectedVoucher,
  } = useLoyalty();

  if (!redeemModalReward) return null;

  const canAfford = user.balance >= redeemModalReward.pointCost;
  const remaining = user.balance - redeemModalReward.pointCost;

  const handleConfirm = () => {
    const res = redeemReward(redeemModalReward);
    if (res.success && res.voucher) {
      setRedeemModalReward(null);
      setCurrentView('member');
      setActiveTab('vouchers');
      setSelectedVoucher(res.voucher);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fadeIn">
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-[var(--brand)]" />
            <h3 className="font-display font-bold text-base text-[var(--ink)]">
              {language === 'vi' ? 'Xác nhận đổi quà' : 'Confirm redemption'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setRedeemModalReward(null)}
            className="flex size-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Reward Summary Card */}
          <div className="flex items-center gap-4 rounded-xl bg-[var(--surface-2)] p-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Gift size={28} />
            </div>
            <div>
              <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--brand)]">
                {redeemModalReward.provider}
              </span>
              <h4 className="font-display font-bold text-base text-[var(--ink)] mt-1">
                {language === 'vi' ? redeemModalReward.titleVi : redeemModalReward.titleEn}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {language === 'vi' ? redeemModalReward.descriptionVi : redeemModalReward.descriptionEn}
              </p>
            </div>
          </div>

          {/* Ledger Calculation */}
          <div className="flex flex-col gap-2 rounded-xl border border-[var(--line)] p-4 text-xs">
            <div className="flex justify-between text-[var(--ink-2)]">
              <span>{language === 'vi' ? 'Số dư Sen hiện tại' : 'Current balance'}</span>
              <span className="font-mono font-bold">{user.balance.toLocaleString()} Sen</span>
            </div>

            <div className="flex justify-between font-bold text-[var(--brand)]">
              <span>{language === 'vi' ? 'Điểm Sen cần đổi' : 'Points to deduct'}</span>
              <span className="font-mono">−{redeemModalReward.pointCost.toLocaleString()} Sen</span>
            </div>

            <div className="h-px bg-[var(--line)] my-1" />

            <div className="flex justify-between font-bold text-sm text-[var(--ink)]">
              <span>{language === 'vi' ? 'Số dư còn lại' : 'Remaining balance'}</span>
              <span className={`font-mono ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {remaining.toLocaleString()} Sen
              </span>
            </div>
          </div>

          <div className="text-[11.5px] text-[var(--muted)] leading-relaxed flex items-start gap-1.5">
            <CheckCircle size={15} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            <span>
              {language === 'vi'
                ? 'Giao dịch đổi quà sẽ phát sinh một voucher điện tử ngay lập tức và được ghi sổ trên blockchain Sui (phí mạng miễn phí 100%).'
                : 'Redemption will immediately mint an on-chain voucher pass on Sui (100% sponsored gas fees).'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRedeemModalReward(null)}
              className="h-10 rounded-xl px-4 text-xs font-semibold text-[var(--ink-2)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canAfford}
              style={{
                background: canAfford ? 'var(--brand)' : 'var(--line)',
                color: canAfford ? '#fff' : 'var(--muted)',
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold shadow-xs transition-opacity hover:opacity-95 disabled:cursor-not-allowed cursor-pointer"
            >
              <Ticket size={16} />
              <span>
                {canAfford
                  ? language === 'vi'
                    ? 'Xác nhận đổi quà'
                    : 'Confirm & Mint Voucher'
                  : language === 'vi'
                  ? 'Số dư không đủ'
                  : 'Insufficient points'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
