import { dataset as defaultDataset, type Dataset } from "@/data/dataset";
import { metrics, getMetric, type Metric, type MetricFormat } from "@/data/metrics";

/** Every consumer computes through this one function. */
export function computeMetric(id: string, ds: Dataset = defaultDataset): number {
  const metric = getMetric(id);
  if (!metric) throw new Error(`Unknown metric: ${id}`);
  return metric.compute(ds);
}

export function metricSeries(id: string, ds: Dataset = defaultDataset): number[] {
  const metric = getMetric(id);
  return metric ? metric.series(ds) : [];
}

export interface Resolution {
  metric: Metric;
  /** The catalog phrase that matched the question */
  matched: string;
}

/** Map a free-text question to a catalog metric. Longest matching synonym wins; no match means no answer. */
export function resolveWithReason(question: string): Resolution | null {
  const q = question.toLowerCase();
  let best: Resolution | null = null;
  for (const metric of metrics) {
    for (const s of metric.synonyms) {
      if (q.includes(s) && (!best || s.length > best.matched.length)) best = { metric, matched: s };
    }
  }
  return best;
}

export function resolveQuestion(question: string): Metric | null {
  return resolveWithReason(question)?.metric ?? null;
}

export interface MetricReading {
  metricId: string;
  value: number;
  series: number[];
}

/** What the BI tile shows. */
export function dashboardTile(metricId: string, ds: Dataset = defaultDataset): MetricReading {
  return { metricId, value: computeMetric(metricId, ds), series: metricSeries(metricId, ds) };
}

/** What the agent returns. Null when no metric in the catalog matches. */
export function agentAnswer(question: string, ds: Dataset = defaultDataset): MetricReading | null {
  const metric = resolveQuestion(question);
  if (!metric) return null;
  return {
    metricId: metric.id,
    value: computeMetric(metric.id, ds),
    series: metricSeries(metric.id, ds),
  };
}

export function formatValue(
  value: number,
  format: MetricFormat,
  opts: { compact?: boolean } = {},
): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: opts.compact ? "compact" : "standard",
      maximumFractionDigits: value >= 1000 && !opts.compact ? 0 : 2,
      minimumFractionDigits: value >= 1000 && !opts.compact ? 0 : 2,
    }).format(value);
  }
  if (format === "percent") {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

/** Size of an error, e.g. "+$1,858 (+211.1%)" or "+7.99 pp". */
export function formatError(correct: number, wrong: number, format: MetricFormat): string {
  const diff = wrong - correct;
  const sign = diff >= 0 ? "+" : "−";
  if (format === "percent") {
    return `${sign}${Math.abs(diff * 100).toFixed(2)} pp`;
  }
  const rel = correct === 0 ? 0 : (diff / correct) * 100;
  return `${sign}${formatValue(Math.abs(diff), format)} (${sign}${Math.abs(rel).toFixed(1)}%)`;
}
