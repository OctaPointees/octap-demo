export const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-error)",
];

/** Formats YYYY-MM-DD to "12 Sep". */
export const dayLabel = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
