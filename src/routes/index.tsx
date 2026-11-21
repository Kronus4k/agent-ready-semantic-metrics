import { createFileRoute } from "@tanstack/react-router";
import { Bot, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ComputationPanel } from "@/components/ask/ComputationPanel";
import { MatchStrip, type MatchState } from "@/components/ask/MatchStrip";
import { MetricCard } from "@/components/ask/MetricCard";
import { QuestionInput } from "@/components/ask/QuestionInput";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/common/PageHeader";
import { dataset } from "@/data/dataset";
import { exampleQuestions, getMetric } from "@/data/metrics";
import { agentAnswer, dashboardTile, formatValue, resolveQuestion } from "@/lib/semantic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask the agent · Agent-ready semantic metrics" },
      {
        name: "description",
        content: "Ask a question and see the dashboard tile and the AI agent return the exact same number from one metric definition.",
      },
      { property: "og:title", content: "Ask the agent · Agent-ready semantic metrics" },
      { property: "og:description", content: "Metrics that people and AI agents read the same way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskPage,
});

const FIRST_QUESTION = exampleQuestions[0] ?? "What was net revenue in the last 30 days?";

function AskPage() {
  const [input, setInput] = useState(FIRST_QUESTION);
  const [asked, setAsked] = useState(FIRST_QUESTION);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function ask(q: string) {
    setAsked(q);
    setThinking(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setThinking(false), 700);
  }

  const resolved = resolveQuestion(asked);
  const lastMetric = useRef(resolved ?? getMetric("net_revenue")!);
  if (resolved) lastMetric.current = resolved;
  const metric = lastMetric.current;

  const tile = dashboardTile(metric.id);
  const answer = thinking ? null : agentAnswer(asked);

  const matchState: MatchState = thinking
    ? "pending"
    : !answer
      ? "unanswered"
      : answer.value === tile.value && answer.metricId === tile.metricId
        ? "match"
        : "mismatch";

  return (
    <div>
      <PageHeader eyebrow="Ask the agent" title="One definition, one number.">
        Ask a business question. The agent maps it to a metric in the catalog and runs the same query the dashboard
        uses, so both always agree.
      </PageHeader>

      <FadeIn delay={0.05}>
        <QuestionInput value={input} onChange={setInput} onSubmit={ask} examples={exampleQuestions} activeQuestion={asked} />
      </FadeIn>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <FadeIn delay={0.12}>
          <MetricCard
            title="Dashboard tile"
            icon={LayoutDashboard}
            source="Revenue overview"
            metric={metric}
            reading={tile}
            state="ready"
            footer={<>{dataset.periodLabel}</>}
          />
        </FadeIn>
        <FadeIn delay={0.18}>
          <MetricCard
            title="Agent answer"
            icon={Bot}
            source="query_metric()"
            metric={resolved}
            reading={answer}
            state={thinking ? "thinking" : answer ? "ready" : "empty"}
            emptyText="No metric in the catalog matches that question, so the agent won't guess. Try one of the examples above."
            footer={
              answer && resolved ? (
                <>
                  “{resolved.label} for the {dataset.periodLabel.split(" · ")[0]?.toLowerCase()} was{" "}
                  <span className="num font-medium text-foreground">{formatValue(answer.value, resolved.format)}</span>.”
                </>
              ) : thinking ? (
                "Resolving question to a catalog metric…"
              ) : (
                "Answer withheld: unknown metric."
              )
            }
          />
        </FadeIn>
      </div>

      <FadeIn delay={0.24} className="mt-4">
        <MatchStrip
          state={matchState}
          detail={
            matchState === "match"
              ? `Both read ${metric.id} → ${formatValue(tile.value, metric.format)}`
              : undefined
          }
        />
      </FadeIn>

      <FadeIn delay={0.3} className="mt-4">
        <ComputationPanel metric={metric} />
      </FadeIn>
    </div>
  );
}
