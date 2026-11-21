import type { LineageNode } from "@/data/lineage";
import { cn } from "@/lib/utils";

export function LineageNodeButton({
  node,
  active,
  onSelect,
}: {
  node: LineageNode;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = node.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      aria-pressed={active}
      className={cn(
        "w-40 shrink-0 rounded-2xl border bg-card p-4 text-left transition-all duration-200",
        active
          ? "border-primary bg-accent ring-4 ring-ring/15"
          : "border-border hover:-translate-y-0.5 hover:border-border-strong",
      )}
    >
      <div
        className={cn(
          "grid size-8 place-items-center rounded-lg border",
          active ? "border-primary/30 text-primary" : "border-border text-muted-foreground",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="mt-3 text-sm font-medium text-foreground">{node.label}</div>
      <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{node.name}</div>
    </button>
  );
}
