import { ArrowUp, Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (q: string) => void;
  examples: string[];
  activeQuestion: string;
}

export function QuestionInput({ value, onChange, onSubmit, examples, activeQuestion }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
        className="surface group flex items-center gap-3 px-5 py-2 transition-colors focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-ring/20"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask a question about your metrics…"
          aria-label="Ask a question"
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
        />
        <span className="kbd hidden sm:inline-block">/</span>
        <button
          type="submit"
          aria-label="Ask"
          disabled={!value.trim()}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              onChange(q);
              onSubmit(q);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
              q === activeQuestion
                ? "border-primary/40 bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
