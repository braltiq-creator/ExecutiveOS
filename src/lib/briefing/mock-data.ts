/**
 * @deprecated Phase 2 — Outcome Engine is the single mock source.
 * Re-exports kept for transitional imports.
 */
export { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
export {
  deriveBriefingFromPortfolio,
  deriveIntelligenceFromPortfolio,
} from "@/lib/outcomes/derive";

import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import {
  deriveBriefingFromPortfolio,
  deriveIntelligenceFromPortfolio,
} from "@/lib/outcomes/derive";

export const MOCK_INTELLIGENCE =
  deriveIntelligenceFromPortfolio(MOCK_OUTCOME_PORTFOLIO);
export const MOCK_EXECUTIVE_BRIEFING =
  deriveBriefingFromPortfolio(MOCK_OUTCOME_PORTFOLIO);
