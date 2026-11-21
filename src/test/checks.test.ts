import { describe, expect, it } from "vitest";

import { bugCases } from "@/data/bugs";
import { dataset, type Dataset } from "@/data/dataset";
import { getMetric, metrics, runTests } from "@/data/metrics";
import { agentAnswer, dashboardTile, resolveWithReason } from "@/lib/semantic";

const clone = (ds: Dataset): Dataset => structuredClone(ds);
const failing = (metricId: string, ds: Dataset) =>
  runTests(getMetric(metricId)!, ds)
    .filter((t) => !t.passed)
    .map((t) => t.name);

describe("metric checks run against the data", () => {
  it("every check passes on the shipped dataset", () => {
    for (const m of metrics) {
      for (const t of runTests(m)) {
        expect({ metric: m.id, test: t.name, passed: t.passed }).toEqual({
          metric: m.id,
          test: t.name,
          passed: true,
        });
      }
    }
  });

  it("catches a duplicated day", () => {
    const ds = clone(dataset);
    ds.daily.splice(5, 0, { ...ds.daily[5]! });
    expect(failing("net_revenue", ds)).toContain("one row per day, no gaps");
    expect(failing("orders", ds)).toContain("one row per day, no gaps");
  });

  it("catches a missing day", () => {
    const ds = clone(dataset);
    ds.daily.splice(10, 1);
    expect(failing("net_revenue", ds)).toContain("one row per day, no gaps");
  });

  it("catches refunds larger than gross", () => {
    const ds = clone(dataset);
    ds.daily[3]!.refunds = ds.daily[3]!.grossRevenue + 1;
    expect(failing("net_revenue", ds)).toEqual(["refunds never exceed gross"]);
  });

  it("catches more orders than sessions", () => {
    const ds = clone(dataset);
    ds.daily[7]!.orders = ds.daily[7]!.sessions + 1;
    expect(failing("orders", ds)).toContain("orders never exceed sessions");
  });

  it("catches a missing cohort week, the same failure as the retention bug", () => {
    const ds = clone(dataset);
    ds.cohorts.splice(3, 1);
    expect(failing("d30_retention", ds)).toEqual(["one row per cohort, no missing weeks"]);
  });

  it("catches retained customers above cohort size", () => {
    const ds = clone(dataset);
    ds.cohorts[0]!.retainedD30 = ds.cohorts[0]!.customers + 1;
    expect(failing("d30_retention", ds)).toContain("retained never exceeds cohort size");
  });
});

describe("denominators matter", () => {
  it("average order value is a ratio of sums, not a mean of daily averages", () => {
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const naive =
      sum(dataset.daily.map((d) => (d.grossRevenue - d.refunds) / d.orders)) / dataset.daily.length;
    expect(dashboardTile("average_order_value").value).not.toBeCloseTo(naive, 2);
  });
});

describe("agent", () => {
  it("answers with the same number as the dashboard for every synonym in the catalog", () => {
    for (const m of metrics) {
      for (const s of m.synonyms) {
        const answer = agentAnswer(`What is our ${s}?`);
        const resolved = resolveWithReason(`What is our ${s}?`);
        expect(answer).not.toBeNull();
        expect(answer!.value).toBe(dashboardTile(answer!.metricId).value);
        expect(resolved!.metric.id).toBe(answer!.metricId);
      }
    }
  });

  it("explains which catalog phrase it matched", () => {
    expect(resolveWithReason("What's our AOV this month?")?.matched).toBe("aov");
  });
});

describe("bug lab", () => {
  it("links each bug to the real numbers measured in Slussen", () => {
    const fanOut = bugCases.find((b) => b.id === "fan-out")!;
    const zeros = bugCases.find((b) => b.id === "missing-zeros")!;
    expect(fanOut.inProduction.wrong).toContain("4.5%");
    expect(zeros.inProduction.wrong).toBe("13.48%");
    expect(zeros.inProduction.correct).toContain("0.47%");
  });
});

describe("server-rendered numbers", () => {
  it("CountUp renders the exact value in its first render, never a zero placeholder", async () => {
    const { renderToString } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { CountUp } = await import("@/components/common/CountUp");
    const html = renderToString(
      createElement(CountUp, { value: dashboardTile("net_revenue").value, format: "currency" }),
    );
    expect(html).toContain("$687,203");
    expect(html).not.toContain("$0.00");
  });
});
