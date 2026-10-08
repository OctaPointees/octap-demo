import { Form } from "@base-ui/react/form";
import { UserPlus } from "phosphor-react";
import { useState } from "react";
import { Button } from "../../../components/shared/Button";
import { ChainRef, FormField, TextInput } from "../../../components/shared/Controls";
import { Card, ErrorState, LoadingBlock, PageHeader, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { useInviteTeammate, useMerchantTenant, useTeam, useUpdateMerchantTenant, useUpdateTeammate } from "../../../queries/merchant";
import { useSession } from "../../../queries/useSession";
import { hasMerchantRole } from "../../../services/session";
import type { MerchantRole, Tenant } from "../../../types/domain";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtCompact, fmtRelative, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const ROLES: { value: MerchantRole; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Everything, incl. API keys & team" },
  { value: "manager", label: "Manager", description: "Campaigns, rewards, adjustments" },
  { value: "cashier", label: "Cashier", description: "Issue points at checkout" },
  { value: "viewer", label: "Viewer", description: "Read-only analytics" },
];

function ProgramSettings({ tenant, canEdit }: { tenant: Tenant & { mtdMinted: number }; canEdit: boolean }) {
  const [form, setForm] = useState({
    pointName: tenant.pointName,
    earnRate: tenant.earnRate,
    contactEmail: tenant.contactEmail,
    contactPhone: tenant.contactPhone,
    brandColor: tenant.brandColor,
  });
  const update = useUpdateMerchantTenant();
  const errors = fieldErrorsOf(update.error);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card title="Loyalty program">
      <Form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(form, { onSuccess: () => notify.success("Settings saved"), onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err) });
        }}
      >
        <FormField label="Point display name" error={errors.pointName}>
          <TextInput value={form.pointName} disabled={!canEdit} onChange={(e) => set("pointName", e.target.value)} invalid={!!errors.pointName} />
        </FormField>
        <FormField label="Token symbol" hint="Fixed at provisioning (on-chain)">
          <TextInput value={tenant.pointSymbol} disabled className="font-mono" />
        </FormField>
        <FormField label="Base earn rate" error={errors.earnRate} hint="Points per 10,000 ₫ spent">
          <TextInput type="number" value={form.earnRate} disabled={!canEdit} onChange={(e) => set("earnRate", Number(e.target.value))} invalid={!!errors.earnRate} />
        </FormField>
        <FormField label="Brand color">
          <div className="flex items-center gap-2">
            <input type="color" className="size-10 cursor-pointer rounded-field border border-base-300" value={form.brandColor} disabled={!canEdit} onChange={(e) => set("brandColor", e.target.value)} />
            <TextInput value={form.brandColor} disabled={!canEdit} onChange={(e) => set("brandColor", e.target.value)} className="font-mono" />
          </div>
        </FormField>
        <FormField label="Contact email" error={errors.contactEmail}>
          <TextInput type="email" value={form.contactEmail} disabled={!canEdit} onChange={(e) => set("contactEmail", e.target.value)} invalid={!!errors.contactEmail} />
        </FormField>
        <FormField label="Contact phone">
          <TextInput value={form.contactPhone} disabled={!canEdit} onChange={(e) => set("contactPhone", e.target.value)} />
        </FormField>
        {canEdit && (
          <div className="sm:col-span-2">
            <Button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending && <span className="loading loading-spinner loading-sm" />}
              Save settings
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MerchantRole>("cashier");
  const invite = useInviteTeammate();
  const errors = fieldErrorsOf(invite.error);
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="Invite a teammate"
      size="sm"
      footer={
        <Button type="submit" form="invite-form" className="btn-primary" disabled={invite.isPending}>
          {invite.isPending && <span className="loading loading-spinner loading-sm" />}
          Send invite
        </Button>
      }
    >
      <Form
        id="invite-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          invite.mutate({ email, role }, { onSuccess: () => { notify.success("Invitation sent", email); onClose(); } });
        }}
      >
        <FormField label="Email" error={errors.email}>
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} autoFocus />
        </FormField>
        <FormField label="Role" hint={ROLES.find((r) => r.value === role)?.description}>
          <Select value={role} onValueChange={setRole} options={ROLES.map((r) => ({ label: r.label, value: r.value }))} />
        </FormField>
      </Form>
    </Modal>
  );
}

