import { Form } from "@base-ui/react/form";
import { OTPField as OtpField } from "@base-ui/react/otp-field";
import { ArrowLeft, Fingerprint, Gift, House, Info, Receipt, SignOut, Storefront, Ticket } from "phosphor-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/shared/Button";
import { ChainRef, FormField, TextInput } from "../../components/shared/Controls";
import { EmptyState, StatusBadge, TierBadge } from "../../components/shared/Display";
import { Modal } from "../../components/shared/Modal";
import { useCheckout, useJoinMerchant, useMyVouchers, useRedeem, useRequestOtp, useVerifyOtp, useWallet, useWalletHistory, useWalletRewards } from "../../queries/wallet";
import { useWalletSession } from "../../queries/useSession";
import { walletService } from "../../services/wallet.service";
import type { Reward } from "../../types/domain";
import { cn } from "../../utils/cn";
import { fieldErrorsOf, formErrorOf } from "../../utils/errors";
import { fmtNumber, fmtRelative, fmtVnd, shortHash } from "../../utils/format";
import { notify } from "../../utils/toast";

type Wallet = NonNullable<ReturnType<typeof useWallet>["data"]>;
type Membership = Wallet["memberships"][number];

/* ------------------------------------------------------------------ Sign in */

function SignIn() {
  const [phone, setPhone] = useState("0901 234 567");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const request = useRequestOtp();
  const verify = useVerifyOtp();
  const sent = request.data;
  const errors = { ...fieldErrorsOf(request.error), ...fieldErrorsOf(verify.error) };
  const formError = formErrorOf(verify.error);

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="size-14 rounded-box bg-primary p-3">
          <img src="/icons/logo_dark.png" alt="" className="w-full" />
        </div>
        <h1 className="text-2xl font-bold">OctaP Rewards</h1>
        <p className="text-sm opacity-65">Earn and redeem points at your favourite stores. No wallet, no seed phrase — just your phone number.</p>
      </div>

      {!sent ? (
        <Form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            request.mutate(phone);
          }}
        >
          <FormField label="Phone number" error={errors.phone}>
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} invalid={!!errors.phone} inputMode="tel" className="input-lg" />
          </FormField>
          <Button type="submit" className="btn-primary btn-lg" disabled={request.isPending}>
            {request.isPending && <span className="loading loading-spinner" />}
            Send code
          </Button>
        </Form>
      ) : (
        <Form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            verify.mutate({ phone: sent.phone, code, name });
          }}
        >
          <div className="text-center text-sm">
            Enter the 6-digit code sent to <b>{sent.phone}</b>
            <div className="mt-1 text-xs opacity-60">Demo code: {walletService.DEMO_OTP}</div>
          </div>
          <OtpField.Root length={6} value={code} onValueChange={(v) => setCode(v)} className="flex justify-center gap-2" aria-label="One-time code">
            {Array.from({ length: 6 }, (_, i) => (
              <OtpField.Input key={i} className={cn("input input-lg w-11 px-0 text-center font-mono text-xl", errors.code && "input-error")} />
            ))}
          </OtpField.Root>
          {errors.code && <div className="text-center text-xs text-error">{errors.code}</div>}
          {formError && <div className="alert alert-error alert-soft text-sm">{formError}</div>}
          <FormField label="Your name (first time only)">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
          </FormField>
          <Button type="submit" className="btn-primary btn-lg" disabled={verify.isPending || code.length < 6}>
            {verify.isPending ? <span className="loading loading-spinner" /> : <Fingerprint size={22} />}
            {verify.isPending ? "Creating zkLogin session…" : "Verify & continue"}
          </Button>
          <button type="button" className="link text-center text-sm" onClick={() => { request.reset(); verify.reset(); setCode(""); }}>
            Use a different number
          </button>
        </Form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Redeem flow */

