import { Tabs } from "@base-ui/react/tabs";
import { ArrowLeft, CheckCircle, Pause, PencilSimple, Play, RocketLaunch } from "phosphor-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { AreaChart } from "../../../components/charts/Charts";
import { dayLabel } from "../../../components/charts/chartUtils";
import { Button } from "../../../components/shared/Button";
import { ChainRef, FormField, TextInput } from "../../../components/shared/Controls";
import { Card, ErrorState, LoadingBlock, StatCard, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { ConfirmDialog, Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { useProvisionTenant, useSetTenantStatus, useTenant, useUpdateTenant } from "../../../queries/admin";
import type { TenantRow } from "../../../services/admin.service";
import type { TenantPlan } from "../../../types/domain";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtCompact, fmtCompactVnd, fmtDate, fmtNumber, fmtRelative, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const tabClass =
  "cursor-pointer border-b-2 border-transparent px-1 pb-2 text-sm font-medium whitespace-nowrap opacity-60 outline-none hover:opacity-100 data-active:border-primary data-active:opacity-100";

function EditLimitsModal({ tenant, open, onOpenChange }: { tenant: TenantRow; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [plan, setPlan] = useState<TenantPlan>(tenant.plan);
  const [cap, setCap] = useState(tenant.monthlyMintCap);
  const update = useUpdateTenant();
  const errors = fieldErrorsOf(update.error);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Plan & issuance limits"
      description="The monthly mint cap is enforced by the tenant's Move treasury; mint requests beyond it are rejected."
      footer={
        <Button
          className="btn-primary"
          disabled={update.isPending}
          onClick={() =>
            update.mutate(
              { id: tenant.id, patch: { plan, monthlyMintCap: cap } },
              {
                onSuccess: () => {
                  notify.success("Limits updated");
                  onOpenChange(false);
                },
              },
            )
          }
        >
          {update.isPending && <span className="loading loading-spinner loading-sm" />}
          Save changes
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Plan">
          <Select<TenantPlan> value={plan} onValueChange={setPlan} options={(["starter", "growth", "enterprise"] as const).map((p) => ({ label: toTitle(p), value: p }))} />
        </FormField>
        <FormField label="Monthly mint cap (points)" error={errors.monthlyMintCap} hint={`Minted this month: ${fmtNumber(tenant.mtdMinted)}`}>
          <TextInput type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} invalid={!!errors.monthlyMintCap} />
        </FormField>
      </div>
    </Modal>
  );
}

export default function PartnerDetailPage() {
  const { id = "" } = useParams();
  const { data, isLoading, error, refetch } = useTenant(id);
  const provision = useProvisionTenant();
  const setStatus = useSetTenantStatus();
  const [statusDialog, setStatusDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <LoadingBlock rows={4} />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const { tenant, kpis, series } = data;
  const suspending = tenant.status === "active";
  const reasonError = fieldErrorsOf(setStatus.error).reason;

  return (
    <>
      <Link to="/admin/partners" className="btn btn-ghost btn-sm w-fit gap-1">
        <ArrowLeft /> Partners
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-box text-lg font-bold text-white" style={{ background: tenant.brandColor }}>
            {tenant.pointSymbol.slice(0, 2)}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {tenant.name} <StatusBadge status={tenant.status} />
            </h1>
            <p className="text-sm opacity-65">
              {tenant.industry} · {toTitle(tenant.plan)} plan · {tenant.pointName} ({tenant.pointSymbol}) · since {fmtDate(tenant.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="btn-ghost" onClick={() => setEditOpen(true)}>
            <PencilSimple /> Limits
          </Button>
          {tenant.status === "provisioning" ? (
            <Button
              className="btn-primary"
              disabled={provision.isPending}
              onClick={() =>
                provision.mutate(tenant.id, {
                  onSuccess: (r) => notify.success("Tenant is live", `Package published in tx ${r.txDigest.slice(0, 10)}…`),
                  onError: (e) => notify.error(e),
                })
              }
            >
              {provision.isPending ? <span className="loading loading-spinner loading-sm" /> : <RocketLaunch />}
              Publish to Sui & activate
            </Button>
          ) : (
            <Button className={suspending ? "btn-error btn-soft" : "btn-success btn-soft"} onClick={() => setStatusDialog(true)}>
              {suspending ? <Pause /> : <Play />} {suspending ? "Suspend" : "Reinstate"}
            </Button>
          )}
        </div>
      </div>

      {tenant.status === "provisioning" && (
        <ul className="steps steps-vertical rounded-box bg-base-100 p-4 sm:steps-horizontal">
          <li className="step step-primary">Tenant record created</li>
          <li className="step step-primary">Owner invited</li>
          <li className="step">Publish Move package</li>
          <li className="step">Mint treasury capability</li>
        </ul>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Issued (30d)" value={fmtCompact(kpis.earned.value)} delta={kpis.earned.delta} spark={series.map((p) => p.earned)} />
        <StatCard label="Redeemed (30d)" value={fmtCompact(kpis.redeemed.value)} delta={kpis.redeemed.delta} spark={series.map((p) => p.redeemed)} />
        <StatCard label="GMV (30d)" value={fmtCompactVnd(kpis.revenueVnd.value)} delta={kpis.revenueVnd.delta} />
        <div className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-100 p-4">
          <div className="text-sm opacity-70">Mint cap this month</div>
          <div className="text-2xl font-bold">{fmtCompact(tenant.mtdMinted)}</div>
          <UsageBar value={tenant.mtdMinted} max={tenant.monthlyMintCap} />
          <div className="text-xs opacity-60">of {fmtCompact(tenant.monthlyMintCap)} points</div>
        </div>
      </div>

      <Tabs.Root defaultValue="overview" className="flex flex-col gap-4">
        <Tabs.List className="flex gap-6 overflow-x-auto border-b border-base-300">
          {["overview", "campaigns", "rewards", "access", "audit"].map((t) => (
            <Tabs.Tab key={t} value={t} className={tabClass}>
              {t === "access" ? "Team & API keys" : toTitle(t)}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview" className="grid gap-4 xl:grid-cols-3">
          <Card title="Activity (30 days)" className="xl:col-span-2">
            <AreaChart labels={series.map((p) => dayLabel(p.date))} series={[{ key: "e", label: "Issued", values: series.map((p) => p.earned) }, { key: "r", label: "Redeemed", values: series.map((p) => p.redeemed) }]} height={220} />
          </Card>
          <Card title="On-chain footprint">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs opacity-60">Move package</dt>
                <dd><ChainRef value={tenant.packageId} kind="object" /></dd>
              </div>
              <div>
                <dt className="text-xs opacity-60">Treasury object</dt>
                <dd><ChainRef value={tenant.treasuryObjectId} kind="object" /></dd>
              </div>
              <div>
                <dt className="text-xs opacity-60">Base earn rate</dt>
                <dd>{tenant.earnRate} {tenant.pointSymbol} / 10,000 ₫</dd>
              </div>
              <div>
                <dt className="text-xs opacity-60">MCP server</dt>
                <dd>{tenant.mcp.enabled ? `Enabled · ${Object.values(tenant.mcp.tools).filter(Boolean).length} tools allowed` : "Disabled"}</dd>
              </div>
              <div>
                <dt className="text-xs opacity-60">Contact</dt>
                <dd>{tenant.contactEmail} · {tenant.contactPhone}</dd>
              </div>
            </dl>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="campaigns">
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-sm">
              <thead><tr><th>Campaign</th><th>Type</th><th>Status</th><th>Budget used</th><th>Window</th></tr></thead>
              <tbody>
                {data.campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td>{toTitle(c.type)}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="w-48"><UsageBar value={c.issuedPoints} max={c.budgetPoints} /><div className="text-xs opacity-60">{fmtCompact(c.issuedPoints)} / {fmtCompact(c.budgetPoints)}</div></td>
                    <td className="text-xs">{fmtDate(c.startAt)} → {fmtDate(c.endAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="rewards">
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-sm">
              <thead><tr><th>Reward</th><th>Cost</th><th>Stock</th><th>Status</th><th>Expires</th></tr></thead>
              <tbody>
                {data.rewards.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.title}</td>
                    <td className="font-mono text-xs">{fmtNumber(r.pointCost)} {tenant.pointSymbol}</td>
                    <td>{r.stock - r.redeemedCount} / {r.stock}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-xs">{fmtDate(r.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="access" className="grid gap-4 xl:grid-cols-2">
          <Card title="Dashboard users">
            <ul className="flex flex-col divide-y divide-base-300">
              {data.staff.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2">
                  <img src={s.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.displayName}</div>
                    <div className="truncate text-xs opacity-60">{s.email}</div>
                  </div>
                  <span className="badge badge-ghost badge-sm">{toTitle(s.merchantRole ?? "")}</span>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          </Card>
          <Card title="API keys">
            <ul className="flex flex-col divide-y divide-base-300">
              {data.apiKeys.map((k) => (
                <li key={k.id} className="flex items-center gap-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{k.name}</div>
                    <div className="font-mono text-xs opacity-60">{k.prefix}_••••</div>
                  </div>
                  <span className="text-xs opacity-60">{fmtCompact(k.requests30d)} req/30d</span>
                  <StatusBadge status={k.status} />
                </li>
              ))}
              {data.apiKeys.length === 0 && <li className="py-4 text-center text-sm opacity-60">No API keys issued.</li>}
            </ul>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="audit">
          <Card bodyClassName="p-0">
            <ul className="flex flex-col divide-y divide-base-300">
              {data.audit.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <StatusBadge status={a.severity} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{a.summary}</div>
                    <div className="text-xs opacity-60">
                      <span className="font-mono">{a.action}</span> · {a.actorName} · {fmtRelative(a.at)}
                    </div>
                  </div>
                  {a.onChain && <CheckCircle className="text-success" weight="fill" aria-label="Anchored on-chain" />}
                </li>
              ))}
            </ul>
          </Card>
        </Tabs.Panel>
      </Tabs.Root>

      <ConfirmDialog
        open={statusDialog}
        onOpenChange={(o) => {
          setStatusDialog(o);
          if (!o) {
            setReason("");
            setStatus.reset();
          }
        }}
        title={suspending ? `Suspend ${tenant.name}?` : `Reinstate ${tenant.name}?`}
        description={
          suspending
            ? "All earn and redeem operations for this tenant will be rejected immediately. Member balances are preserved on-chain."
            : "Point issuance and redemption will resume for this tenant."
        }
        confirmLabel={suspending ? "Suspend tenant" : "Reinstate"}
        tone={suspending ? "error" : "primary"}
        loading={setStatus.isPending}
        onConfirm={() =>
          setStatus.mutate(
            { id: tenant.id, status: suspending ? "suspended" : "active", reason },
            {
              onSuccess: () => {
                notify.success(suspending ? "Tenant suspended" : "Tenant reinstated");
                setStatusDialog(false);
                setReason("");
              },
            },
          )
        }
      >
        {suspending && (
          <FormField label="Reason (recorded on-chain)" error={reasonError}>
            <textarea className={`textarea w-full ${reasonError ? "textarea-error" : ""}`} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
        )}
      </ConfirmDialog>

      <EditLimitsModal key={String(editOpen)} tenant={tenant} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
