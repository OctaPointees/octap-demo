import React, { useState } from 'react';
import { Gift, MagnifyingGlass, Sparkle } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { RewardItem } from '../../types';

export const RedeemTab: React.FC = () => {
  const { language, rewards, user, setRedeemModalReward } = useLoyalty();
  const [filterCategory, setFilterCategory] = useState<'all' | 'lotus' | 'octap'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = rewards.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVi = item.titleVi.toLowerCase().includes(q) || item.provider.toLowerCase().includes(q);
      const matchEn = item.titleEn.toLowerCase().includes(q) || item.provider.toLowerCase().includes(q);
      return matchVi || matchEn;
    }
    return true;
  });

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
    <div className="flex flex-col gap-6">
      {/* Search and Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-1">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            {language === 'vi' ? 'Tất cả' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('lotus')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterCategory === 'lotus'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            Lotus Mart
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('octap')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterCategory === 'octap'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            {language === 'vi' ? 'Mạng lưới OctaP' : 'OctaP network'}
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'vi' ? 'Tìm voucher, quà...' : 'Search rewards...'}
            className="h-9 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--brand)]"
          />
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => {
          const canAfford = user.balance >= item.pointCost;
          const shortage = item.pointCost - user.balance;

          return (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                !canAfford ? 'opacity-85' : ''
              }`}
            >
              {/* Visual Thumbnail */}
              <div className="relative flex h-36 items-center justify-center border-b border-[var(--line)] bg-gradient-to-br from-[var(--surface-2)] to-[#ece4e9]">
                <div className="flex flex-col items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <Gift size={32} className="text-[var(--brand)] opacity-60" />
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

                    {!canAfford ? (
                      <span className="text-[11px] font-medium text-red-500">
                        {language === 'vi'
                          ? `Thiếu ${shortage.toLocaleString()} Sen`
                          : `${shortage.toLocaleString()} short`}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[var(--muted)]">
                        {language === 'vi'
                          ? `còn ${item.stock} quà`
                          : `${item.stock} in stock`}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRedeemModalReward(item)}
                    disabled={!canAfford}
                    style={{
                      background: canAfford ? 'var(--brand)' : 'var(--line)',
                      color: canAfford ? '#fff' : 'var(--muted)',
                    }}
                    className="flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>
                      {canAfford
                        ? language === 'vi'
                          ? 'Đổi ngay'
                          : 'Redeem'
                        : language === 'vi'
                        ? 'Chưa đủ'
                        : 'Locked'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
