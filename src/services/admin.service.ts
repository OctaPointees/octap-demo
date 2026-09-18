import type {
  AuditEvent,
  AuditSeverity,
  McpTool,
  Range,
  Reward,
  RewardStatus,
  Tenant,
  TenantPlan,
  TenantStatus,
  TxChannel,
} from "../types/domain";
import { kpis, RANGE_DAYS, series, totalsByTenant } from "./core/analytics";
import { writeAudit } from "./core/ledger";
import { toPublicStaff } from "./core/staff";
import { getDb } from "./mock/db";
import { badRequest, conflict, notFound, simulate } from "./mock/http";
import { live, suiObjectId, txDigest } from "./mock/random";
import { ALL_MCP_TOOLS, slugify } from "./mock/seed";
import { requireSession } from "./session";

export type TenantRow = Tenant & {
  memberCount: number;
  activeCampaigns: number;
  pointsIssued30d: number;
  revenue30d: number;
  mtdMinted: number;
};

export type CreateTenantInput = {
  name: string;
  industry: string;
  plan: TenantPlan;
  contactEmail: string;
  contactPhone: string;
  pointSymbol: string;
  pointName: string;
  earnRate: number;
  ownerEmail: string;
};

export type AuditFilters = {
  q?: string;
  severity?: AuditSeverity | "all";
  actorType?: AuditEvent["actorType"] | "all";
  tenantId?: string | "all";
  onChainOnly?: boolean;
};

export type ReviewDecision = { decision: "approve" | "reject"; note?: string };

const adminName = () => requireSession("admin").user.displayName;

function tenantRow(t: Tenant): TenantRow {
  const db = getDb();
  const totals = totalsByTenant("30d").get(t.id);
  const monthPrefix = new Date().toISOString().slice(0, 7);
  return {
    ...t,
    memberCount: db.memberships.filter((m) => m.tenantId === t.id).length,
    activeCampaigns: db.campaigns.filter((c) => c.tenantId === t.id && c.status === "active").length,
    pointsIssued30d: totals?.earned ?? 0,
    revenue30d: totals?.revenueVnd ?? 0,
    mtdMinted: db.stats
      .filter((s) => s.tenantId === t.id && s.date.startsWith(monthPrefix))
      .reduce((acc, s) => acc + s.earned, 0),
  };
}

function validateTenant(input: CreateTenantInput, exceptId?: string) {
  const db = getDb();
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!input.industry.trim()) errors.industry = "Industry is required";
  if (!/^\S+@\S+\.\S+$/.test(input.contactEmail)) errors.contactEmail = "Enter a valid email";
  if (!/^[A-Z]{3,5}$/.test(input.pointSymbol)) errors.pointSymbol = "3–5 uppercase letters";
  if (!input.pointName.trim()) errors.pointName = "Point name is required";
  if (!(input.earnRate > 0 && input.earnRate <= 100)) errors.earnRate = "Between 1 and 100";
  if (!exceptId && !/^\S+@\S+\.\S+$/.test(input.ownerEmail)) errors.ownerEmail = "Enter a valid email";
  if (db.tenants.some((t) => t.id !== exceptId && t.pointSymbol === input.pointSymbol)) {
    errors.pointSymbol = "Symbol already used by another tenant";
  }
  if (db.tenants.some((t) => t.id !== exceptId && t.slug === slugify(input.name))) {
    errors.name = "A tenant with this name already exists";
  }
  if (!exceptId && db.staff.some((s) => s.email === input.ownerEmail.toLowerCase())) {
    errors.ownerEmail = "This email already has an OctaP account";
  }
  if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);
}

