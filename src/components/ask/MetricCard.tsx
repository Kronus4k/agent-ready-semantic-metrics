import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/common/CountUp";
import { Sparkline } from "@/components/common/Sparkline";
import type { Metric } from "@/data/metrics";
import type { MetricReading } from "@/lib/semantic";

interface Props {
  title: string;
  icon: LucideIcon;
  source: string;
  metric: Metric | null;
  reading: MetricReading | null;
  state: "ready" | "thinking" | "empty";
  emptyText?: string;
  footer?: ReactNode;
}

export function MetricCard({
  title,
  icon: Icon,
  source,
  metric,
  reading,
  state,
  emptyText,
  footer,
}: Props) {
  return (
    <div className="surface surface-interactive flex min-h-[300px] flex-col p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
          {title}
        </div>
        <span className="text-xs text-muted-foreground">{source}</span>
      </div>

      <AnimatePresence mode="wait">
        {state === "ready" && metric && reading ? (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-1 flex-col"
          >
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <CountUp
              value={reading.value}
              format={metric.format}
              className="num mt-1 block text-5xl font-semibold text-foreground sm:text-[3.5rem] sm:leading-none"
            />
            <div className="mt-3 font-mono text-xs text-muted-foreground">{metric.id}</div>
            <div className="mt-auto pt-6">
              <Sparkline data={reading.series} />
            </div>
          </motion.div>
        ) : state === "thinking" ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex flex-1 flex-col"
          >
            <div className="text-sm text-muted-foreground">Looking up the metric catalog…</div>
            <div className="mt-4 h-14 w-3/4 animate-pulse rounded-xl bg-muted" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-auto h-11 animate-pulse rounded-lg bg-muted" />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex flex-1 flex-col justify-center"
          >
            <div className="num text-5xl font-semibold text-border-strong">—</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {emptyText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {footer && (
        <div className="mt-5 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
