import { FlaskConical, GitFork, LibraryBig, MessageSquareText } from "lucide-react";

export const navItems = [
  { to: "/", label: "Ask the agent", icon: MessageSquareText },
  { to: "/catalog", label: "Metric catalog", icon: LibraryBig },
  { to: "/bugs", label: "Bug lab", icon: FlaskConical },
  { to: "/lineage", label: "Lineage", icon: GitFork },
] as const;

export const GITHUB_URL = "https://github.com/Kronus4k/agent-ready-semantic-metrics";
