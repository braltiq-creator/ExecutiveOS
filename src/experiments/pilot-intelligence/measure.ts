import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry } from "@/operations";
import { getPilotByTenant } from "@/pilot";
import {
  partnerLabelFromTenantId,
  type ExplainedMetric,
  type PilotIntelligenceSnapshot,
} from "@/experiments/framework";
import { countBehaviourEvents } from "@/experiments/behaviour";

function metric(
  id: string,
  label: string,
  value: number,
  unit: ExplainedMetric["unit"],
  explanation: string,
  trend?: ExplainedMetric["trend"],
): ExplainedMetric {
  const capped =
    unit === "percent" || unit === "score" ? Math.min(100, value) : value;
  return {
    id,
    label,
    value: Math.max(0, Math.round(capped)),
    unit,
    explanation,
    trend,
  };
}

/**
 * Measure Design Partner pilot intelligence from anonymised ops telemetry + behaviour events.
 * Never includes customer business content.
 */
export function measurePilotIntelligence(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): PilotIntelligenceSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const pilot = getPilotByTenant(input.tenantId);

  const briefOpens = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "brief_open",
  });
  const accepts = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "recommendation_accept",
  });
  const ignores = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "recommendation_ignore",
  });
  const reviews = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "review_complete",
  });
  const scenarios = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "scenario_open",
  });
  const trustOpens = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "trust_panel_open",
  });

  const adoptionBase = Math.round(
    (t.morningBriefOpens + briefOpens * 2 + t.engagementPct) / 3,
  );
  const engagement = Math.round(
    (t.engagementPct + Math.min(100, briefOpens * 8)) / 2,
  );
  const confidence = Math.round(
    (t.executiveIntelligenceScore + t.recommendationAccuracy + trustOpens * 3) /
      2.2,
  );
  const questionsAnswered = Math.round(
    t.feedbackSubmitted + reviews + scenarios,
  );
  const scenarioSuccess = Math.min(
    100,
    Math.round(40 + scenarios * 12 + t.recommendationAccuracy / 5),
  );
  const acceptanceDenom = Math.max(1, accepts + ignores + t.recommendationsViewed);
  const acceptance = Math.round(
    ((accepts + t.recommendationsAccepted) / acceptanceDenom) * 100,
  );
  const outcomeConfirmation = Math.min(
    100,
    Math.round(t.validationProgressPct * 0.7 + reviews * 5),
  );
  const strategicProgress = Math.round(
    (t.learningProgress + t.discoveryCoveragePct) / 2,
  );
  const timeSaved = Math.round(
    t.averageSessionMinutes * 0.4 * Math.max(1, t.dailyActiveExecutives) * 5,
  );
  const businessValue = Math.min(
    100,
    Math.round(
      (acceptance * 0.35 +
        strategicProgress * 0.35 +
        outcomeConfirmation * 0.3) /
        1,
    ),
  );
  const pilotHealth = Math.round(
    (t.readinessScore + engagement + acceptance) / 3,
  );
  const stageBoost =
    pilot?.stage === "active_pilot" || pilot?.stage === "review"
      ? 8
      : pilot?.stage === "pilot_complete"
        ? 12
        : 0;
  const successProbability = Math.min(
    96,
    Math.round((pilotHealth + businessValue + confidence) / 3 + stageBoost),
  );

  return {
    tenantId: input.tenantId,
    partnerLabel: partnerLabelFromTenantId(input.tenantId),
    profileId: input.profileId,
    asOf,
    metrics: {
      executiveAdoption: metric(
        "executive_adoption",
        "Executive Adoption",
        Math.min(100, adoptionBase),
        "percent",
        "Share of expected executive routines completed (brief opens, sessions, engagement). Higher means the workspace is becoming habitual.",
        briefOpens > 3 ? "up" : "flat",
      ),
      executiveEngagement: metric(
        "executive_engagement",
        "Executive Engagement",
        Math.min(100, engagement),
        "percent",
        "Depth of use beyond login — brief opens, interactions, and active executive days.",
      ),
      executiveConfidence: metric(
        "executive_confidence",
        "Executive Confidence",
        Math.min(100, confidence),
        "score",
        "Proxy for trust in recommendations: intelligence score, recommendation quality, and trust-panel usage.",
      ),
      questionsAnswered: metric(
        "questions_answered",
        "Questions Answered",
        questionsAnswered,
        "count",
        "Executive questions resolved via scenarios, reviews, and feedback loops — not raw chat volume.",
      ),
      scenarioSuccess: metric(
        "scenario_success",
        "Scenario Success",
        scenarioSuccess,
        "percent",
        "How often scenario-framed recommendations appear useful relative to pack usage and quality signals.",
      ),
      recommendationAcceptance: metric(
        "recommendation_acceptance",
        "Recommendation Acceptance",
        Math.min(100, acceptance),
        "percent",
        "Accepted recommendations divided by viewed/decided recommendations (anonymised counts only).",
      ),
      outcomeConfirmation: metric(
        "outcome_confirmation",
        "Outcome Confirmation",
        outcomeConfirmation,
        "percent",
        "Validation and review completion indicating executives confirm outcome movement.",
      ),
      strategicOutcomeProgress: metric(
        "strategic_outcome_progress",
        "Strategic Outcome Progress",
        strategicProgress,
        "percent",
        "Learning and discovery coverage as a proxy for strategic outcome advancement — no initiative names.",
      ),
      timeSaved: metric(
        "time_saved",
        "Time Saved",
        timeSaved,
        "minutes",
        "Estimated executive minutes saved from shorter, higher-signal brief sessions (modelled from session length × activity).",
      ),
      businessValue: metric(
        "business_value",
        "Business Value",
        businessValue,
        "score",
        "Composite of acceptance, strategic progress, and outcome confirmation — anonymised value proxy, not revenue figures.",
      ),
      pilotHealth: metric(
        "pilot_health",
        "Pilot Health",
        Math.min(100, pilotHealth),
        "score",
        "Blend of readiness, engagement, and acceptance — early warning for CS intervention.",
      ),
      successProbability: metric(
        "success_probability",
        "Success Probability",
        successProbability,
        "percent",
        "Likelihood the Design Partner reaches a successful pilot outcome given health, value, confidence, and lifecycle stage.",
      ),
    },
  };
}
