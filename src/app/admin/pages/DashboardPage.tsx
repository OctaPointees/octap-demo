import { ArrowRight, Coins, GasPump, Receipt, Storefront, UsersThree, Warning } from "phosphor-react";
import { useState } from "react";
import { Link } from "react-router";
import { AreaChart } from "../../../components/charts/Charts";
import { dayLabel } from "../../../components/charts/chartUtils";
import { Segmented } from "../../../components/shared/Controls";
import { Card, ErrorState, LoadingBlock, PageHeader, StatCard, StatusBadge } from "../../../components/shared/Display";
import { useAdminOverview } from "../../../queries/admin";
import { useSession } from "../../../queries/useSession";
import type { Range } from "../../../types/domain";
import { RANGE_OPTIONS } from "../../../utils/constants";
import { fmtCompact, fmtCompactVnd, fmtNumber, fmtRelative, fmtSui } from "../../../utils/format";

export default function AdminDashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const { data, isLoading, error, refetch } = useAdminOverview(range);
  const user = useSession()?.user;

  return (
    <>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${user?.displayName ?? ""}`}
        description="Platform-wide view of point issuance, redemption and partner health across all OctaP tenants."
        actions={<Segmented value={range} onValueChange={setRange} options={RANGE_OPTIONS} />}
      />

      {error && <ErrorState error={error} onRetry={refetch} />}
      {isLoading && <LoadingBlock rows={3} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Points issued" icon={Coins} value={fmtCompact(data.kpis.earned.value)} delta={data.kpis.earned.delta} spark={data.series.map((p) => p.earned)} hint="vs previous period" />
            <StatCard label="Points redeemed" icon={Receipt} value={fmtCompact(data.kpis.redeemed.value)} delta={data.kpis.redeemed.delta} spark={data.series.map((p) => p.redeemed)} hint="vs previous period" />
            <StatCard label="Partner GMV via loyalty" icon={Storefront} value={fmtCompactVnd(data.kpis.revenueVnd.value)} delta={data.kpis.revenueVnd.delta} spark={data.series.map((p) => p.revenueVnd)} />
            <StatCard label="Sponsored gas" icon={GasPump} value={fmtSui(data.kpis.gasMist.value)} delta={data.kpis.gasMist.delta} invertDelta hint={`${fmtNumber(data.kpis.txCount.value)} on-chain tx`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Issuance vs redemption" className="xl:col-span-2">
              <AreaChart
                labels={data.series.map((p) => dayLabel(p.date))}
                series={[
                  { key: "earned", label: "Issued", values: data.series.map((p) => p.earned) },
                  { key: "redeemed", label: "Redeemed", values: data.series.map((p) => p.redeemed) },
                ]}
              />
            </Card>

            <Card title="Network">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["active", "provisioning", "suspended"] as const).map((s) => (
                    <div key={s} className="rounded-box bg-base-200 p-3">
                      <div className="text-2xl font-bold">{data.tenantsByStatus[s]}</div>
                      <StatusBadge status={s} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-box bg-base-200 p-3">
                  <span className="flex items-center gap-2 text-sm">
                    <UsersThree size={18} /> Memberships
                  </span>
                  <span className="font-bold">{fmtNumber(data.totalMembers)}</span>
                </div>
                <div className="rounded-box bg-base-200 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Enoki sponsor wallet</span>
                    <span className="font-mono font-bold">{fmtSui(data.sponsorWallet.balanceMist)}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    ≈ {Math.round(data.sponsorWallet.balanceMist / Math.max(1, data.sponsorWallet.dailyBurnMist))} days of runway at the current burn rate
                  </div>
                </div>
                {data.pendingRewards > 0 && (
                  <Link to="/admin/vouchers" className="alert alert-warning alert-soft text-sm">
                    <Warning size={18} />
                    <span className="flex-1">{data.pendingRewards} reward listings awaiting review</span>
                    <ArrowRight />
                  </Link>
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Top partners by issuance" actions={<Link to="/admin/partners" className="btn btn-ghost btn-xs">View all</Link>}>
              <ul className="flex flex-col gap-3">
                {data.topTenants.map((t) => {
                  const max = data.topTenants[0].earned || 1;
                  return (
                    <li key={t.id}>
                      <Link to={`/admin/partners/${t.id}`} className="group flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium group-hover:text-primary">
                            <span className="size-2.5 rounded-full" style={{ background: t.color }} />
                            {t.name}
                            <span className="badge badge-ghost badge-xs font-mono">{t.symbol}</span>
                          </span>
                          <span className="font-mono text-xs">{fmtCompact(t.earned)} pts</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-base-200">
                          <div className="h-full rounded-full" style={{ width: `${(t.earned / max) * 100}%`, background: t.color }} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card title="Security & operations alerts" actions={<Link to="/admin/audit" className="btn btn-ghost btn-xs">Open audit</Link>}>
              <ul className="flex flex-col divide-y divide-base-300">
                {data.alerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-2.5 first:pt-0">
                    <StatusBadge status={a.severity} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{a.summary}</div>
                      <div className="text-xs opacity-60">
                        <span className="font-mono">{a.action}</span> · {a.actorName} · {fmtRelative(a.at)}
                      </div>
                    </div>
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