export const adminService = {
  getOverview(range: Range) {
    return simulate(`GET /v1/admin/overview?range=${range}`, () => {
      requireSession("admin");
      const db = getDb();
      const totals = totalsByTenant(range);
      const topTenants = db.tenants
        .map((t) => ({ tenant: t, ...(totals.get(t.id) ?? { earned: 0, revenueVnd: 0, txCount: 0 }) }))
        .sort((a, b) => b.earned - a.earned)
        .slice(0, 6)
        .map((r) => ({ id: r.tenant.id, name: r.tenant.name, color: r.tenant.brandColor, symbol: r.tenant.pointSymbol, earned: r.earned, revenueVnd: r.revenueVnd, txCount: r.txCount }));
      return {
        kpis: kpis(range),
        series: series(range),
        tenantsByStatus: {
          active: db.tenants.filter((t) => t.status === "active").length,
          provisioning: db.tenants.filter((t) => t.status === "provisioning").length,
          suspended: db.tenants.filter((t) => t.status === "suspended").length,
        },
        totalMembers: db.memberships.length,
        topTenants,
        pendingRewards: db.rewards.filter((r) => r.status === "pending_review").length,
        alerts: db.audit.filter((a) => a.severity !== "info").slice(0, 6),
        sponsorWallet: { balanceMist: 1_284_500_000_000, dailyBurnMist: series("7d").reduce((s, p) => s + p.gasMist, 0) / 7 },
      };
    });
  },

  getMetrics(range: Range) {
    return simulate(`GET /v1/admin/metrics?range=${range}`, () => {
      requireSession("admin");
      const db = getDb();
      const since = Date.now() - RANGE_DAYS[range] * 86_400_000;
      const channelCounts: Record<TxChannel, number> = { pos: 0, sdk: 0, mcp: 0, dashboard: 0, wallet: 0 };
      let failed = 0;
      let recent = 0;
      for (const tx of db.ledger) {
        if (new Date(tx.createdAt).getTime() < since) continue;
        recent++;
        channelCounts[tx.channel]++;
        if (tx.status === "failed") failed++;
      }
      const totals = totalsByTenant(range);
      return {
        series: series(range),
        kpis: kpis(range),
        channels: channelCounts,
        failureRate: recent ? failed / recent : 0,
        byTenant: db.tenants
          .filter((t) => totals.has(t.id))
          .map((t) => ({ id: t.id, name: t.name, symbol: t.pointSymbol, color: t.brandColor, ...totals.get(t.id)! })),
        health: [
          { name: "REST API", status: "operational", latencyP95: live.int(80, 140), uptime: 0.9998 },
          { name: "MCP server", status: "operational", latencyP95: live.int(150, 260), uptime: 0.9991 },
          { name: "Enoki sponsor", status: live.chance(0.3) ? "degraded" : "operational", latencyP95: live.int(400, 900), uptime: 0.9972 },
          { name: "Sui fullnode (mainnet)", status: "operational", latencyP95: live.int(220, 420), uptime: 0.9995 },
          { name: "Indexer", status: "operational", latencyP95: live.int(40, 90), uptime: 0.9999 },
        ] as { name: string; status: "operational" | "degraded" | "down"; latencyP95: number; uptime: number }[],
        chain: { epoch: 612, checkpoint: db.checkpoint, tps: live.int(38, 64), referenceGasPrice: 750 },
      };
    });
  },

  listTenants() {
    return simulate("GET /v1/admin/tenants", () => {
      requireSession("admin");
      return getDb().tenants.map(tenantRow);
    });
  },

  getTenant(id: string) {
    return simulate(`GET /v1/admin/tenants/${id}`, () => {
      requireSession("admin");
      const db = getDb();
      const tenant = db.tenants.find((t) => t.id === id);
      if (!tenant) throw notFound("Tenant");
      return {
        tenant: tenantRow(tenant),
        series: series("30d", id),
        kpis: kpis("30d", id),
        campaigns: db.campaigns.filter((c) => c.tenantId === id),
        rewards: db.rewards.filter((r) => r.tenantId === id),
        staff: db.staff.filter((s) => s.tenantId === id).map(toPublicStaff),
        apiKeys: db.apiKeys.filter((k) => k.tenantId === id),
        audit: db.audit.filter((a) => a.tenantId === id).slice(0, 25),
      };
    });
  },

  createTenant(input: CreateTenantInput) {
    return simulate(
      "POST /v1/admin/tenants",
      () => {
        const actor = adminName();
        validateTenant(input);
        const db = getDb();
        const slug = slugify(input.name);
        const tenant: Tenant = {
          id: `tnt_${Math.random().toString(16).slice(2, 12)}`,
          name: input.name.trim(),
          slug,
          industry: input.industry.trim(),
          status: "provisioning",
          plan: input.plan,
          contactEmail: input.contactEmail.trim(),
          contactPhone: input.contactPhone.trim(),
          pointSymbol: input.pointSymbol,
          pointName: input.pointName.trim(),
          earnRate: input.earnRate,
          monthlyMintCap: input.plan === "enterprise" ? 5_000_000 : input.plan === "growth" ? 1_500_000 : 400_000,
          treasuryObjectId: suiObjectId(),
          packageId: suiObjectId(),
          brandColor: "#9f0261",
          createdAt: new Date().toISOString(),
          mcp: {
            enabled: false,
            tools: Object.fromEntries(ALL_MCP_TOOLS.map((t) => [t, false])) as Record<McpTool, boolean>,
          },
        };
        db.tenants.push(tenant);
        db.staff.push({
          id: `usr_${Math.random().toString(16).slice(2, 12)}`,
          email: input.ownerEmail.toLowerCase(),
          password: "octap123",
          displayName: input.ownerEmail.split("@")[0],
          avatarUrl: "https://picsum.photos/id/100/200/200",
          role: "merchant",
          tenantId: tenant.id,
          merchantRole: "owner",
          status: "invited",
          createdAt: tenant.createdAt,
        });
        writeAudit({
          actorType: "admin",
          actorName: actor,
          action: "tenant.create",
          tenantId: tenant.id,
          severity: "info",
          summary: `Created tenant ${tenant.name} (${tenant.pointSymbol}); owner invite sent to ${input.ownerEmail}`,
          onChain: false,
        });
        return tenant;
      },
      input,
    );
  },

  updateTenant(id: string, patch: Partial<Pick<Tenant, "plan" | "monthlyMintCap" | "earnRate" | "contactEmail" | "contactPhone">>) {
    return simulate(
      `PATCH /v1/admin/tenants/${id}`,
      () => {
        const actor = adminName();
        const tenant = getDb().tenants.find((t) => t.id === id);
        if (!tenant) throw notFound("Tenant");
        if (patch.monthlyMintCap !== undefined && patch.monthlyMintCap < 10_000) {
          throw badRequest("Mint cap too low", { monthlyMintCap: "Minimum is 10,000 points" });
        }
        Object.assign(tenant, patch);
        writeAudit({
          actorType: "admin",
          actorName: actor,
          action: "tenant.update",
          tenantId: id,
          severity: patch.monthlyMintCap !== undefined ? "warning" : "info",
          summary: `Updated ${Object.keys(patch).join(", ")}`,
          onChain: false,
        });
        return tenant;
      },
      patch,
    );
  },

  /** Publishes the tenant's Move package + treasury on Sui and activates it. */
  completeProvisioning(id: string) {
    return simulate(`POST /v1/admin/tenants/${id}/provision`, () => {
      const actor = adminName();
      const tenant = getDb().tenants.find((t) => t.id === id);
      if (!tenant) throw notFound("Tenant");
      if (tenant.status !== "provisioning") throw conflict("Tenant is already provisioned.");
      tenant.status = "active";
      const digest = txDigest();
      writeAudit({
        actorType: "admin",
        actorName: actor,
        action: "tenant.provision",
        tenantId: id,
        severity: "info",
        summary: `Published loyalty package and treasury for ${tenant.name}`,
        txDigest: digest,
        onChain: true,
      });
      return { tenant, txDigest: digest, packageId: tenant.packageId, treasuryObjectId: tenant.treasuryObjectId };
    });
  },

  setTenantStatus(id: string, status: Extract<TenantStatus, "active" | "suspended">, reason: string) {
    return simulate(
      `POST /v1/admin/tenants/${id}/${status === "suspended" ? "suspend" : "reinstate"}`,
      () => {
        const actor = adminName();
        const tenant = getDb().tenants.find((t) => t.id === id);
        if (!tenant) throw notFound("Tenant");
        if (status === "suspended" && reason.trim().length < 10) {
          throw badRequest("Please describe the reason", { reason: "At least 10 characters — this is recorded on-chain" });
        }
        tenant.status = status;
        const digest = txDigest();
        writeAudit({
          actorType: "admin",
          actorName: actor,
          action: status === "suspended" ? "tenant.suspend" : "tenant.reinstate",
          tenantId: id,
          severity: "critical",
          summary: status === "suspended" ? `Suspended ${tenant.name}: ${reason}` : `Reinstated ${tenant.name}`,
          txDigest: digest,
          onChain: true,
        });
        return tenant;
      },
      { status, reason },
    );
  },

  listRewards(status: RewardStatus | "all") {
    return simulate(`GET /v1/admin/rewards?status=${status}`, () => {
      requireSession("admin");
      const db = getDb();
      return db.rewards
        .filter((r) => status === "all" || r.status === status)
        .map((r) => {
          const t = db.tenants.find((x) => x.id === r.tenantId)!;
          return { ...r, tenantName: t.name, pointSymbol: t.pointSymbol };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  },

  reviewReward(id: string, input: ReviewDecision) {
    return simulate(
      `POST /v1/admin/rewards/${id}/review`,
      (): Reward => {
        const actor = adminName();
        const reward = getDb().rewards.find((r) => r.id === id);
        if (!reward) throw notFound("Reward");
        if (reward.status !== "pending_review") throw conflict("This reward has already been reviewed.");
        if (input.decision === "reject" && !input.note?.trim()) {
          throw badRequest("A note is required when rejecting", { note: "Tell the merchant what to change" });
        }
        reward.status = input.decision === "approve" ? "active" : "rejected";
        reward.reviewNote = input.note?.trim() || undefined;
        writeAudit({
          actorType: "admin",
          actorName: actor,
          action: input.decision === "approve" ? "reward.approve" : "reward.reject",
          tenantId: reward.tenantId,
          severity: "info",
          summary: `${input.decision === "approve" ? "Approved" : "Rejected"} reward "${reward.title}"`,
          onChain: false,
        });
        return reward;
      },
      input,
    );
  },

  listAudit(filters: AuditFilters) {
    return simulate(`GET /v1/admin/audit?${new URLSearchParams(filters as Record<string, string>)}`, () => {
      requireSession("admin");
      const db = getDb();
      const q = filters.q?.toLowerCase().trim();
      return db.audit
        .filter((a) => !filters.severity || filters.severity === "all" || a.severity === filters.severity)
        .filter((a) => !filters.actorType || filters.actorType === "all" || a.actorType === filters.actorType)
        .filter((a) => !filters.tenantId || filters.tenantId === "all" || a.tenantId === filters.tenantId)
        .filter((a) => !filters.onChainOnly || a.onChain)
        .filter(
          (a) =>
            !q ||
            a.summary.toLowerCase().includes(q) ||
            a.action.includes(q) ||
            a.actorName.toLowerCase().includes(q) ||
            a.txDigest?.toLowerCase().includes(q),
        )
        .map((a) => ({ ...a, tenantName: db.tenants.find((t) => t.id === a.tenantId)?.name }));
    });
  },

  /** Re-fetches the transaction from a Sui fullnode and checks the event hash. */
  verifyOnChain(auditId: string) {
    return simulate(`POST /v1/admin/audit/${auditId}/verify`, () => {
      requireSession("admin");
      const db = getDb();
      const event = db.audit.find((a) => a.id === auditId);
      if (!event) throw notFound("Audit event");
      if (!event.txDigest) throw conflict("This event is off-chain and cannot be verified against Sui.");
      return {
        digest: event.txDigest,
        verified: true,
        checkpoint: db.checkpoint - live.int(100, 50_000),
        epoch: 612 - live.int(0, 20),
        sender: suiObjectId(),
        sponsor: "0x0c7a…enoki",
        eventType: `${db.tenants.find((t) => t.id === event.tenantId)?.packageId.slice(0, 10) ?? "0xoctap"}::loyalty::${event.action.replace(".", "_")}`,
        signatures: 2,
        verifiedAt: new Date().toISOString(),
      };
    });
  },

  search(q: string) {
    return simulate(`GET /v1/admin/search?q=${encodeURIComponent(q)}`, () => {
      requireSession("admin");
      const db = getDb();
      const needle = q.toLowerCase().trim();
      if (!needle) return [];
      const results: { type: "tenant" | "reward" | "audit"; id: string; title: string; subtitle: string; to: string }[] = [];
      db.tenants
        .filter((t) => t.name.toLowerCase().includes(needle) || t.pointSymbol.toLowerCase().includes(needle))
        .forEach((t) => results.push({ type: "tenant", id: t.id, title: t.name, subtitle: `${t.pointSymbol} · ${t.industry}`, to: `/admin/partners/${t.id}` }));
      db.rewards
        .filter((r) => r.title.toLowerCase().includes(needle))
        .slice(0, 5)
        .forEach((r) =>
          results.push({ type: "reward", id: r.id, title: r.title, subtitle: db.tenants.find((t) => t.id === r.tenantId)?.name ?? "", to: `/admin/vouchers?focus=${r.id}` }),
        );
      db.audit
        .filter((a) => a.txDigest?.toLowerCase().startsWith(needle) || a.action.includes(needle))
        .slice(0, 5)
        .forEach((a) => results.push({ type: "audit", id: a.id, title: a.action, subtitle: a.summary, to: `/admin/audit?q=${encodeURIComponent(a.txDigest ?? a.action)}` }));
      return results.slice(0, 12);
    });
  },
};
