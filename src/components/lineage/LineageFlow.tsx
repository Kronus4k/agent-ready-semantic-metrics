import { Fragment } from "react";

import { lineageChain, lineageNodes, lineageOutputs } from "@/data/lineage";
import { LineageNodeButton } from "./LineageNodeButton";

function Connector() {
  return (
    <div className="flex w-8 shrink-0 items-center" aria-hidden="true">
      <div className="h-px flex-1 bg-border-strong" />
      <div className="size-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-border-strong" />
    </div>
  );
}

function Fork() {
  return (
    <svg className="h-[184px] w-10 shrink-0 text-border-strong" viewBox="0 0 40 184" fill="none" aria-hidden="true">
      <path d="M0 92 H12 C20 92 20 46 28 46 H34" stroke="currentColor" />
      <path d="M0 92 H12 C20 92 20 138 28 138 H34" stroke="currentColor" />
      <path d="M34 42 L40 46 L34 50 Z M34 134 L40 138 L34 142 Z" fill="currentColor" />
    </svg>
  );
}

export function LineageFlow({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const byId = (id: string) => lineageNodes.find((n) => n.id === id)!;
  return (
    <div className="surface scrollbar-none overflow-x-auto p-6">
      <div className="flex w-max items-center">
        {lineageChain.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && <Connector />}
            <LineageNodeButton node={byId(id)} active={selected === id} onSelect={onSelect} />
          </Fragment>
        ))}
        <Fork />
        <div className="flex flex-col gap-4">
          {lineageOutputs.map((id) => (
            <LineageNodeButton key={id} node={byId(id)} active={selected === id} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
