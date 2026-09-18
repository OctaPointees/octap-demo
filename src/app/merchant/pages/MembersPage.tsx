import { Form } from "@base-ui/react/form";
import { UsersThree } from "phosphor-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../../../components/shared/Button";
import { ChainRef, FormField, TextInput } from "../../../components/shared/Controls";
import { DataTable } from "../../../components/shared/DataTable";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, StatusBadge, TierBadge } from "../../../components/shared/Display";
import { Modal } from "../../../components/shared/Modal";
import { columnHelper } from "../../../components/shared/table";
import { useAdjustPoints, useMember, useMembers, useMerchantTenant } from "../../../queries/merchant";
import { useSession } from "../../../queries/useSession";
import { hasMerchantRole } from "../../../services/session";
import type { Member } from "../../../types/domain";
import { cn } from "../../../utils/cn";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtDate, fmtNumber, fmtRelative } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const col = columnHelper<Member>();
const columns = [
  col.accessor("displayName", {
    header: "Member",
    cell: (c) => (
      <div>
        <div className="font-medium">{c.getValue()}</div>
        <div className="font-mono text-xs opacity-60">{c.row.original.phone}</div>
      </div>
    ),
  }),
  col.accessor("tier", { header: "Tier", cell: (c) => <TierBadge tier={c.getValue()} /> }),
  col.accessor("balance", { header: "Balance", cell: (c) => <span className="font-mono font-semibold">{fmtNumber(c.getValue())}</span> }),
  col.accessor("lifetimeEarned", { header: "Lifetime earned", cell: (c) => fmtNumber(c.getValue()) }),
  col.accessor("lifetimeRedeemed", { header: "Redeemed", cell: (c) => fmtNumber(c.getValue()) }),
  col.accessor("joinedAt", { header: "Joined", cell: (c) => <span className="text-xs">{fmtDate(c.getValue())}</span> }),
  col.accessor("lastActiveAt", { header: "Last active", cell: (c) => <span className="text-xs">{fmtRelative(c.getValue())}</span> }),
];

function AdjustForm({ memberId, symbol }: { memberId: string; symbol: string }) {
  const [points, setPoints] = useState(100);
  const [reason, setReason] = useState("");
  const adjust = useAdjustPoints();
  const errors = fieldErrorsOf(adjust.error);
  return (
    <Form
      className="grid gap-3 rounded-box border border-base-300 p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        adjust.mutate(
          { id: memberId, points, reason },
          {
            onSuccess: (tx) => {
              notify.success("Balance adjusted", `${tx.points > 0 ? "+" : ""}${tx.points} ${symbol} recorded on-chain.`);
              setReason("");
            },
            onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err),
          },
        );
      }}
    >
      <FormField label={`Points (±${symbol})`} error={errors.points}>
        <TextInput type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} invalid={!!errors.points} />
      </FormField>
      <FormField label="Reason (audited)" error={errors.reason}>
        <TextInput value={reason} onChange={(e) => setReason(e.target.value)} invalid={!!errors.reason} placeholder="e.g. Goodwill for delayed order #1042" />
      </FormField>
      <Button type="submit" className="btn-primary" disabled={adjust.isPending}>
        {adjust.isPending && <span className="loading loading-spinner loading-sm" />}
        Apply
      </Button>
    </Form>
  );
}

function MemberModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, error } = useMember(id);
  const tenant = useMerchantTenant().data;
  const canAdjust = hasMerchantRole(useSession()?.user.merchantRole, "manager");
  const m = data?.member;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={m?.displayName ?? "Member"} description={m && <span className="font-mono">{m.phone}</span>} size="xl">
      {isLoading && <LoadingBlock rows={2} />}
      {error && <ErrorState error={error} />}
      {data && m && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Balance", `${fmtNumber(m.balance)} ${tenant?.pointSymbol ?? ""}`],
              ["Lifetime earned", fmtNumber(m.lifetimeEarned)],
              ["Redeemed", fmtNumber(m.lifetimeRedeemed)],
              ["Member since", fmtDate(m.joinedAt)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-box bg-base-200 p-3">
                <div className="text-xs opacity-60">{k}</div>
                <div className="font-bold">{v}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <TierBadge tier={m.tier} />
            <span className="opacity-60">zkLogin address</span>
            <ChainRef value={m.suiAddress} kind="account" />
          </div>

          {canAdjust && tenant && <AdjustForm memberId={m.id} symbol={tenant.pointSymbol} />}

          <div>
            <h3 className="mb-2 font-semibold">History</h3>
            <div className="max-h-72 overflow-y-auto rounded-box border border-base-300">
              <table className="table table-sm">
                <thead className="sticky top-0 bg-base-100">
                  <tr><th>When</th><th>Type</th><th>Channel</th><th className="text-right">Points</th><th>Tx</th></tr>
                </thead>
                <tbody>
                  {data.history.map((tx) => (
                    <tr key={tx.id}>
                      <td className="text-xs">{fmtRelative(tx.createdAt)}</td>
                      <td><StatusBadge status={tx.kind} /></td>
                      <td className="text-xs uppercase">{tx.channel}</td>
                      <td className={cn("text-right font-mono", tx.points > 0 ? "text-success" : "text-primary")}>{tx.points > 0 ? "+" : ""}{fmtNumber(tx.points)}</td>
                      <td><ChainRef value={tx.txDigest} /></td>
                    </tr>
                  ))}
                  {data.history.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm opacity-60">No transactions yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {data.vouchers.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Vouchers</h3>
              <ul className="flex flex-wrap gap-2">
                {data.vouchers.map((v) => (
                  <li key={v.id} className="flex items-center gap-2 rounded-box border border-dashed border-base-300 px-3 py-2 text-sm">
                    <span>{v.rewardTitle}</span>
                    <span className="font-mono text-xs opacity-60">{v.code}</span>
                    <StatusBadge status={v.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function MembersPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("member");
  const { data, isLoading, error, refetch } = useMembers("");

  return (
    <>
      <PageHeader
        title="Members"
        description="Customers enrolled in your program. Phone numbers are masked; each member holds a zkLogin-derived Sui address scoped to your tenant."
      />
      {error && <ErrorState error={error} onRetry={refetch} />}
      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Filter by name or tier…"
        initialSort={[{ id: "lastActiveAt", desc: true }]}
        onRowClick={(m) => setParams({ member: m.id })}
        empty={<EmptyState icon={UsersThree} title="No members yet" description="Issue points to a phone number to enroll your first member." />}
      />
      {selected && <MemberModal id={selected} onClose={() => setParams({})} />}
    </>
  );
}
