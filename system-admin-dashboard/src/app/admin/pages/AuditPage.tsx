import { columnHelper } from "../../../components/shared/table";
import { CheckCircle, Cloud, Export, ShieldCheck } from "phosphor-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../../../components/shared/Button";
import { ChainRef, Switch } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { ErrorState, PageHeader, StatusBadge } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { useAudit, useTenants, useVerifyAudit } from "../../../queries/admin";
import type { AuditFilters } from "../../../services/admin.service";
import { fmtDateTime, fmtNumber, fmtRelative, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

type Row = NonNullable<ReturnType<typeof useAudit>["data"]>[number];
const col = columnHelper<Row>();

function VerifyModal({ event, onClose }: { event: Row | null; onClose: () => void }) {
  const verify = useVerifyAudit();
  if (!event) return null;
  const result = verify.data;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="Event details"
      description={event.summary}
      footer={
        event.txDigest && (
          <Button className="btn-primary" disabled={verify.isPending} onClick={() => verify.mutate(event.id, { onError: (e) => notify.error(e) })}>
            {verify.isPending ? <span className="loading loading-spinner loading-sm" /> : <ShieldCheck />}
            {result ? "Re-verify" : "Verify against Sui"}
          </Button>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-xs opacity-60">Action</dt><dd className="font-mono">{event.action}</dd></div>
        <div><dt className="text-xs opacity-60">Severity</dt><dd><StatusBadge status={event.severity} /></dd></div>
        <div><dt className="text-xs opacity-60">Actor</dt><dd>{toTitle(event.actorType)} · {event.actorName}</dd></div>
        <div><dt className="text-xs opacity-60">Source IP</dt><dd className="font-mono">{event.ip}</dd></div>
        <div><dt className="text-xs opacity-60">Tenant</dt><dd>{event.tenantName ?? "Platform"}</dd></div>
        <div><dt className="text-xs opacity-60">Time</dt><dd>{fmtDateTime(event.at)}</dd></div>
        <div className="col-span-2">
          <dt className="text-xs opacity-60">Transaction</dt>
          <dd>{event.txDigest ? <ChainRef value={event.txDigest} /> : <span className="opacity-60">Off-chain event (stored in the OctaP audit log only)</span>}</dd>
        </div>
      </dl>
      {result && (
        <div role="status" className="mt-4 rounded-box border border-success/40 bg-success/10 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold text-success">
            <CheckCircle weight="fill" /> Verified on Sui mainnet
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div><dt className="opacity-60">Checkpoint</dt><dd className="font-mono">{fmtNumber(result.checkpoint)}</dd></div>
            <div><dt className="opacity-60">Epoch</dt><dd className="font-mono">{result.epoch}</dd></div>
            <div className="col-span-2"><dt className="opacity-60">Event type</dt><dd className="font-mono break-all">{result.eventType}</dd></div>
            <div><dt className="opacity-60">Gas sponsor</dt><dd className="font-mono">{result.sponsor}</dd></div>
            <div><dt className="opacity-60">Signatures</dt><dd>{result.signatures} (user zkLogin + sponsor)</dd></div>
          </dl>
        </div>
      )}
    </Modal>
  );
}

export default function AdminAuditPage() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<AuditFilters>({ q: params.get("q") ?? "", severity: "all", actorType: "all", tenantId: "all", onChainOnly: false });
  const { data, isFetching, isLoading, error, refetch } = useAudit(filters);
  const tenants = useTenants().data;
  const [selected, setSelected] = useState<Row | null>(null);

  const set = <K extends keyof AuditFilters>(k: K, v: AuditFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  const columns = useMemo(
    () => [
      col.accessor("at", { header: "When", cell: (c) => <span className="text-xs whitespace-nowrap" title={fmtDateTime(c.getValue())}>{fmtRelative(c.getValue())}</span> }),
      col.accessor("severity", { header: "Severity", cell: (c) => <StatusBadge status={c.getValue()} /> }),
      col.accessor("action", { header: "Action", cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
      col.accessor("summary", { header: "Summary", cell: (c) => <span className="line-clamp-1 max-w-md text-sm">{c.getValue()}</span> }),
      col.accessor("actorName", {
        header: "Actor",
        cell: (c) => (
          <div className="text-xs">
            <div>{c.getValue()}</div>
            <div className="opacity-50">{toTitle(c.row.original.actorType)}</div>
          </div>
        ),
      }),
      col.accessor("tenantName", { header: "Tenant", cell: (c) => <span className="text-xs">{c.getValue() ?? "—"}</span> }),
      col.accessor("onChain", {
        header: "Ledger",
        cell: (c) => (c.getValue() ? <span className="badge badge-success badge-soft badge-sm gap-1"><CheckCircle weight="fill" /> On-chain</span> : <span className="badge badge-ghost badge-sm gap-1"><Cloud /> Off-chain</span>),
      }),
    ],
    [],
  );

  const exportCsv = () => {
    if (!data) return;
    const header = ["at", "severity", "action", "actorType", "actorName", "tenant", "summary", "txDigest", "ip"];
    const lines = data.map((a) => [a.at, a.severity, a.action, a.actorType, a.actorName, a.tenantName ?? "", a.summary, a.txDigest ?? "", a.ip].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `octap-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="System Audit"
        description="Immutable trail of privileged actions. Point mints/burns and tenant lifecycle changes are anchored on Sui and can be independently verified."
        actions={
          <Button className="btn-ghost" onClick={exportCsv} disabled={!data?.length}>
            <Export /> Export CSV
          </Button>
        }
      />
      {error && <ErrorState error={error} onRetry={refetch} />}

      <div className="flex flex-wrap items-center gap-2 rounded-box bg-base-100 p-3">
        <label className="input input-sm w-full sm:w-72">
          <input
            placeholder="Search summary, action, actor, digest…"
            value={filters.q}
            onChange={(e) => {
              set("q", e.target.value);
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
            }}
          />
          {isFetching && <span className="loading loading-spinner loading-xs" />}
        </label>
        <div className="w-40">
          <Select size="sm" value={filters.severity ?? "all"} onValueChange={(v) => set("severity", v)} options={[{ label: "All severities", value: "all" }, { label: "Info", value: "info" }, { label: "Warning", value: "warning" }, { label: "Critical", value: "critical" }]} />
        </div>
        <div className="w-40">
          <Select
            size="sm"
            value={filters.actorType ?? "all"}
            onValueChange={(v) => set("actorType", v)}
            options={[{ label: "All actors", value: "all" }, ...(["admin", "merchant", "api_key", "mcp_agent", "system"] as const).map((a) => ({ label: toTitle(a), value: a }))]}
          />
        </div>
        <div className="w-48">
          <Select size="sm" value={filters.tenantId ?? "all"} onValueChange={(v) => set("tenantId", v)} options={[{ label: "All tenants", value: "all" }, ...(tenants ?? []).map((t) => ({ label: t.name, value: t.id }))]} />
        </div>
        <div className="ml-auto">
          <Switch checked={!!filters.onChainOnly} onCheckedChange={(c) => set("onChainOnly", c)} label="On-chain only" />
        </div>
      </div>

      <DataTable data={data} columns={columns} loading={isLoading} pageSize={15} onRowClick={setSelected} dense />
      <VerifyModal key={selected?.id} event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
