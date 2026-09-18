import { columnHelper } from "../../../components/shared/table";
import { Cube, Lightning, Activity, Timer } from "phosphor-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { BarChart, Donut } from "../../../components/charts/Charts";
import { dayLabel } from "../../../components/charts/chartUtils";
import { Segmented } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { Card, ErrorState, LoadingBlock, PageHeader, StatCard, StatusBadge } from "../../../components/shared/Display";
import { useAdminMetrics } from "../../../queries/admin";
import type { Range } from "../../../types/domain";
import { RANGE_OPTIONS } from "../../../utils/constants";
import { fmtCompact, fmtCompactVnd, fmtNumber, fmtPercent, fmtSui, toTitle } from "../../../utils/format";

type Row = NonNullable<ReturnType<typeof useAdminMetrics>["data"]>["byTenant"][number];
const col = columnHelper<Row>();

const columns = [
  col.accessor("name", {
    header: "Partner",
    cell: (c) => (
      <span className="flex items-center gap-2 font-medium">
        <span className="size-2.5 rounded-full" style={{ background: c.row.original.color }} />
        {c.getValue()}
      </span>
    ),
  }),
  col.accessor("txCount", { header: "Tx", cell: (c) => fmtNumber(c.getValue()) }),
  col.accessor("apiCalls", { header: "API calls", cell: (c) => fmtCompact(c.getValue()) }),
  col.accessor("earned", { header: "Issued", cell: (c) => fmtCompact(c.getValue()) }),
  col.accessor("redeemed", { header: "Redeemed", cell: (c) => fmtCompact(c.getValue()) }),
  col.display({
    id: "burn",
    header: "Redemption rate",
    cell: (c) => fmtPercent(c.row.original.redeemed / Math.max(1, c.row.original.earned)),
  }),
  col.accessor("revenueVnd", { header: "GMV", cell: (c) => fmtCompactVnd(c.getValue()) }),
  col.accessor("gasMist", { header: "Gas sponsored", cell: (c) => <span className="font-mono text-xs">{fmtSui(c.getValue())}</span> }),
];

export default function AdminMetricsPage() {
  const [range, setRange] = useState<Range>("30d");
  const { data, isLoading, error, refetch } = useAdminMetrics(range);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Metrics"
        description="Throughput, infrastructure health and per-tenant consumption of the OctaP platform."
        actions={<Segmented value={range} onValueChange={setRange} options={RANGE_OPTIONS} />}
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      {isLoading && <LoadingBlock />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="On-chain transactions" icon={Cube} value={fmtCompact(data.kpis.txCount.value)} delta={data.kpis.txCount.delta} spark={data.series.map((p) => p.txCount)} />
            <StatCard label="API / SDK / MCP calls" icon={Lightning} value={fmtCompact(data.kpis.apiCalls.value)} delta={data.kpis.apiCalls.delta} spark={data.series.map((p) => p.apiCalls)} />
            <StatCard label="Sui throughput" icon={Activity} value={`${data.chain.tps} TPS`} hint={`Epoch ${data.chain.epoch} · checkpoint ${fmtNumber(data.chain.checkpoint)}`} />
            <StatCard label="Tx failure rate" icon={Timer} value={fmtPercent(data.failureRate, 2)} hint="Ledger sample, current range" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Daily volume" className="xl:col-span-2">
              <BarChart
                labels={data.series.map((p) => dayLabel(p.date))}
                stacked={false}
                series={[
                  { key: "tx", label: "On-chain tx", values: data.series.map((p) => p.txCount) },
                  { key: "api", label: "API calls", values: data.series.map((p) => p.apiCalls) },
                ]}
              />
            </Card>
            <Card title="Issuance channels">
              <Donut
                items={Object.entries(data.channels).map(([k, v]) => ({ label: k === "pos" ? "POS" : k === "sdk" ? "SDK" : k === "mcp" ? "MCP agent" : toTitle(k), value: v }))}
                centerValue={fmtCompact(Object.values(data.channels).reduce((s, v) => s + v, 0))}
                centerLabel="transactions"
              />
            </Card>
          </div>

          <Card title="Service health" bodyClassName="p-0 pt-3">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Status</th>
                    <th>p95 latency</th>
                    <th>Uptime (30d)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.health.map((h) => (
                    <tr key={h.name}>
                      <td className="font-medium">{h.name}</td>
                      <td>
                        <StatusBadge status={h.status} />
                      </td>
                      <td className="font-mono text-xs">{h.latencyP95} ms</td>
                      <td className="font-mono text-xs">{fmtPercent(h.uptime, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Consumption by partner">
            <DataTable data={data.byTenant} columns={columns} initialSort={[{ id: "txCount", desc: true }]} onRowClick={(r) => navigate(`/admin/partners/${r.id}`)} dense />
          </Card>
        </>
      )}
    </>
  );
}
