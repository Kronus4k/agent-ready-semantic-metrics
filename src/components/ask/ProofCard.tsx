import { ArrowUpRight, BadgeCheck } from "lucide-react";

import { slussenProof as p } from "@/data/proof";

export function ProofCard() {
  return (
    <div className="surface p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BadgeCheck className="size-4 text-success" strokeWidth={1.75} />
            Proven on real data in {p.project}
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Not synthetic. Public Olist dataset, asked as the {p.persona}:{" "}
            <span className="num text-foreground">
              {p.questionsMatched} of {p.questionsAsked}
            </span>{" "}
            questions matched.
          </p>
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          View the Slussen repo
          <ArrowUpRight className="size-3" />
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {p.figures.map((f) => (
          <div key={f.label} className="rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground">{f.label}</div>
            <div className="num mt-1 text-2xl font-semibold text-foreground">{f.value}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-success">
              <span className="size-1.5 rounded-full bg-current" />
              Agent = Power BI{f.label === "GMV orders" ? "" : ` · ${p.currency}`}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">{p.summary}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.defectsCaught}</p>
    </div>
  );
}
