import { createFileRoute } from "@tanstack/react-router";

import { BugCard } from "@/components/bugs/BugCard";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/common/PageHeader";
import { bugCases } from "@/data/bugs";

export const Route = createFileRoute("/bugs")({
  head: () => ({
    meta: [
      { title: "Bug lab · Agent-ready semantic metrics" },
      { name: "description", content: "Flip a switch to see how a fan-out join or a mart without zero rows silently distorts a metric." },
      { property: "og:title", content: "Bug lab · Agent-ready semantic metrics" },
      { property: "og:description", content: "Two classic modelling bugs and the size of the error they cause." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BugsPage,
});

function BugsPage() {
  return (
    <div>
      <PageHeader eyebrow="Bug lab" title="Small modelling mistakes, big wrong numbers.">
        Two bugs that pass a casual review and still ship the wrong figure. Turn each one on to see the size of the error.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        {bugCases.map((bug, i) => (
          <FadeIn key={bug.id} delay={0.06 + i * 0.06}>
            <BugCard bug={bug} index={i} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
