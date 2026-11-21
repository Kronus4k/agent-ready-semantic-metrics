import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/common/PageHeader";
import { LineageDetail } from "@/components/lineage/LineageDetail";
import { LineageFlow } from "@/components/lineage/LineageFlow";
import { lineageNodes } from "@/data/lineage";

export const Route = createFileRoute("/lineage")({
  head: () => ({
    meta: [
      { title: "Lineage · Agent-ready semantic metrics" },
      {
        name: "description",
        content:
          "Follow a metric from raw events through the data contract, models and semantic layer to the dashboard and the agent.",
      },
      { property: "og:title", content: "Lineage · Agent-ready semantic metrics" },
      {
        property: "og:description",
        content: "From raw events to one metric, read by both a dashboard and an AI agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LineagePage,
});

function LineagePage() {
  const [selected, setSelected] = useState("metric");
  const node = lineageNodes.find((n) => n.id === selected) ?? lineageNodes[0]!;

  return (
    <div>
      <PageHeader eyebrow="Lineage" title="From raw events to one shared answer.">
        Both outputs branch from the same metric node. Click any step to see what it guarantees.
      </PageHeader>
      <FadeIn delay={0.05}>
        <LineageFlow selected={selected} onSelect={setSelected} />
      </FadeIn>
      <FadeIn delay={0.1} className="mt-4">
        <LineageDetail node={node} />
      </FadeIn>
    </div>
  );
}
