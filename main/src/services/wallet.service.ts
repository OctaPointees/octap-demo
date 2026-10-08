import type { EndUser } from "../types/domain";
import {
  earnPoints,
  findOrCreateEndUser,
  findOrCreateMembership,
  quoteEarn,
  redeemReward,
} from "./core/ledger";
import { getDb } from "./mock/db";
import { ApiError, badRequest, notFound, simulate } from "./mock/http";
import { hex, live } from "./mock/random";
import { normalizePhone } from "./merchant.service";

/**
 * End-user test harness (LI-3). Mirrors what the OctaP consumer SDK does:
 * phone OTP → Enoki zkLogin → sponsored transactions.
 */

const KEY = "octap.wallet.session";
const DEMO_OTP = "123456";

type WalletSession = { token: string; userId: string };

const listeners = new Set<() => void>();
let current: WalletSession | null = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
})();

export const walletSession = {
  get: () => current,
  set(s: WalletSession | null) {
    current = s;
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const pendingOtp = new Map<string, number>();

function requireUser(): EndUser {
  const s = walletSession.get();
  const user = s && getDb().endUsers.find((u) => u.id === s.userId);
  if (!user) throw new ApiError(401, "unauthenticated", "Please sign in with your phone number.");
  return user;
}

function operationalTenant(id: string) {
  const t = getDb().tenants.find((x) => x.id === id);
  if (!t) throw notFound("Merchant");
  return t;
}

export const walletService = {
  DEMO_OTP,

  requestOtp(rawPhone: string) {
    return simulate(
      "POST /v1/wallet/otp",
      () => {
        const phone = normalizePhone(rawPhone);
        if (!phone) throw badRequest("Invalid phone number", { phone: "Use a Vietnamese mobile number, e.g. 0901 234 567" });
        pendingOtp.set(phone, Date.now() + 5 * 60_000);
        return { phone, expiresInSec: 300 };
      },
      { phone: rawPhone },
    );
  },

  verifyOtp(phone: string, code: string, displayName?: string) {
    return simulate(
      "POST /v1/wallet/zklogin",
      () => {
        const exp = pendingOtp.get(phone);
        if (!exp || exp < Date.now()) throw new ApiError(410, "otp_expired", "This code has expired. Request a new one.");
        if (code !== DEMO_OTP) throw badRequest("Incorrect code", { code: "The code you entered is incorrect" });
        pendingOtp.delete(phone);
        const isNew = !getDb().endUsers.some((u) => u.phone === phone);
        const user = findOrCreateEndUser(phone, displayName);
        return { user, isNew, token: `zk_${hex(live, 32)}` };
      },
      { phone, code: "••••••" },
    ).then((res) => {
      walletSession.set({ token: res.token, userId: res.user.id });
      return res;
    });
  },

  signOut() {
    walletSession.set(null);
  },

  getWallet() {
    return simulate("GET /v1/wallet", () => {
      const user = requireUser();
      const db = getDb();
      const memberships = db.memberships
        .filter((m) => m.userId === user.id)
        .map((m) => {
          const t = db.tenants.find((x) => x.id === m.tenantId)!;
          return { ...m, tenant: { id: t.id, name: t.name, symbol: t.pointSymbol, pointName: t.pointName, color: t.brandColor, status: t.status, earnRate: t.earnRate } };
        });
      const joinable = db.tenants
        .filter((t) => t.status === "active" && !memberships.some((m) => m.tenantId === t.id))
        .map((t) => ({ id: t.id, name: t.name, industry: t.industry, symbol: t.pointSymbol, color: t.brandColor }));
      return { user, memberships, joinable };
    });
  },

  join(tenantId: string) {
    return simulate(`POST /v1/wallet/memberships`, () => {
      const user = requireUser();
      const tenant = operationalTenant(tenantId);
      if (tenant.status !== "active") throw new ApiError(403, "tenant_unavailable", `${tenant.name} is not accepting members right now.`);
      const { membership, created } = findOrCreateMembership(tenant, user.id);
      // Signup-bonus campaigns fire on join, like the SDK's `members.enroll()`.
      const db = getDb();
      const bonuses = created
        ? quoteEarn(tenant, 0, true).bonuses.filter(
            (b) => db.campaigns.find((c) => c.id === b.campaignId)?.type === "signup_bonus",
          )
        : [];
      const welcomeBonus = bonuses.reduce((s, b) => s + b.points, 0);
      bonuses.forEach((b) => {
        const c = db.campaigns.find((x) => x.id === b.campaignId)!;
        c.issuedPoints += b.points;
        c.participants += 1;
      });
      membership.balance += welcomeBonus;
      membership.lifetimeEarned += welcomeBonus;
      return { membership, welcomeBonus };
    }, { tenantId });
  },

  listRewards(tenantId: string) {
    return simulate(`GET /v1/wallet/merchants/${tenantId}/rewards`, () => {
      requireUser();
      const now = Date.now();
      return getDb().rewards.filter(
        (r) => r.tenantId === tenantId && r.status === "active" && new Date(r.expiresAt).getTime() > now,
      );
    });
  },

  history(tenantId: string) {
    return simulate(`GET /v1/wallet/merchants/${tenantId}/history`, () => {
      const user = requireUser();
      const db = getDb();
      const m = db.memberships.find((x) => x.userId === user.id && x.tenantId === tenantId);
      if (!m) return [];
      return db.ledger
        .filter((tx) => tx.membershipId === m.id)
        .map((tx) => ({ ...tx, rewardTitle: tx.rewardId ? db.rewards.find((r) => r.id === tx.rewardId)?.title : undefined }));
    });
  },

  vouchers() {
    return simulate("GET /v1/wallet/vouchers", () => {
      const user = requireUser();
      const db = getDb();
      const ids = new Set(db.memberships.filter((m) => m.userId === user.id).map((m) => m.id));
      return db.vouchers
        .filter((v) => ids.has(v.membershipId))
        .map((v) => {
          const r = db.rewards.find((x) => x.id === v.rewardId);
          const t = db.tenants.find((x) => x.id === v.tenantId)!;
          return { ...v, rewardTitle: r?.title ?? "Reward", tenantName: t.name, color: t.brandColor };
        });
    });
  },

  /** Simulates paying at a merchant POS that has the OctaP SDK installed. */
  checkout(tenantId: string, amountVnd: number) {
    return simulate(
      "POST /v1/points/earn",
      () => {
        const user = requireUser();
        const tenant = operationalTenant(tenantId);
        const { membership, created } = findOrCreateMembership(tenant, user.id);
        const { tx, quote } = earnPoints({ tenant, membership, amountVnd, channel: "pos", isNewMember: created, actor: "pos-simulator" });
        return { tx, quote, balance: membership.balance };
      },
      { tenantId, amountVnd },
    );
  },

  /** zkLogin-signed burn of points in exchange for a voucher. */
  redeem(rewardId: string) {
    return simulate(
      "POST /v1/wallet/redemptions",
      () => {
        const user = requireUser();
        const db = getDb();
        const reward = db.rewards.find((r) => r.id === rewardId);
        if (!reward) throw notFound("Reward");
        const tenant = operationalTenant(reward.tenantId);
        const membership = db.memberships.find((m) => m.userId === user.id && m.tenantId === tenant.id);
        if (!membership) throw new ApiError(403, "not_a_member", `Join ${tenant.name} first to redeem its rewards.`);
        const { tx, voucher } = redeemReward({ tenant, membership, reward });
        return { tx, voucher, balance: membership.balance, rewardTitle: reward.title };
      },
      { rewardId },
    );
  },
};
