/**
 * Last validated studio context for Command Centre handoff.
 * Presentation store only — not Core state.
 */

import type { CommercialExecutiveBrief } from "../intelligence/commercial-brief";
import type { CommercialAnalysis } from "../intelligence/commercial-analysis";
import type { ManufacturingExecutiveBrief } from "../intelligence/manufacturing-brief";
import type { ManufacturingAnalysis } from "../intelligence/manufacturing-analysis";

export type ActiveStudioContext = {
  snapshotId: string;
  profileId: string;
  readiness: number;
  brief?: CommercialExecutiveBrief | ManufacturingExecutiveBrief;
  analysis?: CommercialAnalysis | ManufacturingAnalysis;
  commandCentreHref: "/today";
  savedAt: string;
};

let active: ActiveStudioContext | null = null;

export function saveActiveStudioContext(ctx: ActiveStudioContext): void {
  active = ctx;
}

export function getActiveStudioContext(): ActiveStudioContext | null {
  return active;
}

export function clearActiveStudioContext(): void {
  active = null;
}
