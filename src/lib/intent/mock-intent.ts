import type { ExecutiveIntent } from "@/lib/intent/engine-types";

/** Active strategic focus for the enterprise mock portfolio. */
export const MOCK_ACTIVE_INTENT: ExecutiveIntent = {
  id: "intent-h2-enterprise-focus",
  title: "Enterprise conversion & leadership bandwidth",
  narrative:
    "This half, leadership attention concentrates on converting enterprise ARR and protecting the judgment time required to close Helix — while keeping the board narrative honest. Geographic expansion and adjacent experiments wait.",
  priority: "critical",
  horizon: "H2 2026 · next 90 days",
  reviewDate: "2026-07-27",
  reviewCadence: "Weekly · Mondays",
  focusOutcomeIds: ["outcome-enterprise-arr", "outcome-efficiency"],
  watchingOutcomeIds: ["outcome-board"],
  nonFocusOutcomeIds: ["outcome-retention"],
  constraints: [
    {
      id: "constraint-capital",
      label: "No unplanned headcount in Growth",
      explanation:
        "Hiring freeze in revenue ops holds until Helix lands or the board resets the plan.",
    },
    {
      id: "constraint-time",
      label: "Protect Tue/Thu CEO focus blocks",
      explanation:
        "External forums and internal sync sprawl cannot consume residency decision time.",
    },
    {
      id: "constraint-board",
      label: "Board pack must reflect true growth risk",
      explanation:
        "Do not sandbag Helix risk out of the Q3 operating narrative.",
    },
  ],
  successSignals: [
    {
      id: "signal-helix",
      label: "Helix path clear",
      narrative:
        "Residency decision taken with owners and a dated commercial path — not deferred again.",
    },
    {
      id: "signal-focus",
      label: "Focus time recovers",
      narrative:
        "CEO focus blocks held two consecutive weeks and duplicate forums are merged or killed.",
    },
    {
      id: "signal-board",
      label: "Board sees the same risk",
      narrative:
        "Operating narrative and live Outcome Health tell one story on enterprise risk.",
    },
  ],
  status: "active",
  history: [
    {
      id: "ih-1",
      at: "2026-07-01T09:00:00+10:00",
      title: "Intent activated",
      detail: "H2 focus set on enterprise conversion and leadership bandwidth.",
      kind: "activated",
    },
    {
      id: "ih-2",
      at: "2026-07-14T08:30:00+10:00",
      title: "Retention demoted to non-focus",
      detail:
        "NRR remains owned operationally; it is not the CEO’s primary judgment queue this fortnight.",
      kind: "amended",
    },
    {
      id: "ih-3",
      at: "2026-07-20T06:00:00+10:00",
      title: "Weekly review",
      detail: "Helix slip overnight; Intent held — focus outcomes unchanged.",
      kind: "reviewed",
    },
  ],
};

/** Prior period — Intent page history (superseded records, not a second SoT). */
export const MOCK_INTENT_HISTORY: ExecutiveIntent[] = [
  {
    id: "intent-h1-stabilisation",
    title: "Stabilise operating rhythm",
    narrative:
      "H1 concentrated on clearing meeting debt and publishing a single operating narrative after the reorganisation.",
    priority: "high",
    horizon: "H1 2026",
    reviewDate: "2026-06-30",
    reviewCadence: "Biweekly",
    focusOutcomeIds: ["outcome-efficiency", "outcome-board"],
    watchingOutcomeIds: ["outcome-enterprise-arr"],
    nonFocusOutcomeIds: ["outcome-retention"],
    constraints: [
      {
        id: "constraint-h1-reorg",
        label: "Freeze org chart changes",
        explanation: "No further team moves until operating forums settled.",
      },
    ],
    successSignals: [
      {
        id: "signal-h1-forums",
        label: "Forum map published",
        narrative: "One agreed leadership forum map with owners.",
      },
    ],
    status: "superseded",
    history: [
      {
        id: "ih-h1-1",
        at: "2026-01-15T09:00:00+10:00",
        title: "Intent activated",
        detail: "Post-reorg stabilisation mandate.",
        kind: "activated",
      },
      {
        id: "ih-h1-2",
        at: "2026-06-30T17:00:00+10:00",
        title: "Superseded",
        detail: "Replaced by H2 enterprise conversion focus.",
        kind: "superseded",
      },
    ],
  },
];
