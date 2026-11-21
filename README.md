# Agent-ready semantic metrics

Metrics that people and AI agents read the same way.

At a growing number of companies the first reader of a metric is not a person on a dashboard. It is an AI agent answering someone's question. If "revenue" means one thing in the dashboard and another thing to the agent, the agent gives a confident wrong answer to everyone who asks.

This app shows the fix in four pages: write every metric down once, test it against the data and make both the dashboard and the agent read that one definition.

## What's inside

| Page | What it shows |
| --- | --- |
| Ask the agent | Ask a question. A rule-based agent maps it to a metric in the catalog and shows which phrase it matched. The dashboard tile and the agent answer sit side by side with a same number check. If no metric matches, the agent refuses instead of guessing. |
| Metric catalog | Every metric as a contract: definition, grain, denominator, filters, time zone, owner, SQL and tests. |
| Bug lab | Two modelling bugs you can switch on: a fan-out join and a retention mart without zero rows. Each card shows the size of the error and the real numbers from when I caught the same bug in [Slussen](https://github.com/Kronus4k/slussen). |
| Lineage | From raw events through the data contract, staging and fact models to the metric, then out to the dashboard tile and the agent answer. |

## Numbers you can check

- No test result is typed by hand. Every check (one row per day, no gaps, refunds never above gross, ratio of sums, one row per cohort and more) runs against the data each time the app loads. The catalog shows the live result.
- The test suite proves the dashboard and the agent return the same value for every synonym of every metric in the catalog.
- The suite also breaks the data on purpose (a duplicated day, a missing day, a missing cohort week, refunds above gross) and asserts that the right check fails. A check that never fails proves nothing.
- Denominators are explicit. Average order value is net revenue divided by orders, not an average of daily averages; the catalog shows both numbers so the difference is visible.

## The two bugs, for real

Both bugs in the bug lab come from my own Snowflake platform, [Slussen](https://github.com/Kronus4k/slussen), built on the public Olist dataset:

- A naive items × payments join inflated item value by 4.5%. No test failed. The fix was one payment row per order and a tie-out of every Gold metric.
- The retention mart had no rows for months without returning customers, so month-1 retention read 13.48% instead of the true 0.47%. A dense cohort grid fixed it.

## Data

All figures in the app are synthetic and generated with a fixed seed, so every reload and every test sees the same numbers. Nothing here is real company data.

## How it was built

- Scaffolded in [Lovable](https://lovable.dev) from a single prompt: layout, design system and the four pages.
- Refined in code with Claude through Lovable's two-way GitHub sync: checks computed from the data, the agent's match trace, the Slussen numbers, the failure tests and CI.

## Stack

React 19, TypeScript, TanStack Start and Router, Tailwind CSS 4, shadcn/ui, Recharts, Framer Motion, Vitest. CI runs type checks, lint, tests and a production build on every push.

## Run it locally

```bash
bun install
bun run dev
bun run test
```

## Author

Umar Sajjad, Data Engineer in Stockholm. [LinkedIn](https://www.linkedin.com/in/mumar-s) · [GitHub](https://github.com/Kronus4k)
