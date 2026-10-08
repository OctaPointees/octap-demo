import { ArrowRight, Coins, Receipt, Storefront, UsersThree, Vault } from "phosphor-react";
import { useState } from "react";
import { Link } from "react-router";
import { AreaChart, Donut } from "../../../components/charts/Charts";
import { dayLabel } from "../../../components/charts/chartUtils";
import { Segmented } from "../../../components/shared/Controls";
import { Card, ErrorState, LoadingBlock, PageHeader, StatCard, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { useMerchantOverview } from "../../../queries/merchant";
import type { Range } from "../../../types/domain";
import { cn } from "../../../utils/cn";
import { RANGE_OPTIONS } from "../../../utils/constants";
import { fmtCompact, fmtCompactVnd, fmtNumber, fmtPercent, fmtRelative, toTitle } from "../../../utils/format";

const TIER_COLORS = { bronze: "#b0793f", silver: "#9aa4b1", gold: "#e0b53f", platinum: "var(--color-secondary)" };

export default function MerchantDashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const { data, isLoading, error, refetch } = useMerchantOverview(range);

  return (
    <>
      <PageHeader
        title={data ? `${data.tenant.name} loyalty` : "Dashboard"}
        description="Real-time performance of your program. Every point shown here is backed by your tenant treasury on Sui."
        actions={
          <>
            <Segmented value={range} onValueChange={setRange} options={RANGE_OPTIONS} />
            <Link to="/merchant/pos" className="btn btn-primary btn-sm">
              <Storefront /> Issue points
            </Link>
          </>
        }
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      {isLoading && <LoadingBlock rows={3} />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue from members" icon={Storefront} value={fmtCompactVnd(data.kpis.revenueVnd.value)} delta={data.kpis.revenueVnd.delta} spark={data.series.map((p) => p.revenueVnd)} />
            <StatCard label={`${data.tenant.pointSymbol} issued`} icon={Coins} value={fmtCompact(data.kpis.earned.value)} delta={data.kpis.earned.delta} spark={data.series.map((p) => p.earned)} />
            <StatCard label={`${data.tenant.pointSymbol} redeemed`} icon={Receipt} value={fmtCompact(data.kpis.redeemed.value)} delta={data.kpis.redeemed.delta} spark={data.series.map((p) => p.redeemed)} />
            <StatCard label="New members" icon={UsersThree} value={fmtNumber(data.kpis.newMembers.value)} delta={data.kpis.newMembers.delta} spark={data.series.map((p) => p.newMembers)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Points flow" className="xl:col-span-2">
              <AreaChart
                labels={data.series.map((p) => dayLabel(p.date))}
                series={[
                  { key: "earned", label: "Issued", values: data.series.map((p) => p.earned) },
                  { key: "redeemed", label: "Redeemed", values: data.series.map((p) => p.redeemed) },
                ]}
              />
            </Card>
            <Card title="Treasury">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-box bg-primary/10 p-3 text-primary">
                    <Vault size={24} />
                  </div>
                  <div>
                    <div className="text-xs opacity-60">Outstanding points (liability)</div>
                    <div className="text-xl font-bold">
                      {fmtNumber(data.outstandingPoints)} {data.tenant.pointSymbol}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Minted this month</span>
                    <span className="font-mono">
                      {fmtCompact(data.mtdMinted)} / {fmtCompact(data.tenant.monthlyMintCap)}
                    </span>
                  </div>
                  <UsageBar value={data.mtdMinted} max={data.tenant.monthlyMintCap} />
                </div>
                <div className="divider my-0" />
                <div className="text-sm font-medium">Member tier mix</div>
                <Donut size={120} items={Object.entries(data.tiers).map(([k, v]) => ({ label: toTitle(k), value: v, color: TIER_COLORS[k as keyof typeof TIER_COLORS] }))} />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Live campaigns" actions={<Link to="/merchant/campaigns" className="btn btn-ghost btn-xs">Manage <ArrowRight /></Link>}>
              {data.liveCampaigns.length === 0 && <p className="py-6 text-center text-sm opacity-60">No campaigns running right now.</p>}
              <ul className="flex flex-col gap-4">
                {data.liveCampaigns.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className={cn("text-xs font-semibold", c.roi >= 0 ? "text-success" : "text-error")}>ROI {fmtPercent(c.roi, 0)}</span>
                    </div>
                    <UsageBar value={c.issuedPoints} max={c.budgetPoints} />
                    <div className="flex justify-between text-xs opacity-60">
                      <span>{toTitle(c.type)} · {fmtNumber(c.participants)} participants</span>
                      <span>{fmtCompact(c.issuedPoints)} / {fmtCompact(c.budgetPoints)} pts</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Latest transactions" actions={<Link to="/merchant/transactions" className="btn btn-ghost btn-xs">View all <ArrowRight /></Link>}>
              <ul className="flex flex-col divide-y divide-base-300">
                {data.recentTx.map((tx) => (
                  <li key={tx.id} className="flex items-center gap-3 py-2">
                    <StatusBadge status={tx.kind} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{tx.member}</div>
                      <div className="text-xs opacity-60">
                        {tx.channel.toUpperCase()} · {fmtRelative(tx.createdAt)}
                      </div>
                    </div>
                    <span className={cn("font-mono text-sm font-semibold", tx.points > 0 ? "text-success" : "text-primary")}>
                      {tx.points > 0 ? "+" : ""}
                      {fmtNumber(tx.points)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
