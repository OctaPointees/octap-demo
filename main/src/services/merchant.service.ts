import type {
  ApiKey,
  ApiScope,
  Campaign,
  CampaignStatus,
  CampaignType,
  LedgerTx,
  McpTool,
  Member,
  Membership,
  MerchantRole,
  Range,
  Reward,
  Tenant,
  TxChannel,
  TxKind,
} from "../types/domain";
import { kpis, series } from "./core/analytics";
import {
  adjustPoints,
  earnPoints,
  findOrCreateEndUser,
  findOrCreateMembership,
  isCampaignLive,
  monthToDateMinted,
  quoteEarn,
  writeAudit,
} from "./core/ledger";
import { toPublicStaff } from "./core/staff";
import { getDb } from "./mock/db";
import { badRequest, conflict, forbidden, notFound, simulate } from "./mock/http";
import { hex, live, uid } from "./mock/random";
import { requireMerchant, sessionStore } from "./session";

export type CampaignInput = {
  name: string;
  description: string;
  type: CampaignType;
  multiplier?: number;
  minSpendVnd?: number;
  bonusPoints?: number;
  budgetPoints: number;
  pointCostVnd: number;
  startAt: string;
  endAt: string;
  publish: boolean;
};

export type RewardInput = {
  title: string;
  description: string;
  category: Reward["category"];
  pointCost: number;
  faceValueVnd: number;
  stock: number;
  expiresAt: string;
};

export type TxFilters = {
  kind?: TxKind | "all";
  channel?: TxChannel | "all";
  q?: string;
};

export type IssuePointsInput = { phone: string; amountVnd: number; channel: TxChannel };

const actorEmail = () => sessionStore.get()?.user.email ?? "unknown";

function tenantOf(id: string) {
  const t = getDb().tenants.find((x) => x.id === id);
  if (!t) throw notFound("Tenant");
  return t;
}

function toMember(m: Membership): Member {
  const u = getDb().endUsers.find((x) => x.id === m.userId)!;
  return { ...m, displayName: u.displayName, phone: u.phone, suiAddress: u.suiAddress };
}

function maskPhone(phone: string) {
  return phone.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, "$1 $2 •••• $3");
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^0\d{9}$/.test(digits)) return `+84${digits.slice(1)}`;
  if (/^\+84\d{9}$/.test(digits)) return digits;
  return null;
}

export { maskPhone, normalizePhone };

function validateCampaign(input: CampaignInput) {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 3) errors.name = "At least 3 characters";
  if (input.type === "multiplier" && !(input.multiplier && input.multiplier > 1 && input.multiplier <= 10)) {
    errors.multiplier = "Between 1.1× and 10×";
  }
  if (input.type === "spend_threshold" && !(input.minSpendVnd && input.minSpendVnd >= 10_000)) {
    errors.minSpendVnd = "At least 10,000 ₫";
  }
  if (input.type !== "multiplier" && !(input.bonusPoints && input.bonusPoints > 0)) {
    errors.bonusPoints = "Must be greater than 0";
  }
  if (!(input.budgetPoints >= 1_000)) errors.budgetPoints = "Minimum budget is 1,000 points";
  if (!(input.pointCostVnd > 0)) errors.pointCostVnd = "Must be greater than 0";
  if (!input.startAt) errors.startAt = "Required";
  if (!input.endAt) errors.endAt = "Required";
  else if (input.startAt && input.endAt <= input.startAt) errors.endAt = "Must be after the start date";
  if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);
}

function statusFor(input: CampaignInput): CampaignStatus {
  if (!input.publish) return "draft";
  return new Date(input.startAt).getTime() > Date.now() ? "scheduled" : "active";
}

