import type { LucideIcon } from "lucide-react";

import { getMetric, runTests } from "./metrics";
import { Bot, Database, FileCheck2, Filter, LayoutDashboard, Sigma, Table2 } from "lucide-react";

export interface LineageNode {
  id: string;
  label: string;
  /** Technical name, shown in mono */
  name: string;
  icon: LucideIcon;
  stage: "source" | "contract" | "model" | "metric" | "output";
  description: string;
  details: { label: string; value: string }[];
  checks: string[];
}

export const lineageNodes: LineageNode[] = [
  {
    id: "raw",
    label: "Raw events",
    name: "raw.shop_events",
    icon: Database,
    stage: "source",
    description:
      "Append-only order and payment events landed from the shop backend every 15 minutes.",
    details: [
      { label: "Source", value: "Shop backend → object storage" },
      { label: "Volume", value: "≈ 1.2M events / day" },
      { label: "Owner", value: "platform-data" },
    ],
    checks: ["Schema registered", "Arrives every 15 min"],
  },
  {
    id: "contract",
    label: "Data contract",
    name: "contracts/orders.v3.yml",
    icon: FileCheck2,
    stage: "contract",
    description:
      "The producer promises field names, types and meanings. Breaking changes need a new version.",
    details: [
      { label: "Version", value: "v3 (since 2026-06-01)" },
      { label: "Guarantees", value: "order_id unique · amounts in minor units · UTC timestamps" },
      { label: "Owner", value: "checkout-team" },
    ],
    checks: ["Types enforced at ingest", "Breaking change blocked in CI"],
  },
  {
    id: "staging",
    label: "Staging model",
    name: "stg_orders",
    icon: Filter,
    stage: "model",
    description:
      "Renames, casts and de-duplicates events into one clean row per order state change.",
    details: [
      { label: "Materialisation", value: "view" },
      { label: "Grain", value: "One row per order event" },
      { label: "Owner", value: "analytics-engineering" },
    ],
    checks: ["not_null(order_id)", "accepted_values(status)"],
  },
  {
    id: "fact",
    label: "Fact table",
    name: "fct_orders",
    icon: Table2,
    stage: "model",
    description:
      "Latest state of every order with payments pre-aggregated, so joins never fan out.",
    details: [
      { label: "Materialisation", value: "incremental table" },
      { label: "Grain", value: "One row per order" },
      { label: "Owner", value: "analytics-engineering" },
    ],
    checks: ["unique(order_id)", "reconciles with payments ledger"],
  },
  {
    id: "metric",
    label: "Metric",
    name: "metric: net_revenue",
    icon: Sigma,
    stage: "metric",
    description:
      "The single written definition. Filters, time zone and grain live here and nowhere else.",
    details: [
      { label: "Layer", value: "Semantic layer" },
      { label: "Time zone", value: "UTC" },
      { label: "Owner", value: "finance-analytics" },
    ],
    checks: (() => {
      const results = runTests(getMetric("net_revenue")!);
      return [
        "Definition reviewed",
        `${results.filter((r) => r.passed).length} of ${results.length} checks passing on today's data`,
      ];
    })(),
  },
  {
    id: "dashboard",
    label: "Dashboard tile",
    name: "Revenue overview · Net revenue",
    icon: LayoutDashboard,
    stage: "output",
    description: "The BI tile queries the metric by name. It never writes its own SQL.",
    details: [
      { label: "Query", value: "metric('net_revenue', period='30d')" },
      { label: "Refresh", value: "Hourly" },
    ],
    checks: ["Reads from semantic layer only"],
  },
  {
    id: "agent",
    label: "Agent answer",
    name: "agent.tools.query_metric",
    icon: Bot,
    stage: "output",
    description:
      "The agent maps the question to a catalog metric and calls the same query. It may not invent SQL.",
    details: [
      { label: "Tool", value: "query_metric(name, period)" },
      { label: "Fallback", value: "Refuses when no metric matches" },
    ],
    checks: ["Same query as dashboard", "Answer cites metric name"],
  },
];

/** Linear chain, then a fork into the two outputs. */
export const lineageChain = ["raw", "contract", "staging", "fact", "metric"] as const;
export const lineageOutputs = ["dashboard", "agent"] as const;