function RedeemModal({ reward, membership, onClose }: { reward: Reward; membership: Membership; onClose: () => void }) {
  const redeem = useRedeem();
  const result = redeem.data;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={result ? "Enjoy your reward!" : "Confirm redemption"} size="sm">
      {result ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Gift size={40} className="text-primary" weight="duotone" />
          <div className="font-semibold">{result.rewardTitle}</div>
          <div className="w-full rounded-box border-2 border-dashed border-primary p-4 font-mono text-2xl font-bold tracking-widest">{result.voucher.code}</div>
          <div className="text-xs opacity-60">Show this code at {membership.tenant.name}. Remaining balance: {fmtNumber(result.balance)} {membership.tenant.symbol}</div>
          <div className="flex items-center gap-1 text-xs">
            <span className="opacity-60">Burn tx</span>
            <ChainRef value={result.tx.txDigest} />
          </div>
          <Button className="btn-primary btn-block" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-box bg-base-200 p-4 text-sm">
            <div className="font-semibold">{reward.title}</div>
            <div className="mt-2 flex justify-between"><span className="opacity-60">Cost</span><span className="font-mono">{fmtNumber(reward.pointCost)} {membership.tenant.symbol}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Balance after</span><span className="font-mono">{fmtNumber(membership.balance - reward.pointCost)}</span></div>
          </div>
          <p className="text-xs opacity-70">
            You're authorising OctaP to burn these points from your zkLogin account. Network fees are sponsored — you pay nothing.
          </p>
          {redeem.error && <div className="alert alert-error alert-soft text-sm">{formErrorOf(redeem.error)}</div>}
          <Button className="btn-primary btn-lg" disabled={redeem.isPending} onClick={() => redeem.mutate(reward.id)}>
            {redeem.isPending ? <span className="loading loading-spinner" /> : <Fingerprint size={22} />}
            {redeem.isPending ? "Signing with zkLogin…" : "Sign & redeem"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function CheckoutModal({ membership, onClose }: { membership: Membership; onClose: () => void }) {
  const [amount, setAmount] = useState(185_000);
  const checkout = useCheckout();
  const errors = fieldErrorsOf(checkout.error);
  const r = checkout.data;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`Pay at ${membership.tenant.name}`} description="Simulates a POS terminal running the OctaP SDK." size="sm">
      {r ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-4xl font-bold text-success">+{fmtNumber(r.quote.totalPoints)}</div>
          <div className="text-sm opacity-70">{membership.tenant.pointName} earned</div>
          {r.quote.bonuses.map((b) => (
            <span key={b.campaignId} className="badge badge-primary badge-soft">{b.name} +{b.points}</span>
          ))}
          <div className="text-sm">New balance: <b>{fmtNumber(r.balance)}</b></div>
          <Button className="btn-primary btn-block mt-2" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <Form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            checkout.mutate({ tenantId: membership.tenantId, amountVnd: amount }, { onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err) });
          }}
        >
          <FormField label="Bill amount (VND)" error={errors.amountVnd}>
            <TextInput type="number" step={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} invalid={!!errors.amountVnd} className="input-lg" />
          </FormField>
          <div className="text-xs opacity-60">≈ {fmtNumber(Math.floor((amount / 10_000) * membership.tenant.earnRate))} base points + any live campaign bonuses</div>
          <Button type="submit" className="btn-primary btn-lg" disabled={checkout.isPending}>
            {checkout.isPending && <span className="loading loading-spinner" />}
            Pay {fmtVnd(amount)}
          </Button>
        </Form>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------- Merchant view */

function MerchantView({ membership, onBack }: { membership: Membership; onBack: () => void }) {
  const rewards = useWalletRewards(membership.tenantId);
  const history = useWalletHistory(membership.tenantId);
  const [tab, setTab] = useState<"rewards" | "history">("rewards");
  const [redeeming, setRedeeming] = useState<Reward | null>(null);
  const [paying, setPaying] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4 text-white" style={{ background: membership.tenant.color }}>
        <button className="btn btn-ghost btn-sm btn-circle text-white" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="mt-2 text-sm opacity-80">{membership.tenant.name}</div>
        <div className="text-4xl font-bold">{fmtNumber(membership.balance)}</div>
        <div className="flex items-center gap-2 text-sm opacity-90">
          {membership.tenant.pointName} <TierBadge tier={membership.tier} />
        </div>
        <Button className="btn-sm mt-4 border-0 bg-white/20 text-white hover:bg-white/30" onClick={() => setPaying(true)} disabled={membership.tenant.status !== "active"}>
          <Storefront /> Pay in store & earn
        </Button>
      </div>

      <div className="flex border-b border-base-300">
        {(["rewards", "history"] as const).map((t) => (
          <button key={t} className={cn("flex-1 py-3 text-sm font-medium capitalize", tab === t ? "border-b-2 border-primary text-primary" : "opacity-60")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {tab === "rewards" && (
          <>
            {rewards.isLoading && <div className="skeleton h-20 w-full" />}
            {rewards.data?.length === 0 && <EmptyState icon={Gift} title="No rewards yet" />}
            {rewards.data?.map((r) => {
              const affordable = membership.balance >= r.pointCost;
              const soldOut = r.redeemedCount >= r.stock;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-box border border-base-300 p-3">
                  <div className="rounded-box bg-primary/10 p-2 text-primary"><Gift size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="text-xs opacity-60">{fmtNumber(r.pointCost)} {membership.tenant.symbol}{soldOut && " · sold out"}</div>
                  </div>
                  <Button className="btn-primary btn-sm" disabled={!affordable || soldOut} onClick={() => setRedeeming(r)}>
                    Redeem
                  </Button>
                </div>
              );
            })}
          </>
        )}
        {tab === "history" && (
          <ul className="flex flex-col divide-y divide-base-300">
            {history.data?.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-2">
                <StatusBadge status={tx.kind} />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="truncate">{tx.rewardTitle ?? (tx.amountVnd ? `Purchase ${fmtVnd(tx.amountVnd)}` : tx.note ?? "Adjustment")}</div>
                  <div className="opacity-50">{fmtRelative(tx.createdAt)} · {shortHash(tx.txDigest, 6, 4)}</div>
                </div>
                <span className={cn("font-mono text-sm font-semibold", tx.points > 0 ? "text-success" : "text-primary")}>
                  {tx.points > 0 ? "+" : ""}{fmtNumber(tx.points)}
                </span>
              </li>
            ))}
            {history.data?.length === 0 && <EmptyState icon={Receipt} title="No activity yet" />}
          </ul>
        )}
      </div>

      {redeeming && <RedeemModal reward={redeeming} membership={membership} onClose={() => setRedeeming(null)} />}
      {paying && <CheckoutModal membership={membership} onClose={() => setPaying(false)} />}
    </div>
  );
}

/* --------------------------------------------------------------------- Home */

function Home({ wallet }: { wallet: Wallet }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"home" | "vouchers">("home");
  const join = useJoinMerchant();
  const vouchers = useMyVouchers(tab === "vouchers");
  const open = wallet.memberships.find((m) => m.tenantId === openId);

  if (open) return <MerchantView membership={open} onBack={() => setOpenId(null)} />;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs opacity-60">Xin chào,</div>
          <div className="text-lg font-bold">{wallet.user.displayName}</div>
        </div>
        <button className="btn btn-ghost btn-sm btn-circle" aria-label="Sign out" onClick={() => walletService.signOut()}>
          <SignOut size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === "home" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {wallet.memberships.map((m) => (
                <button key={m.id} onClick={() => setOpenId(m.tenantId)} className="relative overflow-hidden rounded-box p-4 text-left text-white shadow-md transition-transform active:scale-[0.98]" style={{ background: m.tenant.color }}>
                  <div className="absolute -top-8 -right-8 size-28 rounded-full bg-white/10" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{m.tenant.name}</span>
                    {m.tenant.status !== "active" && <span className="badge badge-sm">{m.tenant.status}</span>}
                  </div>
                  <div className="mt-3 text-3xl font-bold">{fmtNumber(m.balance)}</div>
                  <div className="text-xs opacity-80">{m.tenant.pointName} · {m.tier}</div>
                </button>
              ))}
              {wallet.memberships.length === 0 && <EmptyState icon={Storefront} title="No memberships yet" description="Join a store below to start earning." />}
            </div>

            {wallet.joinable.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold opacity-70">Discover stores</h2>
                <div className="flex flex-col gap-2">
                  {wallet.joinable.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-box border border-base-300 p-3">
                      <div className="grid size-9 place-items-center rounded-box text-xs font-bold text-white" style={{ background: t.color }}>{t.symbol.slice(0, 2)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{t.name}</div>
                        <div className="text-xs opacity-60">{t.industry}</div>
                      </div>
                      <Button
                        className="btn-sm btn-soft btn-primary"
                        disabled={join.isPending && join.variables === t.id}
                        onClick={() => join.mutate(t.id, { onSuccess: (r) => notify.success(`Joined ${t.name}`, r.welcomeBonus ? `Welcome bonus: +${r.welcomeBonus} ${t.symbol}` : undefined), onError: (e) => notify.error(e) })}
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 rounded-box bg-base-200 p-3 text-xs opacity-80">
              <Info size={16} className="shrink-0" />
              <span>Points belong to each store and can't be transferred between stores or exchanged for cash.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {vouchers.isLoading && <div className="skeleton h-20 w-full" />}
            {vouchers.data?.length === 0 && <EmptyState icon={Ticket} title="No vouchers yet" description="Redeem points for rewards to see them here." />}
            {vouchers.data?.map((v) => (
              <div key={v.id} className="flex overflow-hidden rounded-box border border-base-300">
                <div className="w-2" style={{ background: v.color }} />
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    {v.rewardTitle} <StatusBadge status={v.status} />
                  </div>
                  <div className="text-xs opacity-60">{v.tenantName} · {fmtRelative(v.issuedAt)}</div>
                  <div className="mt-2 font-mono text-lg font-bold tracking-widest">{v.code}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="grid grid-cols-2 border-t border-base-300">
        {([["home", House, "Wallet"], ["vouchers", Ticket, "Vouchers"]] as const).map(([key, Icon, label]) => (
          <button key={key} className={cn("flex flex-col items-center gap-0.5 py-2 text-xs", tab === key ? "text-primary" : "opacity-60")} onClick={() => setTab(key)}>
            <Icon size={22} weight={tab === key ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* --------------------------------------------------------------------- Shell */

export default function WalletApp() {
  const session = useWalletSession();
  const wallet = useWallet(!!session);

  return (
    <div className="app-wrapper flex flex-col items-center justify-center gap-4 overflow-y-auto bg-base-200 p-4">
      <div className="flex w-full max-w-sm items-center justify-between text-xs">
        <span className="badge badge-warning badge-soft">Test harness · LI-3</span>
        <Link to="/login" className="link opacity-60">Back to dashboards</Link>
      </div>
      <div className="flex h-[min(760px,calc(100dvh-5rem))] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-8 border-neutral-800 bg-base-100 shadow-2xl">
        {!session ? (
          <SignIn />
        ) : wallet.isLoading ? (
          <div className="flex flex-1 items-center justify-center"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : wallet.error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm">{formErrorOf(wallet.error)}</p>
            <Button className="btn-sm" onClick={() => walletService.signOut()}>Sign in again</Button>
          </div>
        ) : (
          wallet.data && <Home wallet={wallet.data} />
        )}
      </div>
      {session && wallet.data && (
        <div className="flex max-w-sm items-center gap-1 text-xs opacity-60">
          zkLogin address <ChainRef value={wallet.data.user.suiAddress} kind="account" />
        </div>
      )}
    </div>
  );
}
