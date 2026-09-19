export type Language = 'vi' | 'en';

export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthdate: string;
  tier: TierKey;
  balance: number;
  expiringPoints: number;
  expiringDateText: { vi: string; en: string };
  nextTierPointsNeeded: number;
  nextTierName: string;
  nextTierMax: number;
  earned12m: number;
  earned12mGrowthPct: number;
  zkLoginProvider: string;
  suiAddress: string;
}

export interface RewardItem {
  id: string;
  titleVi: string;
  titleEn: string;
  provider: string;
  badgeVi: string;
  badgeEn: string;
  badgeTheme: 'lotus' | 'cinema' | 'cafe' | 'gold';
  pointCost: number;
  stock: number;
  category: 'all' | 'lotus' | 'octap';
  descriptionVi: string;
  descriptionEn: string;
  minTier?: TierKey;
}

export interface VoucherItem {
  id: string;
  code: string;
  titleVi: string;
  titleEn: string;
  provider: string;
  expiryVi: string;
  expiryEn: string;
  status: 'ready' | 'expiring' | 'used';
  suiTxDigest?: string;
}

export interface RedemptionHistoryItem {
  id: string;
  timeVi: string;
  timeEn: string;
  rewardVi: string;
  rewardEn: string;
  provider: string;
  pointsDeducted: number;
  statusVi: string;
  statusEn: string;
  statusType: 'issued' | 'used';
  suiTxDigest: string;
}

export interface PointHistoryItem {
  id: string;
  type: 'bill' | 'bonus' | 'redeem' | 'adjust';
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  points: number;
  suiTxDigest: string;
  dateKey: string;
}

export interface FaqItem {
  id: string;
  qVi: string;
  qEn: string;
  aVi: string;
  aEn: string;
}

export interface BrandColorOption {
  name: string;
  hex: string;
  slug: string;
}
