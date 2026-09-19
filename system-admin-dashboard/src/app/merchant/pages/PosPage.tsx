import { Form } from "@base-ui/react/form";
import { CheckCircle, Sparkle, Storefront } from "phosphor-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/shared/Button";
import { ChainRef, FormField, TextInput } from "../../../components/shared/Controls";
import { Card, PageHeader } from "../../../components/shared/Display";
import { Select } from "../../../components/shared/Select";
import { useEarnQuote, useIssuePoints, useMerchantTenant } from "../../../queries/merchant";
import type { TxChannel } from "../../../types/domain";
import { fieldErrorsOf, formErrorOf } from "../../../utils/errors";
import { fmtNumber, fmtSui, fmtVnd } from "../../../utils/format";

const QUICK_AMOUNTS = [85_000, 250_000, 520_000, 1_200_000];

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function PosPage() {
  const tenant = useMerchantTenant().data;
  const [phone, setPhone] = useState("0901 234 567");
  const [amount, setAmount] = useState(250_000);
  const [channel, setChannel] = useState<Extract<TxChannel, "pos" | "sdk" | "dashboard">>("pos");
  const debouncedAmount = useDebounced(amount);
  const quote = useEarnQuote(debouncedAmount);
  const issue = useIssuePoints();
  const errors = fieldErrorsOf(issue.error);
  const formError = formErrorOf(issue.error);
  const result = issue.data;

  return (
    <>
      <PageHeader
        title="Issue points"
        description="Award points for an in-store purchase. This is the same call a POS terminal makes through the OctaP SDK — members are identified by phone and never need a crypto wallet."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <Card title="Checkout" className="xl:col-span-3">
          <Form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              issue.mutate({ phone, amountVnd: amount, channel });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Member phone number" error={errors.phone} hint="New numbers are enrolled automatically">
                <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} invalid={!!errors.phone} inputMode="tel" />
              </FormField>
              <FormField label="Channel">
                <Select
                  value={channel}
                  onValueChange={setChannel}
                  options={[
                    { label: "POS terminal", value: "pos" },
                    { label: "SDK (e-commerce)", value: "sdk" },
                    { label: "Dashboard (manual)", value: "dashboard" },
                  ]}
                />
              </FormField>
            </div>
            <FormField label="Bill amount (VND)" error={errors.amountVnd}>
              <TextInput type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} invalid={!!errors.amountVnd} className="text-lg font-semibold" />
            </FormField>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button key={a} type="button" className="btn btn-sm btn-soft" onClick={() => setAmount(a)}>
                  {fmtVnd(a)}
                </button>
              ))}
            </div>

            <div className="rounded-box bg-base-200 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium">
                <span>Points preview</span>
                {quote.isFetching && <span className="loading loading-dots loading-xs" />}
              </div>
              {amount < 10_000 ? (
                <p className="text-sm opacity-60">Enter at least 10,000 ₫ to earn points.</p>
              ) : quote.data ? (
                <ul className="flex flex-col gap-1 text-sm">
                  <li className="flex justify-between">
                    <span>Base rate ({tenant?.earnRate} / 10,000 ₫)</span>
                    <span className="font-mono">{fmtNumber(quote.data.basePoints)}</span>
                  </li>
                  {quote.data.bonuses.map((b) => (
                    <li key={b.campaignId} className="flex justify-between text-primary">
                      <span className="flex items-center gap-1">
                        <Sparkle weight="fill" /> {b.name}
                      </span>
                      <span className="font-mono">+{fmtNumber(b.points)}</span>
                    </li>
                  ))}
                  <li className="mt-1 flex justify-between border-t border-base-300 pt-2 font-bold">
                    <span>Total</span>
                    <span className="font-mono">
                      {fmtNumber(quote.data.totalPoints)} {tenant?.pointSymbol}
                    </span>
                  </li>
                </ul>
              ) : null}
            </div>

            {formError && (
              <div role="alert" className="alert alert-error alert-soft text-sm">
                {formError}
              </div>
            )}

            <Button type="submit" className="btn-primary btn-lg" disabled={issue.isPending}>
              {issue.isPending ? <span className="loading loading-spinner" /> : <Storefront size={20} />}
              {issue.isPending ? "Submitting sponsored transaction…" : "Award points"}
            </Button>
          </Form>
        </Card>

        <div className="flex flex-col gap-4 xl:col-span-2">
          {result && (
            <Card className="border-success/40">
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle size={40} weight="fill" className="text-success" />
                <div className="text-3xl font-bold">
                  +{fmtNumber(result.totalPoints)} {tenant?.pointSymbol}
                </div>
                <div className="text-sm opacity-70">
                  {result.memberName}
                  {result.newMember && <span className="badge badge-primary badge-sm ml-2">New member</span>}
                </div>
                <div className="text-sm">
                  New balance: <b>{fmtNumber(result.balance)}</b>
                </div>
                <div className="mt-2 w-full rounded-box bg-base-200 p-3 text-left text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-60">Tx digest</span>
                    <ChainRef value={result.tx.txDigest} />
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Checkpoint</span>
                    <span className="font-mono">{fmtNumber(result.tx.checkpoint)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Gas (sponsored by OctaP)</span>
                    <span className="font-mono">{fmtSui(result.tx.gasMist)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card title="Equivalent SDK call">
            <pre className="overflow-x-auto rounded-box bg-secondary p-4 text-xs leading-relaxed text-secondary-content">
              {`import { OctaP } from "@octap/sdk";

const octap = new OctaP({ apiKey: process.env.OCTAP_KEY });

const receipt = await octap.points.earn({
  phone: "${phone.replace(/\s/g, "")}",
  amount: ${amount},          // VND
  currency: "VND",
  channel: "${channel}",
});

// receipt.points     → ${quote.data?.totalPoints ?? "…"}
// receipt.txDigest   → Sui transaction digest`}
            </pre>
          </Card>
        </div>
      </div>
    </>
  );
}
