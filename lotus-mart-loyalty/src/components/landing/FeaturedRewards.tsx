import React from 'react';
import { ArrowRight, Gift, Sparkle } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { RewardItem } from '../../types';

export const FeaturedRewards: React.FC = () => {
  const {
    language,
    rewards,
    signedIn,
    user,
    setSignInModalOpen,
    setRedeemModalReward,
    setCurrentView,
    setActiveTab,
  } = useLoyalty();

  // Show first 4 rewards as featured
  const featured = rewards.slice(0, 4);

  const handleRedeemClick = (reward: RewardItem) => {
    if (!signedIn) {
      setSignInModalOpen(true);
    } else {
      setRedeemModalReward(reward);
    }
  };

  const getBadgeStyle = (theme: RewardItem['badgeTheme']) => {
    switch (theme) {
      case 'cinema':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'cafe':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'gold':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'lotus':
      default:
        return 'bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand-wash)]';
    }
  };

  return (
    <section
      id="qua"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
      className="py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold text-[var(--brand)]">03</span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
              {language === 'vi' ? 'Quà tiêu biểu' : 'Featured rewards'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!signedIn) {
                setSignInModalOpen(true);
              } else {
                setCurrentView('member');
                setActiveTab('redeem');
              }
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] hover:underline cursor-pointer"
          >
            <span>
              {language === 'vi'
                ? `Xem tất cả ${rewards.length} quà →`
                : `See all ${rewards.length} rewards →`}
            </span>
          </button>
        </div>

        <p className="max-w-2xl text-[var(--ink-2)] text-base mb-12">
          {language === 'vi'
            ? 'Quà của Lotus Mart và voucher từ mạng lưới OctaP — cùng một số dư Sen, đổi được ở mọi thương hiệu liên kết.'
            : 'Lotus Mart gifts and OctaP partner network vouchers — spend one unified Petal balance across both.'}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => {
            const canAfford = !signedIn || user.balance >= item.pointCost;

            return (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--ground)] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Visual Placeholder for Reward Image */}
                <div className="relative flex h-36 items-center justify-center border-b border-[var(--line)] bg-gradient-to-br from-[var(--surface-2)] to-[#ece4e9]">
                  <div className="flex flex-col items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    <Gift size={28} className="text-[var(--brand)] opacity-60" />
                    <span>{item.provider}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span
                    className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle(
                      item.badgeTheme
                    )}`}
                  >
                    {language === 'vi' ? item.badgeVi : item.badgeEn}
                  </span>

                  <h3 className="font-display mt-2.5 text-base font-bold text-[var(--ink)] leading-snug">
                    {language === 'vi' ? item.titleVi : item.titleEn}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
                    {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-[var(--line)]">
                    <div>
                      <div className="font-mono text-base font-bold text-[var(--brand)] tabular-nums">
                        {item.pointCost.toLocaleString()}{' '}
                        <span className="text-xs font-normal">
                          {language === 'vi' ? 'Sen' : 'Petals'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-[var(--muted)]">
                        {language === 'vi'
                          ? `còn ${item.stock}`
                          : `${item.stock} left`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeemClick(item)}
                      disabled={signedIn && !canAfford}
                      style={{
                        background: canAfford ? 'var(--brand)' : 'var(--line)',
                        color: canAfford ? '#fff' : 'var(--muted)',
                      }}
                      className="flex h-9 items-center justify-center rounded-lg px-3.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>
                        {!signedIn
                          ? language === 'vi'
                            ? 'Đổi'
                            : 'Redeem'
                          : canAfford
                          ? language === 'vi'
                            ? 'Đổi'
                            : 'Redeem'
                          : language === 'vi'
                          ? 'Thiếu Sen'
                          : 'Short'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
