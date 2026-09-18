import { useId, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { fmtCompact } from "../../utils/format";
import { CHART_COLORS } from "./chartUtils";


export type Series = { key: string; label: string; color?: string; values: number[] };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

function Legend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      {series.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: s.color ?? CHART_COLORS[i] }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- AreaChart */

type AreaProps = {
  labels: string[];
  series: Series[];
  height?: number;
  format?: (v: number) => string;
  className?: string;
};

const W = 800;
const PAD = { top: 12, right: 12, bottom: 24, left: 48 };

export function AreaChart({ labels, series, height = 240, format = fmtCompact, className }: AreaProps) {
  const gid = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const max = useMemo(() => niceMax(Math.max(1, ...series.flatMap((s) => s.values))), [series]);
  const n = labels.length;
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.ceil(n / 8);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Legend series={series} />
      <div className="relative">
        <svg ref={ref} viewBox={`0 0 ${W} ${height}`} className="w-full overflow-visible" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img">
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${gid}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity="0.22" />
                <stop offset="1" stopColor={s.color ?? CHART_COLORS[i]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.08" />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="currentColor" fillOpacity="0.5">
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % labelEvery === 0 ? (
              <text key={l + i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.5">
                {l}
              </text>
            ) : null,
          )}
          {series.map((s, si) => {
            const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
            return (
              <g key={s.key}>
                <path d={`${d} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gid}-${si})`} />
                <path d={d} fill="none" stroke={s.color ?? CHART_COLORS[si]} strokeWidth="2" strokeLinejoin="round" />
              </g>
            );
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />
              {series.map((s, si) => (
                <circle key={s.key} cx={x(hover)} cy={y(s.values[hover])} r="4" fill="var(--color-base-100)" stroke={s.color ?? CHART_COLORS[si]} strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-box border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-lg"
            style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "calc(-100% - 12px)" : "12px"})` }}
          >
            <div className="mb-1 font-semibold">{labels[hover]}</div>
            {series.map((s, si) => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: s.color ?? CHART_COLORS[si] }} />
                  {s.label}
                </span>
                <span className="font-mono">{format(s.values[hover])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- BarChart */

type BarProps = {
  labels: string[];
  series: Series[];
  height?: number;
  stacked?: boolean;
  format?: (v: number) => string;
};

export function BarChart({ labels, series, height = 220, stacked = true, format = fmtCompact }: BarProps) {
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;
  const totals = labels.map((_, i) => (stacked ? series.reduce((s, x) => s + x.values[i], 0) : Math.max(...series.map((x) => x.values[i]))));
  const max = niceMax(Math.max(1, ...totals));
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const band = innerW / n;
  const barW = Math.max(2, band * 0.65);
  const y = (v: number) => (v / max) * innerH;
  const labelEvery = Math.ceil(n / 10);

  return (
    <div className="flex flex-col gap-3">
      <Legend series={series} />
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${height}`} className="w-full" onMouseLeave={() => setHover(null)} role="img">
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH - t * innerH} y2={PAD.top + innerH - t * innerH} stroke="currentColor" strokeOpacity="0.08" />
              <text x={PAD.left - 8} y={PAD.top + innerH - t * innerH} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="currentColor" fillOpacity="0.5">
                {format(t * max)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => {
            let acc = 0;
            const bx = PAD.left + i * band + (band - barW) / 2;
            return (
              <g key={l + i} onMouseEnter={() => setHover(i)} opacity={hover === null || hover === i ? 1 : 0.5}>
                <rect x={PAD.left + i * band} y={PAD.top} width={band} height={innerH} fill="transparent" />
                {series.map((s, si) => {
                  const h = y(s.values[i]);
                  const w = stacked ? barW : barW / series.length;
                  const rx = stacked ? bx : bx + si * w;
                  const ry = PAD.top + innerH - (stacked ? acc : 0) - h;
                  if (stacked) acc += h;
                  return <rect key={s.key} x={rx} y={ry} width={w} height={Math.max(0, h)} rx="2" fill={s.color ?? CHART_COLORS[si]} />;
                })}
                {i % labelEvery === 0 && (
                  <text x={bx + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.5">
                    {l}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-box border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-lg"
            style={{ left: `${((PAD.left + (hover + 0.5) * band) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "calc(-100% - 12px)" : "12px"})` }}
          >
            <div className="mb-1 font-semibold">{labels[hover]}</div>
            {series.map((s, si) => (
              <div key={s.key} className="flex justify-between gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: s.color ?? CHART_COLORS[si] }} />
                  {s.label}
                </span>
                <span className="font-mono">{format(s.values[hover])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- Donut */

export function Donut({ items, size = 160, centerLabel, centerValue }: { items: { label: string; value: number; color?: string }[]; size?: number; centerLabel?: string; centerValue?: string }) {
  const total = items.reduce((s, x) => s + x.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const offsets = items.reduce<number[]>((acc, _it, i) => [...acc, i === 0 ? 0 : acc[i - 1] + (items[i - 1].value / total) * c], []);
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-base-200)" strokeWidth="14" />
        {items.map((it, i) => {
          const len = (it.value / total) * c;
          return (
            <circle key={it.label} cx="50" cy="50" r={r} fill="none" stroke={it.color ?? CHART_COLORS[i % CHART_COLORS.length]} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offsets[i]} transform="rotate(-90 50 50)">
              <title>{`${it.label}: ${it.value}`}</title>
            </circle>
          );
        })}
        {centerValue && (
          <g>
            <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              {centerValue}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.6">
              {centerLabel}
            </text>
          </g>
        )}
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: it.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="min-w-24">{it.label}</span>
            <span className="font-mono text-xs opacity-70">{((it.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
