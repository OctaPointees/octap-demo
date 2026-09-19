import { Form } from "@base-ui/react/form";
import { Gift, Info, Plus, Ticket } from "phosphor-react";
import { useState } from "react";
import { Button } from "../../../components/shared/Button";
import { FormField, Segmented, TextInput } from "../../../components/shared/Controls";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, StatusBadge, UsageBar } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { Select } from "../../../components/shared/Select";
import { useCreateReward, useMerchantTenant, useRestockReward, useRewards, useSetRewardStatus } from "../../../queries/merchant";
import { useSession } from "../../../queries/useSession";
import type { RewardInput } from "../../../services/merchant.service";
import { hasMerchantRole } from "../../../services/session";
import type { Reward } from "../../../types/domain";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtDate, fmtNumber, fmtVnd, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const CATEGORIES: Reward["category"][] = ["discount", "free_item", "gift", "experience"];

function NewRewardModal({ open, onOpenChange, symbol }: { open: boolean; onOpenChange: (o: boolean) => void; symbol: string }) {
  const [form, setForm] = useState<RewardInput>(() => ({
    title: "",
    description: "",
    category: "discount",
    pointCost: 500,
    faceValueVnd: 50_000,
    stock: 200,
    expiresAt: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
  }));
  const create = useCreateReward();
  const errors = fieldErrorsOf(create.error);
  const set = <K extends keyof RewardInput>(k: K, v: RewardInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="List a new reward"
      description="Members redeem rewards by burning points with zkLogin consent. New listings are reviewed by OctaP before going live."
      size="lg"
      footer={
        <>
          <Button className="btn-ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="reward-form" className="btn-primary" disabled={create.isPending}>
            {create.isPending && <span className="loading loading-spinner loading-sm" />}
            Submit for review
          </Button>
        </>
      }
    >
      <Form
        id="reward-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(form, {
            onSuccess: () => {
              notify.success("Reward submitted", "OctaP compliance usually reviews listings within 1 business day.");
              onOpenChange(false);
            },
            onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err),
          });
        }}
      >
        <FormField label="Title" error={errors.title} className="sm:col-span-2">
          <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} invalid={!!errors.title} placeholder="e.g. Free signature drink" />
        </FormField>
        <FormField label="Description / terms" className="sm:col-span-2">
          <textarea className="textarea w-full" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <FormField label="Category">
          <Select value={form.category} onValueChange={(v) => set("category", v)} options={CATEGORIES.map((c) => ({ label: toTitle(c), value: c }))} />
        </FormField>
        <FormField label={`Point cost (${symbol})`} error={errors.pointCost}>
          <TextInput type="number" value={form.pointCost} onChange={(e) => set("pointCost", Number(e.target.value))} invalid={!!errors.pointCost} />
        </FormField>
        <FormField label="Face value (VND)" error={errors.faceValueVnd} hint={form.pointCost > 0 ? `≈ ${Math.round(form.faceValueVnd / form.pointCost)} ₫ per point` : undefined}>
          <TextInput type="number" step={1000} value={form.faceValueVnd} onChange={(e) => set("faceValueVnd", Number(e.target.value))} invalid={!!errors.faceValueVnd} />
        </FormField>
        <FormField label="Stock" error={errors.stock}>
          <TextInput type="number" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} invalid={!!errors.stock} />
        </FormField>
        <FormField label="Expires on" error={errors.expiresAt}>
          <TextInput type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} invalid={!!errors.expiresAt} />
        </FormField>
        <div className="alert alert-info alert-soft text-xs sm:col-span-2">
          <Info size={16} /> Rewards can only be redeemed with {symbol} points and cannot be exchanged for cash (LI-1, LI-2).
        </div>
      </Form>
    </Modal>
  );
}

