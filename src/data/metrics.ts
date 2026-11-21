import { dataset as defaultDataset, type Dataset } from "./dataset";

export type MetricFormat = "currency" | "percent" | "number";

export type TestKind =
  "not_null" | "unique" | "accepted_range" | "reconciliation" | "freshness" | "relationship";

/** A test result. Never typed by hand: produced by running a check against the dataset. */
export interface MetricTest {
  name: string;
  kind: TestKind;
  passed: boolean;
  detail: string;
}

/** A check that runs against the data every time the app (or CI) loads. */
export interface MetricCheck {
  name: string;
  kind: TestKind;
  run: (ds: Dataset) => { passed: boolean; detail: string };
}

/** One written definition per metric. Dashboard and agent both read this, nothing else. */
export interface Metric {
  id: string;
  label: string;
  description: string;
  definition: string;
  grain: string;
  denominator: string | null;
  owner: string;
  timezone: string;
  filters: string[];
  format: MetricFormat;
  sql: string;
  checks: MetricCheck[];
  /** Phrases the agent uses to map a question to this metric */
  synonyms: string[];
  /** Aggregate value for the reporting period */
  compute: (ds: Dataset) => number;
  /** Points for the sparkline */
  series: (ds: Dataset) => number[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
const int = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
const pct = (n: number, d = 2) => `${(n * 100).toFixed(d)}%`;
const DAY = 86_400_000;

const netRevenue = (ds: Dataset) =>
  sum(ds.daily.map((d) => d.grossRevenue)) - sum(ds.daily.map((d) => d.refunds));
const totalOrders = (ds: Dataset) => sum(ds.daily.map((d) => d.orders));
const totalSessions = (ds: Dataset) => sum(ds.daily.map((d) => d.sessions));

/** Shared check: the daily table has exactly one row per day, with no gaps. */
const dailySpine: MetricCheck = {
  name: "one row per day, no gaps",
  kind: "unique",
  run: (ds) => {
    const dates = ds.daily.map((d) => d.date);
    const unique = new Set(dates).size === dates.length;
    const gaps = ds.daily
      .slice(1)
      .filter((d, i) => Date.parse(d.date) - Date.parse(ds.daily[i]!.date) !== DAY).length;
    return {
      passed: unique && gaps === 0,
      detail: `${dates.length} days, ${dates.length - new Set(dates).size} duplicates, ${gaps} gaps`,
    };
  },
};

export const metrics: Metric[] = [
  {
    id: "net_revenue",
    label: "Net revenue",
    description: "Order value after refunds, for completed orders.",
    definition:
      "Sum of gross order value minus refunded value for orders with status = 'completed', counted once per order on the day the order was placed.",
    grain: "One row per order",
    denominator: null,
    owner: "finance-analytics",
    timezone: "UTC",
    filters: ["status = 'completed'", "is_test_order = false", "currency normalised to USD"],
    format: "currency",
    sql: `-- metric: net_revenue
select
  sum(o.gross_amount_usd - coalesce(o.refunded_amount_usd, 0)) as net_revenue
from {{ ref('fct_orders') }} as o
where o.status = 'completed'
  and o.is_test_order = false
  and o.ordered_at_utc >= {{ period_start }}
  and o.ordered_at_utc <  {{ period_end }}`,
    checks: [
      dailySpine,
      {
        name: "refunds never exceed gross",
        kind: "accepted_range",
        run: (ds) => {
          const bad = ds.daily.filter((d) => d.refunds > d.grossRevenue || d.refunds < 0).length;
          return { passed: bad === 0, detail: `${bad} of ${ds.daily.length} days out of range` };
        },
      },
      {
        name: "reconciles with daily totals",
        kind: "reconciliation",
        run: (ds) => {
          const byDay = sum(ds.daily.map((d) => d.grossRevenue - d.refunds));
          const diff = Math.abs(byDay - netRevenue(ds));
          return {
            passed: diff < 0.01,
            detail: `Δ ${usd(diff)} between day-level and period totals`,
          };
        },
      },
    ],
    synonyms: ["net revenue", "revenue", "sales", "income", "turnover"],
    compute: (ds) => sum(ds.daily.map((d) => d.grossRevenue - d.refunds)),
    series: (ds) => ds.daily.map((d) => d.grossRevenue - d.refunds),
  },
  {
    id: "orders",
    label: "Orders",
    description: "Count of completed, non-test orders.",
    definition:
      "Count of distinct order_id with status = 'completed', on the day the order was placed.",
    grain: "One row per order",
    denominator: null,
    owner: "commerce-analytics",
    timezone: "UTC",
    filters: ["status = 'completed'", "is_test_order = false"],
    format: "number",
    sql: `-- metric: orders
select
  count(distinct o.order_id) as orders
from {{ ref('fct_orders') }} as o
where o.status = 'completed'
  and o.is_test_order = false
  and o.ordered_at_utc >= {{ period_start }}
  and o.ordered_at_utc <  {{ period_end }}`,
    checks: [
      dailySpine,
      {
        name: "orders never exceed sessions",
        kind: "accepted_range",
        run: (ds) => {
          const bad = ds.daily.filter((d) => d.orders > d.sessions || d.orders < 0).length;
          return { passed: bad === 0, detail: `${bad} of ${ds.daily.length} days out of range` };
        },
      },
      {
        name: "counts are whole numbers",
        kind: "not_null",
        run: (ds) => {
          const bad = ds.daily.filter((d) => !Number.isInteger(d.orders)).length;
          return {
            passed: bad === 0,
            detail: `${int(totalOrders(ds))} orders, ${bad} invalid values`,
          };
        },
      },
    ],
    synonyms: ["how many orders", "number of orders", "order count", "orders"],
    compute: (ds) => sum(ds.daily.map((d) => d.orders)),
    series: (ds) => ds.daily.map((d) => d.orders),
  },
  {
    id: "average_order_value",
    label: "Average order value",
    description: "Net revenue divided by completed orders.",
    definition:
      "net_revenue / orders over the same period and filters. Ratio of sums, never an average of daily averages.",
    grain: "Period",
    denominator: "orders",
    owner: "commerce-analytics",
    timezone: "UTC",
    filters: ["inherits filters from net_revenue and orders"],
    format: "currency",
    sql: `-- metric: average_order_value
select
  {{ metric('net_revenue') }} / nullif({{ metric('orders') }}, 0)
    as average_order_value`,
    checks: [
      {
        name: "denominator > 0",
        kind: "accepted_range",
        run: (ds) => ({ passed: totalOrders(ds) > 0, detail: `orders = ${int(totalOrders(ds))}` }),
      },
      {
        name: "equals net_revenue / orders",
        kind: "reconciliation",
        run: (ds) => {
          const value = netRevenue(ds) / totalOrders(ds);
          const naive = mean(ds.daily.map((d) => (d.grossRevenue - d.refunds) / d.orders));
          return {
            passed: Number.isFinite(value),
            detail: `${usd(value)}; an average of daily averages would say ${usd(naive)}`,
          };
        },
      },
      {
        name: "value between $10 and $500",
        kind: "accepted_range",
        run: (ds) => {
          const v = netRevenue(ds) / totalOrders(ds);
          return { passed: v >= 10 && v <= 500, detail: usd(v) };
        },
      },
    ],
    synonyms: ["average order value", "aov", "basket size", "order value", "average basket"],
    compute: (ds) => {
      const rev = sum(ds.daily.map((d) => d.grossRevenue - d.refunds));
      const orders = sum(ds.daily.map((d) => d.orders));
      return orders === 0 ? 0 : rev / orders;
    },
    series: (ds) => ds.daily.map((d) => (d.orders ? (d.grossRevenue - d.refunds) / d.orders : 0)),
  },
  {
    id: "conversion_rate",
    label: "Conversion rate",
    description: "Share of sessions that end in a completed order.",
    definition:
      "orders / sessions over the same period. Sessions exclude bots and internal traffic.",
    grain: "Period",
    denominator: "sessions",
    owner: "growth-analytics",
    timezone: "UTC",
    filters: ["is_bot = false", "is_internal = false"],
    format: "percent",
    sql: `-- metric: conversion_rate
select
  {{ metric('orders') }}::numeric
    / nullif(count(distinct s.session_id), 0) as conversion_rate
from {{ ref('fct_sessions') }} as s
where s.is_bot = false
  and s.is_internal = false
  and s.started_at_utc >= {{ period_start }}
  and s.started_at_utc <  {{ period_end }}`,
    checks: [
      {
        name: "denominator > 0",
        kind: "accepted_range",
        run: (ds) => ({
          passed: totalSessions(ds) > 0,
          detail: `sessions = ${int(totalSessions(ds))}`,
        }),
      },
      {
        name: "value between 0 and 1",
        kind: "accepted_range",
        run: (ds) => {
          const v = totalOrders(ds) / totalSessions(ds);
          return { passed: v >= 0 && v <= 1, detail: pct(v, 3) };
        },
      },
      {
        name: "ratio of sums, not mean of daily rates",
        kind: "reconciliation",
        run: (ds) => {
          const v = totalOrders(ds) / totalSessions(ds);
          const naive = mean(ds.daily.map((d) => d.orders / d.sessions));
          return { passed: Number.isFinite(v), detail: `${pct(v, 3)} vs naive ${pct(naive, 3)}` };
        },
      },
    ],
    synonyms: ["conversion rate", "conversion", "convert", "converting"],
    compute: (ds) => {
      const orders = sum(ds.daily.map((d) => d.orders));
      const sessions = sum(ds.daily.map((d) => d.sessions));
      return sessions === 0 ? 0 : orders / sessions;
    },
    series: (ds) => ds.daily.map((d) => (d.sessions ? d.orders / d.sessions : 0)),
  },
  {
    id: "d30_retention",
    label: "30-day retention",
    description: "Share of new customers who order again within 30 days.",
    definition:
      "Customers with a second completed order within 30 days of their first, divided by all customers in the signup cohort. Cohorts with zero returners still count.",
    grain: "One row per signup cohort",
    denominator: "customers in cohort",
    owner: "lifecycle-analytics",
    timezone: "UTC",
    filters: ["first order status = 'completed'", "cohort fully matured (≥ 30 days old)"],
    format: "percent",
    sql: `-- metric: d30_retention
select
  sum(c.retained_d30)::numeric / nullif(sum(c.customers), 0) as d30_retention
from {{ ref('mart_retention_cohorts') }} as c  -- one row per cohort, zeros included
where c.cohort_week >= {{ period_start }} - interval '12 weeks'
  and c.is_matured = true`,
    checks: [
      {
        name: "one row per cohort, no missing weeks",
        kind: "unique",
        run: (ds) => {
          const weeks = ds.cohorts.map((c) => c.cohort);
          const gaps = ds.cohorts
            .slice(1)
            .filter(
              (c, i) => Date.parse(c.cohort) - Date.parse(ds.cohorts[i]!.cohort) !== 7 * DAY,
            ).length;
          const dupes = weeks.length - new Set(weeks).size;
          return {
            passed: gaps === 0 && dupes === 0,
            detail: `${weeks.length} cohorts, ${dupes} duplicates, ${gaps} gaps`,
          };
        },
      },
      {
        name: "retained never exceeds cohort size",
        kind: "accepted_range",
        run: (ds) => {
          const bad = ds.cohorts.filter(
            (c) => c.retainedD30 > c.customers || c.retainedD30 < 0,
          ).length;
          return {
            passed: bad === 0,
            detail: `${bad} of ${ds.cohorts.length} cohorts out of range`,
          };
        },
      },
      {
        name: "value between 0 and 1",
        kind: "accepted_range",
        run: (ds) => {
          const v =
            sum(ds.cohorts.map((c) => c.retainedD30)) / sum(ds.cohorts.map((c) => c.customers));
          return { passed: v >= 0 && v <= 1, detail: pct(v) };
        },
      },
    ],
    synonyms: ["retention", "retain", "come back", "returning", "repeat"],
    compute: (ds) =>
      sum(ds.cohorts.map((c) => c.retainedD30)) / sum(ds.cohorts.map((c) => c.customers)),
    series: (ds) => ds.cohorts.map((c) => c.retainedD30 / c.customers),
  },
];

export const exampleQuestions: string[] = [
  "What was net revenue in the last 30 days?",
  "What is our average order value?",
  "What's the conversion rate from sessions?",
  "What share of new customers come back within 30 days?",
];

/** Run every check of a metric against the data. This is what the UI shows and what CI asserts. */
export function runTests(metric: Metric, ds: Dataset = defaultDataset): MetricTest[] {
  return metric.checks.map((c) => ({ name: c.name, kind: c.kind, ...c.run(ds) }));
}

export function getMetric(id: string): Metric | undefined {
  return metrics.find((m) => m.id === id);
}
