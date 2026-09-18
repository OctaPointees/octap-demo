import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  adminService,
  type AuditFilters,
  type CreateTenantInput,
  type ReviewDecision,
} from "../services/admin.service";
import type { Range, RewardStatus, Tenant } from "../types/domain";

export const adminKeys = {
  all: ["admin"] as const,
  overview: (r: Range) => ["admin", "overview", r] as const,
  metrics: (r: Range) => ["admin", "metrics", r] as const,
  tenants: () => ["admin", "tenants"] as const,
  tenant: (id: string) => ["admin", "tenants", id] as const,
  rewards: (s: string) => ["admin", "rewards", s] as const,
  audit: (f: AuditFilters) => ["admin", "audit", f] as const,
  search: (q: string) => ["admin", "search", q] as const,
};

export const useAdminOverview = (range: Range) =>
  useQuery({ queryKey: adminKeys.overview(range), queryFn: () => adminService.getOverview(range), placeholderData: keepPreviousData });

export const useAdminMetrics = (range: Range) =>
  useQuery({ queryKey: adminKeys.metrics(range), queryFn: () => adminService.getMetrics(range), placeholderData: keepPreviousData });

export const useTenants = () => useQuery({ queryKey: adminKeys.tenants(), queryFn: adminService.listTenants });

export const useTenant = (id: string) => useQuery({ queryKey: adminKeys.tenant(id), queryFn: () => adminService.getTenant(id) });

export const useAdminRewards = (status: RewardStatus | "all") =>
  useQuery({ queryKey: adminKeys.rewards(status), queryFn: () => adminService.listRewards(status), placeholderData: keepPreviousData });

export const useAudit = (filters: AuditFilters) =>
  useQuery({ queryKey: adminKeys.audit(filters), queryFn: () => adminService.listAudit(filters), placeholderData: keepPreviousData });

export const useAdminSearch = (q: string) =>
  useQuery({ queryKey: adminKeys.search(q), queryFn: () => adminService.search(q), enabled: q.trim().length >= 2, staleTime: 5_000 });

export const useCreateTenant = () => useMutation({ mutationFn: (input: CreateTenantInput) => adminService.createTenant(input) });

export const useUpdateTenant = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof adminService.updateTenant>[1] }) => adminService.updateTenant(id, patch),
  });

export const useProvisionTenant = () => useMutation({ mutationFn: (id: string) => adminService.completeProvisioning(id) });

export const useSetTenantStatus = () =>
  useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: Extract<Tenant["status"], "active" | "suspended">; reason: string }) =>
      adminService.setTenantStatus(id, status, reason),
  });

export const useReviewReward = () =>
  useMutation({ mutationFn: ({ id, input }: { id: string; input: ReviewDecision }) => adminService.reviewReward(id, input) });

export const useVerifyAudit = () => useMutation({ mutationFn: (id: string) => adminService.verifyOnChain(id) });
