import { Form } from "@base-ui/react/form";
import { Menu } from "@base-ui/react/menu";
import { DotsThreeVertical, Megaphone, Plus } from "phosphor-react";
import { useMemo, useState } from "react";
import { Button } from "../../../components/shared/Button";
import { FormField, Segmented, Switch, TextInput } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { EmptyState, ErrorState, PageHeader, StatCard, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { ConfirmDialog, Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { columnHelper } from "../../../components/shared/table";
import { useCampaigns, useDeleteCampaign, useMerchantTenant, useSaveCampaign, useSetCampaignStatus } from "../../../queries/merchant";
import { useSession } from "../../../queries/useSession";
import type { CampaignInput } from "../../../services/merchant.service";
import { hasMerchantRole } from "../../../services/session";
import type { CampaignType } from "../../../types/domain";
import { cn } from "../../../utils/cn";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtCompact, fmtCompactVnd, fmtDate, fmtNumber, fmtPercent, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

type Row = NonNullable<ReturnType<typeof useCampaigns>["data"]>[number];
const col = columnHelper<Row>();

const TYPE_INFO: Record<CampaignType, string> = {
  multiplier: "Multiply base points on every purchase",
  spend_threshold: "Bonus points when a bill exceeds a threshold",
  signup_bonus: "One-time bonus when a member joins",
  fixed_bonus: "Flat bonus on every transaction",
};

const toInputDate = (iso: string) => iso.slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

function blank(): CampaignInput {
  return { name: "", description: "", type: "multiplier", multiplier: 2, minSpendVnd: 500_000, bonusPoints: 50, budgetPoints: 100_000, pointCostVnd: 100, startAt: today(), endAt: inDays(30), publish: true };
}

function CampaignModal({ campaign, open, onOpenChange }: { campaign: Row | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState<CampaignInput>(() =>
    campaign
      ? {
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          multiplier: campaign.multiplier ?? 2,
          minSpendVnd: campaign.minSpendVnd ?? 500_000,
          bonusPoints: campaign.bonusPoints ?? 50,
          budgetPoints: campaign.budgetPoints,
          pointCostVnd: campaign.pointCostVnd,
          startAt: toInputDate(campaign.startAt),
          endAt: toInputDate(campaign.endAt),
          publish: campaign.status !== "draft",
        }
      : blank(),
  );
  const save = useSaveCampaign();
  const errors = fieldErrorsOf(save.error);
  const set = <K extends keyof CampaignInput>(k: K, v: CampaignInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const costVnd = form.budgetPoints * form.pointCostVnd;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={campaign ? `Edit “${campaign.name}”` : "New campaign"}
      description="Campaign rules are evaluated by the OctaP rule engine at earn time and capped by the budget."
      size="lg"
      footer={
        <>
          <Button className="btn-ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="campaign-form" className="btn-primary" disabled={save.isPending}>
            {save.isPending && <span className="loading loading-spinner loading-sm" />}
            {campaign ? "Save changes" : form.publish ? "Create & publish" : "Save draft"}
          </Button>
        </>
      }
    >
      <Form
        id="campaign-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(
            { id: campaign?.id, input: form },
            {
              onSuccess: (c) => {
                notify.success(campaign ? "Campaign updated" : "Campaign created", `Status: ${toTitle(c.status)}`);
                onOpenChange(false);
              },
              onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err),
            },
          );
        }}
      >
        <FormField label="Name" error={errors.name} className="sm:col-span-2">
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} placeholder="e.g. Double Points Weekend" />
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <textarea className="textarea w-full" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>

        <FormField label="Mechanic" hint={TYPE_INFO[form.type]}>
          <Select<CampaignType>
            value={form.type}
            onValueChange={(v) => set("type", v)}
            options={(Object.keys(TYPE_INFO) as CampaignType[]).map((t) => ({ label: toTitle(t), value: t }))}
          />
        </FormField>
        {form.type === "multiplier" ? (
          <FormField label="Multiplier" error={errors.multiplier} hint="e.g. 2 = double points">
            <TextInput type="number" step={0.1} value={form.multiplier} onChange={(e) => set("multiplier", Number(e.target.value))} invalid={!!errors.multiplier} />
          </FormField>
        ) : (
          <FormField label="Bonus points" error={errors.bonusPoints}>
            <TextInput type="number" value={form.bonusPoints} onChange={(e) => set("bonusPoints", Number(e.target.value))} invalid={!!errors.bonusPoints} />
          </FormField>
        )}
        {form.type === "spend_threshold" && (
          <FormField label="Minimum bill (VND)" error={errors.minSpendVnd}>
            <TextInput type="number" step={10_000} value={form.minSpendVnd} onChange={(e) => set("minSpendVnd", Number(e.target.value))} invalid={!!errors.minSpendVnd} />
          </FormField>
        )}

        <div className="divider my-0 text-xs opacity-60 sm:col-span-2">Budget & schedule</div>

        <FormField label="Points budget" error={errors.budgetPoints}>
          <TextInput type="number" step={1000} value={form.budgetPoints} onChange={(e) => set("budgetPoints", Number(e.target.value))} invalid={!!errors.budgetPoints} />
        </FormField>
        <FormField label="Cost per point (VND)" error={errors.pointCostVnd} hint={`Max campaign cost ≈ ${fmtCompactVnd(costVnd)}`}>
          <TextInput type="number" value={form.pointCostVnd} onChange={(e) => set("pointCostVnd", Number(e.target.value))} invalid={!!errors.pointCostVnd} />
        </FormField>
        <FormField label="Starts" error={errors.startAt}>
          <TextInput type="date" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} invalid={!!errors.startAt} />
        </FormField>
        <FormField label="Ends" error={errors.endAt}>
          <TextInput type="date" value={form.endAt} onChange={(e) => set("endAt", e.target.value)} invalid={!!errors.endAt} />
        </FormField>
        {(!campaign || campaign.status === "draft") && (
          <div className="rounded-box bg-base-200 p-3 sm:col-span-2">
            <Switch checked={form.publish} onCheckedChange={(c) => set("publish", c)} label="Publish immediately" description="Off saves a draft. Future start dates are scheduled automatically." />
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default function CampaignsPage() {
  const { data, isLoading, error, refetch } = useCampaigns();
  const tenant = useMerchantTenant().data;
  const canEdit = hasMerchantRole(useSession()?.user.merchantRole, "manager");
  const [filter, setFilter] = useState<"all" | "active" | "scheduled" | "draft" | "ended">("all");
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [confirm, setConfirm] = useState<{ row: Row; action: "end" | "delete" } | null>(null);
  const setStatus = useSetCampaignStatus();
  const del = useDeleteCampaign();

  const rows = useMemo(() => data?.filter((c) => filter === "all" || c.status === filter || (filter === "active" && c.status === "paused")), [data, filter]);
  const totals = useMemo(() => {
    const live = data?.filter((c) => c.status === "active") ?? [];
    const issued = live.reduce((s, c) => s + c.issuedPoints, 0);
    const revenue = live.reduce((s, c) => s + c.revenueAttributedVnd, 0);
    const cost = live.reduce((s, c) => s + c.issuedPoints * c.pointCostVnd, 0);
    return { live: live.length, issued, revenue, roi: cost ? (revenue - cost) / cost : 0 };
  }, [data]);

  const act = (row: Row, status: "active" | "paused" | "ended") =>
    setStatus.mutate({ id: row.id, status }, { onSuccess: () => notify.success(`Campaign ${status === "active" ? "resumed" : status}`), onError: (e) => notify.error(e) });

  const columns = [
    col.accessor("name", {
      header: "Campaign",
      cell: (c) => (
        <div>
          <div className="font-medium">{c.getValue()}</div>
          <div className="text-xs opacity-60">
            {toTitle(c.row.original.type)}
            {c.row.original.multiplier && ` · ${c.row.original.multiplier}×`}
            {c.row.original.bonusPoints && ` · +${c.row.original.bonusPoints} pts`}
            {c.row.original.minSpendVnd && ` over ${fmtCompactVnd(c.row.original.minSpendVnd)}`}
          </div>
        </div>
      ),
    }),
    col.accessor("status", { header: "Status", cell: (c) => <StatusBadge status={c.getValue()} /> }),
    col.accessor((r) => r.issuedPoints / r.budgetPoints, {
      id: "budget",
      header: "Budget",
      cell: (c) => (
        <div className="w-36">
          <UsageBar value={c.row.original.issuedPoints} max={c.row.original.budgetPoints} />
          <div className="text-xs opacity-60">{fmtCompact(c.row.original.issuedPoints)} / {fmtCompact(c.row.original.budgetPoints)}</div>
        </div>
      ),
    }),
    col.accessor("participants", { header: "Participants", cell: (c) => fmtNumber(c.getValue()) }),
    col.accessor("revenueAttributedVnd", { header: "Revenue", cell: (c) => fmtCompactVnd(c.getValue()) }),
    col.accessor("roi", { header: "ROI", cell: (c) => (c.row.original.issuedPoints ? <span className={cn("font-semibold", c.getValue() >= 0 ? "text-success" : "text-error")}>{fmtPercent(c.getValue(), 0)}</span> : "—") }),
    col.accessor("startAt", { header: "Window", cell: (c) => <span className="text-xs whitespace-nowrap">{fmtDate(c.getValue())} → {fmtDate(c.row.original.endAt)}</span> }),
    col.display({
      id: "actions",
      header: "",
      cell: (c) => {
        const r = c.row.original;
        if (!canEdit || r.status === "ended") return null;
        return (
          <Menu.Root>
            <Menu.Trigger className="btn btn-ghost btn-sm btn-square" aria-label="Campaign actions" onClick={(e) => e.stopPropagation()}>
              <DotsThreeVertical size={18} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={4} className="z-50">
                <Menu.Popup className="min-w-40 rounded-box border border-base-300 bg-base-100 p-1 text-sm shadow-lg">
                  {[
                    { label: "Edit", onClick: () => setEditing(r), show: true },
                    { label: "Pause", onClick: () => act(r, "paused"), show: r.status === "active" },
                    { label: "Resume", onClick: () => act(r, "active"), show: r.status === "paused" },
                    { label: "End now", onClick: () => setConfirm({ row: r, action: "end" }), show: r.status !== "draft", danger: true },
                    { label: "Delete draft", onClick: () => setConfirm({ row: r, action: "delete" }), show: r.status === "draft", danger: true },
                  ]
                    .filter((i) => i.show)
                    .map((i) => (
                      <Menu.Item key={i.label} onClick={i.onClick} className={cn("cursor-pointer rounded-field px-3 py-2 outline-none data-highlighted:bg-base-200", i.danger && "text-error")}>
                        {i.label}
                      </Menu.Item>
                    ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        );
      },
    }),
  ];

  return (
    <>
      <PageHeader
        title="Campaigns"
        description={`Configure earn rules and budgets for ${tenant?.pointName ?? "your points"}. ROI = (attributed revenue − points cost) ÷ points cost.`}
        actions={
          canEdit && (
            <Button className="btn-primary" onClick={() => setEditing("new")}>
              <Plus /> New campaign
            </Button>
          )
        }
      />
      {!canEdit && <div className="alert alert-info alert-soft text-sm">You have read-only access. Ask a manager or owner to change campaigns.</div>}
      {error && <ErrorState error={error} onRetry={refetch} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live campaigns" value={totals.live} />
        <StatCard label="Points issued by live campaigns" value={fmtCompact(totals.issued)} />
        <StatCard label="Attributed revenue" value={fmtCompactVnd(totals.revenue)} />
        <StatCard label="Blended ROI" value={fmtPercent(totals.roi, 0)} />
      </div>

      <DataTable
        data={rows}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Search campaigns…"
        onRowClick={canEdit ? (r) => r.status !== "ended" && setEditing(r) : undefined}
        toolbar={
          <Segmented
            value={filter}
            onValueChange={setFilter}
            options={[
              { label: "All", value: "all" },
              { label: "Running", value: "active" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Drafts", value: "draft" },
              { label: "Ended", value: "ended" },
            ]}
          />
        }
        empty={<EmptyState icon={Megaphone} title="No campaigns" description="Create a campaign to reward customers with bonus points." />}
      />

      {editing && <CampaignModal key={editing === "new" ? "new" : editing.id} campaign={editing === "new" ? null : editing} open onOpenChange={(o) => !o && setEditing(null)} />}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.action === "delete" ? "Delete draft?" : "End campaign now?"}
        description={confirm?.action === "delete" ? `“${confirm.row.name}” will be permanently removed.` : `“${confirm?.row.name}” will stop awarding bonus points immediately. This cannot be undone.`}
        confirmLabel={confirm?.action === "delete" ? "Delete" : "End campaign"}
        tone="error"
        loading={setStatus.isPending || del.isPending}
        onConfirm={() => {
          if (!confirm) return;
          const done = { onSuccess: () => { notify.success(confirm.action === "delete" ? "Draft deleted" : "Campaign ended"); setConfirm(null); }, onError: (e: unknown) => notify.error(e) };
          if (confirm.action === "delete") del.mutate(confirm.row.id, done);
          else setStatus.mutate({ id: confirm.row.id, status: "ended" }, done);
        }}
      />
    </>
  );
}
