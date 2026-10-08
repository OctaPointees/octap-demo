import { Form } from "@base-ui/react/form";
import { columnHelper } from "../../../components/shared/table";
import { Plus, Storefront } from "phosphor-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/shared/Button";
import { FormField, Segmented, TextInput } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { EmptyState, ErrorState, PageHeader, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { useCreateTenant, useTenants } from "../../../queries/admin";
import type { CreateTenantInput, TenantRow } from "../../../services/admin.service";
import type { TenantPlan } from "../../../types/domain";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtCompact, fmtDate, fmtNumber, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const col = columnHelper<TenantRow>();

const columns = [
  col.accessor("name", {
    header: "Partner",
    cell: (c) => (
      <div className="flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-box text-xs font-bold text-white" style={{ background: c.row.original.brandColor }}>
          {c.row.original.pointSymbol.slice(0, 2)}
        </div>
        <div>
          <div className="font-medium">{c.getValue()}</div>
          <div className="text-xs opacity-60">{c.row.original.industry}</div>
        </div>
      </div>
    ),
  }),
  col.accessor("pointSymbol", { header: "Token", cell: (c) => <span className="badge badge-ghost badge-sm font-mono">{c.getValue()}</span> }),
  col.accessor("plan", { header: "Plan", cell: (c) => toTitle(c.getValue()) }),
  col.accessor("status", { header: "Status", cell: (c) => <StatusBadge status={c.getValue()} /> }),
  col.accessor("memberCount", { header: "Members", cell: (c) => fmtNumber(c.getValue()) }),
  col.accessor("activeCampaigns", { header: "Live campaigns" }),
  col.accessor("pointsIssued30d", { header: "Issued (30d)", cell: (c) => fmtCompact(c.getValue()) }),
  col.accessor((r) => r.mtdMinted / r.monthlyMintCap, {
    id: "cap",
    header: "Mint cap (MTD)",
    cell: (c) => (
      <div className="flex w-32 flex-col gap-1">
        <UsageBar value={c.row.original.mtdMinted} max={c.row.original.monthlyMintCap} />
        <span className="text-xs opacity-60">
          {fmtCompact(c.row.original.mtdMinted)} / {fmtCompact(c.row.original.monthlyMintCap)}
        </span>
      </div>
    ),
  }),
  col.accessor("createdAt", { header: "Since", cell: (c) => <span className="text-xs">{fmtDate(c.getValue())}</span> }),
];

const EMPTY: CreateTenantInput = {
  name: "",
  industry: "",
  plan: "growth",
  contactEmail: "",
  contactPhone: "",
  pointSymbol: "",
  pointName: "",
  earnRate: 1,
  ownerEmail: "",
};

function OnboardPartnerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState(EMPTY);
  const create = useCreateTenant();
  const navigate = useNavigate();
  const errors = fieldErrorsOf(create.error);
  const set = <K extends keyof CreateTenantInput>(k: K, v: CreateTenantInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      create.reset();
      setForm(EMPTY);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={close}
      title="Onboard a new partner"
      description="Creates an isolated tenant. Its point token and treasury are published to Sui during provisioning."
      size="lg"
      footer={
        <>
          <Button className="btn-ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" form="onboard-form" className="btn-primary" disabled={create.isPending}>
            {create.isPending && <span className="loading loading-spinner loading-sm" />}
            Create tenant
          </Button>
        </>
      }
    >
      <Form
        id="onboard-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(form, {
            onSuccess: (t) => {
              notify.success("Tenant created", `${t.name} is provisioning. Owner invite sent to ${form.ownerEmail}.`);
              close(false);
              navigate(`/admin/partners/${t.id}`);
            },
            onError: (e) => {
              if (!Object.keys(fieldErrorsOf(e)).length) notify.error(e);
            },
          });
        }}
      >
        <FormField label="Business name" error={errors.name}>
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} placeholder="e.g. Sunrise Hotels" />
        </FormField>
        <FormField label="Industry" error={errors.industry}>
          <TextInput value={form.industry} onChange={(e) => set("industry", e.target.value)} invalid={!!errors.industry} placeholder="e.g. Hospitality" />
        </FormField>
        <FormField label="Contact email" error={errors.contactEmail}>
          <TextInput type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} invalid={!!errors.contactEmail} />
        </FormField>
        <FormField label="Contact phone">
          <TextInput value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+84 28 …" />
        </FormField>
        <FormField label="Plan" hint="Sets monthly mint cap and MCP access">
          <Select<TenantPlan>
            value={form.plan}
            onValueChange={(v) => set("plan", v)}
            options={[
              { label: "Starter · 400K pts/mo", value: "starter" },
              { label: "Growth · 1.5M pts/mo", value: "growth" },
              { label: "Enterprise · 5M pts/mo", value: "enterprise" },
            ]}
          />
        </FormField>
        <FormField label="Owner email" error={errors.ownerEmail} hint="Receives the dashboard invitation">
          <TextInput type="email" value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} invalid={!!errors.ownerEmail} />
        </FormField>

        <div className="divider col-span-full my-0 text-xs opacity-60">Point token</div>

        <FormField label="Token symbol" error={errors.pointSymbol} hint="3–5 uppercase letters, unique">
          <TextInput value={form.pointSymbol} onChange={(e) => set("pointSymbol", e.target.value.toUpperCase().slice(0, 5))} invalid={!!errors.pointSymbol} className="font-mono" placeholder="SRH" />
        </FormField>
        <FormField label="Point display name" error={errors.pointName}>
          <TextInput value={form.pointName} onChange={(e) => set("pointName", e.target.value)} invalid={!!errors.pointName} placeholder="Sunrise Stars" />
        </FormField>
        <FormField label="Base earn rate" error={errors.earnRate} hint="Points per 10,000 ₫ spent">
          <TextInput type="number" min={1} value={form.earnRate} onChange={(e) => set("earnRate", Number(e.target.value))} invalid={!!errors.earnRate} />
        </FormField>
      </Form>
    </Modal>
  );
}

export default function PartnersPage() {
  const { data, isLoading, error, refetch } = useTenants();
  const [status, setStatus] = useState<"all" | "active" | "provisioning" | "suspended">("all");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const rows = useMemo(() => data?.filter((t) => status === "all" || t.status === status), [data, status]);

  return (
    <>
      <PageHeader
        title="Partners"
        description="Merchant tenants running loyalty programs on OctaP. Each tenant's points are strictly isolated (LI-1)."
        actions={
          <Button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={18} /> Onboard partner
          </Button>
        }
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      <DataTable
        data={rows}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Search partners…"
        onRowClick={(r) => navigate(`/admin/partners/${r.id}`)}
        toolbar={
          <Segmented
            value={status}
            onValueChange={setStatus}
            options={[
              { label: `All (${data?.length ?? 0})`, value: "all" },
              { label: "Active", value: "active" },
              { label: "Provisioning", value: "provisioning" },
              { label: "Suspended", value: "suspended" },
            ]}
          />
        }
        empty={<EmptyState icon={Storefront} title="No partners here" description="Try a different status filter." />}
      />
      <OnboardPartnerModal open={open} onOpenChange={setOpen} />
    </>
  );
}
