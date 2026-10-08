/**
 * Deterministic helpers so the seeded mock data is identical on every reset.
 */

export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    float: (min: number, max: number) => next() * (max - min) + min,
    pick: <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  };
}

export type Rng = ReturnType<typeof createRng>;

/** Non-deterministic rng for runtime mutations. */
export const live = createRng(Date.now());

const HEX = "0123456789abcdef";
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function hex(rng: Rng, length: number) {
  let s = "";
  for (let i = 0; i < length; i++) s += HEX[rng.int(0, 15)];
  return s;
}

/** Sui object id / address: 0x + 64 hex chars. */
export const suiObjectId = (rng: Rng = live) => `0x${hex(rng, 64)}`;

/** Sui transaction digest: base58, ~44 chars. */
export function txDigest(rng: Rng = live) {
  let s = "";
  for (let i = 0; i < 44; i++) s += BASE58[rng.int(0, BASE58.length - 1)];
  return s;
}

export function uid(prefix: string, rng: Rng = live) {
  return `${prefix}_${hex(rng, 12)}`;
}

export function voucherCode(rng: Rng = live) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 12; i++) {
    if (i && i % 4 === 0) s += "-";
    s += chars[rng.int(0, chars.length - 1)];
  }
  return s;
}
