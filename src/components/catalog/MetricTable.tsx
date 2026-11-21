import { ChevronRight } from "lucide-react";

import { TestsBadge } from "@/components/common/TestList";
import { runTests, type Metric } from "@/data/metrics";

export function MetricTable({ rows, onSelect }: { rows: Metric[]; onSelect: (m: Metric) => void }) {
  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Metric", "Description", "Grain", "Denominator", "Owner", "Tests", ""].map((h) => (
                <th key={h} className="eyebrow px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((m) => (
              <tr
                key={m.id}
                onClick={() => onSelect(m)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(m)}
                tabIndex={0}
                className="group cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
              >
                <td className="px-5 py-4 align-top">
                  <div className="font-mono text-[13px] font-medium text-foreground">{m.id}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.label}</div>
                </td>
                <td className="max-w-[260px] px-5 py-4 align-top text-muted-foreground">
                  {m.description}
                </td>
                <td className="px-5 py-4 align-top text-foreground">{m.grain}</td>
                <td className="px-5 py-4 align-top font-mono text-[12.5px] text-muted-foreground">
                  {m.denominator ?? "—"}
                </td>
                <td className="px-5 py-4 align-top font-mono text-[12.5px] text-muted-foreground">
                  {m.owner}
                </td>
                <td className="px-5 py-4 align-top">
                  <TestsBadge tests={runTests(m)} />
                </td>
                <td className="px-3 py-4 align-top">
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No metrics match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
