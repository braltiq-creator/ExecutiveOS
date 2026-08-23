import type { TimeHorizon, TimeHorizonId } from "@/futures/models/types";

export const TIME_HORIZONS: Record<TimeHorizonId, TimeHorizon> = {
  "24h": {
    id: "24h",
    label: "24 Hours",
    days: 1,
    executiveUse: "Overnight shifts and immediate operating risk.",
  },
  "7d": {
    id: "7d",
    label: "7 Days",
    days: 7,
    executiveUse: "Weekly rhythm — decisions that must land this week.",
  },
  "30d": {
    id: "30d",
    label: "30 Days",
    days: 30,
    executiveUse: "Monthly operating plan and cash/capacity pressure.",
  },
  "90d": {
    id: "90d",
    label: "90 Days",
    days: 90,
    executiveUse: "Quarter outcomes and strategic initiative checkpoints.",
  },
  "12m": {
    id: "12m",
    label: "12 Months",
    days: 365,
    executiveUse: "Annual trajectory and structural bets.",
  },
  "3y": {
    id: "3y",
    label: "3 Years",
    days: 1095,
    executiveUse: "Long-cycle strategic positioning.",
  },
};

export function listTimeHorizons(): TimeHorizon[] {
  return Object.values(TIME_HORIZONS);
}

export function getTimeHorizon(id: TimeHorizonId): TimeHorizon {
  return TIME_HORIZONS[id];
}

/** Pick a primary horizon from pressure signals — deterministic. */
export function selectPrimaryHorizon(input: {
  urgentDecisionCount: number;
  decliningOutcomeCount: number;
  capacityConstrained: boolean;
  strategicInitiativePressure: boolean;
}): TimeHorizonId {
  if (input.urgentDecisionCount >= 2 || input.capacityConstrained) {
    return "7d";
  }
  if (input.decliningOutcomeCount >= 2) {
    return "30d";
  }
  if (input.strategicInitiativePressure) {
    return "90d";
  }
  return "30d";
}
