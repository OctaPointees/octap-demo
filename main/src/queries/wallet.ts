import { useMutation, useQuery } from "@tanstack/react-query";
import { walletService } from "../services/wallet.service";

export const walletKeys = {
  wallet: ["wallet"] as const,
  rewards: (t: string) => ["wallet", "rewards", t] as const,
  history: (t: string) => ["wallet", "history", t] as const,
  vouchers: ["wallet", "vouchers"] as const,
};

export const useWallet = (enabled: boolean) => useQuery({ queryKey: walletKeys.wallet, queryFn: walletService.getWallet, enabled });
export const useWalletRewards = (tenantId: string | null) =>
  useQuery({ queryKey: walletKeys.rewards(tenantId ?? ""), queryFn: () => walletService.listRewards(tenantId!), enabled: !!tenantId });
export const useWalletHistory = (tenantId: string | null) =>
  useQuery({ queryKey: walletKeys.history(tenantId ?? ""), queryFn: () => walletService.history(tenantId!), enabled: !!tenantId });
export const useMyVouchers = (enabled: boolean) => useQuery({ queryKey: walletKeys.vouchers, queryFn: walletService.vouchers, enabled });

export const useRequestOtp = () => useMutation({ mutationFn: (phone: string) => walletService.requestOtp(phone) });
export const useVerifyOtp = () =>
  useMutation({ mutationFn: ({ phone, code, name }: { phone: string; code: string; name?: string }) => walletService.verifyOtp(phone, code, name) });
export const useJoinMerchant = () => useMutation({ mutationFn: (tenantId: string) => walletService.join(tenantId) });
export const useCheckout = () =>
  useMutation({ mutationFn: ({ tenantId, amountVnd }: { tenantId: string; amountVnd: number }) => walletService.checkout(tenantId, amountVnd) });
export const useRedeem = () => useMutation({ mutationFn: (rewardId: string) => walletService.redeem(rewardId) });
