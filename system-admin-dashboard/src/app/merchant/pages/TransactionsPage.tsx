import { Receipt } from "phosphor-react";
import { useState } from "react";
import { ChainRef } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { EmptyState, ErrorState, PageHeader, StatusBadge } from "../../../components/shared/Display";
import { Select } from "../../../components/shared/Select";
import { columnHelper } from "../../../components/shared/table";
import { useMerchantTenant, useTransactions } from "../../../queries/merchant";
import type { TxFilters } from "../../../services/merchant.service";
import type { TxChannel, TxKind } from "../../../types/domain";
import { cn } from "../../../utils/cn";
import { fmtDateTime, fmtNumber, fmtSui, fmtVnd } from "../../../utils/format";

type Row = NonNullable<ReturnType<typeof useTransactions>["data"]>[number];
const col = columnHelper<Row>();

const columns = [
  col.accessor("createdAt", { header: "Time", cell: (c) => <span className="text-xs whitespace-nowrap">{fmtDateTime(c.getValue())}</span> }),
  col.accessor("kind", { header: "Type", cell: (c) => <StatusBadge status={c.getValue()} /> }),
  col.accessor("memberName", { header: "Member" }),
  col.accessor("points", {
    header: "Points",
    cell: (c) => (
      <span className={cn("font-mono font-semibold", c.getValue() > 0 ? "text-success" : "text-primary")}>
        {c.getValue() > 0 ? "+" : ""}
        {fmtNumber(c.getValue())}
      </span>
    ),
  }),
  col.display({
    id: "detail",
    header: "Detail",
    cell: (c) => {
      const r = c.row.original;
      return (
        <span className="text-xs opacity-75">
          {r.amountVnd ? `Bill ${fmtVnd(r.amountVnd)}` : r.rewardTitle ?? r.note ?? ""}
          {r.campaignNames.length > 0 && <span className="text-primary"> · {r.campaignNames.join(", ")}</span>}
        </span>
      );
    },
  }),
  col.accessor("channel", { header: "Channel", cell: (c) => <span className="badge badge-ghost badge-sm uppercase">{c.getValue()}</span> }),
  col.accessor("status", { header: "Status", cell: (c) => <StatusBadge status={c.getValue()} /> }),
  col.accessor("txDigest", { header: "Sui tx", enableSorting: false, cell: (c) => <ChainRef value={c.getValue()} /> }),
  col.accessor("gasMist", { header: "Gas", cell: (c) => <span className="font-mono text-xs opacity-60">{fmtSui(c.getValue())}</span> }),
];

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TxFilters>({ kind: "all", channel: "all" });
  const { data, isLoading, error, refetch } = useTransactions(filters);
  const tenant = useMerchantTenant().data;

  return (
    <>
      <PageHeader
        title="Transactions"
        description={`Ledger of every ${tenant?.pointSymbol ?? ""} mint and burn. Each row maps to a sponsored Sui transaction you can verify on a public explorer.`}
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Filter by member or digest…"
        pageSize={15}
        dense
        toolbar={
          <>
            <div className="w-40">
              <Select<TxKind | "all">
                size="sm"
                value={filters.kind ?? "all"}
                onValueChange={(v) => setFilters((f) => ({ ...f, kind: v }))}
                options={[{ label: "All types", value: "all" }, { label: "Earn", value: "earn" }, { label: "Redeem", value: "redeem" }, { label: "Adjust", value: "adjust" }]}
              />
            </div>
            <div className="w-40">
              <Select<TxChannel | "all">
                size="sm"
                value={filters.channel ?? "all"}
                onValueChange={(v) => setFilters((f) => ({ ...f, channel: v }))}
                options={[{ label: "All channels", value: "all" }, { label: "POS", value: "pos" }, { label: "SDK", value: "sdk" }, { label: "MCP", value: "mcp" }, { label: "Dashboard", value: "dashboard" }, { label: "Wallet", value: "wallet" }]}
              />
            </div>
          </>
        }
        empty={<EmptyState icon={Receipt} title="No transactions" description="Nothing matches these filters." />}
      />
    </>
  );
}
