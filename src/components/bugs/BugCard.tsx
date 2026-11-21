import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bug, Factory, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { CodeBlock } from "@/components/common/CodeBlock";
import { CountUp } from "@/components/common/CountUp";
import { Switch } from "@/components/ui/switch";
import type { BugCase } from "@/data/bugs";
import { formatError } from "@/lib/semantic";
import { cn } from "@/lib/utils";

export function BugCard({ bug, index }: { bug: BugCase; index: number }) {
  const [on, setOn] = useState(false);
  const switchId = `bug-${bug.id}`;

  return (
    <div
      className={cn(
        "surface flex flex-col p-6 transition-colors duration-300",
        on && "border-destructive/40",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Bug {String(index + 1).padStart(2, "0")}</div>
          <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
            {bug.title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <label htmlFor={switchId} className="text-xs text-muted-foreground">
            {on ? "Bug on" : "Bug off"}
          </label>
          <Switch
            id={switchId}
            checked={on}
            onCheckedChange={setOn}
            className="data-[state=checked]:bg-destructive"
          />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{bug.summary}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 text-xs text-success">
            <ShieldCheck className="size-3.5" />
            Correct
          </div>
          <CountUp
            value={bug.correctValue}
            format={bug.format}
            className="num mt-2 block text-3xl font-semibold text-foreground"
          />
          <div className="mt-1 text-xs text-muted-foreground">{bug.metricLabel}</div>
        </div>
        <div
          className={cn(
            "rounded-xl border p-4 transition-colors duration-300",
            on ? "border-destructive/30 bg-destructive-soft" : "border-dashed border-border",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              on ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Bug className="size-3.5" />
            With the bug
          </div>
          <AnimatePresence mode="wait">
            {on ? (
              <motion.div
                key="on"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CountUp
                  value={bug.wrongValue}
                  format={bug.format}
                  className="num mt-2 block text-3xl font-semibold text-destructive"
                />
                <div className="num mt-1 text-xs font-medium text-destructive">
                  {formatError(bug.correctValue, bug.wrongValue, bug.format)}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="num mt-2 text-3xl font-semibold text-border-strong">—</div>
                <div className="mt-1 text-xs text-muted-foreground">Turn the switch on</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6">
        <CodeBlock
          code={on ? bug.buggySql : bug.correctSql}
          label={on ? "buggy.sql" : "correct.sql"}
          tone={on ? "danger" : "default"}
        />
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{bug.whyItBreaks}</p>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Factory className="size-3.5 text-primary" strokeWidth={1.75} />
            Caught for real in {bug.inProduction.project}
          </div>
          <a
            href={bug.inProduction.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            View repo
            <ArrowUpRight className="size-3" />
          </a>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="num text-sm text-destructive line-through decoration-destructive/50">
            {bug.inProduction.wrong}
          </span>
          <span className="num text-sm font-semibold text-success">{bug.inProduction.correct}</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {bug.inProduction.story}
        </p>
      </div>
    </div>
  );
}
