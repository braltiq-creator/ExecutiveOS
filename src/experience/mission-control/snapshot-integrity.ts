/**
 * Phase 57F — Command Centre context integrity for active Executive Snapshots.
 *
 * When a real snapshot is active, Mission Control must project that snapshot
 * (and its Commercial Intelligence) — never Northline/Helix demo templates.
 */

import type { CommercialAnalysis } from "@/executive-snapshot-studio/intelligence/commercial-analysis";
import type { CommercialExecutiveBrief } from "@/executive-snapshot-studio/intelligence/commercial-brief";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import type { CouncilBrief } from "@/experience/executive-council/types";
import type {
  IntelligenceStreamEvent,
  JudgementItem,
} from "@/experience/intelligence-engine/types";
import type { McKpi, McPulse } from "@/experience/mission-control/types";
import type { StudioReadiness } from "@/executive-snapshot-studio/types";

/** Demo business phrases that must never appear under a real snapshot. */
export const DEMO_BUSINESS_PHRASES = [
  "Quarterly Strategy Review",
  "Majority agreement",
  "Watch COO",
  "Proceed —",
  "Have counsel circulate the option paper",
  "Increase Enterprise ARR",
  "Board Readiness",
  "Reduce leadership meeting load",
  "Helix Industries",
  "Northline",
  "Alex Rivera",
  "EU data residency",
] as const;

export function containsDemoBusinessPhrase(text: string): boolean {
  return DEMO_BUSINESS_PHRASES.some((p) =>
    text.toLowerCase().includes(p.toLowerCase()),
  );
}

export function assertNoDemoBusinessContext(blob: string): void {
  for (const phrase of DEMO_BUSINESS_PHRASES) {
    if (blob.toLowerCase().includes(phrase.toLowerCase())) {
      throw new Error(
        `Demo business context leaked into Executive Snapshot Command Centre: "${phrase}"`,
      );
    }
  }
}

function notEstablished(label: string): McKpi {
  return {
    id: label as McKpi["id"],
    label: label
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    value: "Not yet established",
    status: "Evidence pending",
    trend: "flat",
    severity: "neutral",
    confidence: 0,
    href: "/today",
  };
}

/**
 * KPIs for an active Executive Snapshot — evidence-safe empties for unsupported domains.
 */
