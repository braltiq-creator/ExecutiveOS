import {
  buildAdvisorSummaries,
  buildExecutiveCards,
} from "@/lib/intelligence-center/recommendations";
import { collectIntelligenceSignals } from "@/lib/intelligence-center/signals";
import { buildExecutiveTimeline } from "@/lib/intelligence-center/timeline";
import {
  buildGreeting,
  getPreferredName,
  resolveActiveDigestType,
} from "@/lib/intelligence-center/briefing";
import { buildExecutiveDigest } from "@/lib/intelligence-center/digest";
import type { DigestType, IntelligenceCenterData } from "@/lib/intelligence-center/types";
import type { FeatureEntitlements } from "@/lib/features/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

export function buildIntelligenceCenter(
  intelligence: ExecutiveIntelligenceResult,
  entitlements: FeatureEntitlements | null,
  digestType?: DigestType,
): IntelligenceCenterData {
  const signals = collectIntelligenceSignals(intelligence, entitlements);
  const { cards, topInsights } = buildExecutiveCards(signals);
  const advisorSummaries = buildAdvisorSummaries(signals);
  const timeline = buildExecutiveTimeline(intelligence);
  const activeDigest = digestType ?? resolveActiveDigestType();
  const preferredName = getPreferredName(intelligence);

  const digest = buildExecutiveDigest(
    activeDigest,
    intelligence,
    cards,
    topInsights,
    signals.length,
  );

  return {
    generatedAt: new Date().toISOString(),
    greeting: buildGreeting(preferredName),
    preferredName,
    jobTitle: intelligence.executive.jobTitle,
    company: intelligence.executive.company,
    activeDigest,
    digest,
    topInsights,
    cards,
    advisorSummaries,
    timeline,
    healthScore: intelligence.health.score,
    insightCount: signals.length,
  };
}

export type { IntelligenceCenterData, DigestType } from "@/lib/intelligence-center/types";
