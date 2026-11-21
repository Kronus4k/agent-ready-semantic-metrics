export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
          <path
            d="M3 12V7M8 12V4M13 12V9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-tight text-foreground">Agent-ready</div>
        <div className="text-[13px] font-semibold tracking-tight text-muted-foreground">
          semantic metrics
        </div>
      </div>
    </div>
  );
}

export function SyntheticBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-primary" />
      Synthetic data
    </span>
  );
}
