import type {
  ApiKey,
  ApiScope,
  AuditEvent,
  Campaign,
  CampaignType,
  DailyStat,
  EndUser,
  LedgerTx,
  McpTool,
  MemberTier,
  Membership,
  Reward,
  StaffAccount,
  Tenant,
  TxChannel,
  VoucherCode,
} from "../../types/domain";
import {
  createRng,
  hex,
  suiObjectId,
  txDigest,
  uid,
  voucherCode,
  type Rng,
} from "./random";

export type Database = {
  version: number;
  staff: StaffAccount[];
  tenants: Tenant[];
  campaigns: Campaign[];
  rewards: Reward[];
  endUsers: EndUser[];
  memberships: Membership[];
  ledger: LedgerTx[];
  vouchers: VoucherCode[];
  apiKeys: ApiKey[];
  audit: AuditEvent[];
  stats: DailyStat[];
  checkpoint: number;
};

export const DB_VERSION = 2;

const DAY = 86_400_000;
const now = () => Date.now();
const daysAgo = (d: number, rng?: Rng) =>
  new Date(now() - d * DAY - (rng ? rng.int(0, DAY) : 0)).toISOString();
const dateKey = (d: Date) => d.toISOString().slice(0, 10);

export const ALL_MCP_TOOLS: McpTool[] = [
  "get_balance",
  "list_campaigns",
  "create_campaign",
  "issue_points",
  "list_rewards",
  "get_member_history",
];

type TenantSeed = {
  name: string;
  points: string;
  industry: string;
  symbol: string;
  color: string;
  plan: Tenant["plan"];
  status: Tenant["status"];
  scale: number;
};

const TENANTS: TenantSeed[] = [
  { name: "Lotus Mart", points: "Lotus Points", industry: "Retail & Grocery", symbol: "LTM", color: "#9f0261", plan: "enterprise", status: "active", scale: 1.6 },
  { name: "Phố Cà Phê", points: "Phố Beans", industry: "Food & Beverage", symbol: "PCP", color: "#8b5a2b", plan: "growth", status: "active", scale: 1.2 },
  { name: "Sài Gòn Books", points: "Book Stars", industry: "Books & Stationery", symbol: "SGB", color: "#002b49", plan: "starter", status: "active", scale: 0.5 },
  { name: "Mekong Fitness", points: "Mekong Miles", industry: "Health & Fitness", symbol: "MKF", color: "#88c057", plan: "growth", status: "active", scale: 0.8 },
  { name: "Hanoi Bakehouse", points: "Crumb Coins", industry: "Food & Beverage", symbol: "HBH", color: "#f39c12", plan: "starter", status: "active", scale: 0.6 },
  { name: "TechNest Electronics", points: "Nest Credits", industry: "Electronics", symbol: "TNE", color: "#33bbf6", plan: "enterprise", status: "active", scale: 1.1 },
  { name: "Green Leaf Pharmacy", points: "Leaf Points", industry: "Healthcare", symbol: "GLP", color: "#2e8b57", plan: "growth", status: "active", scale: 0.7 },
  { name: "Lumière Cinema", points: "Reel Stars", industry: "Entertainment", symbol: "LMC", color: "#6a4c93", plan: "growth", status: "active", scale: 0.9 },
  { name: "Kite Ride", points: "Kite Miles", industry: "Mobility", symbol: "KTR", color: "#d9383a", plan: "enterprise", status: "active", scale: 1.3 },
  { name: "Nón Lá Fashion", points: "Style Points", industry: "Fashion", symbol: "NLF", color: "#c2185b", plan: "starter", status: "active", scale: 0.4 },
  { name: "Sunrise Hotels", points: "Sunrise Nights", industry: "Hospitality", symbol: "SRH", color: "#ff8c42", plan: "enterprise", status: "provisioning", scale: 0 },
  { name: "Blue Lagoon Spa", points: "Lagoon Pearls", industry: "Wellness", symbol: "BLS", color: "#1b998b", plan: "starter", status: "suspended", scale: 0.3 },
];

const FIRST = ["An", "Bình", "Châu", "Dũng", "Giang", "Hà", "Hải", "Hạnh", "Hiếu", "Hoa", "Huy", "Khánh", "Lan", "Linh", "Long", "Mai", "Minh", "My", "Nam", "Ngọc", "Nhi", "Phong", "Phúc", "Quân", "Quỳnh", "Sơn", "Tâm", "Thảo", "Trang", "Tuấn", "Vy", "Yến"];
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô"];

