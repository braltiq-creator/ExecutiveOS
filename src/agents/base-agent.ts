import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import type { ConfidenceScore } from "@/intelligence/executive-intelligence/types";
import type { AgentContext } from "@/agents/context";
import type {
  AgentChallenge,
  AgentRecommendation,
  AgentReview,
  AgentSignal,
  AgentStance,
  RegisteredAgentId,
} from "@/agents/types";

export type ExecutiveAgent = {
  readonly id: RegisteredAgentId;
  readonly title: string;
  readonly shortTitle: string;
  readonly focusAreas: string[];
  review(ctx: AgentContext): AgentReview;
  recommend(ctx: AgentContext): AgentRecommendation[];
  challenge(ctx: AgentContext): AgentChallenge[];
  summarise(ctx: AgentContext): string;
  identifyRisks(ctx: AgentContext): AgentSignal[];
  identifyOpportunities(ctx: AgentContext): AgentSignal[];
  confidence(ctx: AgentContext): ConfidenceScore;
  reasoning(ctx: AgentContext): string[];
};

export type LensHelpers = {
  id: RegisteredAgentId;
  title: string;
  shortTitle: string;
  focusAreas: string[];
  summarise: (ctx: AgentContext) => string;
  recommend: (ctx: AgentContext) => AgentRecommendation[];
  challenge: (ctx: AgentContext) => AgentChallenge[];
  identifyRisks: (ctx: AgentContext) => AgentSignal[];
  identifyOpportunities: (ctx: AgentContext) => AgentSignal[];
  reasoning: (ctx: AgentContext) => string[];
};

export function createAgent(lens: LensHelpers): ExecutiveAgent {
  return {
    id: lens.id,
    title: lens.title,
    shortTitle: lens.shortTitle,
    focusAreas: lens.focusAreas,
    summarise: lens.summarise,
    recommend: lens.recommend,
    challenge: lens.challenge,
    identifyRisks: lens.identifyRisks,
    identifyOpportunities: lens.identifyOpportunities,
    reasoning: lens.reasoning,
    confidence(ctx) {
      return defaultConfidence(ctx, lens.id);
    },
    review(ctx) {
      const recommendations = lens.recommend(ctx);
      const challenges = lens.challenge(ctx);
      const risks = lens.identifyRisks(ctx);
      const opportunities = lens.identifyOpportunities(ctx);
      const reasoning = lens.reasoning(ctx);
      return {
        agentId: lens.id,
        asOf: ctx.asOf,
        summary: lens.summarise(ctx),
        priorities: buildPriorities(recommendations, risks),
        recommendations,
        challenges,
        risks,
        opportunities,
        confidence: defaultConfidence(ctx, lens.id),
        reasoning,
        sources: [
          "Executive Intelligence Engine",
          "Executive Judgement Engine",
          "Executive Intent Engine",
          "Executive Memory Engine",
          "Executive Knowledge Graph",
        ],
      };
    },
  };
}

function buildPriorities(
  recommendations: AgentRecommendation[],
  risks: AgentSignal[],
): string[] {
  return [
    ...recommendations.slice(0, 2).map((item) => item.title),
    ...risks.slice(0, 2).map((item) => item.label),
  ].slice(0, 4);
}

function defaultConfidence(
  ctx: AgentContext,
  agentId: RegisteredAgentId,
): ConfidenceScore {
  const brief = ctx.briefs[0];
  const base = brief?.confidence.value ?? ctx.snapshot.pulse.confidence.value;
  return assessConfidence({
    label: agentId,
    dataCompleteness: Math.min(92, 55 + ctx.snapshot.outcomes.length * 5),
    freshnessHours: 8,
    sourceAgreement: base,
    historicalReliability: Math.max(50, base - 8),
    predictionCertainty: Math.max(40, base - 12),
    aiReasoningConfidence: Math.max(45, base - 10),
  });
}

export function stanceFromJudgement(
  stance: string | undefined,
): AgentStance {
  switch (stance) {
    case "lean_approve":
      return "proceed";
    case "lean_wait":
      return "delay";
    case "lean_investigate":
      return "investigate";
    case "lean_delegate":
      return "delegate";
    default:
      return "watch";
  }
}

export function rec(
  id: string,
  stance: AgentStance,
  title: string,
  rationale: string,
  evidence: string[],
  decisionIds: string[] = [],
  outcomeIds: string[] = [],
): AgentRecommendation {
  return {
    id,
    stance,
    title,
    rationale,
    evidence,
    relatedDecisionIds: decisionIds,
    relatedOutcomeIds: outcomeIds,
  };
}

export function risk(
  id: string,
  label: string,
  severity: AgentSignal["severity"],
  evidence: string[],
  relatedEntityIds: string[] = [],
): AgentSignal {
  return { id, label, severity, evidence, relatedEntityIds };
}

export function opportunity(
  id: string,
  label: string,
  evidence: string[],
  relatedEntityIds: string[] = [],
): AgentSignal {
  return {
    id,
    label,
    severity: "moderate",
    evidence,
    relatedEntityIds,
  };
}

export function challenge(
  id: string,
  target: string,
  text: string,
  evidence: string[],
): AgentChallenge {
  return { id, target, challenge: text, evidence };
}
