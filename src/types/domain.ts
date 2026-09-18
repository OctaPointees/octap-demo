/**
 * Domain model for the OctaP design draft.
 * These shapes mirror what the real OctaP REST/SDK layer is expected to return.
 */

export type ID = string;
export type ISODate = string;

/* ----------------------------------------------------------------------------
 * Identity & access
 * ------------------------------------------------------------------------- */

export type PortalRole = "admin" | "merchant";
export type MerchantRole = "owner" | "manager" | "cashier" | "viewer";

export type SessionUser = {
  id: ID;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: PortalRole;
  /** Only set for merchant users. */
  tenantId?: ID;
  merchantRole?: MerchantRole;
};

export type Session = {
  token: string;
  user: SessionUser;
  expiresAt: ISODate;
};

export type StaffAccount = SessionUser & {
  password: string;
  status: "active" | "invited" | "disabled";
  lastLoginAt?: ISODate;
  createdAt: ISODate;
};

/* ----------------------------------------------------------------------------
 * Tenants (merchants / business partners)
 * ------------------------------------------------------------------------- */

export type TenantStatus = "provisioning" | "active" | "suspended";
export type TenantPlan = "starter" | "growth" | "enterprise";

export type McpTool =
  | "get_balance"
  | "list_campaigns"
  | "create_campaign"
  | "issue_points"
  | "list_rewards"
  | "get_member_history";

export type Tenant = {
  id: ID;
  name: string;
  slug: string;
  industry: string;
  status: TenantStatus;
  plan: TenantPlan;
  contactEmail: string;
  contactPhone: string;
  /** Tenant-isolated point token, e.g. "LTM" for Lotus Mart points. */
  pointSymbol: string;
  pointName: string;
  /** Base earn rate: points granted per 10,000 VND spent. */
  earnRate: number;
  /** Monthly issuance ceiling (points). Guard against runaway minting. */
  monthlyMintCap: number;
  /** Sui object id of the tenant treasury (TreasuryCap wrapper). */
  treasuryObjectId: string;
  packageId: string;
  brandColor: string;
  createdAt: ISODate;
  mcp: { enabled: boolean; tools: Record<McpTool, boolean> };
};

/* ----------------------------------------------------------------------------
 * Campaigns, rewards, members, ledger
 * ------------------------------------------------------------------------- */

export type CampaignType =
  | "multiplier"
  | "spend_threshold"
  | "signup_bonus"
  | "fixed_bonus";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "ended";

export type Campaign = {
  id: ID;
  tenantId: ID;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  /** multiplier: e.g. 2 = double points. */
  multiplier?: number;
  /** spend_threshold: min bill (VND) to trigger the bonus. */
  minSpendVnd?: number;
  /** spend_threshold / signup_bonus / fixed_bonus. */
  bonusPoints?: number;
  /** Points budget for this campaign. */
  budgetPoints: number;
  issuedPoints: number;
  /** Cost of a point for ROI maths (VND). */
  pointCostVnd: number;
  revenueAttributedVnd: number;
  participants: number;
  startAt: ISODate;
  endAt: ISODate;
  createdAt: ISODate;
};

export type RewardStatus =
  | "pending_review"
  | "active"
  | "paused"
  | "rejected"
  | "expired";

export type Reward = {
  id: ID;
  tenantId: ID;
  title: string;
  description: string;
  category: "discount" | "free_item" | "gift" | "experience";
  pointCost: number;
  faceValueVnd: number;
  stock: number;
  redeemedCount: number;
  status: RewardStatus;
  reviewNote?: string;
  expiresAt: ISODate;
  createdAt: ISODate;
};

export type MemberTier = "bronze" | "silver" | "gold" | "platinum";

export type EndUser = {
  id: ID;
  phone: string;
  displayName: string;
  /** zkLogin-derived Sui address. */
  suiAddress: string;
  createdAt: ISODate;
};

export type Membership = {
  id: ID;
  tenantId: ID;
  userId: ID;
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: MemberTier;
  joinedAt: ISODate;
  lastActiveAt: ISODate;
};

/** Membership joined with its end-user, as returned by list endpoints. */
export type Member = Membership & {
  displayName: string;
  phone: string;
  suiAddress: string;
};

export type TxKind = "earn" | "redeem" | "adjust" | "expire";
export type TxChannel = "pos" | "sdk" | "mcp" | "dashboard" | "wallet";
export type TxStatus = "confirmed" | "pending" | "failed";

export type LedgerTx = {
  id: ID;
  tenantId: ID;
  membershipId: ID;
  kind: TxKind;
  /** Signed: positive for earn/adjust+, negative for redeem/expire. */
  points: number;
  amountVnd?: number;
  campaignIds: ID[];
  rewardId?: ID;
  channel: TxChannel;
  status: TxStatus;
  txDigest: string;
  checkpoint: number;
  gasMist: number;
  note?: string;
  createdAt: ISODate;
};

export type VoucherCode = {
  id: ID;
  code: string;
  rewardId: ID;
  tenantId: ID;
  membershipId: ID;
  txDigest: string;
  status: "issued" | "used" | "expired";
  issuedAt: ISODate;
};

/* ----------------------------------------------------------------------------
 * Developer surface
 * ------------------------------------------------------------------------- */

export type ApiScope =
  | "points:earn"
  | "points:redeem"
  | "balances:read"
  | "campaigns:read"
  | "campaigns:write"
  | "members:read";

export type ApiKey = {
  id: ID;
  tenantId: ID;
  name: string;
  env: "live" | "test";
  prefix: string;
  scopes: ApiScope[];
  status: "active" | "revoked";
  createdAt: ISODate;
  lastUsedAt?: ISODate;
  requests30d: number;
};

/* ----------------------------------------------------------------------------
 * Audit & metrics
 * ------------------------------------------------------------------------- */

export type AuditSeverity = "info" | "warning" | "critical";
export type AuditActorType =
  | "admin"
  | "merchant"
  | "api_key"
  | "mcp_agent"
  | "system";

export type AuditEvent = {
  id: ID;
  at: ISODate;
  actorType: AuditActorType;
  actorName: string;
  action: string;
  tenantId?: ID;
  severity: AuditSeverity;
  summary: string;
  txDigest?: string;
  ip: string;
  /** Whether the event was anchored on-chain and verified against Sui. */
  onChain: boolean;
};

export type DailyStat = {
  date: string; // YYYY-MM-DD
  tenantId: ID;
  earned: number;
  redeemed: number;
  txCount: number;
  revenueVnd: number;
  newMembers: number;
  gasMist: number;
  apiCalls: number;
};

/* ----------------------------------------------------------------------------
 * API envelopes
 * ------------------------------------------------------------------------- */

export type Paged<T> = {
  items: T[];
  total: number;
};

export type Range = "7d" | "30d" | "90d";
