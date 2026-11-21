import { CircleCheck, CircleX } from "lucide-react";

import type { MetricTest } from "@/data/metrics";

export function TestList({ tests }: { tests: MetricTest[] }) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {tests.map((t) => (
        <li key={t.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
          {t.passed ? (
            <CircleCheck className="size-4 shrink-0 text-success" />
          ) : (
            <CircleX className="size-4 shrink-0 text-destructive" />
          )}
          <span className="font-mono text-[12.5px] text-foreground">{t.name}</span>
          <span className="ml-auto text-right text-xs text-muted-foreground">{t.detail}</span>
        </li>
      ))}
    </ul>
  );
}

export function TestsBadge({ tests }: { tests: MetricTest[] }) {
  const passed = tests.filter((t) => t.passed).length;
  const all = passed === tests.length;
  return (
    <span
      className={
        all
          ? "num inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success"
          : "num inline-flex items-center gap-1.5 rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-medium text-destructive"
      }
    >
      <span className="size-1.5 rounded-full bg-current" />
      {passed}/{tests.length}
    </span>
  );
}
