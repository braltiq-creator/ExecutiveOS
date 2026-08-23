export type MockInsight = {
  id: string;
  title: string;
  summary: string;
  outcomeIds: string[];
  confidence: number;
  sourceLabel: string;
  createdAt: string;
};

export const MOCK_INSIGHTS: MockInsight[] = [
  {
    id: "insight-helix-coverage",
    title: "Enterprise pipeline coverage slipped below 2.5×",
    summary:
      "Q3 enterprise coverage fell from 3.1× to 2.4× after Helix and Meridian moved out of committed forecast.",
    outcomeIds: ["outcome-enterprise-arr"],
    confidence: 84,
    sourceLabel: "Revenue operations",
    createdAt: "2026-07-20T06:00:00+10:00",
  },
  {
    id: "insight-board-disclosure",
    title: "Board risk language needs a written residency posture",
    summary:
      "Without a decided Helix residency position, board disclosure remains incomplete for the Friday pack.",
    outcomeIds: ["outcome-board", "outcome-enterprise-arr"],
    confidence: 79,
    sourceLabel: "Chief of Staff",
    createdAt: "2026-07-20T05:30:00+10:00",
  },
  {
    id: "insight-retention",
    title: "Expansion accounts show rising security review friction",
    summary:
      "Three installed accounts flagged longer security questionnaires this month — pattern, not one-off.",
    outcomeIds: ["outcome-enterprise-arr"],
    confidence: 72,
    sourceLabel: "Customer success",
    createdAt: "2026-07-19T18:00:00+10:00",
  },
];
