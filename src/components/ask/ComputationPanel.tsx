import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { CodeBlock } from "@/components/common/CodeBlock";
import { TestList } from "@/components/common/TestList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { runTests, type Metric } from "@/data/metrics";
import { cn } from "@/lib/utils";

export function ComputationPanel({ metric }: { metric: Metric }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="surface overflow-hidden">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-muted/50">
        <div>
          <div className="text-sm font-medium text-foreground">How this number was computed</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            Definition, SQL and tests for{" "}
            <span className="font-mono text-foreground">{metric.id}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="grid gap-8 border-t border-border px-6 py-6 md:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <section>
              <div className="eyebrow">Definition</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{metric.definition}</p>
            </section>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="eyebrow">Grain</dt>
                <dd className="mt-1 text-foreground">{metric.grain}</dd>
              </div>
              <div>
                <dt className="eyebrow">Time zone</dt>
                <dd className="mt-1 text-foreground">{metric.timezone}</dd>
              </div>
              <div>
                <dt className="eyebrow">Denominator</dt>
                <dd className="mt-1 font-mono text-[13px] text-foreground">
                  {metric.denominator ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Owner</dt>
                <dd className="mt-1 font-mono text-[13px] text-foreground">{metric.owner}</dd>
              </div>
            </dl>
            <section>
              <div className="eyebrow mb-2">Tests</div>
              <TestList tests={runTests(metric)} />
            </section>
          </div>
          <div>
            <div className="eyebrow mb-2">SQL</div>
            <CodeBlock code={metric.sql} label={`metrics/${metric.id}.sql`} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
