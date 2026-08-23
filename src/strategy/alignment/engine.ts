/**
 * Alignment engine — trace recommendations/decisions to strategic outcomes.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import {
  listStrategicInitiatives,
  listDriftingInitiatives,
} from "@/strategy/initiatives";
import type {
  AlignmentLink,
  AlignmentSnapshot,
  StrategicOutcome,
} from "@/strategy/framework/types";

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap += 1;
  return Math.round((overlap / new Set([...ta, ...tb]).size) * 100);
}

function alignTextToOutcomes(input: {
  tenantId: string;
  title: string;
  detail?: string;
  recommendationId?: string | null;
  decisionId?: string | null;
  asOf: string;
}): AlignmentLink[] {
  const outcomes = listStrategicOutcomes(input.tenantId);
  const hay = `${input.title} ${input.detail ?? ""}`;
  return outcomes
    .map((outcome) => {
      const score = Math.max(
        similarity(hay, outcome.name),
        similarity(hay, outcome.description),
        similarity(hay, outcome.successMeasures.join(" ")),
      );
      const contribution = Math.min(100, Math.round(score * 0.85 + 10));
      const link: AlignmentLink & { score: number } = {
        id: `align-${input.tenantId}-${outcome.id}-${input.recommendationId ?? input.decisionId ?? "x"}`,
        tenantId: input.tenantId,
        recommendationId: input.recommendationId ?? null,
        recommendationTitle: input.title,
        outcomeId: outcome.id,
        outcomeName: outcome.name,
        expectedImpact: `Advances "${outcome.name}" through focused executive action`,
        confidence: Math.min(90, 40 + Math.round(score * 0.5)),
        evidence: [
          ...outcome.evidence.slice(0, 2),
          score >= 20
            ? `Lexical alignment ${score}%`
            : "Default strategic linkage (top outcome)",
        ],
        potentialRisk:
          outcome.currentHealth === "off_track" ||
          outcome.currentHealth === "at_risk"
            ? "Outcome already at risk — delayed action increases strategic drift"
            : "Misaligned effort if recommendation is deferred",
        estimatedContribution: contribution,
        providerIds: inferProviders(outcome),
        decisionId: input.decisionId ?? null,
        asOf: input.asOf,
        score,
      };
      return link;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score: _score, ...link }) => link);
}

function inferProviders(outcome: StrategicOutcome): string[] {
  const text = `${outcome.name} ${outcome.description}`.toLowerCase();
  const providers: string[] = ["microsoft365"];
  if (/operat|capacity|safety|delivery|field|job/.test(text)) {
    providers.push("simpro");
  }
  if (/revenue|pipeline|forecast|customer|commercial|growth/.test(text)) {
    providers.push("salesforce");
  }
  return providers;
}

export function alignRecommendationToOutcomes(input: {
  tenantId: string;
  recommendationId?: string;
  title: string;
  detail?: string;
  asOf?: string;
}): AlignmentLink[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const links = alignTextToOutcomes({
    tenantId: input.tenantId,
    title: input.title,
    detail: input.detail,
    recommendationId: input.recommendationId ?? null,
    asOf,
  });
  // Ensure every recommendation maps to at least the top outcome
  if (links.length === 0) {
    const top = listStrategicOutcomes(input.tenantId)[0];
    if (!top) return [];
    return [
      {
        id: `align-${input.tenantId}-${top.id}-fallback`,
        tenantId: input.tenantId,
        recommendationId: input.recommendationId ?? null,
        recommendationTitle: input.title,
        outcomeId: top.id,
        outcomeName: top.name,
        expectedImpact: `Supports primary strategic outcome "${top.name}"`,
        confidence: 45,
        evidence: ["Primary strategic outcome fallback"],
        potentialRisk: "Weak explicit alignment — refine outcome tags",
        estimatedContribution: 35,
        providerIds: inferProviders(top),
        decisionId: null,
        asOf,
      },
    ];
  }
  return links;
}

export function buildAlignmentSnapshot(input: {
  tenantId: string;
  recommendations?: Array<{ id: string; title: string; detail?: string }>;
  decisions?: Array<{ id: string; title: string; detail?: string }>;
  asOf?: string;
}): AlignmentSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const recommendationAlignments = (input.recommendations ?? []).flatMap((r) =>
    alignRecommendationToOutcomes({
      tenantId: input.tenantId,
      recommendationId: r.id,
      title: r.title,
      detail: r.detail,
      asOf,
    }),
  );
  const decisionAlignments = (input.decisions ?? []).flatMap((d) =>
    alignTextToOutcomes({
      tenantId: input.tenantId,
      title: d.title,
      detail: d.detail,
      decisionId: d.id,
      asOf,
    }),
  );

  const improvingOutcomes = listStrategicOutcomes(input.tenantId).filter(
    (o) => o.currentHealth === "on_track" || o.currentHealth === "achieved",
  );
  const drifting = listDriftingInitiatives(input.tenantId);

  const providerMap = new Map<string, Set<string>>();
  for (const link of recommendationAlignments) {
    for (const p of link.providerIds) {
      const set = providerMap.get(p) ?? new Set();
      set.add(link.outcomeId);
      providerMap.set(p, set);
    }
  }

  return {
    tenantId: input.tenantId,
    asOf,
    recommendationAlignments,
    decisionAlignments,
    driftingInitiatives: drifting,
    improvingOutcomes,
    providerEvidence: [...providerMap.entries()].map(([providerId, ids]) => ({
      providerId,
      outcomeIds: [...ids],
      contribution: `${providerId} contributes evidence to ${ids.size} strategic outcome(s)`,
    })),
    explanation: `Aligned ${recommendationAlignments.length} recommendation link(s) and ${decisionAlignments.length} decision link(s); ${drifting.length} initiative(s) drifting; ${improvingOutcomes.length} outcome(s) improving.`,
  };
}

export function whichInitiativesAffectOutcome(
  tenantId: string,
  outcomeId: string,
) {
  return listStrategicInitiatives(tenantId).filter(
    (i) => i.outcomeId === outcomeId,
  );
}