function RestockModal({ reward, onClose }: { reward: Reward; onClose: () => void }) {
  const [add, setAdd] = useState(100);
  const restock = useRestockReward();
  const err = fieldErrorsOf(restock.error).add;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="Restock reward"
      description={reward.title}
      size="sm"
      footer={
        <Button
          className="btn-primary"
          disabled={restock.isPending}
          onClick={() => restock.mutate({ id: reward.id, add }, { onSuccess: () => { notify.success("Stock updated"); onClose(); } })}
        >
          Add stock
        </Button>
      }
    >
      <FormField label="Units to add" error={err} hint={`Currently ${reward.stock - reward.redeemedCount} left of ${reward.stock}`}>
        <TextInput type="number" value={add} onChange={(e) => setAdd(Number(e.target.value))} invalid={!!err} />
      </FormField>
    </Modal>
  );
}

export default function RewardsPage() {
  const { data, isLoading, error, refetch } = useRewards();
  const tenant = useMerchantTenant().data;
  const canEdit = hasMerchantRole(useSession()?.user.merchantRole, "manager");
  const [filter, setFilter] = useState<"all" | "active" | "pending_review" | "inactive">("all");
  const [creating, setCreating] = useState(false);
  const [restocking, setRestocking] = useState<Reward | null>(null);
  const setStatus = useSetRewardStatus();

  const rows = data?.filter((r) =>
    filter === "all" ? true : filter === "inactive" ? ["paused", "expired", "rejected"].includes(r.status) : r.status === filter,
  );

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Digital vouchers your members can redeem with points."
        actions={
          canEdit && (
            <Button className="btn-primary" onClick={() => setCreating(true)}>
              <Plus /> New reward
            </Button>
          )
        }
      />
      <Segmented
        value={filter}
        onValueChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Live", value: "active" },
          { label: "In review", value: "pending_review" },
          { label: "Inactive", value: "inactive" },
        ]}
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      {isLoading && <LoadingBlock rows={2} />}
      {rows && rows.length === 0 && <EmptyState icon={Ticket} title="No rewards here" description="List a reward to give members something to save up for." />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows?.map((r) => {
          const left = r.stock - r.redeemedCount;
          return (
            <article key={r.id} className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-box bg-primary/10 p-2.5 text-primary">
                  <Gift size={22} />
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="line-clamp-2 text-xs opacity-60">{r.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{fmtNumber(r.pointCost)}</span>
                <span className="text-sm opacity-60">{tenant?.pointSymbol}</span>
                <span className="ml-auto text-xs opacity-60">worth {fmtVnd(r.faceValueVnd)}</span>
              </div>
              <div>
                <UsageBar value={r.redeemedCount} max={r.stock} />
                <div className="mt-1 flex justify-between text-xs opacity-60">
                  <span>{fmtNumber(r.redeemedCount)} redeemed</span>
                  <span>{fmtNumber(left)} left</span>
                </div>
              </div>
              {r.reviewNote && <div className="rounded-box bg-base-200 p-2 text-xs italic">OctaP review: “{r.reviewNote}”</div>}
              <div className="mt-auto flex items-center justify-between border-t border-base-300 pt-3 text-xs">
                <span className="opacity-60">Expires {fmtDate(r.expiresAt)}</span>
                {canEdit && (
                  <div className="flex gap-1">
                    {(r.status === "active" || r.status === "paused") && (
                      <Button
                        className="btn-ghost btn-xs"
                        disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: r.id, status: r.status === "active" ? "paused" : "active" }, { onSuccess: (x) => notify.success(`Reward ${x.status === "active" ? "resumed" : "paused"}`), onError: (e) => notify.error(e) })}
                      >
                        {r.status === "active" ? "Pause" : "Resume"}
                      </Button>
                    )}
                    {r.status !== "rejected" && r.status !== "expired" && (
                      <Button className="btn-ghost btn-xs" onClick={() => setRestocking(r)}>
                        Restock
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {creating && <NewRewardModal open onOpenChange={setCreating} symbol={tenant?.pointSymbol ?? "points"} />}
      {restocking && <RestockModal reward={restocking} onClose={() => setRestocking(null)} />}
    </>
  );
}