export function buildSnapshotIntegrityKpis(input: {
  active: ActiveExecutiveSnapshotContext;
  updatedLabel?: string;
}): McKpi[] {
  const { active } = input;
  const updated = input.updatedLabel ?? "now";
  const brief = active.commercialBrief;
  const analysis = active.analysis;
  const readiness = active.readiness;

  const riskCount =
    analysis?.insights.filter((i) =>
      ["investigate", "act"].includes(i.posture),
    ).length ??
    active.portfolio.outcomes.filter(
      (o) => o.status === "at_risk" || o.status === "off_track",
    ).length;

  const judgementCount =
    analysis?.insights.filter(
      (i) => i.posture === "investigate" || i.posture === "act",
    ).length ?? active.portfolio.decisions.length;

  const commercialLabel =
    brief?.commercialHealth?.trim() ||
    (analysis
      ? analysis.openCount > 0
        ? "Establishing"
        : "Monitoring"
      : "Establishing");

  const orgHealth = notEstablished("organisation_health");
  orgHealth.label = "Organisation Health";
  orgHealth.value = "Not yet established";
  orgHealth.href = "/strategy?from=organisation_health";
  orgHealth.updatedLabel = updated;

  return [
    orgHealth,
    {
      id: "executive_value",
      label: "Executive Value",
      value:
        brief?.executiveValue && !/not yet|unquantif/i.test(brief.executiveValue)
          ? brief.executiveValue
          : "Not yet quantified",
      status: "Pending evidence",
      trend: "flat",
      severity: "neutral",
      confidence: readiness?.confidence ?? 0,
      href: "/reports",
      updatedLabel: updated,
    },
    {
      id: "strategic_outcomes",
      label: "Strategic Outcomes",
      value: "Not yet established",
      status: "Priorities pending",
      trend: "flat",
      severity: "neutral",
      confidence: 0,
      href: "/strategy?from=strategic_outcomes",
      updatedLabel: updated,
    },
    {
      id: "priority_decisions",
      label: "Priority Decisions",
      value:
        judgementCount > 0
          ? `${judgementCount} candidates`
          : "Judgement required",
      status: judgementCount > 0 ? "Judgement required" : "None established",
      trend: "flat",
      severity: judgementCount > 0 ? "warning" : "neutral",
      confidence: readiness?.confidence ?? 50,
      href: "/decisions?from=priority_decisions",
      updatedLabel: updated,
    },
    {
      id: "critical_risks",
      label: "Critical Risks",
      value:
        riskCount > 0 ? String(Math.min(9, riskCount)) : "Not yet established",
      status: riskCount > 0 ? "Evidence-based" : "Evidence pending",
      trend: riskCount > 0 ? "down" : "flat",
      severity: riskCount >= 2 ? "critical" : riskCount === 1 ? "warning" : "neutral",
      confidence: readiness?.confidence ?? 0,
      href: "/decisions?from=critical_risks",
      updatedLabel: updated,
    },
    {
      ...notEstablished("customer_health"),
      label: "Customer Health",
      href: "/knowledge?from=customer_health",
      updatedLabel: updated,
    },
    {
      ...notEstablished("system_health"),
      label: "System Health",
      href: "/administration",
      updatedLabel: updated,
    },
    {
      ...notEstablished("people_health"),
      label: "People Health",
      href: "/team",
      updatedLabel: updated,
    },
    {
      id: "commercial_health",
      label: "Commercial Health",
      value: commercialLabel.slice(0, 28),
      status: "From Commercial Intelligence",
      trend: "flat",
      severity: /watch|risk|atten|uncertain/i.test(commercialLabel)
        ? "warning"
        : "neutral",
      confidence: brief?.confidence ?? readiness?.confidence ?? 50,
      href: "/strategy?from=commercial_health",
      updatedLabel: updated,
    },
  ];
}

export function buildSnapshotIntegrityPulse(input: {
  active: ActiveExecutiveSnapshotContext;
}): McPulse {
  const { active } = input;
  const brief = active.commercialBrief;
  const analysis = active.analysis;
  const signals: McPulse["signals"] = [];

  if (analysis) {
    signals.push({
      id: "open-book",
      mark: analysis.openCount > 0 ? "dot" : "up",
      text: `Commercial evidence currently indicates ${analysis.openCount} open / ${analysis.closedCount} closed records in view`,
      severity: analysis.openCount > 0 ? "warning" : "positive",
    });
  }

  const ageing = analysis?.insights.find((i) =>
    /ageing|aging|stage duration/i.test(i.title + i.detail),
  );
  if (ageing) {
    signals.push({
      id: "ageing",
      mark: "down",
      text: ageing.title,
      severity: "warning",
    });
  }

  const pastClose = analysis?.insights.find((i) =>
    /past.?close|close date/i.test(i.title + i.detail),
  );
  if (pastClose) {
    signals.push({
      id: "past-close",
      mark: "down",
      text: pastClose.title,
      severity: "critical",
    });
  }

  const nextStep = analysis?.insights.find((i) =>
    /next.?step|activity|evidence/i.test(i.title + i.detail),
  );
  if (nextStep) {
    signals.push({
      id: "evidence",
      mark: "dot",
      text: nextStep.title,
      severity: "warning",
    });
  }

  if (signals.length === 0 && brief?.executiveJudgement) {
    signals.push({
      id: "judgement",
      mark: "dot",
      text: brief.executiveJudgement.slice(0, 120),
      severity: "neutral",
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: "pending",
      mark: "dot",
      text: "Commercial evidence is establishing — no enterprise pulse claimed from this source",
      severity: "neutral",
    });
  }

  return {
    headline: "Commercial evidence",
    signals: signals.slice(0, 4),
    confidence: brief?.confidence ?? active.readiness?.confidence ?? 0,
  };
}

