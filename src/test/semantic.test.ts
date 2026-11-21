import { describe, expect, it } from "vitest";

import { bugCases } from "@/data/bugs";
import { exampleQuestions, metrics } from "@/data/metrics";
import { agentAnswer, dashboardTile, formatError, resolveQuestion } from "@/lib/semantic";

describe("semantic layer", () => {
  it("dashboard and agent return the same number for every metric", () => {
    for (const m of metrics) {
      const answer = agentAnswer(m.synonyms[0] ?? "");
      expect(answer?.metricId).toBe(m.id);
      expect(answer?.value).toBe(dashboardTile(m.id).value);
    }
  });

  it("maps each example question to the intended metric", () => {
    expect(exampleQuestions.map((q) => resolveQuestion(q)?.id)).toEqual([
      "net_revenue",
      "average_order_value",
      "conversion_rate",
      "d30_retention",
    ]);
  });

  it("agent refuses when no metric matches", () => {
    expect(agentAnswer("What is the weather in Paris?")).toBeNull();
  });
});

describe("bug lab", () => {
  it("fan-out join overstates revenue: $880 correct vs $2,738 wrong", () => {
    const bug = bugCases.find((b) => b.id === "fan-out");
    expect(bug?.correctValue).toBe(880);
    expect(bug?.wrongValue).toBe(2738);
    expect(formatError(880, 2738, "currency")).toBe("+$1,858 (+211.1%)");
  });

  it("missing zero rows inflate retention from 10.09% to 18.08%", () => {
    const bug = bugCases.find((b) => b.id === "missing-zeros");
    expect(bug?.correctValue).toBeCloseTo(217 / 2150, 6);
    expect(bug?.wrongValue).toBeCloseTo(217 / 1200, 6);
    expect(formatError(217 / 2150, 217 / 1200, "percent")).toBe("+7.99 pp");
  });
});