export default function SettingsPage() {
  const session = useSession();
  const isOwner = hasMerchantRole(session?.user.merchantRole, "owner");
  const tenant = useMerchantTenant();
  const team = useTeam();
  const updateMate = useUpdateTeammate();
  const [inviting, setInviting] = useState(false);

  if (tenant.isLoading) return <LoadingBlock rows={3} />;
  if (tenant.error || !tenant.data) return <ErrorState error={tenant.error} onRetry={tenant.refetch} />;
  const t = tenant.data;

  return (
    <>
      <PageHeader title="Settings" description="Program configuration, plan limits and team access." />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProgramSettings key={t.id + t.pointName} tenant={t} canEdit={isOwner} />
        </div>
        <Card title="Plan & limits">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><dt className="opacity-60">Plan</dt><dd className="font-semibold">{toTitle(t.plan)}</dd></div>
            <div>
              <div className="mb-1 flex justify-between"><dt className="opacity-60">Monthly mint cap</dt><dd className="font-mono text-xs">{fmtCompact(t.mtdMinted)} / {fmtCompact(t.monthlyMintCap)}</dd></div>
              <UsageBar value={t.mtdMinted} max={t.monthlyMintCap} />
            </div>
            <div><dt className="text-xs opacity-60">Treasury object</dt><dd><ChainRef value={t.treasuryObjectId} kind="object" /></dd></div>
            <div><dt className="text-xs opacity-60">Move package</dt><dd><ChainRef value={t.packageId} kind="object" /></dd></div>
            <p className="rounded-box bg-base-200 p-3 text-xs opacity-75">Plan and cap changes are handled by OctaP operators to protect against unauthorised minting.</p>
          </dl>
        </Card>
      </div>

      <Card
        title="Team"
        actions={
          isOwner && (
            <Button className="btn-primary btn-sm" onClick={() => setInviting(true)}>
              <UserPlus /> Invite
            </Button>
          )
        }
      >
        {team.error && <ErrorState error={team.error} onRetry={team.refetch} />}
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last sign-in</th><th /></tr></thead>
            <tbody>
              {team.data?.map((s) => {
                const self = s.id === session?.user.id;
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={s.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                        <div>
                          <div className="font-medium">{s.displayName} {self && <span className="badge badge-ghost badge-xs">you</span>}</div>
                          <div className="text-xs opacity-60">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="w-44">
                      {isOwner && !self ? (
                        <Select
                          size="sm"
                          value={s.merchantRole ?? "viewer"}
                          onValueChange={(role) => updateMate.mutate({ id: s.id, patch: { merchantRole: role } }, { onSuccess: () => notify.success("Role updated"), onError: (e) => notify.error(e) })}
                          options={ROLES.map((r) => ({ label: r.label, value: r.value }))}
                        />
                      ) : (
                        toTitle(s.merchantRole ?? "")
                      )}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="text-xs">{s.lastLoginAt ? fmtRelative(s.lastLoginAt) : "—"}</td>
                    <td className="text-right">
                      {isOwner && !self && s.status !== "invited" && (
                        <Button
                          className="btn-ghost btn-xs"
                          onClick={() => updateMate.mutate({ id: s.id, patch: { status: s.status === "active" ? "disabled" : "active" } }, { onError: (e) => notify.error(e) })}
                        >
                          {s.status === "active" ? "Disable" : "Enable"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {inviting && <InviteModal onClose={() => setInviting(false)} />}
    </>
  );
}
