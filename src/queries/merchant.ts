import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  merchantService,
  type CampaignInput,
  type IssuePointsInput,
  type RewardInput,
  type TxFilters,
} from "../services/merchant.service";
import type { ApiKey, ApiScope, McpTool, MerchantRole, Range } from "../types/domain";

export const merchantKeys = {
  tenant: ["merchant", "tenant"] as const,
  overview: (r: Range) => ["merchant", "overview", r] as const,
  campaigns: ["merchant", "campaigns"] as const,
  rewards: ["merchant", "rewards"] as const,
  members: (q: string) => ["merchant", "members", q] as const,
  member: (id: string) => ["merchant", "member", id] as const,
  txs: (f: TxFilters) => ["merchant", "transactions", f] as const,
  quote: (amount: number) => ["merchant", "quote", amount] as const,
  apiKeys: ["merchant", "api-keys"] as const,
  team: ["merchant", "team"] as const,
};

export const useMerchantTenant = () => useQuery({ queryKey: merchantKeys.tenant, queryFn: merchantService.getTenant });
export const useMerchantOverview = (range: Range) =>
  useQuery({ queryKey: merchantKeys.overview(range), queryFn: () => merchantService.getOverview(range), placeholderData: keepPreviousData });
export const useCampaigns = () => useQuery({ queryKey: merchantKeys.campaigns, queryFn: merchantService.listCampaigns });
export const useRewards = () => useQuery({ queryKey: merchantKeys.rewards, queryFn: merchantService.listRewards });
export const useMembers = (q: string, enabled = true) =>
  useQuery({ queryKey: merchantKeys.members(q), queryFn: () => merchantService.listMembers(q), placeholderData: keepPreviousData, enabled });
export const useMember = (id: string | null) =>
  useQuery({ queryKey: merchantKeys.member(id ?? ""), queryFn: () => merchantService.getMember(id!), enabled: !!id });
export const useTransactions = (f: TxFilters) =>
  useQuery({ queryKey: merchantKeys.txs(f), queryFn: () => merchantService.listTransactions(f), placeholderData: keepPreviousData });
export const useEarnQuote = (amount: number) =>
  useQuery({ queryKey: merchantKeys.quote(amount), queryFn: () => merchantService.quote(amount), enabled: amount >= 10_000, placeholderData: keepPreviousData });
export const useApiKeys = (enabled = true) => useQuery({ queryKey: merchantKeys.apiKeys, queryFn: merchantService.listApiKeys, enabled });
export const useTeam = () => useQuery({ queryKey: merchantKeys.team, queryFn: merchantService.listTeam });

export const useUpdateMerchantTenant = () => useMutation({ mutationFn: merchantService.updateTenant });

export const useSaveCampaign = () =>
  useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CampaignInput }) =>
      id ? merchantService.updateCampaign(id, input) : merchantService.createCampaign(input),
  });
export const useSetCampaignStatus = () =>
  useMutation({ mutationFn: ({ id, status }: { id: string; status: "active" | "paused" | "ended" }) => merchantService.setCampaignStatus(id, status) });
export const useDeleteCampaign = () => useMutation({ mutationFn: (id: string) => merchantService.deleteCampaign(id) });

export const useCreateReward = () => useMutation({ mutationFn: (input: RewardInput) => merchantService.createReward(input) });
export const useSetRewardStatus = () =>
  useMutation({ mutationFn: ({ id, status }: { id: string; status: "active" | "paused" }) => merchantService.setRewardStatus(id, status) });
export const useRestockReward = () => useMutation({ mutationFn: ({ id, add }: { id: string; add: number }) => merchantService.restockReward(id, add) });

export const useAdjustPoints = () =>
  useMutation({ mutationFn: ({ id, points, reason }: { id: string; points: number; reason: string }) => merchantService.adjustMemberPoints(id, points, reason) });
export const useIssuePoints = () => useMutation({ mutationFn: (input: IssuePointsInput) => merchantService.issuePoints(input) });

export const useCreateApiKey = () =>
  useMutation({ mutationFn: (input: { name: string; env: ApiKey["env"]; scopes: ApiScope[] }) => merchantService.createApiKey(input) });
export const useRevokeApiKey = () => useMutation({ mutationFn: (id: string) => merchantService.revokeApiKey(id) });
export const useUpdateMcp = () =>
  useMutation({ mutationFn: (patch: { enabled?: boolean; tool?: McpTool; toolEnabled?: boolean }) => merchantService.updateMcp(patch) });

export const useInviteTeammate = () => useMutation({ mutationFn: (input: { email: string; role: MerchantRole }) => merchantService.inviteTeammate(input) });
export const useUpdateTeammate = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { merchantRole?: MerchantRole; status?: "active" | "disabled" } }) => merchantService.updateTeammate(id, patch),
  });