const CAMPAIGN_TEMPLATES: { name: string; type: CampaignType; description: string }[] = [
  { name: "Double Points Weekend", type: "multiplier", description: "2× points on every purchase from Friday to Sunday." },
  { name: "Big Basket Bonus", type: "spend_threshold", description: "Spend above the threshold and get bonus points instantly." },
  { name: "Welcome Aboard", type: "signup_bonus", description: "New members receive a one-time welcome bonus." },
  { name: "Tết Lucky Points", type: "multiplier", description: "Lunar New Year triple-points celebration." },
  { name: "Mid-Autumn Treat", type: "fixed_bonus", description: "Flat bonus points on every transaction during the festival." },
  { name: "Back to School", type: "spend_threshold", description: "Bonus for big back-to-school baskets." },
  { name: "Happy Hour Boost", type: "multiplier", description: "1.5× points during weekday happy hours." },
];

const REWARD_TEMPLATES: { title: string; category: Reward["category"]; value: number }[] = [
  { title: "50,000₫ off your next bill", category: "discount", value: 50_000 },
  { title: "100,000₫ gift voucher", category: "discount", value: 100_000 },
  { title: "Free signature drink", category: "free_item", value: 55_000 },
  { title: "Free delivery for a month", category: "gift", value: 120_000 },
  { title: "Birthday gift box", category: "gift", value: 200_000 },
  { title: "VIP lounge access", category: "experience", value: 350_000 },
  { title: "15% off storewide", category: "discount", value: 80_000 },
  { title: "Buy 1 get 1 free", category: "free_item", value: 60_000 },
];

const ACTIONS: { action: string; severity: AuditEvent["severity"]; actor: AuditEvent["actorType"]; summary: string; onChain: boolean }[] = [
  { action: "points.mint", severity: "info", actor: "api_key", summary: "Minted {n} points via POS integration", onChain: true },
  { action: "points.burn", severity: "info", actor: "system", summary: "Burned {n} points on reward redemption", onChain: true },
  { action: "campaign.create", severity: "info", actor: "merchant", summary: "Created campaign \"{c}\"", onChain: false },
  { action: "campaign.pause", severity: "warning", actor: "merchant", summary: "Paused campaign \"{c}\"", onChain: false },
  { action: "apikey.create", severity: "warning", actor: "merchant", summary: "Issued a new live API key", onChain: false },
  { action: "apikey.revoke", severity: "warning", actor: "merchant", summary: "Revoked API key", onChain: false },
  { action: "mcp.tool_call", severity: "info", actor: "mcp_agent", summary: "Agent called get_balance for a member", onChain: false },
  { action: "mint.cap_exceeded", severity: "critical", actor: "api_key", summary: "Mint request rejected: monthly cap exceeded", onChain: false },
  { action: "auth.failed_login", severity: "warning", actor: "system", summary: "5 failed login attempts from a single IP", onChain: false },
  { action: "tenant.update", severity: "info", actor: "admin", summary: "Updated tenant plan settings", onChain: false },
  { action: "treasury.cap_rotated", severity: "critical", actor: "admin", summary: "Treasury capability rotated to new multisig", onChain: true },
  { action: "reward.approve", severity: "info", actor: "admin", summary: "Approved reward listing", onChain: false },
];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function tierFor(lifetime: number): MemberTier {
  if (lifetime > 20_000) return "platinum";
  if (lifetime > 8_000) return "gold";
  if (lifetime > 2_500) return "silver";
  return "bronze";
}

export { slugify, tierFor };