export const merchantService = {
  getTenant() {
    return simulate("GET /v1/merchant/tenant", () => {
      const tenantId = requireMerchant();
      const t = tenantOf(tenantId);
      return { ...t, mtdMinted: monthToDateMinted(t.id) };
    });
  },

  updateTenant(patch: Partial<Pick<Tenant, "pointName" | "earnRate" | "contactEmail" | "contactPhone" | "brandColor">>) {
    return simulate(
      "PATCH /v1/merchant/tenant",
      () => {
        const tenantId = requireMerchant("owner");
        const t = tenantOf(tenantId);
        const errors: Record<string, string> = {};
        if (patch.pointName !== undefined && !patch.pointName.trim()) errors.pointName = "Required";
        if (patch.earnRate !== undefined && !(patch.earnRate > 0 && patch.earnRate <= 100)) errors.earnRate = "Between 1 and 100";
        if (patch.contactEmail !== undefined && !/^\S+@\S+\.\S+$/.test(patch.contactEmail)) errors.contactEmail = "Enter a valid email";
        if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);
        Object.assign(t, patch);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "tenant.update", tenantId, severity: patch.earnRate ? "warning" : "info", summary: `Updated program settings: ${Object.keys(patch).join(", ")}`, onChain: false });
        return t;
      },
      patch,
    );
  },

  getOverview(range: Range) {
    return simulate(`GET /v1/merchant/overview?range=${range}`, () => {
      const tenantId = requireMerchant();
      const db = getDb();
      const tenant = tenantOf(tenantId);
      const campaigns = db.campaigns.filter((c) => c.tenantId === tenantId);
      const members = db.memberships.filter((m) => m.tenantId === tenantId);
      const outstanding = members.reduce((s, m) => s + m.balance, 0);
      const tiers = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
      members.forEach((m) => tiers[m.tier]++);
      return {
        tenant,
        kpis: kpis(range, tenantId),
        series: series(range, tenantId),
        outstandingPoints: outstanding,
        liabilityVnd: outstanding * 100,
        memberCount: members.length,
        tiers,
        mtdMinted: monthToDateMinted(tenantId),
        liveCampaigns: campaigns
          .filter((c) => c.status === "active")
          .map((c) => ({ ...c, roi: c.issuedPoints ? (c.revenueAttributedVnd - c.issuedPoints * c.pointCostVnd) / (c.issuedPoints * c.pointCostVnd) : 0 })),
        recentTx: db.ledger
          .filter((tx) => tx.tenantId === tenantId)
          .slice(0, 8)
          .map((tx) => ({ ...tx, member: toMember(db.memberships.find((m) => m.id === tx.membershipId)!).displayName })),
      };
    });
  },

  /* ---------------------------------------------------------------- campaigns */

  listCampaigns() {
    return simulate("GET /v1/merchant/campaigns", () => {
      const tenantId = requireMerchant();
      return getDb()
        .campaigns.filter((c) => c.tenantId === tenantId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((c) => ({
          ...c,
          isLive: isCampaignLive(c),
          roi: c.issuedPoints ? (c.revenueAttributedVnd - c.issuedPoints * c.pointCostVnd) / (c.issuedPoints * c.pointCostVnd) : 0,
        }));
    });
  },

  createCampaign(input: CampaignInput) {
    return simulate(
      "POST /v1/merchant/campaigns",
      (): Campaign => {
        const tenantId = requireMerchant("manager");
        validateCampaign(input);
        const c: Campaign = {
          id: uid("cmp"),
          tenantId,
          name: input.name.trim(),
          description: input.description.trim(),
          type: input.type,
          status: statusFor(input),
          multiplier: input.type === "multiplier" ? input.multiplier : undefined,
          minSpendVnd: input.type === "spend_threshold" ? input.minSpendVnd : undefined,
          bonusPoints: input.type !== "multiplier" ? input.bonusPoints : undefined,
          budgetPoints: input.budgetPoints,
          issuedPoints: 0,
          pointCostVnd: input.pointCostVnd,
          revenueAttributedVnd: 0,
          participants: 0,
          startAt: new Date(input.startAt).toISOString(),
          endAt: new Date(input.endAt).toISOString(),
          createdAt: new Date().toISOString(),
        };
        getDb().campaigns.push(c);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "campaign.create", tenantId, severity: "info", summary: `Created campaign "${c.name}" (${c.status})`, onChain: false });
        return c;
      },
      input,
    );
  },

  updateCampaign(id: string, input: CampaignInput) {
    return simulate(
      `PUT /v1/merchant/campaigns/${id}`,
      () => {
        const tenantId = requireMerchant("manager");
        const c = getDb().campaigns.find((x) => x.id === id && x.tenantId === tenantId);
        if (!c) throw notFound("Campaign");
        if (c.status === "ended") throw conflict("Ended campaigns cannot be edited.");
        validateCampaign(input);
        if (input.budgetPoints < c.issuedPoints) {
          throw badRequest("Budget below issued points", { budgetPoints: `Already issued ${c.issuedPoints.toLocaleString()} points` });
        }
        Object.assign(c, {
          name: input.name.trim(),
          description: input.description.trim(),
          type: input.type,
          multiplier: input.multiplier,
          minSpendVnd: input.minSpendVnd,
          bonusPoints: input.bonusPoints,
          budgetPoints: input.budgetPoints,
          pointCostVnd: input.pointCostVnd,
          startAt: new Date(input.startAt).toISOString(),
          endAt: new Date(input.endAt).toISOString(),
          status: c.status === "draft" ? statusFor(input) : c.status,
        });
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "campaign.update", tenantId, severity: "info", summary: `Updated campaign "${c.name}"`, onChain: false });
        return c;
      },
      input,
    );
  },

  setCampaignStatus(id: string, status: "active" | "paused" | "ended") {
    return simulate(
      `POST /v1/merchant/campaigns/${id}/status`,
      () => {
        const tenantId = requireMerchant("manager");
        const c = getDb().campaigns.find((x) => x.id === id && x.tenantId === tenantId);
        if (!c) throw notFound("Campaign");
        if (c.status === "ended") throw conflict("This campaign has already ended.");
        c.status = status;
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: `campaign.${status === "active" ? "resume" : status === "paused" ? "pause" : "end"}`, tenantId, severity: status === "active" ? "info" : "warning", summary: `Set campaign "${c.name}" to ${status}`, onChain: false });
        return c;
      },
      { status },
    );
  },

  deleteCampaign(id: string) {
    return simulate(`DELETE /v1/merchant/campaigns/${id}`, () => {
      const tenantId = requireMerchant("manager");
      const db = getDb();
      const idx = db.campaigns.findIndex((x) => x.id === id && x.tenantId === tenantId);
      if (idx < 0) throw notFound("Campaign");
      if (db.campaigns[idx].status !== "draft") throw conflict("Only drafts can be deleted. End the campaign instead.");
      db.campaigns.splice(idx, 1);
      return { id };
    });
  },

  /* ------------------------------------------------------------------ rewards */

  listRewards() {
    return simulate("GET /v1/merchant/rewards", () => {
      const tenantId = requireMerchant();
      return getDb()
        .rewards.filter((r) => r.tenantId === tenantId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  },

  createReward(input: RewardInput) {
    return simulate(
      "POST /v1/merchant/rewards",
      (): Reward => {
        const tenantId = requireMerchant("manager");
        const errors: Record<string, string> = {};
        if (input.title.trim().length < 3) errors.title = "At least 3 characters";
        if (!(input.pointCost > 0)) errors.pointCost = "Must be greater than 0";
        if (!(input.faceValueVnd >= 0)) errors.faceValueVnd = "Cannot be negative";
        if (!(input.stock > 0)) errors.stock = "Must be at least 1";
        if (!input.expiresAt || new Date(input.expiresAt).getTime() < Date.now()) errors.expiresAt = "Must be in the future";
        if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);
        const r: Reward = {
          id: uid("rwd"),
          tenantId,
          ...input,
          title: input.title.trim(),
          redeemedCount: 0,
          status: "pending_review",
          expiresAt: new Date(input.expiresAt).toISOString(),
          createdAt: new Date().toISOString(),
        };
        getDb().rewards.push(r);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "reward.create", tenantId, severity: "info", summary: `Submitted reward "${r.title}" for review`, onChain: false });
        return r;
      },
      input,
    );
  },

  setRewardStatus(id: string, status: "active" | "paused") {
    return simulate(
      `POST /v1/merchant/rewards/${id}/status`,
      () => {
        const tenantId = requireMerchant("manager");
        const r = getDb().rewards.find((x) => x.id === id && x.tenantId === tenantId);
        if (!r) throw notFound("Reward");
        if (!["active", "paused"].includes(r.status)) throw conflict(`A ${r.status.replace("_", " ")} reward cannot be ${status === "active" ? "resumed" : "paused"}.`);
        r.status = status;
        return r;
      },
      { status },
    );
  },

  restockReward(id: string, add: number) {
    return simulate(
      `POST /v1/merchant/rewards/${id}/restock`,
      () => {
        const tenantId = requireMerchant("manager");
        const r = getDb().rewards.find((x) => x.id === id && x.tenantId === tenantId);
        if (!r) throw notFound("Reward");
        if (!(Number.isInteger(add) && add > 0)) throw badRequest("Invalid quantity", { add: "Enter a positive whole number" });
        r.stock += add;
        return r;
      },
      { add },
    );
  },

  /* ------------------------------------------------------------------ members */

  listMembers(q = "") {
    return simulate(`GET /v1/merchant/members?q=${encodeURIComponent(q)}`, () => {
      const tenantId = requireMerchant();
      const needle = q.toLowerCase().replace(/\s/g, "");
      return getDb()
        .memberships.filter((m) => m.tenantId === tenantId)
        .map(toMember)
        .filter((m) => !needle || m.displayName.toLowerCase().includes(needle) || m.phone.includes(needle) || m.suiAddress.includes(needle))
        .map((m) => ({ ...m, phone: maskPhone(m.phone) }))
        .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
    });
  },

  getMember(id: string) {
    return simulate(`GET /v1/merchant/members/${id}`, () => {
      const tenantId = requireMerchant();
      const db = getDb();
      const m = db.memberships.find((x) => x.id === id && x.tenantId === tenantId);
      if (!m) throw notFound("Member");
      const member = toMember(m);
      return {
        member: { ...member, phone: maskPhone(member.phone) },
        history: db.ledger.filter((tx) => tx.membershipId === id),
        vouchers: db.vouchers
          .filter((v) => v.membershipId === id)
          .map((v) => ({ ...v, rewardTitle: db.rewards.find((r) => r.id === v.rewardId)?.title ?? "Reward" })),
      };
    });
  },

  adjustMemberPoints(id: string, points: number, reason: string) {
    return simulate(
      `POST /v1/merchant/members/${id}/adjustments`,
      () => {
        const tenantId = requireMerchant("manager");
        const db = getDb();
        const m = db.memberships.find((x) => x.id === id && x.tenantId === tenantId);
        if (!m) throw notFound("Member");
        return adjustPoints({ tenant: tenantOf(tenantId), membership: m, points, reason, actor: actorEmail() });
      },
      { points, reason },
    );
  },

  /* ------------------------------------------------------------- transactions */

  listTransactions(filters: TxFilters) {
    return simulate(`GET /v1/merchant/transactions?${new URLSearchParams(filters as Record<string, string>)}`, () => {
      const tenantId = requireMerchant();
      const db = getDb();
      const q = filters.q?.toLowerCase().trim();
      return db.ledger
        .filter((tx) => tx.tenantId === tenantId)
        .filter((tx) => !filters.kind || filters.kind === "all" || tx.kind === filters.kind)
        .filter((tx) => !filters.channel || filters.channel === "all" || tx.channel === filters.channel)
        .map((tx) => {
          const m = toMember(db.memberships.find((x) => x.id === tx.membershipId)!);
          return {
            ...tx,
            memberName: m.displayName,
            rewardTitle: tx.rewardId ? db.rewards.find((r) => r.id === tx.rewardId)?.title : undefined,
            campaignNames: tx.campaignIds.map((cid) => db.campaigns.find((c) => c.id === cid)?.name ?? cid),
          };
        })
        .filter((tx) => !q || tx.txDigest.toLowerCase().includes(q) || tx.memberName.toLowerCase().includes(q));
    });
  },

  /** Preview what a POS bill would earn, without minting. */
  quote(amountVnd: number) {
    return simulate(`GET /v1/merchant/points/quote?amount=${amountVnd}`, () => {
      const tenantId = requireMerchant("cashier");
      return quoteEarn(tenantOf(tenantId), amountVnd, false);
    });
  },

  /** Same call the POS SDK makes: `octap.points.earn({ phone, amount })`. */
  issuePoints(input: IssuePointsInput) {
    return simulate(
      "POST /v1/points/earn",
      (): { tx: LedgerTx; totalPoints: number; balance: number; memberName: string; newMember: boolean } => {
        const tenantId = requireMerchant("cashier");
        const phone = normalizePhone(input.phone);
        if (!phone) throw badRequest("Invalid phone number", { phone: "Use a Vietnamese mobile number, e.g. 0901 234 567" });
        const tenant = tenantOf(tenantId);
        const user = findOrCreateEndUser(phone);
        const { membership, created } = findOrCreateMembership(tenant, user.id);
        const { tx, quote } = earnPoints({ tenant, membership, amountVnd: input.amountVnd, channel: input.channel, isNewMember: created, actor: actorEmail() });
        return { tx, totalPoints: quote.totalPoints, balance: membership.balance, memberName: user.displayName, newMember: created };
      },
      input,
    );
  },

  /* ---------------------------------------------------------------- developer */

  listApiKeys() {
    return simulate("GET /v1/merchant/api-keys", () => {
      const tenantId = requireMerchant("manager");
      return getDb()
        .apiKeys.filter((k) => k.tenantId === tenantId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  },

  createApiKey(input: { name: string; env: ApiKey["env"]; scopes: ApiScope[] }) {
    return simulate(
      "POST /v1/merchant/api-keys",
      () => {
        const tenantId = requireMerchant("owner");
        const errors: Record<string, string> = {};
        if (input.name.trim().length < 3) errors.name = "At least 3 characters";
        if (!input.scopes.length) errors.scopes = "Select at least one scope";
        if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);
        const prefix = `ocp_${input.env}_${hex(live, 6)}`;
        const key: ApiKey = {
          id: uid("key"),
          tenantId,
          name: input.name.trim(),
          env: input.env,
          prefix,
          scopes: input.scopes,
          status: "active",
          createdAt: new Date().toISOString(),
          requests30d: 0,
        };
        getDb().apiKeys.push(key);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "apikey.create", tenantId, severity: input.env === "live" ? "warning" : "info", summary: `Issued ${input.env} API key "${key.name}" (${input.scopes.join(", ")})`, onChain: false });
        // The full secret is only ever returned once.
        return { key, secret: `${prefix}_${hex(live, 40)}` };
      },
      input,
    );
  },

  revokeApiKey(id: string) {
    return simulate(`DELETE /v1/merchant/api-keys/${id}`, () => {
      const tenantId = requireMerchant("owner");
      const key = getDb().apiKeys.find((k) => k.id === id && k.tenantId === tenantId);
      if (!key) throw notFound("API key");
      key.status = "revoked";
      writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "apikey.revoke", tenantId, severity: "warning", summary: `Revoked API key "${key.name}" (${key.prefix})`, onChain: false });
      return key;
    });
  },

  updateMcp(patch: { enabled?: boolean; tool?: McpTool; toolEnabled?: boolean }) {
    return simulate(
      "PATCH /v1/merchant/mcp",
      () => {
        const tenantId = requireMerchant("owner");
        const t = tenantOf(tenantId);
        if (t.plan === "starter") throw forbidden("The MCP server is available on Growth and Enterprise plans.");
        if (patch.enabled !== undefined) t.mcp.enabled = patch.enabled;
        if (patch.tool) t.mcp.tools[patch.tool] = !!patch.toolEnabled;
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "mcp.update", tenantId, severity: patch.tool === "issue_points" && patch.toolEnabled ? "warning" : "info", summary: patch.tool ? `${patch.toolEnabled ? "Allowed" : "Blocked"} MCP tool ${patch.tool}` : `${patch.enabled ? "Enabled" : "Disabled"} MCP server`, onChain: false });
        return t.mcp;
      },
      patch,
    );
  },

  /* --------------------------------------------------------------------- team */

  listTeam() {
    return simulate("GET /v1/merchant/team", () => {
      const tenantId = requireMerchant();
      return getDb().staff.filter((s) => s.tenantId === tenantId).map(toPublicStaff);
    });
  },

  inviteTeammate(input: { email: string; role: MerchantRole }) {
    return simulate(
      "POST /v1/merchant/team/invitations",
      () => {
        const tenantId = requireMerchant("owner");
        const email = input.email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email)) throw badRequest("Invalid email", { email: "Enter a valid email address" });
        const db = getDb();
        if (db.staff.some((s) => s.email === email)) throw conflict("This person already has an OctaP account.", { email: "Already a member of a workspace" });
        const account = {
          id: uid("usr"),
          email,
          password: "octap123",
          displayName: email.split("@")[0],
          avatarUrl: `https://picsum.photos/id/${live.int(1, 90)}/200/200`,
          role: "merchant" as const,
          tenantId,
          merchantRole: input.role,
          status: "invited" as const,
          createdAt: new Date().toISOString(),
        };
        db.staff.push(account);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "team.invite", tenantId, severity: "info", summary: `Invited ${email} as ${input.role}`, onChain: false });
        return toPublicStaff(account);
      },
      input,
    );
  },

  updateTeammate(id: string, patch: { merchantRole?: MerchantRole; status?: "active" | "disabled" }) {
    return simulate(
      `PATCH /v1/merchant/team/${id}`,
      () => {
        const tenantId = requireMerchant("owner");
        const s = getDb().staff.find((x) => x.id === id && x.tenantId === tenantId);
        if (!s) throw notFound("Teammate");
        if (s.id === sessionStore.get()?.user.id) throw conflict("You cannot change your own role or status.");
        Object.assign(s, patch);
        writeAudit({ actorType: "merchant", actorName: actorEmail(), action: "team.update", tenantId, severity: "warning", summary: `Updated ${s.email}: ${JSON.stringify(patch)}`, onChain: false });
        return toPublicStaff(s);
      },
      patch,
    );
  },
};
