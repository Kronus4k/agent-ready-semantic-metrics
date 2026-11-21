import { motion } from "framer-motion";
import { CircleCheck, CircleDashed, CircleSlash } from "lucide-react";

import { cn } from "@/lib/utils";

export type MatchState = "match" | "mismatch" | "pending" | "unanswered";

const copy: Record<MatchState, { title: string; body: string }> = {
  match: { title: "Same number", body: "Dashboard tile and agent answer are identical, to the cent." },
  mismatch: { title: "Numbers differ", body: "The two answers do not agree. Check which definition each one used." },
  pending: { title: "Checking…", body: "Waiting for the agent to answer." },
  unanswered: { title: "Nothing to compare", body: "The agent refused instead of guessing, so there is no number to check." },
};

export function MatchStrip({ state, detail }: { state: MatchState; detail?: string }) {
  const Icon = state === "match" ? CircleCheck : state === "pending" ? CircleDashed : CircleSlash;
  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col gap-2 rounded-2xl border px-5 py-4 transition-colors duration-500 sm:flex-row sm:items-center sm:gap-4",
        state === "match" && "border-success/30 bg-success-soft",
        state === "mismatch" && "border-destructive/30 bg-destructive-soft",
        (state === "pending" || state === "unanswered") && "border-border bg-muted",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 text-sm font-semibold",
          state === "match" && "text-success",
          state === "mismatch" && "text-destructive",
          (state === "pending" || state === "unanswered") && "text-muted-foreground",
        )}
      >
        <motion.span
          key={state}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <Icon className={cn("size-5", state === "pending" && "animate-spin [animation-duration:2.5s]")} />
        </motion.span>
        Same number check · {copy[state].title}
      </div>
      <p className="text-sm text-muted-foreground sm:ml-auto">{detail ?? copy[state].body}</p>
    </motion.div>
  );
}
