/**
 * Synthetic dataset. Deterministic so every reload (and every test) sees the same numbers.
 * Replace with real extracts later; keep the shapes.
 */

export interface DailyRow {
  /** ISO date, UTC */
  date: string;
  sessions: number;
  orders: number;
  /** Gross order value in USD, before refunds */
  grossRevenue: number;
  /** Refunded value in USD */
  refunds: number;
}

export interface CohortRow {
  /** Signup week (ISO week start) */
  cohort: string;
  customers: number;
  /** Customers who placed another order within 30 days of their first */
  retainedD30: number;
}

export interface Dataset {
  periodLabel: string;
  daily: DailyRow[];
  cohorts: CohortRow[];
}

function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDaily(): DailyRow[] {
  const rand = seeded(42);
  const start = Date.UTC(2026, 9, 22); // 22 Oct 2026
  const rows: DailyRow[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start + i * 86_400_000);
    const weekday = d.getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    const trend = 1 + i * 0.008;
    const sessions = Math.round((weekend ? 9_200 : 11_800) * trend * (0.92 + rand() * 0.16));
    const conv = 0.031 + rand() * 0.006;
    const orders = Math.round(sessions * conv);
    const aov = 52 + rand() * 9;
    const grossRevenue = Math.round(orders * aov * 100) / 100;
    const refunds = Math.round(grossRevenue * (0.025 + rand() * 0.02) * 100) / 100;
    rows.push({ date: d.toISOString().slice(0, 10), sessions, orders, grossRevenue, refunds });
  }
  return rows;
}

export const cohorts: CohortRow[] = [
  { cohort: "2026-08-03", customers: 1_184, retainedD30: 331 },
  { cohort: "2026-08-10", customers: 1_242, retainedD30: 352 },
  { cohort: "2026-08-17", customers: 1_198, retainedD30: 329 },
  { cohort: "2026-08-24", customers: 1_305, retainedD30: 371 },
  { cohort: "2026-08-31", customers: 1_276, retainedD30: 366 },
  { cohort: "2026-09-07", customers: 1_331, retainedD30: 389 },
  { cohort: "2026-09-14", customers: 1_352, retainedD30: 398 },
  { cohort: "2026-09-21", customers: 1_410, retainedD30: 421 },
];

export const dataset: Dataset = {
  periodLabel: "Last 30 days · 22 Oct – 20 Nov 2026",
  daily: buildDaily(),
  cohorts,
};
