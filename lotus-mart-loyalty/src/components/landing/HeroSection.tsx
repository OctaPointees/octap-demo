import React from 'react';
import { ArrowRight, CheckCircle, ShieldCheck, Sparkle } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const HeroSection: React.FC = () => {
  const {
    language,
    signedIn,
    user,
    setCurrentView,
    setActiveTab,
    setSignInModalOpen,
    setSelectedTxDigest,
  } = useLoyalty();

  return (
    <div>
      {/* Signed-in Top Strip if user is logged in */}
      {signedIn && (
        <div
          style={{
            background: 'var(--brand)',
            color: '#fff',
          }}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-8 shadow-xs"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold">
              {language === 'vi' ? `Chào ${user.name}` : `Welcome ${user.name}`}
            </span>
            <div className="flex items-center gap-1.5 font-display text-lg font-bold">
              <span>{user.balance.toLocaleString()}</span>
              <span className="text-xs font-normal opacity-85">
                {language === 'vi' ? 'Sen khả dụng' : 'Petals available'}
              </span>
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              {language === 'vi' ? 'Hạng Vàng' : 'Gold tier'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentView('member');
              setActiveTab('redeem');
            }}
            className="flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-90 cursor-pointer"
          >
            <span>{language === 'vi' ? 'Mở khu vực thành viên →' : 'Open member portal →'}</span>
          </button>
        </div>
      )}

      {/* Main Hero Container */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-8 lg:grid-cols-12 lg:py-20">
        {/* Left column: Headings, details, CTAs, metrics */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-soft)] bg-[var(--brand-wash)] px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-[var(--brand)] uppercase">
            <ShieldCheck size={14} weight="bold" />
            <span>
              {language === 'vi'
                ? 'Ghi nhận trên blockchain Sui'
                : 'Recorded on the Sui blockchain'}
            </span>
          </div>

          <h1 className="font-display mt-5 mb-4 text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.08]">
            {language === 'vi'
              ? 'Mỗi lần đi chợ, một điểm Sen minh bạch.'
              : 'Every shop, one transparent Petal.'}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[var(--ink-2)] sm:text-lg mb-8">
            {language === 'vi'
              ? 'Điểm thưởng Lotus Mart được ghi thẳng lên chuỗi khối Sui: bạn xem được từng giao dịch, không ai sửa được số dư, và đổi được sang voucher trong mạng lưới OctaP bất cứ lúc nào.'
              : 'Lotus Mart points are written straight to the Sui blockchain: you can inspect every transaction, nobody can alter your balance, and you can swap points for vouchers across the OctaP partner network.'}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              type="button"
              onClick={() => {
                if (!signedIn) {
                  setSignInModalOpen(true);
                } else {
                  setCurrentView('member');
                }
              }}
              style={{
                background: 'var(--brand)',
                color: '#fff',
              }}
              className="flex h-12 items-center gap-2 rounded-lg px-6 font-semibold shadow-md transition-all hover:opacity-95 cursor-pointer"
            >
              <span>
                {signedIn
                  ? language === 'vi'
                    ? 'Vào khu vực thành viên'
                    : 'Open Member Portal'
                  : language === 'vi'
                  ? 'Tạo tài khoản miễn phí'
                  : 'Create a free account'}
              </span>
              <ArrowRight size={17} weight="bold" />
            </button>

            <a
              href="#cachhoatdong"
              className="flex h-12 items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 font-semibold text-[var(--ink)] shadow-xs transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {language === 'vi' ? 'Cách hoạt động' : 'How it works'}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-[var(--line)] pt-5 font-mono text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>{language === 'vi' ? '28.400 thành viên' : '28,400 members'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>{language === 'vi' ? '1,28M Sen đã phát' : '1.28M Petals issued'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>{language === 'vi' ? '64 siêu thị toàn quốc' : '64 stores nationwide'}</span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Member Card Simulation */}
        <div className="flex justify-center lg:col-span-5">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 hover:scale-[1.01]">
            {/* Gradient Card Top */}
            <div
              style={{
                background: 'var(--brand)',
                color: '#fff',
              }}
              className="p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-6 -mr-6 size-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium tracking-wide uppercase opacity-80">
                    {language === 'vi' ? 'Số dư Sen khả dụng' : 'Petal balance'}
                  </div>
                  <div className="font-display mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
                    {user.balance.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
                  <Sparkle size={13} weight="fill" className="text-amber-200" />
                  <span>{language === 'vi' ? 'Hạng Vàng' : 'Gold'}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 mb-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${(user.balance / user.nextTierMax) * 100}%` }}
                />
              </div>

              <div className="flex justify-between gap-2 text-[11.5px] opacity-90 font-medium">
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

            {/* Simulated Live Ledger Rows with Sui Verification click */}
            <div className="flex flex-col gap-3 p-5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[var(--ink)]">
                    {language === 'vi' ? 'Hoá đơn 520.000 ₫' : 'Bill 520,000 ₫'}
                  </div>
                  <div className="font-mono text-xs text-[var(--muted)]">
                    19 Th9, 14:02 · Lotus Q7
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600">+52</span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[var(--ink)]">
                    {language === 'vi' ? 'Đổi voucher Lumière Cinema' : 'Redeemed Lumière Cinema voucher'}
                  </div>
                  <div className="font-mono text-xs text-[var(--muted)]">
                    18 Th9, 20:11 · {language === 'vi' ? 'Ví OctaP' : 'OctaP wallet'}
                  </div>
                </div>
                <span className="font-mono font-bold text-[var(--brand)]">−800</span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between font-mono text-[11.5px] text-[var(--muted)] pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                  <span>{language === 'vi' ? 'Xác thực on-chain' : 'Verified on-chain'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTxDigest('8FkQ7xAm5P1qm2Rd7K1p')}
                  className="text-[var(--brand)] underline underline-offset-2 hover:opacity-80 cursor-pointer font-bold"
                >
                  8FkQ7xAm…m2Rd ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
