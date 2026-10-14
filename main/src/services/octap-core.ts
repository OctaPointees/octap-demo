/**
 * Thin client for the REAL OctaP Core API (https://github.com/OctaPointees/octap-core), used only
 * by the "Issue points" POS flow (merchant.service.ts's issuePoints) — every other service call in
 * this app stays on the local mock (see services/mock/http.ts).
 *
 * Calls Core directly from the browser rather than through a server-side proxy: Core has no
 * auth/tenant check yet either (see its docs/roadmap.md known gaps), so this isn't skipping a real
 * security boundary that exists today. A production POS integration would go through a backend
 * holding an API key, not a browser tab.
 */

const CORE_URL = (import.meta.env.VITE_OCTAP_CORE_URL as string | undefined) ?? "http://127.0.0.1:3000";
const ORGANIZATION_ID = (import.meta.env.VITE_OCTAP_ORGANIZATION_ID as string | undefined) ?? "00000000-0000-0000-0000-000000000001";

export class OctapCoreError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${CORE_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-organization-id": ORGANIZATION_ID,
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new OctapCoreError(
      `Could not reach OctaP Core at ${CORE_URL}. Is the API (and worker) running? (npm run start:api / start:worker in OctaP_Core)`,
      { cause },
    );
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new OctapCoreError(body?.message ?? `OctaP Core request failed (${res.status})`);
  }
  return body as T;
}

export interface EnsureMemberResult {
  organizationEndUserId: string;
  isNewMember: boolean;
}

export interface EarnResult {
  transactionId: string;
  status: string;
}

export interface LoyaltyTransactionResult {
  id: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  pointsAmount: number;
  blockchainDigest: string | null;
}

export const octapCore = {
  ensureMemberByPhone(phoneNumber: string, displayName?: string) {
    return request<EnsureMemberResult>("/v1/members/ensure-by-phone", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, displayName }),
    });
  },

  earn(input: { organizationEndUserId: string; pointsAmount: number; idempotencyKey: string; receiptReference?: string }) {
    return request<EarnResult>("/v1/credits/earn", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /** Polls until `transactionId` leaves PENDING (worker dispatch typically resolves in a few seconds). */
  async waitForConfirmation(
    organizationEndUserId: string,
    transactionId: string,
    { tries = 15, intervalMs = 1000 }: { tries?: number; intervalMs?: number } = {},
  ): Promise<LoyaltyTransactionResult> {
    for (let attempt = 0; attempt < tries; attempt++) {
      const transactions = await request<LoyaltyTransactionResult[]>(
        `/v1/credits/members/${organizationEndUserId}/transactions?limit=10`,
      );
      const match = transactions.find((t) => t.id === transactionId);
      if (match && match.status !== "PENDING") return match;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new OctapCoreError("Timed out waiting for the transaction to confirm on-chain.");
  },
};
