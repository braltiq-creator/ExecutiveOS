/**
 * Executive Discovery session — orchestrates the <15 minute journey.
 */

import { KnowledgeGraph } from "@/knowledge-graph";
import {
  assertNoRealityLabFixtures,
  averageDiscoveryConfidence,
  discoverOrganisation,
  shouldUseRealityLabDiscovery,
  type DiscoveryAccountOrganisation,
  type DiscoveryConnectedSystem,
} from "@/onboarding/discovery";
import { inferOrganisation } from "@/onboarding/organisation";
import { learnExecutiveProfile } from "@/onboarding/executive-profile";
import { bootstrapKnowledgeGraph } from "@/onboarding/knowledge-bootstrap";
import {
  applyValidationAction,
  validationCandidates,
} from "@/onboarding/validation";
import { scoreConfidence, buildLearningMaturity } from "@/onboarding/confidence";
import { createProgress, advanceProgress } from "@/onboarding/progress";
import { generateFirstExecutiveBrief } from "@/onboarding/experience";
import { inferIndustry } from "@/onboarding/industry";
import { recommendProviders } from "@/onboarding/providers";
import { buildOnboardingRecommendations } from "@/onboarding/recommendations";
import { measureOnboarding } from "@/onboarding/metrics";
import {
  assertDiscoveryTenantIsolation,
  assertGraphTenantIsolation,
  assertRecommendationIsolation,
} from "@/onboarding/isolation";
import type {
  DiscoveryItem,
  DiscoveryProgress,
  FirstExecutiveBrief,
  LearnedExecutiveProfile,
  MinimumQuestions,
  OrganisationInference,
  ValidationAction,
  LearningMaturity,
  OnboardingMetricsSnapshot,
} from "@/onboarding/types";
import type { ConfidenceSummary } from "@/onboarding/confidence";
import type { BootstrapResult } from "@/onboarding/knowledge-bootstrap";
import { seedStrategicOutcomesFromDiscovery } from "@/strategy/outcomes";
import {
  recommendIntelligenceProfile,
  selectTenantIntelligenceProfile,
  type IntelligenceProfileId,
  type ProfileRecommendation,
} from "@/profiles";

export type DiscoverySession = {
  tenantId: string;
  userId: string;
  startedAt: string;
  questions: MinimumQuestions | null;
  discoveries: DiscoveryItem[];
  organisation: OrganisationInference | null;
  profile: LearnedExecutiveProfile | null;
  progress: DiscoveryProgress;
  brief: FirstExecutiveBrief | null;
  confidence: ConfidenceSummary | null;
  bootstrap: BootstrapResult | null;
  maturity: LearningMaturity | null;
  metrics: OnboardingMetricsSnapshot | null;
  graph: KnowledgeGraph;
  /** Recommended Intelligence Profile — outcome packaging, not integrations */
  profileRecommendation: ProfileRecommendation | null;
  /** Selected profile (recommended or manual override) */
  intelligenceProfileId: IntelligenceProfileId | null;
};

export function createDiscoverySession(input: {
  tenantId: string;
  userId: string;
  asOf?: string;
}): DiscoverySession {
  const asOf = input.asOf ?? new Date().toISOString();
  return {
    tenantId: input.tenantId,
    userId: input.userId,
    startedAt: asOf,
    questions: null,
    discoveries: [],
    organisation: null,
    profile: null,
    progress: createProgress(input.tenantId),
    brief: null,
    confidence: null,
    bootstrap: null,
    maturity: null,
    metrics: null,
    graph: new KnowledgeGraph({
      asOf,
      source: `onboarding-${input.tenantId}`,
    }),
    profileRecommendation: null,
    intelligenceProfileId: null,
  };
}

