import { ArrowDownRight, ArrowUpRight, Warning, type Icon } from "phosphor-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { MemberTier } from "../../types/domain";
import { fmtPercent, toTitle } from "../../utils/format";
import { Sparkline } from "../charts/Sparkline";
import { Button } from "./Button";

/* --------------------------------------------------------------- PageHeader */

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm opacity-65">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* --------------------------------------------------------------------- Card */

export function Card({ title, actions, children, className, bodyClassName }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-box border border-base-300 bg-base-100", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 px-5 pt-4">
          <h2 className="font-semibold">{title}</h2>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------- StatCard */

type StatCardProps = {
  label: string;
  value: ReactNode;
  delta?: number;
  icon?: Icon;
  spark?: number[];
  hint?: ReactNode;
  invertDelta?: boolean;
};

export function StatCard({ label, value, delta, icon: IconCmp, spark, hint, invertDelta }: StatCardProps) {
  const good = delta === undefined ? undefined : invertDelta ? delta <= 0 : delta >= 0;
  return (
    <div className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-100 p-4">
      <div className="flex items-center justify-between text-sm opacity-70">
        <span>{label}</span>
        {IconCmp && <IconCmp size={18} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {spark && spark.length > 1 && <Sparkline values={spark} className="h-8 w-24" />}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-success" : "text-error")}>
            {delta >= 0 ? <ArrowUpRight weight="bold" /> : <ArrowDownRight weight="bold" />}
            {fmtPercent(Math.abs(delta))}
          </span>
        )}
        {hint && <span className="opacity-60">{hint}</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- StatusBadge */

const STATUS_TONE: Record<string, string> = {
  active: "badge-success",
  operational: "badge-success",
  confirmed: "badge-success",
  issued: "badge-success",
  earn: "badge-success",
  approve: "badge-success",
  scheduled: "badge-info",
  provisioning: "badge-info",
  pending: "badge-warning",
  pending_review: "badge-warning",
  invited: "badge-warning",
  paused: "badge-warning",
  degraded: "badge-warning",
  warning: "badge-warning",
  adjust: "badge-warning",
  redeem: "badge-primary",
  info: "badge-info",
  draft: "badge-ghost",
  ended: "badge-ghost",
  used: "badge-ghost",
  expired: "badge-ghost",
  expire: "badge-ghost",
  revoked: "badge-ghost",
  disabled: "badge-ghost",
  suspended: "badge-error",
  rejected: "badge-error",
  failed: "badge-error",
  critical: "badge-error",
  down: "badge-error",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("badge badge-soft badge-sm whitespace-nowrap", STATUS_TONE[status] ?? "badge-neutral", className)}>
      {toTitle(status)}
    </span>
  );
}

/* ------------------------------------------------------------------- States */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-box", className)} />;
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="alert alert-error alert-soft">
      <Warning size={20} />
      <div>
        <div className="font-semibold">Couldn't load this data</div>
        <div className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</div>
      </div>
      {onRetry && (
        <Button className="btn-sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: IconCmp, title, description, action }: { icon?: Icon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      {IconCmp && (
        <div className="mb-2 rounded-full bg-base-200 p-4">
          <IconCmp size={28} className="opacity-60" />
        </div>
      )}
      <div className="font-semibold">{title}</div>
      {description && <p className="max-w-sm text-sm opacity-60">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Horizontal usage bar, e.g. budget used / mint cap. */
export function UsageBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max ? Math.min(1, value / max) : 0;
  const tone = pct > 0.9 ? "progress-error" : pct > 0.7 ? "progress-warning" : "progress-primary";
  return <progress className={cn("progress h-1.5", tone, className)} value={pct * 100} max={100} />;
}

/* --------------------------------------------------------------- TierBadge */

const TIER_BADGE: Record<MemberTier, string> = {
  bronze: "bg-[#b0793f]/15 text-[#8a5a2b]",
  silver: "bg-[#9aa4b1]/20 text-[#5d6673]",
  gold: "bg-[#e0b53f]/20 text-[#8a6a10]",
  platinum: "bg-secondary/15 text-secondary",
};

export function TierBadge({ tier }: { tier: MemberTier }) {
  return <span className={cn("badge badge-sm border-0 font-semibold", TIER_BADGE[tier])}>{toTitle(tier)}</span>;
}
