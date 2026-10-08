export type Language = 'en' | 'vi';

export interface SuiDigestDetail {
  digest: string;
  checkpoint: number;
  epoch: number;
  timestamp: string;
  sender: string;
  packageId: string;
  module: string;
  action: 'mint_isolated_points' | 'burn_for_voucher' | 'register_tenant' | 'sponsor_gas';
  merchant: string;
  tokenSymbol: string;
  amount: number;
  sponsoredGasSui: number;
  gasPayer: string;
  status: 'SUCCESS' | 'FINALIZED';
}

export interface PartnerBrand {
  id: string;
  name: string;
  symbol: string;
  category: string;
  categoryVi: string;
  color: string;
  stores: number;
  activeMembers: string;
  pointsRate: string;
  pointsRateVi: string;
  description: string;
  descriptionVi: string;
  moveModule: string;
}
