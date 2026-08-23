import { AGENT_DEFINITIONS } from "@/lib/agents/registry";
import {
  buildInsightScores,
  decisionRiskToScore,
  hoursUntil,
  importanceToScore,
  initiativeHealthToUrgency,
  objectivePriorityToScore,
  urgencyFromHours,
} from "@/lib/intelligence-center/prioritizer";
import type {
  InsightCategory,
  IntelligenceSignal,
} from "@/lib/intelligence-center/types";
import type { FeatureEntitlements } from "@/lib/features/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function createSignal(input: {
  id: string;
  source: IntelligenceSignal["source"];
  category: InsightCategory;
  title: string;
  summary: string;
  badge?: string;
  href?: string;
  entityId?: string;
  impact: number;
  urgency: number;
  confidence: number;
  strategicAlignment: number;
  risk: number;
}): IntelligenceSignal {
  return {
    id: input.id,
    source: input.source,
    category: input.category,
    title: input.title,
    summary: input.summary,
    badge: input.badge,
    href: input.href,
    entityId: input.entityId,
    scores: buildInsightScores({
      impact: input.impact,
      urgency: input.urgency,
      confidence: input.confidence,
      strategicAlignment: input.strategicAlignment,
      risk: input.risk,
    }),
  };
}

function collectHealthSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];
  const { health } = intelligence;

  if (health.score < 60 || health.trend === "declining") {
    signals.push(
      createSignal({
        id: "health-portfolio",
        source: "executive_health",
        category: "critical_attention",
        title: `Portfolio health at ${health.score}/100`,
        summary: health.explanation.join(" "),
        badge: health.trend,
        href: "/initiatives",
        impact: 100 - health.score,
        urgency: health.trend === "declining" ? 85 : 65,
        confidence: 90,
        strategicAlignment: 88,
        risk: 100 - health.score,
      }),
    );
  }

  for (const action of health.recommendedActions.slice(0, 3)) {
    signals.push(
      createSignal({
        id: `health-action-${action.id}`,
        source: "executive_health",
        category: "critical_attention",
        title: action.title,
        summary: action.rationale,
        badge: action.priority,
        href: "/initiatives",
        impact: action.priority === "high" ? 85 : 65,
        urgency: action.priority === "high" ? 80 : 55,
        confidence: 88,
        strategicAlignment: 82,
        risk: action.priority === "high" ? 75 : 45,
      }),
    );
  }

  return signals;
}

function collectInitiativeSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  for (const initiative of intelligence.initiatives.initiatives) {
    if (initiative.healthStatus === "on_track" || initiative.healthStatus === "completed") {
      continue;
    }

    const urgency = initiativeHealthToUrgency(initiative.healthStatus);
    signals.push(
      createSignal({
        id: `initiative-${initiative.id}`,
        source: "initiatives",
        category:
          initiative.healthStatus === "off_track"
            ? "critical_attention"
            : "upcoming_risks",
        title: initiative.title,
        summary:
          initiative.healthExplanation.join(" ") ||
          `${initiative.progressPercentage}% complete · Owner: ${initiative.owner}`,
        badge: initiative.healthStatus.replace("_", " "),
        href: "/initiatives",
        entityId: initiative.id,
        impact: urgency,
        urgency,
        confidence: 92,
        strategicAlignment: objectivePriorityToScore(initiative.priority),
        risk: urgency,
      }),
    );
  }

  return signals;
}

function collectObjectiveSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  for (const objective of intelligence.objectives) {
    if (objective.healthTrend !== "declining") {
      continue;
    }

    signals.push(
      createSignal({
        id: `objective-${objective.id}`,
        source: "objectives",
        category: "critical_attention",
        title: objective.title,
        summary:
          objective.healthExplanation?.join(" ") || objective.description,
        badge: "declining",
        href: "/initiatives",
        entityId: objective.id,
        impact: 78,
        urgency: 72,
        confidence: 85,
        strategicAlignment: objectivePriorityToScore(objective.priority),
        risk: 70,
      }),
    );
  }

  return signals;
}

function collectMemorySignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  for (const entry of intelligence.memory.entries) {
    const importance = importanceToScore(entry.importance);

    if (entry.memoryType === "Risk") {
      signals.push(
        createSignal({
          id: `memory-risk-${entry.id}`,
          source: "executive_memory",
          category: "upcoming_risks",
          title: entry.title,
          summary: entry.content,
          badge: entry.importance,
          href: "/graph",
          entityId: entry.id,
          impact: importance,
          urgency: importance * 0.85,
          confidence: 80,
          strategicAlignment: 70,
          risk: importance,
        }),
      );
    }

    if (entry.memoryType === "Opportunity") {
      signals.push(
        createSignal({
          id: `memory-opportunity-${entry.id}`,
          source: "executive_memory",
          category: "strategic_opportunities",
          title: entry.title,
          summary: entry.content,
          badge: entry.importance,
          href: "/graph",
          entityId: entry.id,
          impact: importance,
          urgency: importance * 0.55,
          confidence: 75,
          strategicAlignment: 85,
          risk: 20,
        }),
      );
    }

    if (entry.memoryType === "Commitment") {
      signals.push(
        createSignal({
          id: `memory-commitment-${entry.id}`,
          source: "executive_memory",
          category: "delegated_actions",
          title: entry.title,
          summary: entry.content,
          badge: entry.importance,
          href: "/graph",
          entityId: entry.id,
          impact: importance * 0.9,
          urgency: importance * 0.7,
          confidence: 78,
          strategicAlignment: 65,
          risk: 35,
        }),
      );
    }

    if (
      entry.memoryType === "Observation" &&
      (entry.importance === "critical" || entry.importance === "high")
    ) {
      signals.push(
        createSignal({
          id: `memory-people-${entry.id}`,
          source: "executive_memory",
          category: "people_issues",
          title: entry.title,
          summary: entry.content,
          badge: entry.importance,
          href: "/team",
          entityId: entry.id,
          impact: importance,
          urgency: importance * 0.75,
          confidence: 72,
          strategicAlignment: 60,
          risk: 55,
        }),
      );
    }
  }

  return signals;
}

function collectDecisionSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  for (const decision of intelligence.decisions.decisions) {
    const riskScore = decisionRiskToScore(decision.riskLevel);
    const isPending = ["draft", "under_review", "approved"].includes(
      decision.status,
    );

    if (!isPending && decision.status !== "in_progress") {
      continue;
    }

    const reviewUrgency =
      decision.reviewDate && hoursUntil(decision.reviewDate) <= 168
        ? urgencyFromHours(hoursUntil(decision.reviewDate))
        : 45;

    signals.push(
      createSignal({
        id: `decision-${decision.id}`,
        source: "decisions",
        category: "recommended_decisions",
        title: decision.title,
        summary: `${decision.summary} · Expected: ${decision.expectedOutcome}`,
        badge: decision.statusLabel,
        href: "/decisions",
        entityId: decision.id,
        impact: riskScore,
        urgency: Math.max(reviewUrgency, decision.status === "draft" ? 70 : 55),
        confidence: 88,
        strategicAlignment: 75,
        risk: riskScore,
      }),
    );
  }

  return signals;
}

function collectCalendarSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];
  const { calendar } = intelligence;

  if (calendar.health.meetingOverload) {
    signals.push(
      createSignal({
        id: "calendar-overload",
        source: "calendar",
        category: "critical_attention",
        title: "Calendar overload detected",
        summary: calendar.health.summary,
        badge: calendar.health.status,
        href: "/calendar",
        impact: 82,
        urgency: 88,
        confidence: 95,
        strategicAlignment: 70,
        risk: 65,
      }),
    );
  }

  for (const conflict of calendar.conflicts) {
    signals.push(
      createSignal({
        id: `calendar-conflict-${conflict.id}`,
        source: "calendar",
        category: "critical_attention",
        title: conflict.title,
        summary: conflict.message,
        badge: "conflict",
        href: "/calendar",
        impact: 75,
        urgency: urgencyFromHours(hoursUntil(conflict.startsAt)),
        confidence: 98,
        strategicAlignment: 55,
        risk: 60,
      }),
    );
  }

  for (const prep of calendar.preparationNeeded.slice(0, 4)) {
    signals.push(
      createSignal({
        id: `meeting-prep-${prep.meetingId}`,
        source: "meetings",
        category: "meeting_preparation",
        title: prep.meetingTitle,
        summary:
          [
            prep.relatedInitiatives[0]?.title
              ? `Initiative: ${prep.relatedInitiatives[0].title}`
              : null,
            prep.relatedRisks[0]?.title
              ? `Risk: ${prep.relatedRisks[0].title}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Review context before this meeting.",
        badge: prep.preparationScore >= 80 ? "ready" : "prepare",
        href: "/calendar",
        entityId: prep.meetingId,
        impact: 70,
        urgency: urgencyFromHours(hoursUntil(prep.startsAt)),
        confidence: 85,
        strategicAlignment: 72,
        risk: prep.relatedRisks.length > 0 ? 65 : 30,
      }),
    );
  }

  return signals;
}

function collectGraphSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];
  const graph = intelligence.integrations.knowledgeGraph;

  if (!graph.connected) {
    return signals;
  }

  const riskNodes = graph.nodes.filter((node) => node.nodeType === "risk");
  for (const node of riskNodes.slice(0, 3)) {
    signals.push(
      createSignal({
        id: `graph-risk-${node.id}`,
        source: "knowledge_graph",
        category: "upcoming_risks",
        title: node.label,
        summary: node.summary ?? "Connected risk in knowledge graph.",
        badge: "graph",
        href: "/graph",
        entityId: node.id,
        impact: 72,
        urgency: 58,
        confidence: 70,
        strategicAlignment: 68,
        risk: 78,
      }),
    );
  }

  const crmNodes = graph.nodes.filter(
    (node) => node.nodeType === "crm_opportunity",
  );
  for (const node of crmNodes.slice(0, 3)) {
    signals.push(
      createSignal({
        id: `graph-crm-${node.id}`,
        source: "knowledge_graph",
        category: "sales_highlights",
        title: node.label,
        summary: node.summary ?? "CRM opportunity in knowledge graph.",
        badge: "pipeline",
        href: "/graph",
        entityId: node.id,
        impact: 68,
        urgency: 50,
        confidence: 65,
        strategicAlignment: 80,
        risk: 25,
      }),
    );
  }

  return signals;
}

function collectIntegrationSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];
  const { integrations } = intelligence;

  if (!integrations.calendar.connected) {
    signals.push(
      createSignal({
        id: "integration-calendar",
        source: "integrations",
        category: "critical_attention",
        title: "Calendar not connected",
        summary:
          "Connect Microsoft 365 to enable proactive calendar intelligence and meeting preparation.",
        badge: "action",
        href: "/settings/integrations",
        impact: 60,
        urgency: 55,
        confidence: 100,
        strategicAlignment: 65,
        risk: 40,
      }),
    );
  }

  const crmRecords = integrations.crm.records;
  if (integrations.crm.connected && crmRecords.length > 0) {
    for (const record of crmRecords.slice(0, 2)) {
      signals.push(
        createSignal({
          id: `crm-${record.id}`,
          source: "integrations",
          category: "sales_highlights",
          title: record.name,
          summary: `Stage: ${record.stage} · Source: ${record.source}`,
          badge: record.stage,
          href: "/settings/integrations",
          entityId: record.id,
          impact: 65,
          urgency: 48,
          confidence: 75,
          strategicAlignment: 82,
          risk: 20,
        }),
      );
    }
  }

  return signals;
}

function collectOrganizationSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  if (intelligence.teamMembers.length === 0 && intelligence.organization) {
    signals.push(
      createSignal({
        id: "org-no-team",
        source: "organization",
        category: "people_issues",
        title: "No team members configured",
        summary:
          "Add team members to enable people intelligence and delegation tracking.",
        badge: "setup",
        href: "/team",
        impact: 55,
        urgency: 40,
        confidence: 95,
        strategicAlignment: 50,
        risk: 30,
      }),
    );
  }

  return signals;
}

function collectBillingSignals(
  entitlements: FeatureEntitlements | null,
): IntelligenceSignal[] {
  if (!entitlements) {
    return [];
  }

  const signals: IntelligenceSignal[] = [];
  const usageRatio =
    entitlements.limits.aiRequests > 0
      ? entitlements.usage.ai_requests / entitlements.limits.aiRequests
      : 0;

  if (usageRatio >= 0.85) {
    signals.push(
      createSignal({
        id: "billing-ai-limit",
        source: "billing",
        category: "critical_attention",
        title: "AI request limit approaching",
        summary: `${entitlements.usage.ai_requests} of ${entitlements.limits.aiRequests} AI requests used this period.`,
        badge: "billing",
        href: "/settings/billing",
        impact: 70,
        urgency: usageRatio >= 0.95 ? 90 : 72,
        confidence: 100,
        strategicAlignment: 40,
        risk: 55,
      }),
    );
  }

  if (
    entitlements.subscription.status === "past_due" ||
    entitlements.subscription.status === "cancelled"
  ) {
    signals.push(
      createSignal({
        id: "billing-subscription",
        source: "billing",
        category: "critical_attention",
        title: `Subscription ${entitlements.subscription.status.replace("_", " ")}`,
        summary: "Review billing to restore full ExecutiveOS capabilities.",
        badge: entitlements.subscription.status,
        href: "/settings/billing",
        impact: 90,
        urgency: 95,
        confidence: 100,
        strategicAlignment: 30,
        risk: 80,
      }),
    );
  }

  return signals;
}

function collectFinancialSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  const financialDecisions = intelligence.decisions.decisions.filter(
    (decision) =>
      decision.riskLevel === "high" ||
      decision.riskLevel === "critical",
  );

  for (const decision of financialDecisions.slice(0, 2)) {
    signals.push(
      createSignal({
        id: `financial-decision-${decision.id}`,
        source: "decisions",
        category: "financial_highlights",
        title: decision.title,
        summary: decision.expectedOutcome,
        badge: decision.riskLevelLabel,
        href: "/decisions",
        entityId: decision.id,
        impact: decisionRiskToScore(decision.riskLevel),
        urgency: 55,
        confidence: 82,
        strategicAlignment: 78,
        risk: decisionRiskToScore(decision.riskLevel),
      }),
    );
  }

  if (intelligence.organisation.annualRevenueBand) {
    signals.push(
      createSignal({
        id: "financial-context",
        source: "organization",
        category: "financial_highlights",
        title: "Financial context",
        summary: `Company size: ${intelligence.organisation.companySize} · Revenue band: ${intelligence.organisation.annualRevenueBand}`,
        badge: "context",
        href: "/organization",
        impact: 45,
        urgency: 25,
        confidence: 90,
        strategicAlignment: 70,
        risk: 15,
      }),
    );
  }

  return signals;
}

function collectAdvisorSignals(
  intelligence: ExecutiveIntelligenceResult,
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  if (intelligence.health.trend === "declining") {
    const riskAdvisor = AGENT_DEFINITIONS.find((a) => a.id === "risk_advisor");
    if (riskAdvisor) {
      signals.push(
        createSignal({
          id: "advisor-risk",
          source: "advisors",
          category: "upcoming_risks",
          title: `${riskAdvisor.name} flagged portfolio decline`,
          summary:
            "Consult the Risk Advisor for mitigation strategies aligned to your objectives.",
          badge: "advisor",
          href: "/advisors",
          impact: 75,
          urgency: 70,
          confidence: 80,
          strategicAlignment: 78,
          risk: 72,
        }),
      );
    }
  }

  return signals;
}

export function collectIntelligenceSignals(
  intelligence: ExecutiveIntelligenceResult,
  entitlements: FeatureEntitlements | null,
): IntelligenceSignal[] {
  return [
    ...collectHealthSignals(intelligence),
    ...collectInitiativeSignals(intelligence),
    ...collectObjectiveSignals(intelligence),
    ...collectMemorySignals(intelligence),
    ...collectDecisionSignals(intelligence),
    ...collectCalendarSignals(intelligence),
    ...collectGraphSignals(intelligence),
    ...collectIntegrationSignals(intelligence),
    ...collectOrganizationSignals(intelligence),
    ...collectBillingSignals(entitlements),
    ...collectFinancialSignals(intelligence),
    ...collectAdvisorSignals(intelligence),
  ];
}
