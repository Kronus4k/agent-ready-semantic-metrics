import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

import type { LineageNode } from "@/data/lineage";

const stageLabel: Record<LineageNode["stage"], string> = {
  source: "Source",
  contract: "Contract",
  model: "Model",
  metric: "Semantic layer",
  output: "Consumer",
};

export function LineageDetail({ node }: { node: LineageNode }) {
  const Icon = node.icon;
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="surface grid gap-8 p-6 md:grid-cols-[1.2fr_1fr]"
    >
      <div>
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="eyebrow">{stageLabel[node.stage]}</div>
            <div className="text-lg font-semibold tracking-tight text-foreground">{node.label}</div>
          </div>
        </div>
        <div className="mt-4 font-mono text-[13px] text-muted-foreground">{node.name}</div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{node.description}</p>
        <ul className="mt-5 space-y-2">
          {node.checks.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-foreground">
              <CircleCheck className="size-4 text-success" />
              {c}
            </li>
          ))}
        </ul>
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border">
        {node.details.map((d) => (
          <div key={d.label} className="px-4 py-3">
            <dt className="eyebrow">{d.label}</dt>
            <dd className="mt-1 text-sm text-foreground">{d.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