export type SnapshotCommercialBriefView = {
  title: string;
  judgement: string;
  evidence: string[];
  implication: string;
  recommended: string[];
  dataConfidence: string;
  meetingPackAvailable: false;
  meetingPackLabel: string;
};

export function buildSnapshotCommercialBriefView(
  active: ActiveExecutiveSnapshotContext,
): SnapshotCommercialBriefView {
  const brief = active.commercialBrief;
  return {
    title: brief?.title ?? "Commercial Executive Brief",
    judgement:
      brief?.executiveJudgement ??
      "Commercial Executive Intelligence is active for this snapshot. Strategic outcomes have not yet been established.",
    evidence: brief?.evidence?.slice(0, 4) ?? [],
    implication: brief?.businessImplication ?? "",
    recommended: brief?.recommendedJudgement?.slice(0, 3) ?? [],
    dataConfidence: brief?.dataConfidence ?? "Calibrated to available evidence",
    meetingPackAvailable: false,
    meetingPackLabel: "Meeting pack not yet prepared",
  };
}

export function buildSnapshotCouncilBrief(
  active: ActiveExecutiveSnapshotContext,
): {
  brief: CouncilBrief;
  decisionTitle: string;
  outcomeName: string;
} {
  const commercial = active.commercialBrief;
  const hasPosition = Boolean(commercial?.councilPosition?.trim());

  return {
    brief: {
      headline: hasPosition
        ? commercial!.councilPosition.slice(0, 140)
        : "Council position not yet established",
      agreementLabel: hasPosition
        ? commercial!.councilDisagreement.length > 0
          ? "Disagreement noted"
          : "Position forming from commercial evidence"
        : "Council position not yet established",
      confidence: hasPosition ? commercial!.confidence : 0,
      // Avoid seat-specific "Watch COO" templates when no position exists.
      focusRole: hasPosition ? "Council" : "not established",
    },
    decisionTitle: "Commercial judgement",
    outcomeName: "Strategic outcomes not yet established",
  };
}

