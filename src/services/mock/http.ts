import { commit } from "./db";
import { live } from "./random";

/**
 * Pseudo transport. Every service call goes through `simulate`, which:
 *  - waits a realistic latency,
 *  - runs the handler against the mock db (handlers throw ApiError like a server would),
 *  - persists the db, deep-clones the result (no shared references with the "server"),
 *  - records the call in the network log shown by the Mock API console.
 */

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export const badRequest = (message: string, fieldErrors?: Record<string, string>) =>
  new ApiError(422, "validation_failed", message, fieldErrors);
export const notFound = (what: string) =>
  new ApiError(404, "not_found", `${what} was not found`);
export const forbidden = (message = "You do not have permission to perform this action") =>
  new ApiError(403, "forbidden", message);
export const conflict = (message: string, fieldErrors?: Record<string, string>) =>
  new ApiError(409, "conflict", message, fieldErrors);

export type NetworkEntry = {
  id: number;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  at: number;
  body?: unknown;
  response?: unknown;
  error?: string;
};

const MAX_LOG = 100;
let log: NetworkEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

export const networkLog = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  snapshot: () => log,
  clear() {
    log = [];
    listeners.forEach((l) => l());
  },
};

function record(entry: Omit<NetworkEntry, "id" | "at">) {
  log = [{ ...entry, id: ++seq, at: Date.now() }, ...log].slice(0, MAX_LOG);
  listeners.forEach((l) => l());
}

export const settings = {
  latency: [220, 650] as [number, number],
  /** Probability that any request fails with a 503 (chaos testing). */
  failureRate: 0,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function simulate<T>(
  endpoint: string,
  handler: () => T,
  body?: unknown,
): Promise<T> {
  const [method, path] = endpoint.split(" ");
  const duration = live.int(settings.latency[0], settings.latency[1]);
  await sleep(duration);

  try {
    if (settings.failureRate && live.chance(settings.failureRate)) {
      throw new ApiError(503, "service_unavailable", "Upstream Sui fullnode timed out. Please retry.");
    }
    const result = handler();
    if (method !== "GET") commit();
    const cloned = result === undefined ? result : structuredClone(result);
    record({ method, path, status: method === "POST" ? 201 : 200, durationMs: duration, body, response: cloned });
    return cloned;
  } catch (e) {
    const err =
      e instanceof ApiError
        ? e
        : new ApiError(500, "internal_error", e instanceof Error ? e.message : "Unexpected error");
    record({ method, path, status: err.status, durationMs: duration, body, error: err.message });
    throw err;
  }
}