export function createSeed(): Database {
  const rng = createRng(20260919);
  let checkpoint = 184_220_000;

  const tenants: Tenant[] = TENANTS.map((t, i) => {
    const slug = slugify(t.name);
    return {
      id: `tnt_${hex(rng, 10)}`,
      name: t.name,
      slug,
      industry: t.industry,
      status: t.status,
      plan: t.plan,
      contactEmail: `partners@${slug.replace(/-/g, "")}.vn`,
      contactPhone: `+84 28 ${rng.int(3000, 3999)} ${rng.int(1000, 9999)}`,
      pointSymbol: t.symbol,
      pointName: t.points,
      earnRate: rng.pick([1, 1, 2, 5]),
      monthlyMintCap: t.plan === "enterprise" ? 5_000_000 : t.plan === "growth" ? 1_500_000 : 400_000,
      treasuryObjectId: suiObjectId(rng),
      packageId: suiObjectId(rng),
      brandColor: t.color,
      createdAt: daysAgo(t.status === "provisioning" ? 1 : 400 - i * 25, rng),
      mcp: {
        enabled: t.plan !== "starter",
        tools: Object.fromEntries(
          ALL_MCP_TOOLS.map((tool) => [
            tool,
            ["get_balance", "list_campaigns", "list_rewards"].includes(tool),
          ]),
        ) as Record<McpTool, boolean>,
      },
    };
  });

  const staff: StaffAccount[] = [
    {
      id: "usr_admin_01",
      email: "admin@octap.io",
      password: "octap123",
      displayName: "KhanhMND",
      avatarUrl: "https://picsum.photos/id/237/200/200",
      role: "admin",
      status: "active",
      createdAt: daysAgo(500),
      lastLoginAt: daysAgo(1),
    },
    {
      id: "usr_admin_02",
      email: "ops@octap.io",
      password: "octap123",
      displayName: "Ops On-call",
      avatarUrl: "https://picsum.photos/id/64/200/200",
      role: "admin",
      status: "active",
      createdAt: daysAgo(300),
    },
  ];

  const staffNames = ["Owner", "Manager", "Cashier", "Viewer"] as const;
  tenants.forEach((t, i) => {
    const domain = t.contactEmail.split("@")[1];
    staffNames.forEach((r, j) => {
      if (j > 1 && i > 2) return;
      staff.push({
        id: `usr_${hex(rng, 10)}`,
        email: `${r.toLowerCase()}@${domain}`,
        password: "octap123",
        displayName: `${rng.pick(LAST)} ${rng.pick(FIRST)}`,
        avatarUrl: `https://picsum.photos/id/${rng.int(1, 90)}/200/200`,
        role: "merchant",
        tenantId: t.id,
        merchantRole: r.toLowerCase() as StaffAccount["merchantRole"],
        status: j === 3 ? "invited" : "active",
        createdAt: t.createdAt,
        lastLoginAt: j === 3 ? undefined : daysAgo(rng.int(0, 10), rng),
      });
    });
  });

  // End users (shared identity, zkLogin address) ------------------------------
  const endUsers: EndUser[] = Array.from({ length: 80 }, (_, i) => ({
    id: `eu_${hex(rng, 10)}`,
    phone: i === 0 ? "+84901234567" : `+849${rng.int(0, 9)}${rng.int(1_000_000, 9_999_999)}`,
    displayName: i === 0 ? "Demo Member" : `${rng.pick(LAST)} ${rng.pick(FIRST)}`,
    suiAddress: suiObjectId(rng),
    createdAt: daysAgo(rng.int(5, 380), rng),
  }));

  const liveTenants = tenants.filter((t) => t.status !== "provisioning");

  const memberships: Membership[] = [];
  endUsers.forEach((u, i) => {
    const count = i === 0 ? 4 : rng.int(1, 4);
    const joined = new Set<string>();
    for (let k = 0; k < count; k++) {
      const t = i === 0 ? liveTenants[k] : rng.pick(liveTenants);
      if (joined.has(t.id)) continue;
      joined.add(t.id);
      const earned = rng.int(200, 30_000);
      const redeemed = Math.floor(earned * rng.float(0, 0.7));
      memberships.push({
        id: `mbr_${hex(rng, 10)}`,
        tenantId: t.id,
        userId: u.id,
        balance: earned - redeemed,
        lifetimeEarned: earned,
        lifetimeRedeemed: redeemed,
        tier: tierFor(earned),
        joinedAt: daysAgo(rng.int(3, 360), rng),
        lastActiveAt: daysAgo(rng.int(0, 30), rng),
      });
    }
  });

  // Campaigns ------------------------------------------------------------------
  const campaigns: Campaign[] = [];
  liveTenants.forEach((t) => {
    const n = rng.int(3, 6);
    const templates = [...CAMPAIGN_TEMPLATES].sort(() => rng.next() - 0.5).slice(0, n);
    templates.forEach((tpl, idx) => {
      const status: Campaign["status"] =
        idx === 0 ? "active" : rng.pick(["active", "ended", "scheduled", "paused", "draft", "ended"] as const);
      // start/end expressed as "days ago"; negative means in the future.
      const start =
        status === "scheduled"
          ? -rng.int(3, 20)
          : status === "draft"
            ? -rng.int(10, 30)
            : status === "ended"
              ? rng.int(50, 110)
              : rng.int(3, 30);
      const duration =
        status === "active" || status === "paused"
          ? start + rng.int(7, 45)
          : rng.int(14, 45);
      const budget = rng.pick([50_000, 100_000, 250_000, 500_000]) * Math.max(t.plan === "enterprise" ? 2 : 1, 1);
      const issued =
        status === "scheduled" || status === "draft"
          ? 0
          : Math.floor(budget * (status === "ended" ? rng.float(0.7, 1) : rng.float(0.15, 0.8)));
      campaigns.push({
        id: `cmp_${hex(rng, 10)}`,
        tenantId: t.id,
        name: tpl.name,
        description: tpl.description,
        type: tpl.type,
        status,
        multiplier: tpl.type === "multiplier" ? rng.pick([1.5, 2, 3]) : undefined,
        minSpendVnd: tpl.type === "spend_threshold" ? rng.pick([300_000, 500_000, 1_000_000]) : undefined,
        bonusPoints: tpl.type !== "multiplier" ? rng.pick([20, 50, 100, 200]) : undefined,
        budgetPoints: budget,
        issuedPoints: issued,
        pointCostVnd: rng.pick([50, 80, 100]),
        revenueAttributedVnd: issued * rng.int(250, 900),
        participants: Math.floor(issued / rng.int(40, 120)),
        startAt: daysAgo(start),
        endAt: daysAgo(start - duration),
        createdAt: daysAgo(Math.max(start, 0) + rng.int(2, 10)),
      });
    });
  });

  // Rewards ----------------------------------------------------------------------
  const rewards: Reward[] = [];
  liveTenants.forEach((t) => {
    const n = rng.int(4, 7);
    [...REWARD_TEMPLATES]
      .sort(() => rng.next() - 0.5)
      .slice(0, n)
      .forEach((tpl, idx) => {
        const stock = rng.pick([100, 250, 500, 1000]);
        const status: Reward["status"] =
          idx === n - 1 ? "pending_review" : rng.pick(["active", "active", "active", "paused", "expired"] as const);
        rewards.push({
          id: `rwd_${hex(rng, 10)}`,
          tenantId: t.id,
          title: tpl.title,
          description: `Redeem at any ${t.name} location. One per transaction.`,
          category: tpl.category,
          pointCost: Math.round((tpl.value / 100) * (t.earnRate > 1 ? 2 : 1) / 10) * 10,
          faceValueVnd: tpl.value,
          stock,
          redeemedCount: status === "pending_review" ? 0 : rng.int(0, Math.floor(stock * 0.8)),
          status,
          expiresAt: daysAgo(status === "expired" ? rng.int(1, 30) : -rng.int(30, 180)),
          createdAt: daysAgo(rng.int(5, 120), rng),
        });
      });
  });

  // Ledger (recent sample) --------------------------------------------------
  const ledger: LedgerTx[] = [];
  const channels: TxChannel[] = ["pos", "pos", "pos", "sdk", "sdk", "mcp", "dashboard"];
  memberships.forEach((m) => {
    const tenant = tenants.find((t) => t.id === m.tenantId)!;
    const n = rng.int(2, 8);
    for (let k = 0; k < n; k++) {
      const redeem = rng.chance(0.2);
      const amount = rng.int(3, 250) * 10_000;
      const tenantRewards = rewards.filter((r) => r.tenantId === m.tenantId);
      const reward = redeem ? rng.pick(tenantRewards) : undefined;
      const points = redeem ? -(reward?.pointCost ?? 100) : Math.floor((amount / 10_000) * tenant.earnRate);
      checkpoint += rng.int(20, 400);
      ledger.push({
        id: uid("tx", rng),
        tenantId: m.tenantId,
        membershipId: m.id,
        kind: redeem ? "redeem" : "earn",
        points,
        amountVnd: redeem ? undefined : amount,
        campaignIds: [],
        rewardId: reward?.id,
        channel: redeem ? "wallet" : rng.pick(channels),
        status: rng.chance(0.03) ? "failed" : rng.chance(0.03) ? "pending" : "confirmed",
        txDigest: txDigest(rng),
        checkpoint,
        gasMist: rng.int(1_500_000, 4_200_000),
        createdAt: daysAgo(rng.int(0, 29), rng),
      });
    }
  });
  ledger.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const vouchers: VoucherCode[] = ledger
    .filter((tx) => tx.kind === "redeem" && tx.rewardId)
    .map((tx) => ({
      id: uid("vch", rng),
      code: voucherCode(rng),
      rewardId: tx.rewardId!,
      tenantId: tx.tenantId,
      membershipId: tx.membershipId,
      txDigest: tx.txDigest,
      status: rng.chance(0.6) ? "used" : "issued",
      issuedAt: tx.createdAt,
    }));

  // API keys ---------------------------------------------------------------------
  const scopesPool: ApiScope[] = ["points:earn", "points:redeem", "balances:read", "campaigns:read", "campaigns:write", "members:read"];
  const apiKeys: ApiKey[] = [];
  liveTenants.forEach((t) => {
    const names = ["POS terminals", "Mobile app backend", "Staging sandbox"];
    names.slice(0, rng.int(1, 3)).forEach((name, idx) => {
      const env = idx === 2 ? "test" : "live";
      apiKeys.push({
        id: uid("key", rng),
        tenantId: t.id,
        name,
        env,
        prefix: `ocp_${env}_${hex(rng, 6)}`,
        scopes: idx === 0 ? ["points:earn", "balances:read"] : scopesPool.filter(() => rng.chance(0.6)),
        status: rng.chance(0.1) ? "revoked" : "active",
        createdAt: daysAgo(rng.int(20, 300), rng),
        lastUsedAt: daysAgo(rng.int(0, 5), rng),
        requests30d: rng.int(1_000, 250_000),
      });
    });
  });

  // Daily stats (aggregate, 120 days) -------------------------------------------
  const stats: DailyStat[] = [];
  const today = new Date();
  tenants.forEach((t, i) => {
    const scale = TENANTS[i].scale;
    if (!scale) return;
    let trend = 1;
    for (let d = 119; d >= 0; d--) {
      const date = new Date(today.getTime() - d * DAY);
      const weekend = [0, 6].includes(date.getDay()) ? 1.35 : 1;
      trend *= rng.float(0.995, 1.012);
      const base = 1_800 * scale * trend * weekend;
      const txCount = Math.round(base * rng.float(0.8, 1.2) / 12);
      const earned = Math.round(base * rng.float(9, 13));
      stats.push({
        date: dateKey(date),
        tenantId: t.id,
        earned,
        redeemed: Math.round(earned * rng.float(0.35, 0.7)),
        txCount,
        revenueVnd: Math.round(earned * rng.float(9_000, 11_000) / t.earnRate),
        newMembers: Math.round(rng.float(2, 30) * scale),
        gasMist: txCount * rng.int(1_800_000, 3_000_000),
        apiCalls: Math.round(txCount * rng.float(3, 6)),
      });
    }
  });

  // Audit trail -------------------------------------------------------------
  const ips = ["14.161.22.", "113.190.4.", "171.244.3.", "42.118.9.", "10.0.12."];
  const audit: AuditEvent[] = Array.from({ length: 220 }, () => {
    const tpl = rng.pick(ACTIONS);
    const tenant = rng.pick(liveTenants);
    const campaign = campaigns.find((c) => c.tenantId === tenant.id);
    return {
      id: uid("aud", rng),
      at: daysAgo(rng.float(0, 45), rng),
      actorType: tpl.actor,
      actorName:
        tpl.actor === "admin"
          ? rng.pick(["KhanhMND", "Ops On-call"])
          : tpl.actor === "merchant"
            ? `owner@${tenant.contactEmail.split("@")[1]}`
            : tpl.actor === "api_key"
              ? `ocp_live_${hex(rng, 6)}`
              : tpl.actor === "mcp_agent"
                ? rng.pick(["support-bot", "claude-agent", "crm-assistant"])
                : "octap-core",
      action: tpl.action,
      tenantId: tpl.action === "auth.failed_login" && rng.chance(0.5) ? undefined : tenant.id,
      severity: tpl.severity,
      summary: tpl.summary
        .replace("{n}", String(rng.int(10, 5000)))
        .replace("{c}", campaign?.name ?? "Campaign"),
      txDigest: tpl.onChain ? txDigest(rng) : undefined,
      ip: `${rng.pick(ips)}${rng.int(2, 254)}`,
      onChain: tpl.onChain,
    };
  }).sort((a, b) => b.at.localeCompare(a.at));

  return {
    version: DB_VERSION,
    staff,
    tenants,
    campaigns,
    rewards,
    endUsers,
    memberships,
    ledger,
    vouchers,
    apiKeys,
    audit,
    stats,
    checkpoint,
  };
}
