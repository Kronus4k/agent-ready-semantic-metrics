/**
 * Real result from Slussen (github.com/Kronus4k/slussen), not synthetic.
 * Measured on 6 Nov 2026 as the Norte regional analyst, on the public Olist dataset.
 */
export const slussenProof = {
  project: "Slussen",
  url: "https://github.com/Kronus4k/slussen",
  persona: "Norte analyst",
  currency: "BRL",
  figures: [
    { label: "GMV", value: "409,522.85" },
    { label: "GMV orders", value: "1,840" },
    { label: "Average order value", value: "222.57" },
  ],
  questionsMatched: 5,
  questionsAsked: 5,
  summary:
    "An AI agent (Snowflake Cortex Analyst) and the Power BI tie-out page returned the same figures to the cent, under the same row access policy. Asked about another market, the agent returned nothing: row access applies to the agent too.",
  defectsCaught:
    "Getting there caught two silent defects: verified queries that had drifted after a schema change and an order count of 1,846 against the dashboard's 1,840 until the analysis-window rule was aligned.",
} as const;
