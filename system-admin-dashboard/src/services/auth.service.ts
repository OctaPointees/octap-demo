import type { Session, SessionUser } from "../types/domain";
import { writeAudit } from "./core/ledger";
import { getDb } from "./mock/db";
import { ApiError, badRequest, simulate } from "./mock/http";
import { hex, live } from "./mock/random";
import { sessionStore } from "./session";

export type LoginInput = { email: string; password: string; remember: boolean };

export const DEMO_ACCOUNTS = [
  { label: "Platform admin", email: "admin@octap.io", hint: "OctaP operator console" },
  { label: "Merchant owner", email: "owner@lotusmart.vn", hint: "Full access to Lotus Mart" },
  { label: "Merchant cashier", email: "cashier@lotusmart.vn", hint: "Limited RBAC role" },
  { label: "Merchant manager", email: "manager@phocaphe.vn", hint: "Phố Cà Phê tenant" },
];
export const DEMO_PASSWORD = "octap123";

export const authService = {
  login(input: LoginInput) {
    return simulate(
      "POST /v1/auth/sessions",
      (): Session => {
        const email = input.email.trim().toLowerCase();
        const errors: Record<string, string> = {};
        if (!email) errors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address";
        if (!input.password) errors.password = "Password is required";
        if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields", errors);

        const db = getDb();
        const account = db.staff.find((s) => s.email === email);
        if (!account || account.password !== input.password) {
          writeAudit({
            actorType: "system",
            actorName: email,
            action: "auth.failed_login",
            severity: "warning",
            summary: `Failed sign-in attempt for ${email}`,
            onChain: false,
            ip: `14.161.22.${live.int(2, 254)}`,
          });
          throw new ApiError(401, "invalid_credentials", "Email or password is incorrect.");
        }
        if (account.status !== "active") {
          throw new ApiError(403, "account_inactive", "This account has not been activated yet. Check your invitation email.");
        }
        if (account.tenantId) {
          const tenant = db.tenants.find((t) => t.id === account.tenantId);
          if (tenant?.status === "suspended") {
            throw new ApiError(403, "tenant_suspended", `${tenant.name} is suspended. Contact OctaP support.`);
          }
        }

        account.lastLoginAt = new Date().toISOString();
        const user: SessionUser = {
          id: account.id,
          email: account.email,
          displayName: account.displayName,
          avatarUrl: account.avatarUrl,
          role: account.role,
          tenantId: account.tenantId,
          merchantRole: account.merchantRole,
        };
        const ttl = input.remember ? 30 : 1;
        return {
          token: `sess_${hex(live, 32)}`,
          user,
          expiresAt: new Date(Date.now() + ttl * 86_400_000).toISOString(),
        };
      },
      { email: input.email, password: "••••••••", remember: input.remember },
    ).then((session) => {
      sessionStore.set(session);
      return session;
    });
  },

  logout() {
    return simulate("DELETE /v1/auth/sessions/current", () => undefined).finally(() => sessionStore.set(null));
  },

  requestPasswordReset(email: string) {
    return simulate(
      "POST /v1/auth/password-reset",
      () => {
        if (!/^\S+@\S+\.\S+$/.test(email)) throw badRequest("Enter a valid email address", { email: "Enter a valid email address" });
        // Always succeed to avoid account enumeration.
        return { message: `If ${email} belongs to an account, a reset link is on its way.` };
      },
      { email },
    );
  },
};
