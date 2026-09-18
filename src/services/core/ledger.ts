import type {
  AuditEvent,
  Campaign,
  DailyStat,
  EndUser,
  LedgerTx,
  Membership,
  Reward,
  Tenant,
  TxChannel,
  VoucherCode,
} from "../../types/domain";
import { getDb } from "../mock/db";
import { badRequest, conflict, forbidden } from "../mock/http";
import { live, suiObjectId, txDigest, uid, voucherCode } from "../mock/random";
import { tierFor } from "../mock/seed";

/**
 * Shared "on-chain" operations used by the merchant, POS/SDK and wallet services.
 * In production these become Move calls sponsored through Enoki.
 */

const todayKey = () => new Date().toISOString().slice(0, 10);

function bumpStat(tenantId: string, patch: Partial<Omit<DailyStat, "date" | "tenantId">>) {
  const db = getDb();
  const key = todayKey();
  let row = db.stats.find((s) => s.tenantId === tenantId && s.date === key);
  if (!row) {
    row = { date: key, tenantId, earned: 0, redeemed: 0, txCount: 0, revenueVnd: 0, newMembers: 0, gasMist: 0, apiCalls: 0 };
    db.stats.push(row);
  }
  for (const [k, v] of Object.entries(patch) as [keyof typeof patch, number][]) {
    row[k] += v;
  }
}

export function writeAudit(event: Omit<AuditEvent, "id" | "at" | "ip"> & { ip?: string }) {
  const db = getDb();
  const entry: AuditEvent = {
    id: uid("aud"),
    at: new Date().toISOString(),
    ip: event.ip ?? "127.0.0.1",
    ...event,
  };
  db.audit.unshift(entry);
  return entry;
}

function nextCheckpoint() {
  const db = getDb();
  db.checkpoint += live.int(5, 60);
  return db.checkpoint;
}

export function isCampaignLive(c: Campaign, at = Date.now()) {
  return (
    c.status === "active" &&
    new Date(c.startAt).getTime() <= at &&
    new Date(c.endAt).getTime() >= at &&
    c.issuedPoints < c.budgetPoints
  );
}

export function monthToDateMinted(tenantId: string) {
  const prefix = todayKey().slice(0, 7);
  return getDb()
    .stats.filter((s) => s.tenantId === tenantId && s.date.startsWith(prefix))
    .reduce((sum, s) => sum + s.earned, 0);
}

export type EarnQuote = {
  basePoints: number;
  bonuses: { campaignId: string; name: string; points: number }[];
  totalPoints: number;
};

/** Pure calculation of points for a bill, used for previews and issuance. */
export function quoteEarn(tenant: Tenant, amountVnd: number, isNewMember: boolean): EarnQuote {
  const db = getDb();
  const basePoints = Math.floor((amountVnd / 10_000) * tenant.earnRate);
  const bonuses: EarnQuote["bonuses"] = [];

  db.campaigns
    .filter((c) => c.tenantId === tenant.id && isCampaignLive(c))
    .forEach((c) => {
      let pts = 0;
      if (c.type === "multiplier" && c.multiplier) pts = Math.floor(basePoints * (c.multiplier - 1));
      if (c.type === "spend_threshold" && amountVnd >= (c.minSpendVnd ?? Infinity)) pts = c.bonusPoints ?? 0;
      if (c.type === "fixed_bonus") pts = c.bonusPoints ?? 0;
      if (c.type === "signup_bonus" && isNewMember) pts = c.bonusPoints ?? 0;
      pts = Math.min(pts, c.budgetPoints - c.issuedPoints);
      if (pts > 0) bonuses.push({ campaignId: c.id, name: c.name, points: pts });
    });

  return {
    basePoints,
    bonuses,
    totalPoints: basePoints + bonuses.reduce((s, b) => s + b.points, 0),
  };
}

