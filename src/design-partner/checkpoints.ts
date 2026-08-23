/**
 * 30-day Design Partner checkpoint framework — measurement, not PM software.
 */

import { pilotDayOf, pilotWeekFromDay } from "./environment";
import type { DesignPartnerCheckpoint, DesignPartnerPilotWeek } from "./types";

const WEEK_DEFS: Array<{
  week: Exclude<DesignPartnerPilotWeek, "not_started" | "complete">;
  title: string;
  themes: string[];
}> = [
  {
    week: "week_1",
    title: "Week 1 — Baseline",
    themes: [
      "Data onboarding",
      "Forecast interpretation",
      "Baseline snapshot",
    ],
  },
  {
    week: "week_2",
    title: "Week 2 — Judgement quality",
    themes: ["Executive usage", "Judgement quality", "Data friction"],
  },
  {
    week: "week_3",
    title: "Week 3 — Decision workflow",
    themes: ["Decision workflow", "Action linkage", "Repeat usage"],
  },
  {
    week: "week_4",
    title: "Week 4 — Value review",
    themes: [
      "Value review",
      "Adoption",
      "Integration discussion",
      "Expansion opportunities",
    ],
  },
];

export function buildDesignPartnerCheckpoints(input: {
  pilotStartedAt?: string | null;
  asOf?: string;
}): DesignPartnerCheckpoint[] {
  const day = pilotDayOf(input.pilotStartedAt, input.asOf);
  if (day == null) {
    return WEEK_DEFS.map((w) => ({
      week: w.week,
      title: w.title,
      themes: w.themes,
      status: "not_started" as const,
    }));
  }

  const current = pilotWeekFromDay(day);
  const order: DesignPartnerPilotWeek[] = [
    "week_1",
    "week_2",
    "week_3",
    "week_4",
  ];
  const currentIdx = order.indexOf(current === "complete" ? "week_4" : current);

  return WEEK_DEFS.map((w, idx) => {
    let status: DesignPartnerCheckpoint["status"] = "upcoming";
    if (current === "complete" || idx < currentIdx) status = "complete";
    else if (idx === currentIdx) status = "current";
    return {
      week: w.week,
      title: w.title,
      themes: w.themes,
      status,
    };
  });
}

/** Explicit pilot boundary — included vs excluded. */
export const DESIGN_PARTNER_PILOT_INCLUDES = [
  "Manufacturing Forecasting",
  "Excel / CSV ingestion via Universal Data Gateway",
  "Executive Snapshot",
  "Command Centre",
  "Judgement",
  "Decision",
  "Action",
  "Snapshot comparison",
  "Pilot measurement",
] as const;

export const DESIGN_PARTNER_PILOT_EXCLUDES = [
  "Live ERP integration",
  "Live Dynamics integration",
  "SAP integration",
  "Automated factory scheduling",
  "MRP",
  "CMMS",
  "Production execution",
  "Inventory optimisation",
  "Dealer allocation automation",
  "Autonomous decision making",
] as const;