export function submitMinimumQuestions(
  session: DiscoverySession,
  questions: MinimumQuestions,
): DiscoverySession {
  // Seed Strategic Outcomes Framework from Discovery (non-Core overlay)
  const named = (questions.strategicOutcomes ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (named.length > 0) {
    seedStrategicOutcomesFromDiscovery({
      tenantId: session.tenantId,
      profileId: "operations_executive",
      names: named,
      owner: questions.role,
    });
  }

  return {
    ...session,
    questions,
    progress: advanceProgress(session.progress, {
      phase: "questions",
      percent: 15,
      message: "Thank you — connecting to your systems next.",
    }),
  };
}

export function runDiscovery(
  session: DiscoverySession,
  input?: {
    connectedSystems?: DiscoveryConnectedSystem[];
    asOf?: string;
    allowRealityLabFixtures?: boolean;
    demoIntent?: boolean;
    /** Only when connections have been verified — never invent. */
    verifiedConnections?: boolean;
    accountOrganisation?: DiscoveryAccountOrganisation;
  },
): DiscoverySession {
  const asOf = input?.asOf ?? new Date().toISOString();
  const useLab = shouldUseRealityLabDiscovery({
    allowRealityLabFixtures: input?.allowRealityLabFixtures,
    demoIntent: input?.demoIntent,
  });
  // Production: empty unless caller verified connections. Reality Lab defaults apply inside catalogue.
  const claimedSystems = input?.connectedSystems ?? [];
  const systems: DiscoveryConnectedSystem[] = useLab
    ? claimedSystems.length > 0
      ? claimedSystems
      : ["microsoft365", "simpro"]
    : input?.verifiedConnections
      ? claimedSystems
      : [];

  const discoveries = discoverOrganisation({
    tenantId: session.tenantId,
    asOf,
    connectedSystems: systems,
    allowRealityLabFixtures: input?.allowRealityLabFixtures,
    demoIntent: input?.demoIntent,
    accountOrganisation: input?.accountOrganisation,
  });

  const fixtureGate = assertNoRealityLabFixtures(discoveries, {
    allowRealityLabFixtures: input?.allowRealityLabFixtures,
    demoIntent: input?.demoIntent,
  });
  if (!fixtureGate.ok) {
    throw new Error(
      `Production Truth Boundary: Reality Lab fixtures blocked (${fixtureGate.violations.join(", ")}).`,
    );
  }

  const isolation = assertDiscoveryTenantIsolation({
    tenantId: session.tenantId,
    discoveries,
  });
  if (!isolation.ok) {
    throw new Error(isolation.violations.join("; "));
  }

  const organisation = inferOrganisation({
    tenantId: session.tenantId,
    discoveries,
    knownOrganisationName: input?.accountOrganisation?.name,
  });

  const industry = inferIndustry(discoveries);
  const questions: MinimumQuestions = {
    ...(session.questions ?? {
      role: "CEO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
    }),
    industry: industry.askUser
      ? session.questions?.industry
      : industry.industry ?? session.questions?.industry,
  };

  const profile = learnExecutiveProfile({
    tenantId: session.tenantId,
    userId: session.userId,
    questions,
    discoveryCount: discoveries.length,
    averageConfidence: averageDiscoveryConfidence(discoveries),
  });

  const bootstrap = bootstrapKnowledgeGraph({
    tenantId: session.tenantId,
    graph: session.graph,
    discoveries,
  });

  const graphIsolation = assertGraphTenantIsolation({
    tenantId: session.tenantId,
    graph: session.graph,
  });
  if (!graphIsolation.ok) {
    throw new Error(graphIsolation.violations.join("; "));
  }

  const confidence = scoreConfidence({
    discoveries,
    organisationConfidence: organisation.confidence,
    profileConfidence: profile.confidence,
    graphCompleteness: bootstrap.completeness,
  });

  const profileRecommendation =
    systems.length === 0 && !useLab
      ? null
      : recommendIntelligenceProfile({
          role: questions.role,
          primaryObjective: questions.primaryObjective,
          industry: questions.industry,
          // Never pass unverified connector claims into scoring.
          connectedProviders: systems,
        });

  return {
    ...session,
    questions,
    discoveries,
    organisation,
    profile,
    bootstrap,
    confidence,
    profileRecommendation,
    intelligenceProfileId:
      session.intelligenceProfileId ??
      profileRecommendation?.profileId ??
      null,
    progress: advanceProgress(session.progress, {
      phase: "discovering",
      percent: discoveries.length > 0 ? 60 : 40,
      message:
        discoveries.length > 0
          ? `Discovered ${discoveries.length} organisational signals.`
          : "No verified connected-system evidence yet — establish executive context next.",
      discoveriesFound: discoveries.length,
      systemsConnected: systems,
    }),
  };
}

/** Manual override during discovery — integrations stay invisible. */
export function selectDiscoveryIntelligenceProfile(
  session: DiscoverySession,
  profileId: IntelligenceProfileId,
): DiscoverySession {
  return {
    ...session,
    intelligenceProfileId: profileId,
  };
}

export function validateDiscovery(
  session: DiscoverySession,
  discoveryId: string,
  action: ValidationAction,
  editedValue?: string,
): DiscoverySession {
  const discoveries = session.discoveries.map((item) =>
    item.id === discoveryId
      ? applyValidationAction({ item, action, editedValue })
      : item,
  );

  const bootstrap = bootstrapKnowledgeGraph({
    tenantId: session.tenantId,
    graph: session.graph,
    discoveries,
  });

  const organisation = inferOrganisation({
    tenantId: session.tenantId,
    discoveries,
  });

  const confidence = scoreConfidence({
    discoveries,
    organisationConfidence: organisation.confidence,
    profileConfidence: session.profile?.confidence ?? 50,
    graphCompleteness: bootstrap.completeness,
  });

  return {
    ...session,
    discoveries,
    organisation,
    bootstrap,
    confidence,
    progress: advanceProgress(session.progress, {
      phase: "validating",
      percent: 78,
      message: "Thanks — that improves how I learn.",
      discoveriesFound: discoveries.length,
    }),
  };
}

export function completeDiscovery(
  session: DiscoverySession,
  asOf?: string,
): DiscoverySession {
  const completedAt = asOf ?? new Date().toISOString();
  if (!session.questions || !session.organisation || !session.profile) {
    throw new Error("Discovery incomplete — questions and inference required");
  }

  const fixtureGate = assertNoRealityLabFixtures(session.discoveries);
  if (!fixtureGate.ok) {
    throw new Error(
      `Production Truth Boundary: Reality Lab fixtures blocked (${fixtureGate.violations.join(", ")}).`,
    );
  }

  // Production with no verified evidence must not invent a connected-systems briefing.
  if (
    !shouldUseRealityLabDiscovery() &&
    session.discoveries.length === 0
  ) {
    throw new Error(
      "Production Truth Boundary: no verified discovery evidence — create an Executive Snapshot instead.",
    );
  }

  const confidence =
    session.confidence ??
    scoreConfidence({
      discoveries: session.discoveries,
      organisationConfidence: session.organisation.confidence,
      profileConfidence: session.profile.confidence,
      graphCompleteness: session.bootstrap?.completeness ?? 0,
    });

  const brief = generateFirstExecutiveBrief({
    tenantId: session.tenantId,
    asOf: completedAt,
    organisation: session.organisation,
    profile: session.profile,
    discoveries: session.discoveries,
    confidence,
  });

  // Never re-derive a recommendation from unverified connector claims at completion.
  const profileRecommendation = session.profileRecommendation;
  const intelligenceProfileId =
    session.intelligenceProfileId ?? profileRecommendation?.profileId ?? null;

  if (!intelligenceProfileId) {
    throw new Error(
      "Select an Intelligence Profile before completing discovery.",
    );
  }

  selectTenantIntelligenceProfile({
    tenantId: session.tenantId,
    profileId: intelligenceProfileId,
    source:
      profileRecommendation &&
      intelligenceProfileId === profileRecommendation.profileId
        ? "recommended"
        : "manual",
    recommendedProfileId:
      profileRecommendation?.profileId ?? intelligenceProfileId,
    explanation: profileRecommendation?.explanation,
    asOf: completedAt,
  });

  const recommendations = buildOnboardingRecommendations({
    tenantId: session.tenantId,
    profile: session.profile,
    discoveries: session.discoveries,
    profileRecommendation,
    intelligenceProfileId,
  });

  const recIsolation = assertRecommendationIsolation({
    tenantId: session.tenantId,
    recommendationTenantIds: recommendations.map((r) => r.tenantId),
  });
  if (!recIsolation.ok) {
    throw new Error(recIsolation.violations.join("; "));
  }

  const maturity = buildLearningMaturity({
    tenantId: session.tenantId,
    startedAt: session.startedAt,
    asOf: completedAt,
    connectedSystems: session.progress.systemsConnected,
    confidence,
    knowledgeGraphGrowth: session.bootstrap?.entitiesCreated ?? 0,
  });

  const metrics = measureOnboarding({
    tenantId: session.tenantId,
    startedAt: session.startedAt,
    completedAt,
    discoveries: session.discoveries,
    confidence,
    manualConfigurationMinutes: 2,
  });

  return {
    ...session,
    brief,
    confidence,
    maturity,
    metrics,
    profileRecommendation,
    intelligenceProfileId,
    progress: advanceProgress(session.progress, {
      phase: "complete",
      percent: 100,
      message: "Your first Executive Briefing is ready.",
      elapsedSeconds: metrics.timeToFirstBriefingSeconds ?? 0,
    }),
  };
}

export function getValidationQueue(session: DiscoverySession): DiscoveryItem[] {
  return validationCandidates(session.discoveries);
}

export function getProviderRecommendations(session: DiscoverySession) {
  return recommendProviders({
    alreadyConnected: session.progress.systemsConnected as Array<
      "microsoft365" | "simpro" | "salesforce"
    >,
    profileId: session.intelligenceProfileId ?? undefined,
  });
}

/** In-memory session store for Reality Lab / tests. */
const sessions = new Map<string, DiscoverySession>();

export function saveDiscoverySession(session: DiscoverySession): void {
  sessions.set(session.tenantId, session);
}

export function loadDiscoverySession(
  tenantId: string,
): DiscoverySession | undefined {
  return sessions.get(tenantId);
}

export function resetDiscoverySessions(): void {
  sessions.clear();
}