export function findOrCreateEndUser(phone: string, displayName?: string) {
  const db = getDb();
  let user = db.endUsers.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: uid("eu"),
      phone,
      displayName: displayName || `Member ${phone.slice(-4)}`,
      suiAddress: suiObjectId(),
      createdAt: new Date().toISOString(),
    } satisfies EndUser;
    db.endUsers.push(user);
  }
  return user;
}

export function findOrCreateMembership(tenant: Tenant, userId: string) {
  const db = getDb();
  let m = db.memberships.find((x) => x.tenantId === tenant.id && x.userId === userId);
  let created = false;
  if (!m) {
    const at = new Date().toISOString();
    m = {
      id: uid("mbr"),
      tenantId: tenant.id,
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      tier: "bronze",
      joinedAt: at,
      lastActiveAt: at,
    } satisfies Membership;
    db.memberships.push(m);
    bumpStat(tenant.id, { newMembers: 1 });
    created = true;
  }
  return { membership: m, created };
}

function pushTx(tx: Omit<LedgerTx, "id" | "txDigest" | "checkpoint" | "gasMist" | "createdAt" | "status">) {
  const db = getDb();
  const entry: LedgerTx = {
    ...tx,
    id: uid("tx"),
    status: "confirmed",
    txDigest: txDigest(),
    checkpoint: nextCheckpoint(),
    gasMist: live.int(1_600_000, 3_900_000),
    createdAt: new Date().toISOString(),
  };
  db.ledger.unshift(entry);
  return entry;
}

export function assertTenantOperational(tenant: Tenant) {
  if (tenant.status !== "active") {
    throw forbidden(`${tenant.name} is ${tenant.status}; point operations are disabled.`);
  }
}

export function earnPoints(opts: {
  tenant: Tenant;
  membership: Membership;
  amountVnd: number;
  channel: TxChannel;
  isNewMember: boolean;
  actor: string;
}) {
  const { tenant, membership, amountVnd, channel, isNewMember, actor } = opts;
  assertTenantOperational(tenant);
  if (!Number.isFinite(amountVnd) || amountVnd < 10_000) {
    throw badRequest("Bill amount must be at least 10,000 ₫", { amountVnd: "Minimum is 10,000 ₫" });
  }

  const quote = quoteEarn(tenant, amountVnd, isNewMember);
  if (monthToDateMinted(tenant.id) + quote.totalPoints > tenant.monthlyMintCap) {
    writeAudit({
      actorType: channel === "mcp" ? "mcp_agent" : "api_key",
      actorName: actor,
      action: "mint.cap_exceeded",
      tenantId: tenant.id,
      severity: "critical",
      summary: `Mint of ${quote.totalPoints} points rejected: monthly cap reached`,
      onChain: false,
    });
    throw conflict("Monthly mint cap reached for this tenant. Contact OctaP support to raise it.");
  }

  const db = getDb();
  quote.bonuses.forEach((b) => {
    const c = db.campaigns.find((x) => x.id === b.campaignId)!;
    c.issuedPoints += b.points;
    c.participants += 1;
    c.revenueAttributedVnd += amountVnd;
  });

  membership.balance += quote.totalPoints;
  membership.lifetimeEarned += quote.totalPoints;
  membership.tier = tierFor(membership.lifetimeEarned);
  membership.lastActiveAt = new Date().toISOString();

  const tx = pushTx({
    tenantId: tenant.id,
    membershipId: membership.id,
    kind: "earn",
    points: quote.totalPoints,
    amountVnd,
    campaignIds: quote.bonuses.map((b) => b.campaignId),
    channel,
  });

  bumpStat(tenant.id, {
    earned: quote.totalPoints,
    txCount: 1,
    revenueVnd: amountVnd,
    gasMist: tx.gasMist,
    apiCalls: channel === "dashboard" ? 0 : 1,
  });

  writeAudit({
    actorType: channel === "dashboard" ? "merchant" : channel === "mcp" ? "mcp_agent" : channel === "wallet" ? "system" : "api_key",
    actorName: actor,
    action: "points.mint",
    tenantId: tenant.id,
    severity: "info",
    summary: `Minted ${quote.totalPoints} ${tenant.pointSymbol} for a ${amountVnd.toLocaleString("en-US")} ₫ bill`,
    txDigest: tx.txDigest,
    onChain: true,
  });

  return { tx, quote, membership };
}

