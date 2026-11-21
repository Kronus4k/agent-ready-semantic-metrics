import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { MetricSheet } from "@/components/catalog/MetricSheet";
import { MetricTable } from "@/components/catalog/MetricTable";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/common/PageHeader";
import { metrics, runTests, type Metric } from "@/data/metrics";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Metric catalog · Agent-ready semantic metrics" },
      {
        name: "description",
        content:
          "Every metric with its written contract: definition, grain, denominator, owner, SQL and tests.",
      },
      { property: "og:title", content: "Metric catalog · Agent-ready semantic metrics" },
      {
        property: "og:description",
        content: "Searchable catalog of metric contracts shared by dashboards and AI agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Metric | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return metrics;
    return metrics.filter((m) =>
      [m.id, m.label, m.description, m.owner, m.grain, m.denominator ?? ""].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  const passed = metrics.reduce((a, m) => a + runTests(m).filter((t) => t.passed).length, 0);
  const total = metrics.reduce((a, m) => a + m.checks.length, 0);

  return (
    <div>
      <PageHeader eyebrow="Metric catalog" title="The contract behind every number.">
        Each metric is written down once: what it counts, at what grain, divided by what, owned by
        whom and tested how.
      </PageHeader>

      <FadeIn
        delay={0.05}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <label className="surface flex h-11 w-full items-center gap-2.5 px-4 transition-colors focus-within:border-primary/50 sm:max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search metrics, owners, grain…"
            className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="num text-sm text-muted-foreground">
          {metrics.length} metrics · {passed}/{total} tests passing
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <MetricTable rows={rows} onSelect={setSelected} />
      </FadeIn>

      <MetricSheet metric={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