export function buildSnapshotJudgementQueue(
  active: ActiveExecutiveSnapshotContext,
): JudgementItem[] {
  const items: JudgementItem[] = [];
  const analysis = active.analysis;
  const insights =
    analysis?.insights.filter(
      (i) =>
        i.posture === "investigate" ||
        i.posture === "act" ||
        i.category === "executive_judgement" ||
        i.category === "data_quality",
    ) ?? [];

  for (const insight of insights.slice(0, 8)) {
    items.push({
      id: `snap-${insight.id}`,
      kind:
        insight.posture === "act"
          ? "risk"
          : insight.category === "data_quality"
            ? "opportunity"
            : "decision",
      title: insight.title.slice(0, 80),
      whyItMatters: (insight.implication ?? insight.detail).slice(0, 160),
      organisationalImpact: insight.detail.slice(0, 140),
      confidence: insight.confidence,
      costOfDelay:
        insight.posture === "monitor"
          ? "Low if monitored"
          : "Commercial uncertainty compounds while unexamined",
      recommendedAction:
        insight.posture === "insufficient_evidence"
          ? "Gather evidence before binding"
          : insight.posture === "monitor"
            ? "Monitor"
            : "Investigate",
      href: "/today",
      rankScore: insight.confidence,
      reasoning: {
        whyMatters: (insight.implication ?? insight.detail).slice(0, 180),
        evidence: insight.evidence.slice(0, 4),
        alternatives: "Deferral without evidence raises forecast uncertainty.",
        expectedOutcome:
          insight.posture === "insufficient_evidence"
            ? "Insufficient evidence — do not bind"
            : "Raise confidence before executive bind",
        confidence: insight.confidence,
        suggestedAction:
          insight.posture === "act" || insight.posture === "investigate"
            ? "Investigate with Council"
            : "Monitor",
      },
    });
  }

  // Fall back to portfolio decisions built from commercial bridge (not MOCK).
  if (items.length === 0) {
    for (const d of active.portfolio.decisions.slice(0, 6)) {
      if (containsDemoBusinessPhrase(d.question + d.why)) continue;
      items.push({
        id: `port-${d.id}`,
        kind: "decision",
        title: d.question.slice(0, 80),
        whyItMatters: (d.why || d.businessImpact).slice(0, 160),
        organisationalImpact: d.businessImpact.slice(0, 140),
        confidence: d.confidence,
        costOfDelay: d.costOfDelay.slice(0, 80),
        recommendedAction: d.whatShouldHappenNext.slice(0, 80),
        href: `/decisions/${d.id}`,
        rankScore: d.confidence,
        reasoning: {
          whyMatters: d.businessImpact.slice(0, 180),
          evidence: d.evidence.slice(0, 3).map((e) => e.title),
          alternatives: d.alternatives[0]?.label ?? "Monitor",
          expectedOutcome: d.expectedOutcomeImpact.slice(0, 120),
          confidence: d.confidence,
          suggestedAction: d.whatShouldHappenNext.slice(0, 80),
        },
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: "snap-none",
      kind: "strategy",
      title: "No material decision established",
      whyItMatters:
        "Strategic priorities have not yet been established for this commercial book.",
      organisationalImpact: "Judgement is ranked by materiality when evidence appears.",
      confidence: active.readiness?.confidence ?? 50,
      costOfDelay: "None yet",
      recommendedAction: "Continue evidence review",
      href: "/today",
      rankScore: 40,
      reasoning: {
        whyMatters: "No formal executive decision has been established from this snapshot.",
        evidence: [`${active.recordCount} records in Executive Snapshot`],
        alternatives: "Wait for stronger commercial signals.",
        expectedOutcome: "Evidence-safe empty state",
        confidence: active.readiness?.confidence ?? 50,
        suggestedAction: "Review Commercial Executive Brief",
      },
    });
  }

  return items.sort((a, b) => b.rankScore - a.rankScore);
}

export function buildSnapshotIntelligenceStream(
  active: ActiveExecutiveSnapshotContext,
): IntelligenceStreamEvent[] {
  const asOf = active.commercialBrief?.asOf ?? active.activatedAt;
  const events: IntelligenceStreamEvent[] = [];

  for (const insight of active.analysis?.insights.slice(0, 12) ?? []) {
    const blob = `${insight.title} ${insight.detail}`;
    if (containsDemoBusinessPhrase(blob)) continue;
    events.push({
      id: `stream-${insight.id}`,
      timeLabel: "Snapshot",
      at: asOf,
      title: insight.title.slice(0, 80),
      detail: insight.detail.slice(0, 140),
      href: "/today",
    });
  }

  if (events.length === 0) {
    events.push({
      id: "stream-empty",
      timeLabel: "Snapshot",
      at: asOf,
      title: "Commercial intelligence active",
      detail: `${active.recordCount} records · no seeded enterprise events`,
      href: "/today",
    });
  }

  return events;
}

export function snapshotReadinessSummary(
  readiness?: StudioReadiness,
): string {
  if (!readiness) return "Readiness pending";
  return `Executive readiness ${readiness.executiveReadiness}% · Evidence ${readiness.evidenceCoverage}%`;
}

/** Whether analysis/brief support commercial observations on the Command Centre. */
export function hasCommercialObservations(
  analysis?: CommercialAnalysis,
  brief?: CommercialExecutiveBrief,
): boolean {
  return Boolean(
    (analysis && analysis.insights.length > 0) ||
      (brief && brief.executiveJudgement.trim().length > 0),
  );
}
