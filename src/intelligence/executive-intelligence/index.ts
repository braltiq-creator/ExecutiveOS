/**
 * Executive Intelligence Engine (EIE)
 *
 * Reasoning layer between enterprise data providers and the executive UI.
 * Pure TypeScript. Deterministic. No React.
 */

export type * from "@/intelligence/executive-intelligence/types";

export type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
export { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/mock-enterprise-data-provider";

export { assessConfidence, assessPortfolioConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
export { buildReasoningGraph, explainGraph } from "@/intelligence/executive-intelligence/engines/reasoning-graph";
export { deriveBusinessPulse } from "@/intelligence/executive-intelligence/engines/business-pulse-engine";
export { deriveExecutiveCapacity } from "@/intelligence/executive-intelligence/engines/executive-capacity-engine";
export { deriveOutcomeIntelligence } from "@/intelligence/executive-intelligence/engines/outcome-intelligence-engine";
export { deriveDecisionIntelligence } from "@/intelligence/executive-intelligence/engines/decision-intelligence-engine";
export { deriveRecommendations } from "@/intelligence/executive-intelligence/engines/recommendation-engine";
export { deriveBusinessNarrative } from "@/intelligence/executive-intelligence/engines/business-narrative-engine";
export { allocateAttention } from "@/intelligence/executive-intelligence/engines/attention-engine";
export { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/engines/executive-snapshot-builder";

export { toPresentationSnapshot } from "@/intelligence/executive-intelligence/adapters/to-presentation-snapshot";

export { clipNarrative } from "@/intelligence/executive-intelligence/lib/helpers";

import { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/mock-enterprise-data-provider";
import { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/engines/executive-snapshot-builder";
import { toPresentationSnapshot } from "@/intelligence/executive-intelligence/adapters/to-presentation-snapshot";
import {
  createIsolatedIntentProfile,
  createIsolatedKnowledgeGraph,
  createIsolatedMemoryStore,
} from "@/intelligence/executive-intelligence/lib/isolated-context";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import { getEnterpriseDigitalTwin } from "@/digital-twin";

/** Primary entry — portfolio SoT → Intelligent snapshot (demo twin overlays allowed). */
export function runExecutiveIntelligence(
  portfolio: OutcomePortfolio,
): IntelligentExecutiveSnapshot {
  const provider = createMockEnterpriseDataProvider(portfolio);
  return buildIntelligentExecutiveSnapshot(
    provider,
    undefined,
    undefined,
    undefined,
    getEnterpriseDigitalTwin(),
  );
}

/**
 * Real customer / commercial snapshots — no demo intent, memory, twin, or provider overlays.
 */
export function runIsolatedExecutiveIntelligence(
  portfolio: OutcomePortfolio,
  options?: { executiveName?: string; asOf?: string },
): IntelligentExecutiveSnapshot {
  const provider = createMockEnterpriseDataProvider(portfolio);
  const asOf = options?.asOf ?? portfolio.refreshedAt;
  return buildIntelligentExecutiveSnapshot(
    provider,
    createIsolatedKnowledgeGraph(asOf),
    createIsolatedIntentProfile({
      executiveName: options?.executiveName ?? portfolio.executiveName,
      asOf,
    }),
    createIsolatedMemoryStore(asOf),
    undefined,
    { isolateFromDemoContext: true },
  );
}

/** Today presentation entry — UI should call this (or consume its result). */
export function buildExecutiveSnapshotForUi(
  portfolio: OutcomePortfolio,
): ExecutiveSnapshot {
  return toPresentationSnapshot(runExecutiveIntelligence(portfolio));
}
