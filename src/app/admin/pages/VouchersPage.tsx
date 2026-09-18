import { columnHelper } from "../../../components/shared/table";
import { Check, Ticket, X } from "phosphor-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../../../components/shared/Button";
import { FormField, Segmented } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { EmptyState, ErrorState, PageHeader, StatusBadge } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { useAdminRewards, useReviewReward } from "../../../queries/admin";
import type { RewardStatus } from "../../../types/domain";
import { cn } from "../../../utils/cn";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtDate, fmtNumber, fmtVnd, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

type Row = NonNullable<ReturnType<typeof useAdminRewards>["data"]>[number];
const col = columnHelper<Row>();

function ReviewModal({ reward, decision, onClose }: { reward: Row | null; decision: "approve" | "reject"; onClose: () => void }) {
  const [note, setNote] = useState("");
  const review = useReviewReward();
  const noteError = fieldErrorsOf(review.error).note;
  if (!reward) return null;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={decision === "approve" ? "Approve reward listing" : "Reject reward listing"}
      description={`${reward.tenantName} · ${reward.title}`}
      footer={
        <Button
          className={decision === "approve" ? "btn-success" : "btn-error"}
          disabled={review.isPending}
          onClick={() =>
            review.mutate(
              { id: reward.id, input: { decision, note } },
              {
                onSuccess: () => {
                  notify.success(decision === "approve" ? "Reward approved" : "Reward rejected", `${reward.tenantName} has been notified.`);
                  onClose();
                },
                onError: (e) => !fieldErrorsOf(e).note && notify.error(e),
              },
            )
          }
        >
          {review.isPending && <span className="loading loading-spinner loading-sm" />}
          {decision === "approve" ? "Approve & publish" : "Reject"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3 rounded-box bg-base-200 p-4 text-sm">
          <div><dt className="text-xs opacity-60">Point cost</dt><dd className="font-mono">{fmtNumber(reward.pointCost)} {reward.pointSymbol}</dd></div>
          <div><dt className="text-xs opacity-60">Face value</dt><dd>{fmtVnd(reward.faceValueVnd)}</dd></div>
          <div><dt className="text-xs opacity-60">Stock</dt><dd>{fmtNumber(reward.stock)}</dd></div>
          <div><dt className="text-xs opacity-60">Expires</dt><dd>{fmtDate(reward.expiresAt)}</dd></div>
          <div className="col-span-2"><dt className="text-xs opacity-60">Description</dt><dd>{reward.description}</dd></div>
        </dl>
        <FormField label={decision === "reject" ? "Reason for rejection" : "Note to merchant (optional)"} error={noteError}>
          <textarea className={cn("textarea w-full", noteError && "textarea-error")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Modal>
  );
}

export default function AdminVouchersPage() {
  const [status, setStatus] = useState<RewardStatus | "all">("pending_review");
  const [params] = useSearchParams();
  const focus = params.get("focus");
  const { data, isLoading, error, refetch } = useAdminRewards(focus ? "all" : status);
  const [reviewing, setReviewing] = useState<{ row: Row; decision: "approve" | "reject" } | null>(null);

  const columns = [
    col.accessor("title", {
      header: "Reward",
      cell: (c) => (
        <div className={cn(focus === c.row.original.id && "rounded bg-warning/20 px-1")}>
          <div className="font-medium">{c.getValue()}</div>
          <div className="text-xs opacity-60">{toTitle(c.row.original.category)}</div>
        </div>
      ),
    }),
    col.accessor("tenantName", { header: "Partner" }),
    col.accessor("pointCost", { header: "Cost", cell: (c) => <span className="font-mono text-xs">{fmtNumber(c.getValue())} {c.row.original.pointSymbol}</span> }),
    col.accessor("faceValueVnd", { header: "Face value", cell: (c) => fmtVnd(c.getValue()) }),
    col.accessor((r) => r.faceValueVnd / Math.max(1, r.pointCost), {
      id: "vpp",
      header: "₫ / point",
      cell: (c) => <span className={cn("font-mono text-xs", c.getValue() > 200 && "text-warning font-bold")} title={c.getValue() > 200 ? "Unusually generous — check for mispricing" : undefined}>{c.getValue().toFixed(0)}</span>,
    }),
    col.accessor("stock", { header: "Stock", cell: (c) => `${fmtNumber(c.getValue() - c.row.original.redeemedCount)} / ${fmtNumber(c.getValue())}` }),
    col.accessor("status", { header: "Status", cell: (c) => <StatusBadge status={c.getValue()} /> }),
    col.display({
      id: "actions",
      header: "",
      cell: (c) =>
        c.row.original.status === "pending_review" ? (
          <div className="flex justify-end gap-1">
            <Button className="btn-success btn-soft btn-xs" onClick={() => setReviewing({ row: c.row.original, decision: "approve" })}>
              <Check /> Approve
            </Button>
            <Button className="btn-error btn-soft btn-xs" onClick={() => setReviewing({ row: c.row.original, decision: "reject" })}>
              <X /> Reject
            </Button>
          </div>
        ) : (
          c.row.original.reviewNote && <span className="text-xs italic opacity-60">“{c.row.original.reviewNote}”</span>
        ),
    }),
  ];

  return (
    <>
      <PageHeader
        title="Vouchers"
        description="Every reward a merchant lists goes through compliance review before members can redeem it. Rewards are redeemable only with the issuing merchant's points (LI-1) and never convert to cash (LI-2)."
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Search rewards or partners…"
        toolbar={
          <Segmented
            value={focus ? "all" : status}
            onValueChange={setStatus}
            options={[
              { label: "Pending review", value: "pending_review" },
              { label: "Active", value: "active" },
              { label: "Rejected", value: "rejected" },
              { label: "All", value: "all" },
            ]}
          />
        }
        empty={<EmptyState icon={Ticket} title="Queue is clear" description="No reward listings match this filter." />}
      />
      <ReviewModal key={reviewing?.row.id} reward={reviewing?.row ?? null} decision={reviewing?.decision ?? "approve"} onClose={() => setReviewing(null)} />
    </>
  );
}
