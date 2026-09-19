import type { DailyStat, Range } from "../../types/domain";
import { getDb } from "../mock/db";

export const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

export type SeriesPoint = Omit<DailyStat, "tenantId">;

export type Kpi = { value: number; previous: number; delta: number };

const METRICS = ["earned", "redeemed", "txCount", "revenueVnd", "newMembers", "gasMist", "apiCalls"] as const;
type Metric = (typeof METRICS)[number];

function dayKeys(days: number, offset = 0) {
  const keys: string[] = [];
  const now = Date.now();
  for (let d = days - 1 + offset; d >= offset; d--) {
    keys.push(new Date(now - d * 86_400_000).toISOString().slice(0, 10));
  }
  return keys;
}

function emptyPoint(date: string): SeriesPoint {
  return { date, earned: 0, redeemed: 0, txCount: 0, revenueVnd: 0, newMembers: 0, gasMist: 0, apiCalls: 0 };
}

export function series(range: Range, tenantId?: string, offset = 0): SeriesPoint[] {
  const keys = dayKeys(RANGE_DAYS[range], offset);
  const byDate = new Map(keys.map((k) => [k, emptyPoint(k)]));
  for (const s of getDb().stats) {
    if (tenantId && s.tenantId !== tenantId) continue;
    const p = byDate.get(s.date);
    if (!p) continue;
    for (const m of METRICS) p[m] += s[m];
  }
  return keys.map((k) => byDate.get(k)!);
}

function sum(points: SeriesPoint[], m: Metric) {
  return points.reduce((acc, p) => acc + p[m], 0);
}

export function kpis(range: Range, tenantId?: string): Record<Metric, Kpi> {
  const current = series(range, tenantId);
  const prev = series(range, tenantId, RANGE_DAYS[range]);
  return Object.fromEntries(
    METRICS.map((m) => {
      const value = sum(current, m);
      const previous = sum(prev, m);
      return [m, { value, previous, delta: previous ? (value - previous) / previous : 0 }];
    }),
  ) as Record<Metric, Kpi>;
}

export function totalsByTenant(range: Range) {
  const keys = new Set(dayKeys(RANGE_DAYS[range]));
  const map = new Map<string, SeriesPoint>();
  for (const s of getDb().stats) {
    if (!keys.has(s.date)) continue;
    const p = map.get(s.tenantId) ?? emptyPoint("");
    for (const m of METRICS) p[m] += s[m];
    map.set(s.tenantId, p);
  }
  return map;
}
