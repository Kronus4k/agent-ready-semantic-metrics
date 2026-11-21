import type { MetricFormat } from "./metrics";

/** Tiny sample tables that reproduce two classic modelling bugs. */

export interface SampleOrder {
  orderId: string;
  items: number;
  payments: number[];
}

export const sampleOrders: SampleOrder[] = [
  { orderId: "o_1001", items: 3, payments: [120] },
  { orderId: "o_1002", items: 1, payments: [45] },
  { orderId: "o_1003", items: 2, payments: [60, 40] },
  { orderId: "o_1004", items: 4, payments: [210] },
  { orderId: "o_1005", items: 1, payments: [30, 15] },
  { orderId: "o_1006", items: 2, payments: [88] },
  { orderId: "o_1007", items: 5, payments: [150, 50] },
  { orderId: "o_1008", items: 1, payments: [72] },
];

export interface SampleCohort {
  cohort: string;
  customers: number;
  /** Active in week 4. 0 means the buggy mart has no row for this cohort. */
  activeWeek4: number;
}

export const sampleCohorts: SampleCohort[] = [
  { cohort: "2026-W31", customers: 400, activeWeek4: 72 },
  { cohort: "2026-W32", customers: 350, activeWeek4: 0 },
  { cohort: "2026-W33", customers: 420, activeWeek4: 81 },
  { cohort: "2026-W34", customers: 310, activeWeek4: 0 },
  { cohort: "2026-W35", customers: 380, activeWeek4: 64 },
  { cohort: "2026-W36", customers: 290, activeWeek4: 0 },
];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Correct: one row per order, so each payment is counted once. */
export const revenueCorrect = (orders: SampleOrder[]) => sum(orders.flatMap((o) => o.payments));

/** Buggy: items × payments join, each payment repeats once per item. */
export const revenueFanOut = (orders: SampleOrder[]) =>
  sum(orders.flatMap((o) => o.payments.map((p) => p * o.items)));

/** Correct: cohorts with zero actives stay in the denominator. */
export const retentionCorrect = (cohorts: SampleCohort[]) =>
  sum(cohorts.map((c) => c.activeWeek4)) / sum(cohorts.map((c) => c.customers));

/** Buggy: the mart only has rows where activity happened, so zero cohorts vanish. */
export const retentionMissingZeros = (cohorts: SampleCohort[]) => {
  const present = cohorts.filter((c) => c.activeWeek4 > 0);
  return sum(present.map((c) => c.activeWeek4)) / sum(present.map((c) => c.customers));
};

export interface BugCase {
  id: string;
  title: string;
  metricLabel: string;
  metricId: string;
  format: MetricFormat;
  summary: string;
  whyItBreaks: string;
  correctValue: number;
  wrongValue: number;
  correctSql: string;
  buggySql: string;
}

export const bugCases: BugCase[] = [
  {
    id: "fan-out",
    title: "Join items to payments without one row per order",
    metricLabel: "Revenue, 8 sample orders",
    metricId: "net_revenue",
    format: "currency",
    summary: "Joining order_items and payments on order_id multiplies every payment by the number of items.",
    whyItBreaks:
      "An order with 5 items and 2 payments produces 10 rows. Summing payment amounts over those rows counts each payment 5 times.",
    correctValue: revenueCorrect(sampleOrders),
    wrongValue: revenueFanOut(sampleOrders),
    correctSql: `with payments as (
  select order_id, sum(amount) as paid
  from payments group by 1        -- one row per order
)
select sum(p.paid) as revenue
from orders o
join payments p using (order_id)`,
    buggySql: `select sum(p.amount) as revenue
from orders o
join order_items i using (order_id)  -- n items
join payments p using (order_id)     -- × m payments`,
  },
  {
    id: "missing-zeros",
    title: "Retention mart without zero rows",
    metricLabel: "Week-4 retention, 6 cohorts",
    metricId: "d30_retention",
    format: "percent",
    summary: "The mart is built from activity events, so cohorts with nobody active in week 4 have no row at all.",
    whyItBreaks:
      "Three cohorts had zero actives. Without a date spine their customers drop out of the denominator and retention looks almost twice as good.",
    correctValue: retentionCorrect(sampleCohorts),
    wrongValue: retentionMissingZeros(sampleCohorts),
    correctSql: `select sum(coalesce(a.active, 0))::numeric
       / sum(c.customers) as retention
from cohorts c                       -- spine: every cohort
left join week4_activity a using (cohort)`,
    buggySql: `select sum(a.active)::numeric
       / sum(c.customers) as retention
from week4_activity a                -- only rows with activity
join cohorts c using (cohort)`,
  },
];
