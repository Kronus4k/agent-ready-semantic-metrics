import { CodeBlock } from "@/components/common/CodeBlock";
import { TestList, TestsBadge } from "@/components/common/TestList";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { runTests, type Metric } from "@/data/metrics";
import { computeMetric, formatValue } from "@/lib/semantic";

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd
        className={
          mono ? "mt-1 font-mono text-[13px] text-foreground" : "mt-1 text-sm text-foreground"
        }
      >
        {children}
      </dd>
    </div>
  );
}

export function MetricSheet({ metric, onClose }: { metric: Metric | null; onClose: () => void }) {
  return (
    <Sheet open={!!metric} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border p-0 shadow-none sm:max-w-xl"
      >
        {metric && (
          <div className="p-6 sm:p-8">
            <SheetHeader className="space-y-0 text-left">
              <div className="eyebrow">Metric contract</div>
              <SheetTitle className="mt-2 font-mono text-xl font-semibold tracking-tight text-foreground">
                {metric.id}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-muted-foreground">
                {metric.label} · {metric.description}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 rounded-xl border border-border px-5 py-4">
              <div className="text-xs text-muted-foreground">Current value</div>
              <div className="num mt-1 text-3xl font-semibold text-foreground">
                {formatValue(computeMetric(metric.id), metric.format)}
              </div>
            </div>

            <section className="mt-8">
              <div className="eyebrow">Definition</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{metric.definition}</p>
            </section>

            <dl className="mt-8 grid grid-cols-2 gap-5">
              <Field label="Grain">{metric.grain}</Field>
              <Field label="Time zone">{metric.timezone}</Field>
              <Field label="Denominator" mono>
                {metric.denominator ?? "—"}
              </Field>
              <Field label="Owner" mono>
                {metric.owner}
              </Field>
            </dl>

            <section className="mt-8">
              <div className="eyebrow">Filters</div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {metric.filters.map((f) => (
                  <li
                    key={f}
                    className="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-[12px] text-foreground"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <div className="eyebrow mb-2">SQL</div>
              <CodeBlock code={metric.sql} label={`metrics/${metric.id}.sql`} />
            </section>

            <section className="mt-8">
              <div className="mb-2 flex items-center gap-2">
                <span className="eyebrow">Tests</span>
                <TestsBadge tests={runTests(metric)} />
              </div>
              <TestList tests={runTests(metric)} />
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
