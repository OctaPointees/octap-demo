import React from 'react';
import { Clock, QrCode, Sparkle, TrendUp } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const MemberSummary: React.FC = () => {
  const { language, user, setActiveTab } = useLoyalty();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Primary Balance Card */}
      <div
        style={{
          background: 'var(--brand)',
          color: '#fff',
        }}
        className="rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 size-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-85">
              {language === 'vi' ? 'Sen khả dụng' : 'Petals available'}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              <Sparkle size={12} weight="fill" className="text-amber-200" />
              <span>{language === 'vi' ? 'Hạng Vàng' : 'Gold tier'}</span>
            </span>
          </div>

          <div className="font-display mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums leading-none">
            {user.balance.toLocaleString()}
          </div>
        </div>

        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${(user.balance / user.nextTierMax) * 100}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-medium opacity-90">
            <span>
              {language === 'vi'
                ? `Còn ${(user.nextTierMax - user.balance).toLocaleString()} Sen lên ${user.nextTierName}`
                : `${(user.nextTierMax - user.balance).toLocaleString()} Petals to Platinum`}
            </span>
            <span className="font-mono">
              {user.balance.toLocaleString()} / {user.nextTierMax.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Expiring Soon Card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="flex flex-col justify-between rounded-2xl p-6 shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'vi' ? 'Sắp hết hạn' : 'Expiring soon'}
            </span>
            <Clock size={18} />
          </div>

          <div className="font-display mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] tabular-nums">
            {user.expiringPoints}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            {language === 'vi'
              ? user.expiringDateText.vi
              : user.expiringDateText.en}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('redeem')}
            className="mt-2 text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
          >
            {language === 'vi' ? 'Đổi quà ngay →' : 'Redeem rewards now →'}
          </button>
        </div>
      </div>

      {/* 12-Month Earned Analytics Card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="flex flex-col justify-between rounded-2xl p-6 shadow-xs sm:col-span-2 lg:col-span-1"
      >
        <div>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'vi' ? 'Đã tích trong 12 tháng' : 'Earned in 12 months'}
            </span>
            <TrendUp size={18} className="text-emerald-600" />
          </div>

          <div className="font-display mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] tabular-nums">
            {user.earned12m.toLocaleString()}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-xs">
            <TrendUp size={14} weight="bold" />
            <span>
              {language === 'vi'
                ? `${user.earned12mGrowthPct}% so với kỳ trước`
                : `${user.earned12mGrowthPct}% vs previous period`}
            </span>
          </span>

          <span className="font-mono text-[11px] text-[var(--muted)]">
            Sui Verified
          </span>
        </div>
      </div>
    </div>
  );
};
