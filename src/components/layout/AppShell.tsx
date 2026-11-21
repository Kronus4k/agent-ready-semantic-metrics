import { Link, useRouterState } from "@tanstack/react-router";
import { Github } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { BrandMark, SyntheticBadge } from "./BrandMark";
import { GITHUB_URL, navItems } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

function useIsActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

function Sidebar() {
  const isActive = useIsActive();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
      <div className="px-2">
        <BrandMark />
        <div className="mt-4">
          <SyntheticBadge />
        </div>
      </div>
      <nav className="mt-10 flex flex-col gap-0.5" aria-label="Main">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 text-xs leading-relaxed text-muted-foreground">
        One written definition per metric. Dashboards and agents read the same one.
      </div>
    </aside>
  );
}

function TopBar() {
  const isActive = useIsActive();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <p className="hidden text-sm text-muted-foreground lg:block">
          Metrics that people and AI agents read the same way.
        </p>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Github className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
      <nav
        className="scrollbar-none flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden"
        aria-label="Main"
      >
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-3.5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
