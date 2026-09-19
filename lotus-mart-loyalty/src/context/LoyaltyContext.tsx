import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BRAND_COLORS,
  INITIAL_POINT_HISTORY,
  INITIAL_REDEMPTION_HISTORY,
  INITIAL_REWARDS,
  INITIAL_USER,
  INITIAL_VOUCHERS,
} from '../data/initialData';
import type {
  Language,
  PointHistoryItem,
  RedemptionHistoryItem,
  RewardItem,
  UserProfile,
  VoucherItem,
} from '../types';

export type MemberTab = 'redeem' | 'vouchers' | 'redemptions' | 'points' | 'profile';

interface LoyaltyContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  currentView: 'landing' | 'member';
  setCurrentView: (view: 'landing' | 'member') => void;
  activeTab: MemberTab;
  setActiveTab: (tab: MemberTab) => void;
  signedIn: boolean;
  setSignedIn: (signed: boolean) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  rewards: RewardItem[];
  vouchers: VoucherItem[];
  redemptionHistory: RedemptionHistoryItem[];
  pointHistory: PointHistoryItem[];
  redeemReward: (reward: RewardItem) => { success: boolean; error?: string; voucher?: VoucherItem };
  selectedTxDigest: string | null;
  setSelectedTxDigest: (digest: string | null) => void;
  signInModalOpen: boolean;
  setSignInModalOpen: (open: boolean) => void;
  redeemModalReward: RewardItem | null;
  setRedeemModalReward: (reward: RewardItem | null) => void;
  selectedVoucher: VoucherItem | null;
  setSelectedVoucher: (voucher: VoucherItem | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [brandColor, setBrandColorState] = useState<string>(BRAND_COLORS[0].hex);
  const [currentView, setCurrentView] = useState<'landing' | 'member'>('landing');
  const [activeTab, setActiveTab] = useState<MemberTab>('redeem');
  const [signedIn, setSignedIn] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistoryItem[]>(INITIAL_REDEMPTION_HISTORY);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>(INITIAL_POINT_HISTORY);

  // Modals & overlay states
  const [selectedTxDigest, setSelectedTxDigest] = useState<string | null>(null);
  const [signInModalOpen, setSignInModalOpen] = useState<boolean>(false);
  const [redeemModalReward, setRedeemModalReward] = useState<RewardItem | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize CSS variable --brand
  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    document.documentElement.style.setProperty('--brand', color);
    document.documentElement.style.setProperty('--brand-soft', `${color}1a`);
    document.documentElement.style.setProperty('--brand-wash', `${color}0f`);
  };

  useEffect(() => {
    setBrandColor(brandColor);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast(language === 'vi' ? 'Đã lưu thay đổi thông tin' : 'Profile changes saved');
  };

  const redeemReward = (reward: RewardItem) => {
    if (user.balance < reward.pointCost) {
      const err = language === 'vi' 
        ? `Bạn còn thiếu ${(reward.pointCost - user.balance).toLocaleString()} Sen để đổi quà này`
        : `You need ${(reward.pointCost - user.balance).toLocaleString()} more Petals to redeem this reward`;
      showToast(err);
      return { success: false, error: err };
    }

    if (reward.stock <= 0) {
      const err = language === 'vi' ? 'Quà này đã hết lượt đổi' : 'Reward is out of stock';
      showToast(err);
      return { success: false, error: err };
    }

    // Deduct balance
    const newBalance = user.balance - reward.pointCost;
    setUser((prev) => ({ ...prev, balance: newBalance }));

    // Update stock
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, stock: r.stock - 1 } : r))
    );

    // Generate simulated Sui tx digest
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const digestPrefix = ['3Hq', '9Lx', '7Yw', '4Vb', '8Km'][Math.floor(Math.random() * 5)];
    const simulatedDigest = `${digestPrefix}${randomHex}…sui`;

    // Code generator (e.g. LTM-78AB-99CD)
    const codePrefix = reward.provider.toLowerCase().includes('lotus') ? 'LTM' :
      reward.provider.toLowerCase().includes('lumi') ? 'LUM' :
      reward.provider.toLowerCase().includes('cà phê') ? 'PCP' : 'OCT';
    const randomCode = `${codePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newVoucher: VoucherItem = {
      id: `vch-${Date.now()}`,
      code: randomCode,
      titleVi: reward.titleVi,
      titleEn: reward.titleEn,
      provider: reward.provider,
      expiryVi: 'HSD 30 ngày kể từ hôm nay',
      expiryEn: 'Valid for 30 days from today',
      status: 'ready',
      suiTxDigest: simulatedDigest,
    };

    const newRedemption: RedemptionHistoryItem = {
      id: `red-${Date.now()}`,
      timeVi: 'Vừa xong',
      timeEn: 'Just now',
      rewardVi: reward.titleVi,
      rewardEn: reward.titleEn,
      provider: reward.provider,
      pointsDeducted: reward.pointCost,
      statusVi: 'Đã phát hành',
      statusEn: 'Issued',
      statusType: 'issued',
      suiTxDigest: simulatedDigest,
    };

    const newPointTx: PointHistoryItem = {
      id: `pt-${Date.now()}`,
      type: 'redeem',
      titleVi: `Đổi ${reward.titleVi}`,
      titleEn: `Redeemed ${reward.titleEn}`,
      subtitleVi: `Vừa xong · ${reward.provider}`,
      subtitleEn: `Just now · ${reward.provider}`,
      points: -reward.pointCost,
      suiTxDigest: simulatedDigest,
      dateKey: 'today',
    };

    setVouchers((prev) => [newVoucher, ...prev]);
    setRedemptionHistory((prev) => [newRedemption, ...prev]);
    setPointHistory((prev) => [newPointTx, ...prev]);

    showToast(
      language === 'vi'
        ? `Đã đổi thành công "${reward.titleVi}"!`
        : `Successfully redeemed "${reward.titleEn}"!`
    );

    return { success: true, voucher: newVoucher };
  };

  return (
    <LoyaltyContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        brandColor,
        setBrandColor,
        currentView,
        setCurrentView,
        activeTab,
        setActiveTab,
        signedIn,
        setSignedIn,
        user,
        updateUser,
        rewards,
        vouchers,
        redemptionHistory,
        pointHistory,
        redeemReward,
        selectedTxDigest,
        setSelectedTxDigest,
        signInModalOpen,
        setSignInModalOpen,
        redeemModalReward,
        setRedeemModalReward,
        selectedVoucher,
        setSelectedVoucher,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
