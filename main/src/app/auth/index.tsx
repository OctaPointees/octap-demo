import { Checkbox } from "@base-ui/react/checkbox";
import { Form } from "@base-ui/react/form";
import { useMutation } from "@tanstack/react-query";
import {
  Check,
  DeviceMobile,
  Fingerprint,
  LockKey,
  ShieldCheck,
  Stack,
  Warning,
  ArrowLeft,
} from "phosphor-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { FormField, TextInput } from "../../components/shared/Controls";
import { Button } from "../../components/shared/Button";
import { Modal } from "../../components/shared/Modal";
import { useSession } from "../../queries/useSession";
import {
  authService,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
} from "../../services/auth.service";
import { fieldErrorsOf, formErrorOf } from "../../utils/errors";
import { homeFor } from "../../utils/constants";

const PILLARS = [
  {
    icon: Stack,
    title: "Tenant-isolated points",
    text: "Every merchant runs its own point token and treasury on Sui.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud-proof ledger",
    text: "Each mint and burn is anchored on-chain and fully auditable.",
  },
  {
    icon: Fingerprint,
    title: "Zero Web3 friction",
    text: "Members sign in with a phone number via zkLogin; gas is sponsored.",
  },
];

function ForgotPassword({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const reset = useMutation({ mutationFn: authService.requestPasswordReset });
  const errors = fieldErrorsOf(reset.error);
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset.reset();
      }}
      title="Reset your password"
      description="We'll email you a secure link to set a new password."
      size="sm"
    >
      {reset.isSuccess ? (
        <div role="status" className="alert alert-success alert-soft">
          <Check /> {reset.data.message}
        </div>
      ) : (
        <Form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            reset.mutate(email);
          }}
        >
          <FormField label="Work email" error={errors.email}>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={!!errors.email}
              autoFocus
            />
          </FormField>
          <Button
            type="submit"
            className="btn-primary"
            disabled={reset.isPending}
          >
            {reset.isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            Send reset link
          </Button>
        </Form>
      )}
    </Modal>
  );
}

export default function AuthenticationEntryPoint() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: (s) => {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(
        from?.startsWith(homeFor(s.user.role)) ? from : homeFor(s.user.role),
        { replace: true },
      );
    },
  });

  if (session && !login.isPending && !login.isSuccess)
    return <Navigate to={homeFor(session.user.role)} replace />;

  const errors = fieldErrorsOf(login.error);
  const formError = formErrorOf(login.error);

  return (
    <div className="app-wrapper grid lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 text-secondary-content lg:flex">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="size-11 rounded-box bg-primary p-2">
            <img src="/icons/logo_dark.png" className="w-full" alt="" />
          </div>
          <span className="text-xl font-bold">OctaP</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-bold">
            Credit-as-a-Service for modern loyalty Test.
          </h1>
          <p className="mt-4 opacity-75">
            Launch secure, isolated loyalty programs backed by the Sui
            blockchain — with a Web2 experience your customers already know.
          </p>
          <ul className="mt-10 flex flex-col gap-6">
            {PILLARS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <div className="h-fit rounded-box bg-white/10 p-2.5">
                  <p.icon size={22} />
                </div>
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm opacity-70">{p.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs opacity-50">
          © 2026 OctaPoint · Design draft — all data is simulated
        </div>
      </section>

      <section className="flex items-center justify-center overflow-y-auto p-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-3"
            >
              <ArrowLeft size={13} weight="bold" />
              <span>Back to OctaP Home</span>
            </Link>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm opacity-65">
              Merchant dashboard & OctaP operator console
            </p>
          </div>

          {formError && (
            <div role="alert" className="alert alert-error alert-soft text-sm">
              <Warning size={18} /> {formError}
            </div>
          )}

          <Form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password, remember });
            }}
          >
            <FormField label="Work email" error={errors.email}>
              <TextInput
                type="email"
                autoComplete="username"
                placeholder="you@company.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!errors.email}
              />
            </FormField>
            <FormField label="Password" error={errors.password}>
              <TextInput
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!errors.password}
              />
            </FormField>
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox.Root
                  checked={remember}
                  onCheckedChange={(c) => setRemember(c)}
                  className="flex size-5 items-center justify-center rounded border border-base-300 data-checked:border-primary data-checked:bg-primary"
                >
                  <Checkbox.Indicator className="text-primary-content">
                    <Check size={14} weight="bold" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                Keep me signed in
              </label>
              <button
                type="button"
                className="link link-primary"
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              className="btn-primary"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <LockKey size={18} />
              )}
              Sign in
            </Button>
          </Form>

          <div className="rounded-box border border-dashed border-base-300 p-4">
            <div className="mb-2 text-xs font-semibold tracking-wide uppercase opacity-60">
              Demo accounts · password “{DEMO_PASSWORD}”
            </div>
            <div className="flex flex-col gap-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  className="flex items-center justify-between rounded-field px-2 py-1.5 text-left text-sm hover:bg-base-200"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                    login.reset();
                  }}
                >
                  <span>
                    <span className="font-medium">{a.label}</span>
                    <span className="block text-xs opacity-60">{a.email}</span>
                  </span>
                  <span className="text-xs opacity-50">{a.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <Link to="/wallet" className="btn btn-ghost btn-sm gap-2 self-center">
            <DeviceMobile size={18} /> Open the end-user wallet (test harness)
          </Link>
        </div>
      </section>

      <ForgotPassword open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
}
