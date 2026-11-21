import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const KEYWORDS = new Set(
  "select from where and or as join left inner on using with group by order sum count distinct coalesce nullif interval true false is not null case when then else end".split(
    " ",
  ),
);

function highlightLine(line: string): ReactNode[] {
  const commentAt = line.indexOf("--");
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const comment = commentAt >= 0 ? line.slice(commentAt) : "";
  const parts = code.split(/('[^']*'|\{\{[^}]*\}\}|\b\d+(?:\.\d+)?\b|\b[a-z_]+\b)/gi);
  const out: ReactNode[] = parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith("'")) return <span key={i} className="text-code-string">{p}</span>;
    if (p.startsWith("{{")) return <span key={i} className="text-accent-foreground">{p}</span>;
    if (/^\d/.test(p)) return <span key={i} className="text-code-number">{p}</span>;
    if (KEYWORDS.has(p.toLowerCase())) return <span key={i} className="text-code-keyword">{p}</span>;
    return p;
  });
  if (comment) out.push(<span key="c" className="text-code-comment">{comment}</span>);
  return out;
}

export function CodeBlock({ code, label = "SQL", tone = "default" }: { code: string; label?: string; tone?: "default" | "danger" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-code",
        tone === "danger" ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className={cn("font-mono text-[11px]", tone === "danger" ? "text-destructive" : "text-muted-foreground")}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy SQL"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        {code.split("\n").map((line, i) => (
          <div key={i}>{line ? highlightLine(line) : " "}</div>
        ))}
      </pre>
    </div>
  );
}