export function adjustPoints(opts: {
  tenant: Tenant;
  membership: Membership;
  points: number;
  reason: string;
  actor: string;
}) {
  const { tenant, membership, points, reason, actor } = opts;
  assertTenantOperational(tenant);
  if (!Number.isInteger(points) || points === 0) {
    throw badRequest("Adjustment must be a non-zero whole number", { points: "Enter a non-zero whole number" });
  }
  if (!reason.trim()) throw badRequest("A reason is required for manual adjustments", { reason: "Required for the audit trail" });
  if (membership.balance + points < 0) {
    throw badRequest("Adjustment would make the balance negative", { points: `Balance is only ${membership.balance}` });
  }

  membership.balance += points;
  if (points > 0) membership.lifetimeEarned += points;
  membership.tier = tierFor(membership.lifetimeEarned);

  const tx = pushTx({
    tenantId: tenant.id,
    membershipId: membership.id,
    kind: "adjust",
    points,
    campaignIds: [],
    channel: "dashboard",
    note: reason,
  });
  bumpStat(tenant.id, points > 0 ? { earned: points, txCount: 1 } : { redeemed: -points, txCount: 1 });
  writeAudit({
    actorType: "merchant",
    actorName: actor,
    action: points > 0 ? "points.mint" : "points.burn",
    tenantId: tenant.id,
    severity: Math.abs(points) >= 5_000 ? "warning" : "info",
    summary: `Manual adjustment of ${points > 0 ? "+" : ""}${points} ${tenant.pointSymbol}: ${reason}`,
    txDigest: tx.txDigest,
    onChain: true,
  });
  return tx;
}

export function redeemReward(opts: { tenant: Tenant; membership: Membership; reward: Reward }) {
  const { tenant, membership, reward } = opts;
  assertTenantOperational(tenant);
  if (reward.tenantId !== tenant.id) throw forbidden("Rewards can only be redeemed with points of the same merchant.");
  if (reward.status !== "active") throw conflict("This reward is not currently available.");
  if (new Date(reward.expiresAt).getTime() < Date.now()) throw conflict("This reward has expired.");
  if (reward.redeemedCount >= reward.stock) throw conflict("This reward is out of stock.");
  if (membership.balance < reward.pointCost) {
    throw conflict(`You need ${reward.pointCost - membership.balance} more ${tenant.pointSymbol} to redeem this reward.`);
  }

  membership.balance -= reward.pointCost;
  membership.lifetimeRedeemed += reward.pointCost;
  membership.lastActiveAt = new Date().toISOString();
  reward.redeemedCount += 1;

  const tx = pushTx({
    tenantId: tenant.id,
    membershipId: membership.id,
    kind: "redeem",
    points: -reward.pointCost,
    campaignIds: [],
    rewardId: reward.id,
    channel: "wallet",
  });
  bumpStat(tenant.id, { redeemed: reward.pointCost, txCount: 1, gasMist: tx.gasMist });

  const voucher: VoucherCode = {
    id: uid("vch"),
    code: voucherCode(),
    rewardId: reward.id,
    tenantId: tenant.id,
    membershipId: membership.id,
    txDigest: tx.txDigest,
    status: "issued",
    issuedAt: tx.createdAt,
  };
  getDb().vouchers.unshift(voucher);

  writeAudit({
    actorType: "system",
    actorName: "zklogin:" + membership.userId,
    action: "points.burn",
    tenantId: tenant.id,
    severity: "info",
    summary: `Burned ${reward.pointCost} ${tenant.pointSymbol} for "${reward.title}"`,
    txDigest: tx.txDigest,
    onChain: true,
  });

  return { tx, voucher };
}
