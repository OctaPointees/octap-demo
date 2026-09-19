import React from 'react';
import {
  ClockCounterClockwise,
  Gift,
  Receipt,
  Ticket,
  User,
} from 'phosphor-react';
import { useLoyalty, type MemberTab } from '../../context/LoyaltyContext';

export const MemberNav: React.FC = () => {
  const { language, activeTab, setActiveTab, vouchers } = useLoyalty();

  // Active vouchers count (not used)
  const activeVouchersCount = vouchers.filter((v) => v.status !== 'used').length;

  const tabs: { key: MemberTab; labelVi: string; labelEn: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'redeem', labelVi: 'Đổi điểm', labelEn: 'Redeem', icon: Gift },
    {
      key: 'vouchers',
      labelVi: 'Voucher của tôi',
      labelEn: 'My vouchers',
      icon: Ticket,
      badge: activeVouchersCount,
    },
    { key: 'redemptions', labelVi: 'Lịch sử đổi quà', labelEn: 'Redemption history', icon: Receipt },
    { key: 'points', labelVi: 'Lịch sử điểm', labelEn: 'Points history', icon: ClockCounterClockwise },
    { key: 'profile', labelVi: 'Thông tin của tôi', labelEn: 'My profile', icon: User },
  ];

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--line)] pb-px pt-2 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: isActive ? 'var(--brand)' : 'transparent',
              color: isActive ? '#fff' : 'var(--ink-2)',
            }}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
              !isActive && 'hover:bg-[var(--brand-wash)] hover:text-[var(--brand)]'
            }`}
          >
            <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
            <span>{language === 'vi' ? tab.labelVi : tab.labelEn}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  background: isActive ? '#ffffff33' : 'var(--brand-soft)',
                  color: isActive ? '#fff' : 'var(--brand)',
                }}
                className="rounded-full px-2 py-0.2 font-mono text-xs font-bold"
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
