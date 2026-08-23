import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { ExperimentationDashboardView } from "@/components/admin/ExperimentationDashboard";
import {
  buildExperimentationDashboard,
  createExperiment,
  createHypothesis,
  listExperiments,
  listHypotheses,
  listBehaviourEvents,
  recordBehaviourEvent,
  recordInterview,
  startExperiment,
  completeExperiment,
  listInterviews,
} from "@/experiments";
import { listPilots, provisionDesignPartner } from "@/pilot";
import { syncPartnersFromPilots } from "@/operations";

function ensureDemoPartners() {
  if (listPilots().length === 0) {
    provisionDesignPartner({
      partnerName: "Northline Ops Pilot",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@northline-ops.test",
      region: "au",
      environment: "pilot",
    });
    provisionDesignPartner({
      partnerName: "Harbor Commercial Pilot",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@harbor-commercial.test",
      region: "au",
      environment: "pilot",
    });
  }
  syncPartnersFromPilots();
}

function seedExperimentationIfEmpty() {
  ensureDemoPartners();
  const pilots = listPilots();
  if (pilots.length === 0) return;

  const ops = pilots.find(
    (p) => p.intelligenceProfileId === "operations_executive",
  );
  const com = pilots.find(
    (p) => p.intelligenceProfileId === "commercial_executive",
  );

  if (listHypotheses().length === 0) {
    const hypothesis = createHypothesis({
      statement:
        "Displaying strategic outcomes first will increase recommendation acceptance by 15%.",
      objective:
        "Validate Experience 2.0 hierarchy impact on executive acceptance",
      targetProfileId: "all",
      expectedBehaviourChange:
        "Higher recommendation acceptance and trust-panel engagement",
      successMetrics: [
        "recommendation_acceptance",
        "trust_panel_usage",
        "executive_confidence",
      ],
    });

    const experiment = createExperiment({
      hypothesisId: hypothesis.id,
      targetPartnerTenantIds: pilots.map((p) => p.tenantId),
      linkedFeatureFlags: ["experience_outcomes_first"],
    });
    startExperiment(experiment.id);

    const hyp2 = createHypothesis({
      statement:
        "Trust panel review prompts will increase executive review completion by 20%.",
      objective: "Strengthen continuous learning loop",
      targetProfileId: "operations_executive",
      expectedBehaviourChange: "More review completions per brief session",
      successMetrics: ["review_completion", "executive_confidence"],
    });
    const exp2 = createExperiment({
      hypothesisId: hyp2.id,
      targetPartnerTenantIds: ops ? [ops.tenantId] : [pilots[0]!.tenantId],
    });
    startExperiment(exp2.id);
    completeExperiment({
      id: exp2.id,
      result: "validated",
      learning:
        "Review prompts near confidence explanations lift completion without harming brief speed.",
      recommendedAction:
        "Ship review controls in Trust panel for all Experience 2.0 cards.",
    });
  }

  if (listBehaviourEvents().length === 0) {
    if (ops) {
      recordBehaviourEvent({
        tenantId: ops.tenantId,
        profileId: "operations_executive",
        kind: "brief_open",
        featureKey: "today_brief",
        value: 3,
      });
      recordBehaviourEvent({
        tenantId: ops.tenantId,
        profileId: "operations_executive",
        kind: "trust_panel_open",
        featureKey: "trust_panel",
        value: 2,
      });
      recordBehaviourEvent({
        tenantId: ops.tenantId,
        profileId: "operations_executive",
        kind: "recommendation_accept",
        featureKey: "recommendation",
        value: 2,
      });
      recordBehaviourEvent({
        tenantId: ops.tenantId,
        profileId: "operations_executive",
        kind: "recommendation_ignore",
        featureKey: "recommendation",
        value: 1,
      });
    }

    if (com) {
      recordBehaviourEvent({
        tenantId: com.tenantId,
        profileId: "commercial_executive",
        kind: "brief_open",
        featureKey: "today_brief",
        value: 2,
      });
      recordBehaviourEvent({
        tenantId: com.tenantId,
        profileId: "commercial_executive",
        kind: "strategy_view",
        featureKey: "strategy_page",
        value: 1,
      });
      recordBehaviourEvent({
        tenantId: com.tenantId,
        profileId: "commercial_executive",
        kind: "recommendation_ignore",
        featureKey: "recommendation",
        value: 3,
      });
    }
  }

  if (listInterviews().length === 0 && ops) {
    const running = listExperiments().find((e) => e.status === "running");
    recordInterview({
      tenantId: ops.tenantId,
      executiveRole: "CEO",
      executiveLabel: "Exec CEO",
      questionsAsked: [
        "What should I focus on this morning?",
        "Why this recommendation?",
      ],
      positiveFeedback: ["Clear morning hierarchy", "Evidence feels grounded"],
      negativeFeedback: ["Trust panel easy to miss on first visit"],
      featureRequests: ["Board-ready export from Strategy"],
      painPoints: ["Hard to find trust explanation on mobile"],
      suggestedImprovements: ["Surface confidence reasons earlier"],
      overallSatisfaction: 8,
      experimentIds: running ? [running.id] : [],
      recordedAt: new Date().toISOString(),
      recordedBy: "braltiq-cs",
    });
  }
}

export default async function AdminExperimentsPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  seedExperimentationIfEmpty();
  const dashboard = buildExperimentationDashboard();

  return (
    <AppShell breadcrumb="Experiments" maxWidth="6xl">
      <ExperimentationDashboardView dashboard={dashboard} />
    </AppShell>
  );
}
