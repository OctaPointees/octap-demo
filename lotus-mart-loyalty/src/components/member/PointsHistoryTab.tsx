import React, { useState } from 'react';
import {
  ArrowSquareOut,
  ArrowsClockwise,
  CheckCircle,
  ClockCounterClockwise,
  Minus,
  Plus,
  Sparkle,
} from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { PointHistoryItem } from '../../types';

export const PointsHistoryTab: React.FC = () => {
  const { language, pointHistory, setSelectedTxDigest } = useLoyalty();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getTxIcon = (type: PointHistoryItem['type']) => {
    switch (type) {
      case 'bill':
        return {
          icon: Plus,
          className: 'bg-emerald-100 text-emerald-800',
        };
      case 'bonus':
        return {
          icon: Sparkle,
          className: 'bg-amber-100 text-amber-800',
        };
      case 'redeem':
        return {
          icon: Minus,
          className: 'bg-pink-100 text-[var(--brand)]',
        };
      case 'adjust':
      default:
        return {
          icon: ArrowsClockwise,
          className: 'bg-sky-100 text-sky-800',
        };
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--ink)]">
            {language === 'vi' ? 'Lịch sử điểm' : 'Points history'}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {language === 'vi'
              ? 'Mọi dòng biến động điểm đều được ký số và ghi nhận công khai trên chuỗi khối Sui.'
              : 'Every balance update carries a public cryptographic digest on the Sui blockchain.'}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRange('7d')}
            className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${
              range === '7d'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            {language === 'vi' ? '7 ngày' : '7d'}
          </button>
          <button
            type="button"
            onClick={() => setRange('30d')}
            className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${
              range === '30d'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            {language === 'vi' ? '30 ngày' : '30d'}
          </button>
          <button
            type="button"
            onClick={() => setRange('90d')}
            className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${
              range === '90d'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            {language === 'vi' ? '90 ngày' : '90d'}
          </button>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
        {pointHistory.map((pt) => {
          const config = getTxIcon(pt.type);
          const Icon = config.icon;
          const isPositive = pt.points > 0;

          return (
            <div
              key={pt.id}
              className="flex items-center justify-between gap-4 p-4.5 hover:bg-[var(--surface-2)]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${config.className}`}
                >
                  <Icon size={18} weight="bold" />
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-[var(--ink)] text-sm truncate">
                    {language === 'vi' ? pt.titleVi : pt.titleEn}
                  </div>
                  <div className="font-mono text-xs text-[var(--muted)] flex items-center gap-2 flex-wrap">
                    <span>{language === 'vi' ? pt.subtitleVi : pt.subtitleEn}</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTxDigest(pt.suiTxDigest)}
                      className="text-[var(--brand)] hover:underline inline-flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <span>{pt.suiTxDigest.slice(0, 10)}…</span>
                      <ArrowSquareOut size={11} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`font-mono text-base font-bold tabular-nums ${
                    isPositive ? 'text-emerald-600' : 'text-[var(--brand)]'
                  }`}
                >
                  {isPositive ? `+${pt.points}` : pt.points}
                </span>
                <div className="text-[10.5px] text-[var(--muted)]">
                  {language === 'vi' ? 'Sen' : 'Petals'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <CheckCircle size={15} weight="fill" className="text-emerald-500" />
        <span>
          {language === 'vi'
            ? 'Mọi giao dịch đều được đối chiếu độc lập trên Sui Explorer với phí gas tài trợ 100%.'
            : 'All events are independently verifiable on Sui Explorer with 100% sponsored gas fees.'}
        </span>
      </div>
    </div>
  );
};
