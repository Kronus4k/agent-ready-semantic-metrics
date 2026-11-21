import type { ReactNode } from "react";

import { FadeIn } from "./FadeIn";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <FadeIn className="mb-10 max-w-2xl">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h1>
      {children && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{children}</p>}
    </FadeIn>
  );
}
