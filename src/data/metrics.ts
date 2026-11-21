import type { Dataset } from "./dataset";

export type MetricFormat = "currency" | "percent" | "number";

export interface MetricTest {
  name: string;
  kind: "not_null" | "unique" | "accepted_range" | "reconciliation" | "freshness" | "relationship";
  passed: boolean;
  detail: string;
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
  tests: MetricTest[];
  /** Phrases the agent uses to map a question to this metric */
  synonyms: string[];
  /** Aggregate value for the reporting period */
  compute: (ds: Dataset) => number;
  /** Points for the sparkline */
  series: (ds: Dataset) => number[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

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
    tests: [
      { name: "order_id is unique", kind: "unique", passed: true, detail: "0 duplicate keys in fct_orders" },
      { name: "gross_amount_usd not null", kind: "not_null", passed: true, detail: "0 nulls" },
      { name: "reconciles with payments ledger", kind: "reconciliation", passed: true, detail: "Δ 0.00% vs ledger" },
      { name: "loaded within 6h", kind: "freshness", passed: true, detail: "Last load 41 min ago" },
    ],
    synonyms: ["net revenue", "revenue", "sales", "income", "turnover"],
    compute: (ds) => sum(ds.daily.map((d) => d.grossRevenue - d.refunds)),
    series: (ds) => ds.daily.map((d) => d.grossRevenue - d.refunds),
  },
  {
    id: "orders",
    label: "Orders",
    description: "Count of completed, non-test orders.",
    definition: "Count of distinct order_id with status = 'completed', on the day the order was placed.",
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
    tests: [
      { name: "order_id is unique", kind: "unique", passed: true, detail: "0 duplicate keys" },
      { name: "customer_id references dim_customers", kind: "relationship", passed: true, detail: "0 orphans" },
      { name: "loaded within 6h", kind: "freshness", passed: true, detail: "Last load 41 min ago" },
    ],
    synonyms: ["how many orders", "number of orders", "order count", "orders"],
    compute: (ds) => sum(ds.daily.map((d) => d.orders)),
    series: (ds) => ds.daily.map((d) => d.orders),
  },
  {
    id: "average_order_value",
    label: "Average order value",
    description: "Net revenue divided by completed orders.",
    definition: "net_revenue / orders over the same period and filters. Ratio of sums, never an average of daily averages.",
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
    tests: [
      { name: "denominator > 0", kind: "accepted_range", passed: true, detail: "orders = 10,000+ in period" },
      { name: "value between $10 and $500", kind: "accepted_range", passed: true, detail: "Within range" },
      { name: "inputs reconcile", kind: "reconciliation", passed: true, detail: "Built from certified metrics" },
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
    definition: "orders / sessions over the same period. Sessions exclude bots and internal traffic.",
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
    tests: [
      { name: "session_id is unique", kind: "unique", passed: true, detail: "0 duplicate keys" },
      { name: "value between 0 and 1", kind: "accepted_range", passed: true, detail: "Within range" },
      { name: "bot filter applied", kind: "accepted_range", passed: true, detail: "0 bot sessions in input" },
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
    tests: [
      { name: "one row per cohort", kind: "unique", passed: true, detail: "8 cohorts, 8 rows" },
      { name: "zero rows present", kind: "reconciliation", passed: true, detail: "Spine joined, no gaps" },
      { name: "value between 0 and 1", kind: "accepted_range", passed: true, detail: "Within range" },
    ],
    synonyms: ["retention", "retain", "come back", "returning", "repeat"],
    compute: (ds) => sum(ds.cohorts.map((c) => c.retainedD30)) / sum(ds.cohorts.map((c) => c.customers)),
    series: (ds) => ds.cohorts.map((c) => c.retainedD30 / c.customers),
  },
];

export const exampleQuestions: string[] = [
  "What was net revenue in the last 30 days?",
  "What is our average order value?",
  "What's the conversion rate from sessions?",
  "What share of new customers come back within 30 days?",
];

export function getMetric(id: string): Metric | undefined {
  return metrics.find((m) => m.id === id);
}
