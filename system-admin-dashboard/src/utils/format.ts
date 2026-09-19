const numberFmt = new Intl.NumberFormat("en-US");
const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const vndFmt = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const fmtNumber = (n: number) => numberFmt.format(Math.round(n));
export const fmtCompact = (n: number) => compactFmt.format(n);
export const fmtVnd = (n: number) => vndFmt.format(n);
export const fmtCompactVnd = (n: number) => `${compactFmt.format(n)} ₫`;
export const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
export const fmtDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const fmtPercent = (n: number, digits = 1) =>
  `${(n * 100).toFixed(digits)}%`;
export const fmtSui = (mist: number) => `${(mist / 1e9).toFixed(4)} SUI`;

export function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  const suffix = diff >= 0 ? "ago" : "from now";
  if (abs < min) return "just now";
  if (abs < hour) return `${Math.round(abs / min)}m ${suffix}`;
  if (abs < day) return `${Math.round(abs / hour)}h ${suffix}`;
  if (abs < 30 * day) return `${Math.round(abs / day)}d ${suffix}`;
  return fmtDate(iso);
}

/** 0x1234…abcd */
export function shortHash(hash: string, head = 6, tail = 4) {
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function toTitle(s: string) {
  return s
    .replace(/[_.-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
