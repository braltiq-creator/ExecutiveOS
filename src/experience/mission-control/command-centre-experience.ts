/**
 * Phase 58 — Command Centre experience projection.
 * Presentation-only mapping from active Executive Snapshot intelligence → EXDS models.
 * No new business logic; no invented metrics; no demo fallback.
 */

import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import type { CommercialAnalysis } from "@/executive-snapshot-studio/intelligence/commercial-analysis";
import type { CommercialExecutiveBrief } from "@/executive-snapshot-studio/intelligence/commercial-brief";
import type { NarrativeEvidenceMetric } from "@/design-system/executive-experience";
import type {
  ExdsCouncilSeat,
  ExdsHeatCell,
  ExdsRelationshipNode,
  ExdsSemanticTone,
  ExdsTimelineEvent,
} from "@/design-system/executive-experience";
import type { DistributionSegment } from "@/design-system/executive-experience";
import type { JudgementItem } from "@/experience/intelligence-engine/types";
import type { IntelligenceStreamEvent } from "@/experience/intelligence-engine/types";
import {
  assertNoDemoBusinessContext,
  buildSnapshotIntelligenceStream,
  buildSnapshotJudgementQueue,
  containsDemoBusinessPhrase,
} from "@/experience/mission-control/snapshot-integrity";
import { buildManufacturingCommandCentreExperience } from "@/experience/mission-control/manufacturing-command-centre";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  decisionHasLinkedAction,
} from "@/lib/decisions/decision-execution-linkage";

export type CommandCentreMetricCard = {
  id: string;
  title: string;
  value: string;
  meaning: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  confidence: number;
  tone: ExdsSemanticTone;
  href: string;
};

export type CommandCentreEvidenceCoverage = {
  supported: string[];
  notEstablished: string[];
  sourceLabel: string;
};

export type CommandCentreExecutiveValue = {
  status: string;
  explanation: string;
  evidenceRequired: string[];
};

export type CommandCentreAgeingDistribution = {
  question: string;
  segments: DistributionSegment[];
  thresholdLabel: string;
  averageLabel: string | null;
  beyondCount: number | null;
  confidence: number;
};

export type CommandCentreWalkItem = {
  id: string;
  index: string;
  title: string;
  detail: string;
};

export type CommandCentreFocusDomain = {
  id: string;
  label: string;
};

export type CommandCentreOvernightItem = {
  id: string;
  title: string;
  detail: string;
  impact?: string;
  tone: ExdsSemanticTone;
  href?: string;
};

export type CommandCentreExperienceModel = {
  profileId: string;
  profileLabel: string;
  recordCount: number;
  snapshotId: string;
  asOf: string;
  /** Active module presentation — commercial instruments vs manufacturing forecasting. */
  experienceModule?: "commercial" | "manufacturing_forecasting" | "generic";
  experienceKicker?: string;
  leadJudgement: string;
  leadSupport: string;
  evidenceMetrics: NarrativeEvidenceMetric[];
  /** Manufacturing 59B — signal → implication → judgement (derived only). */
  narrativeChain?: {
    signal: string;
    demandImplication: string;
    operationalImplication: string;
    judgement: string;
  } | null;
  darkPanel: {
    judgement: string;
    /** Large scannable statement (5-second read). */
    headline: string;
    /** One supporting sentence under the headline. */
    support: string;
    evidence: Array<{ id: string; text: string }>;
    evidenceStrip: Array<{
      id: string;
      label: string;
      value: string;
      tone: ExdsSemanticTone;
      caption?: string;
      detail?: string;
      role?: string;
    }>;
    requiresJudgement: string;
    potentialImpact: string;
    confidence: number;
    confidenceLabel?: string;
    actionHref: string;
  };
  metrics: CommandCentreMetricCard[];
  heatMap: {
    title: string;
    question: string;
    cells: ExdsHeatCell[];
    confidence: number;
    columns: 2 | 3 | 4 | 5 | 6;
  } | null;
  ageing: CommandCentreAgeingDistribution | null;
  /** Manufacturing Forecasting — national forecast vs actual series. */
  forecastVsActual?: {
    question: string;
    points: Array<{
      period: string;
      forecast: number;
      actual: number;
      variancePct: number | null;
    }>;
  } | null;
  confidenceBoard?: Array<{
    id: string;
    scope: string;
    level: "high" | "medium" | "low" | "insufficient";
    score: number | null;
    why: string[];
  }> | null;
  capacityBoard?: Array<{
    id: string;
    factory: string;
    loadPct: number | null;
    demonstratedDemand: number | null;
    availableSlots: number | null;
    capacity: number | null;
    tone: ExdsSemanticTone;
  }> | null;
  inventoryBoard?: Array<{
    id: string;
    variant: string;
    model: string;
    inventoryDays: number | null;
    finishedGoods: number | null;
    tone: ExdsSemanticTone;
  }> | null;
  queue: JudgementItem[];
  stream: IntelligenceStreamEvent[];
  council: {
    framing: string;
    seats: ExdsCouncilSeat[];
    established: boolean;
  };
  relationships: {
    title: string;
    question: string;
    nodes: ExdsRelationshipNode[];
  } | null;
  timeline: ExdsTimelineEvent[];
  evidenceCoverage: CommandCentreEvidenceCoverage;
  executiveValue: CommandCentreExecutiveValue;
  /** Profile-aware editorial context rail. */
  talkTrack: string[];
  walkItems: CommandCentreWalkItem[];
  focusDomains: CommandCentreFocusDomain[];
  overnight: CommandCentreOvernightItem[];
  executiveInsight: string;
  /** Phase 60 — decision paper teaser (full paper on /decisions). */
  decisionPaper?: {
    readiness: string;
    decisionQuestion: string;
    href: string;
    selectionMessage: string;
    decisionConfidenceLabel: string;
    decisionId?: string | null;
    /** Phase 61 — derived from live Decision / Action state. */
    executionStatus?: string;
    executionStatusLabel?: string;
    selectedOptionLabel?: string | null;
  } | null;
  /** Phase 63 — Design Partner status (generic; no customer hard-coding). */
  designPartner?: {
    organisationId: string;
    environmentLabel: string;
    focusLabel: string | null;
    snapshotLabel: string | null;
    dataHealth: string;
    executiveReadiness: number | null;
    datasetReadiness: number | null;
    pilotDayLabel: string;
    retentionPolicyLabel: string;
    isolationDisclosure: string;
    expansion: Array<{
      id: string;
      label: string;
      status: "active" | "not_active";
      rationale: string;
    }>;
  } | null;
  /** Phase 65 — continuity & accountability (derived only). */
  continuity?: {
    sinceYouLastLooked: Array<{
      id: string;
      state: string;
      label: string;
      detail: string;
    }>;
    nothingMaterialChanged: boolean;
    judgement: {
      previousJudgement: string | null;
      currentJudgement: string;
      state: string;
      label: string;
    };
    accountability: Array<{
      decisionId: string;
      decisionLabel: string;
      statusLabel: string;
      actionLabel: string | null;
      owner: string | null;
      due: string | null;
      lastChange: string;
      requiresAttention: boolean;
      overdue: boolean;
    }>;
  } | null;
};

function formatMoney(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

function findInsight(analysis: CommercialAnalysis | undefined, ...patterns: RegExp[]) {
  if (!analysis) return undefined;
  return analysis.insights.find((i) =>
    patterns.some((p) => p.test(`${i.id} ${i.title} ${i.detail}`)),
  );
}

/** Extract first "N/M" ratio from insight evidence, or a leading count. */
function parseCountRatio(text: string): { n: number; of?: number } | null {
  const ratio = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (ratio) return { n: Number(ratio[1]), of: Number(ratio[2]) };
  const single = text.match(/\b(\d+)\b/);
  if (single) return { n: Number(single[1]) };
  return null;
}

function parseAverageDays(text: string): number | null {
  const m = text.match(/average open stage duration is\s+(\d+)\s+days/i);
  return m ? Number(m[1]) : null;
}

function leadJudgementFrom(
  brief: CommercialExecutiveBrief | undefined,
  analysis: CommercialAnalysis | undefined,
): { judgement: string; support: string; confidence: number } {
  const ageing = findInsight(analysis, /stale-open|ageing|aging/i);
  const nextStep = findInsight(analysis, /next.?step|dq-next-step/i);
  const pastClose = findInsight(analysis, /past.?close|forecast-past-close/i);

  if (brief?.executiveJudgement?.trim()) {
    const first = brief.executiveJudgement.split(/(?<=[.!?])\s+/)[0] ?? brief.executiveJudgement;
    return {
      judgement: first.slice(0, 220),
      support:
        brief.evidence?.[0] ??
        ageing?.implication ??
        "Evidence is drawn from the active Executive Snapshot.",
      confidence: brief.confidence,
    };
  }

  const parts = [ageing?.implication, nextStep?.implication, pastClose?.implication]
    .filter(Boolean)
    .join(" ");

  return {
    judgement:
      parts.slice(0, 220) ||
      "Commercial evidence is establishing — material judgement has not yet been framed.",
    support:
      ageing?.evidence[0] ??
      "Active snapshot intelligence is the sole business context.",
    confidence: analysis?.insights[0]?.confidence ?? 50,
  };
}

function buildEvidenceMetrics(
  analysis: CommercialAnalysis | undefined,
): NarrativeEvidenceMetric[] {
  if (!analysis) return [];
  const metrics: NarrativeEvidenceMetric[] = [];

  const ageing = findInsight(analysis, /stale-open|ageing|aging/i);
  if (ageing) {
    const ratio = parseCountRatio(ageing.evidence[0] ?? ageing.detail);
    const avg = parseAverageDays(ageing.detail);
    if (ratio) {
      metrics.push({
        id: "beyond-threshold",
        label: "Beyond stage-duration threshold",
        value: ratio.of ? `${ratio.n} / ${ratio.of}` : String(ratio.n),
        tone: "attention",
      });
    }
    if (avg != null) {
      metrics.push({
        id: "avg-duration",
        label: "Average open stage duration",
        value: `${avg} days`,
        tone: "watching",
      });
    }
  }

  const pastClose = findInsight(analysis, /past.?close|forecast-past-close/i);
  if (pastClose) {
    const ratio = parseCountRatio(pastClose.evidence[0] ?? pastClose.detail);
    if (ratio) {
      metrics.push({
        id: "past-close",
        label: "Open records past close date",
        value: String(ratio.n),
        tone: "attention",
      });
    }
  }

  if (analysis.openPipelineValue > 0 && metrics.length < 3) {
    metrics.push({
      id: "pipeline",
      label: "Pipeline in view",
      value: formatMoney(analysis.openPipelineValue),
      tone: "intelligence",
    });
  }

  return metrics.slice(0, 3);
}

function buildMetricCards(
  analysis: CommercialAnalysis | undefined,
  brief: CommercialExecutiveBrief | undefined,
): CommandCentreMetricCard[] {
  if (!analysis) return [];
  const cards: CommandCentreMetricCard[] = [];
  const ageing = findInsight(analysis, /stale-open|ageing|aging/i);
  const nextStep = findInsight(analysis, /next.?step|dq-next-step/i);
  const pastClose = findInsight(analysis, /past.?close|forecast-past-close/i);

  if (ageing) {
    const ratio = parseCountRatio(ageing.evidence[0] ?? ageing.detail);
    cards.push({
      id: "ageing-exposure",
      title: "Ageing Exposure",
      value: ratio
        ? `${ratio.n}${ratio.of ? ` / ${ratio.of}` : ""}`
        : formatMoney(analysis.ageingOpenValue),
      meaning: "Where is ageing accumulating?",
      trend: "down",
      trendLabel: (ageing.implication ?? "Exposure rising with stage age").slice(
        0,
        96,
      ),
      confidence: ageing.confidence,
      tone: "attention",
      href: "/today",
    });
  }

  if (analysis.openPipelineValue > 0) {
    cards.push({
      id: "pipeline-in-view",
      title: "Pipeline in View",
      value: formatMoney(analysis.openPipelineValue),
      meaning: "What pipeline remains in view?",
      trend: "flat",
      trendLabel: `${analysis.openCount} open · ${analysis.closedCount} closed records in snapshot`,
      confidence: 90,
      tone: "intelligence",
      href: "/today",
    });
  }

  if (nextStep) {
    const cov = analysis.fieldCoverage.find((f) => f.field === "nextStep");
    cards.push({
      id: "next-step-evidence",
      title: "Next-Step Evidence",
      value: cov ? `${cov.rate}%` : "Thin",
      meaning: "How thin is next-step evidence?",
      trend: "down",
      trendLabel: (nextStep.detail ?? "Evidence gap").slice(0, 96),
      confidence: nextStep.confidence,
      tone: "watching",
      href: "/today",
    });
  }

  if (pastClose) {
    const ratio = parseCountRatio(pastClose.evidence[0] ?? pastClose.detail);
    cards.push({
      id: "past-close-exposure",
      title: "Past-Close Exposure",
      value: ratio ? String(ratio.n) : formatMoney(analysis.pastCloseOpenValue),
      meaning: "Where does past-close exposure sit?",
      trend: "down",
      trendLabel: (
        pastClose.implication ?? "Forecast credibility constrained"
      ).slice(0, 96),
      confidence: pastClose.confidence,
      tone: "attention",
      href: "/today",
    });
  }

  const health =
    brief?.commercialHealth?.trim() ||
    (analysis.openCount > 0 ? "Establishing" : "Monitoring");
  cards.push({
    id: "commercial-health",
    title: "Commercial Health",
    value: /establish|uncertain|watch|atten/i.test(health)
      ? "Establishing"
      : health.slice(0, 22),
    meaning: "What is commercial health signalling?",
    trend: "flat",
    trendLabel: health.slice(0, 96),
    confidence: brief?.confidence ?? 55,
    tone: /watch|risk|uncertain|atten/i.test(health) ? "watching" : "intelligence",
    href: "/today",
  });

  return cards.slice(0, 5);
}

function buildHeatMap(
  analysis: CommercialAnalysis | undefined,
): CommandCentreExperienceModel["heatMap"] {
  if (!analysis || analysis.stageDistribution.length === 0) return null;

  const openStages = analysis.stageDistribution.filter(
    (s) => !/closed|won|lost|inactive/i.test(s.stage),
  );
  const basis = openStages.length > 0 ? openStages : analysis.stageDistribution;
  const max = Math.max(...basis.map((s) => s.count), 1);

  const cells: ExdsHeatCell[] = basis.slice(0, 8).map((s) => {
    const intensity = Math.round((s.count / max) * 100);
    const tone: ExdsSemanticTone =
      intensity >= 80
        ? "attention"
        : intensity >= 55
          ? "watching"
          : intensity >= 30
            ? "intelligence"
            : "improving";
    return {
      id: `stage-${s.stage}`,
      label: s.stage.slice(0, 28) || "(unspecified)",
      value: intensity,
      detail: `${s.count}`,
      tone,
      href: "/today",
    };
  });

  for (const owner of analysis.ownerConcentration.slice(0, 3)) {
    cells.push({
      id: `owner-${owner.owner}`,
      label: owner.owner.slice(0, 22) || "blank",
      value: owner.share,
      detail: `${owner.share}%`,
      tone: owner.share >= 40 ? "attention" : owner.share >= 25 ? "watching" : "intelligence",
      href: "/today",
    });
  }

  return {
    title: "Opportunity Exposure",
    question: "Where is commercial exposure concentrated?",
    cells: cells.slice(0, 12),
    confidence: 84,
    columns: 4,
  };
}

function buildAgeingDistribution(
  analysis: CommercialAnalysis | undefined,
): CommandCentreAgeingDistribution | null {
  if (!analysis || analysis.openCount === 0) return null;
  const ageing = findInsight(analysis, /stale-open|ageing|aging/i);
  if (!ageing) return null;

  const ratio = parseCountRatio(ageing.evidence[0] ?? ageing.detail);
  const beyond = ratio?.n ?? null;
  const of = ratio?.of ?? analysis.openCount;
  const within = beyond != null ? Math.max(0, of - beyond) : null;
  const avg = parseAverageDays(ageing.detail);

  const segments: DistributionSegment[] = [];
  if (within != null) {
    segments.push({
      id: "within",
      label: "< 120 days",
      value: within,
      tone: "intelligence",
    });
  }
  if (beyond != null) {
    segments.push({
      id: "beyond",
      label: "≥ 120 days",
      value: beyond,
      tone: "attention",
    });
  }
  if (segments.length === 0) return null;

  return {
    question: "Where is ageing accumulating?",
    segments,
    thresholdLabel: "Open opportunity stage duration",
    averageLabel: avg != null ? `${avg} days` : null,
    beyondCount: beyond,
    confidence: ageing.confidence,
  };
}

function buildCouncil(active: ActiveExecutiveSnapshotContext): CommandCentreExperienceModel["council"] {
  const brief = active.commercialBrief;
  const established = Boolean(brief?.councilPosition?.trim());
  const framing = established
    ? brief!.councilPosition
    : "Council position not yet established.";
  const dissent = brief?.councilDisagreement ?? [];
  const roles =
    active.councilSeats.length > 0
      ? active.councilSeats
      : ["CEO", "CFO", "COO", "CRO", "CSO"];

  const seats: ExdsCouncilSeat[] = roles.slice(0, 5).map((role) => ({
    id: role.toLowerCase(),
    role,
    position: established
      ? "Council-level position recorded"
      : "Council position not yet established",
    confidence: established ? brief!.confidence : 0,
    reasoning: established
      ? brief!.councilPosition
      : "Commercial intelligence has not established a seat-level Council position for this snapshot.",
    evidence: brief?.evidence?.slice(0, 3),
    challenges: dissent.length > 0 ? dissent : undefined,
    // Never manufacture consensus — agreement stays unset until seats diverge.
    agreement: 0,
  }));

  return { framing, seats, established };
}

function buildRelationships(
  analysis: CommercialAnalysis | undefined,
): CommandCentreExperienceModel["relationships"] {
  if (!analysis) return null;
  const topOwner = analysis.ownerConcentration[0];
  const topProduct = analysis.productConcentration[0];
  const topStage = analysis.stageDistribution[0];
  if (!topOwner && !topProduct && !topStage) return null;

  const nodes: ExdsRelationshipNode[] = [
    { id: "opportunity", label: "Opportunity book", tone: "intelligence" },
  ];
  if (topOwner) {
    nodes.push({
      id: "owner",
      label: `Owner · ${topOwner.owner.slice(0, 24) || "unspecified"} (${topOwner.share}%)`,
      tone: topOwner.share >= 40 ? "attention" : "watching",
    });
  }
  if (topProduct) {
    nodes.push({
      id: "product",
      label: `Product · ${(topProduct.product || "unspecified").slice(0, 24)} (${topProduct.share}%)`,
      tone: topProduct.share >= 40 ? "attention" : "intelligence",
    });
  }
  if (topStage) {
    nodes.push({
      id: "stage",
      label: `Stage · ${topStage.stage.slice(0, 24)}`,
      tone: "watching",
    });
  }

  return {
    title: "Commercial concentration",
    question: "Where is commercial exposure concentrated?",
    nodes,
  };
}

function buildTimeline(
  analysis: CommercialAnalysis | undefined,
  brief: CommercialExecutiveBrief | undefined,
): ExdsTimelineEvent[] {
  const events: ExdsTimelineEvent[] = [];
  const asOf = brief?.asOf ?? analysis?.asOf;

  for (const insight of analysis?.insights.slice(0, 8) ?? []) {
    if (containsDemoBusinessPhrase(`${insight.title} ${insight.detail}`)) continue;
    const stage =
      insight.category === "executive_judgement"
        ? "recommendation"
        : insight.category === "data_quality"
          ? "observation"
          : "analysis";
    events.push({
      id: `tl-${insight.id}`,
      stage,
      title: insight.title.slice(0, 80),
      summary: (insight.implication ?? insight.detail).slice(0, 140),
      timestamp: asOf ? asOf.slice(0, 10) : undefined,
      tone:
        insight.posture === "act"
          ? "attention"
          : insight.posture === "investigate"
            ? "watching"
            : "intelligence",
      href: "/today",
    });
  }

  return events.slice(0, 6);
}

function buildEvidenceCoverage(
  analysis: CommercialAnalysis | undefined,
  profileLabel: string,
): CommandCentreEvidenceCoverage {
  const supported: string[] = [];
  if (analysis) {
    if (analysis.openPipelineValue > 0 || analysis.openCount > 0) {
      supported.push("Pipeline");
    }
    if (findInsight(analysis, /stale-open|ageing|aging/i)) {
      supported.push("Opportunity ageing");
      supported.push("Stage duration");
    }
    if (findInsight(analysis, /past.?close|forecast-past-close/i)) {
      supported.push("Close-date exposure");
    }
    if (analysis.productConcentration.length > 0) supported.push("Product");
    if (analysis.ownerConcentration.length > 0) supported.push("Owner");
    const industry = analysis.fieldCoverage.find((f) => f.field === "industry");
    if (industry && industry.rate > 0) supported.push("Industry");
  }

  return {
    sourceLabel: profileLabel || "Active snapshot",
    supported,
    notEstablished: [
      "Strategic outcomes",
      "Organisation health",
      "People health",
      "System health",
      "Customer health",
    ],
  };
}

function buildExecutiveValue(
  analysis: CommercialAnalysis | undefined,
  brief: CommercialExecutiveBrief | undefined,
): CommandCentreExecutiveValue {
  const status =
    brief?.executiveValue && !/not yet|unquantif/i.test(brief.executiveValue)
      ? brief.executiveValue
      : analysis?.executiveValue.quantified
        ? analysis.executiveValue.narrative
        : "Not yet quantified";

  return {
    status: /not yet/i.test(status) ? "Not yet quantified" : status.slice(0, 48),
    explanation:
      "Current dataset supports pipeline exposure analysis but not verified value-at-risk or protected-value measurement.",
    evidenceRequired: [
      "Baseline forecast",
      "Realised outcomes",
      "Decision impact",
    ],
  };
}

/** Profile-aware focus domains — presentation template only. */
function focusDomainsForProfile(profileId: string): CommandCentreFocusDomain[] {
  switch (profileId) {
    case "manufacturing":
      return [
        { id: "demand", label: "Demand" },
        { id: "factory", label: "Factory" },
        { id: "inventory", label: "Inventory" },
        { id: "capacity", label: "Capacity" },
      ];
    case "mining":
      return [
        { id: "production", label: "Production" },
        { id: "reliability", label: "Reliability" },
        { id: "maintenance", label: "Maintenance" },
        { id: "cost", label: "Cost" },
      ];
    case "utilities":
      return [
        { id: "demand", label: "Demand" },
        { id: "assets", label: "Assets" },
        { id: "field", label: "Field" },
        { id: "reliability", label: "Reliability" },
      ];
    case "field_services":
      return [
        { id: "jobs", label: "Jobs" },
        { id: "workforce", label: "Workforce" },
        { id: "parts", label: "Parts" },
        { id: "sla", label: "SLA" },
      ];
    case "technology":
      return [
        { id: "product", label: "Product" },
        { id: "customers", label: "Customers" },
        { id: "pipeline", label: "Pipeline" },
        { id: "delivery", label: "Delivery" },
      ];
    case "commercial":
    default:
      return [
        { id: "pipeline", label: "Pipeline" },
        { id: "forecast", label: "Forecast" },
        { id: "customers", label: "Customers" },
        { id: "product", label: "Product" },
      ];
  }
}

function buildTalkTrack(
  analysis: CommercialAnalysis | undefined,
  brief: CommercialExecutiveBrief | undefined,
): string[] {
  const sentences: string[] = [];

  const implication = brief?.businessImplication?.trim();
  if (implication && !containsDemoBusinessPhrase(implication)) {
    sentences.push(implication.split(/(?<=[.!?])\s+/)[0]!.slice(0, 160));
  }

  for (const e of brief?.evidence?.slice(0, 2) ?? []) {
    if (containsDemoBusinessPhrase(e)) continue;
    const short = e.replace(/\.$/, "").slice(0, 110);
    if (short && !sentences.some((s) => s.includes(short.slice(0, 24)))) {
      sentences.push(short);
    }
  }

  if (sentences.length === 0 && analysis) {
    for (const i of analysis.insights.slice(0, 2)) {
      if (!containsDemoBusinessPhrase(i.title)) {
        sentences.push(i.title.slice(0, 110));
      }
    }
  }

  if (sentences.length === 0) {
    sentences.push("Active Executive Snapshot evidence is establishing.");
  }

  return sentences.slice(0, 3);
}

function buildWalkItems(
  metrics: CommandCentreMetricCard[],
  analysis: CommercialAnalysis | undefined,
): CommandCentreWalkItem[] {
  const fromMetrics = metrics.slice(0, 4).map((m, i) => ({
    id: m.id,
    index: String(i + 1).padStart(2, "0"),
    title: m.title,
    detail: "",
  }));
  if (fromMetrics.length > 0) return fromMetrics;

  const fallback: CommandCentreWalkItem[] = [];
  if (analysis?.openPipelineValue) {
    fallback.push({
      id: "pipeline",
      index: "01",
      title: "Pipeline",
      detail: "",
    });
  }
  fallback.push({
    id: "evidence",
    index: String(fallback.length + 1).padStart(2, "0"),
    title: "Evidence",
    detail: "",
  });
  return fallback.slice(0, 4);
}

function buildOvernight(
  analysis: CommercialAnalysis | undefined,
  stream: IntelligenceStreamEvent[],
): CommandCentreOvernightItem[] {
  const items: CommandCentreOvernightItem[] = [];
  for (const insight of analysis?.insights.slice(0, 4) ?? []) {
    if (containsDemoBusinessPhrase(insight.title)) continue;
    const tone: ExdsSemanticTone =
      insight.posture === "act"
        ? "attention"
        : insight.category === "data_quality"
          ? "watching"
          : insight.posture === "investigate"
            ? "watching"
            : "intelligence";
    const metric =
      insight.evidence[0]?.match(/\d[\d,/.\s]*/)?.[0]?.trim() ??
      insight.detail.match(/\d[\d,/.\s%]*/)?.[0]?.trim();
    items.push({
      id: insight.id,
      title: insight.title.slice(0, 48),
      detail: metric
        ? metric
        : (insight.detail ?? insight.implication ?? "").slice(0, 72),
      impact:
        insight.posture === "act"
          ? "High"
          : insight.category === "data_quality"
            ? "Watch"
            : insight.posture === "investigate"
              ? "High"
              : "Watch",
      tone,
      href: "/today",
    });
  }
  if (items.length === 0) {
    for (const e of stream.slice(0, 3)) {
      items.push({
        id: e.id,
        title: e.title,
        detail: e.detail ?? "",
        tone: "intelligence",
        href: e.href,
      });
    }
  }
  return items.slice(0, 4);
}

/**
 * Project active Executive Snapshot intelligence into the Command Centre experience model.
 */
export function buildCommandCentreExperience(
  active: ActiveExecutiveSnapshotContext,
  livePortfolio?: OutcomePortfolio | null,
): CommandCentreExperienceModel {
  if (
    active.profileId === "manufacturing" &&
    active.manufacturingAnalysis
  ) {
    return buildManufacturingCommandCentreExperience(
      active,
      livePortfolio ?? active.portfolio,
    );
  }

  const analysis = active.analysis;
  const brief = active.commercialBrief;
  const lead = leadJudgementFrom(brief, analysis);
  const ageingInsight = findInsight(analysis, /stale-open|ageing|aging/i);
  const nextStep = findInsight(analysis, /next.?step|dq-next-step/i);
  const pastClose = findInsight(analysis, /past.?close|forecast-past-close/i);

  const darkEvidence: Array<{ id: string; text: string }> = [];
  if (ageingInsight) {
    darkEvidence.push({
      id: "e-ageing",
      text: ageingInsight.evidence[0] ?? ageingInsight.detail,
    });
  }
  if (pastClose) {
    darkEvidence.push({
      id: "e-past-close",
      text: pastClose.evidence[0] ?? pastClose.detail,
    });
  }
  if (nextStep) {
    darkEvidence.push({
      id: "e-next-step",
      text: nextStep.title,
    });
  }

  const evidenceMetrics = buildEvidenceMetrics(analysis);
  const metrics = buildMetricCards(analysis, brief);
  const queue = buildSnapshotJudgementQueue(active);
  const stream = buildSnapshotIntelligenceStream(active);
  const talkTrack = buildTalkTrack(analysis, brief);
  const overnight = buildOvernight(analysis, stream);

  const headline =
    ageingInsight?.evidence[0]?.slice(0, 140) ||
    ageingInsight?.detail?.slice(0, 140) ||
    lead.judgement.slice(0, 140);

  const support =
    (
      brief?.businessImplication ||
      ageingInsight?.implication ||
      lead.support
    )
      ?.split(/(?<=[.!?])\s+/)[0]
      ?.slice(0, 180) || lead.support.slice(0, 180);

  const model: CommandCentreExperienceModel = {
    profileId: active.profileId,
    profileLabel: active.profileLabel,
    recordCount: active.recordCount,
    snapshotId: active.snapshotId,
    asOf: brief?.asOf ?? analysis?.asOf ?? active.activatedAt,
    experienceModule: "commercial",
    experienceKicker: "Command Centre",
    leadJudgement: lead.judgement,
    leadSupport: lead.support,
    evidenceMetrics,
    darkPanel: {
      judgement:
        brief?.businessImplication?.slice(0, 220) ||
        ageingInsight?.implication?.slice(0, 220) ||
        lead.judgement,
      headline,
      support,
      evidence: darkEvidence.slice(0, 4),
      evidenceStrip: evidenceMetrics.map((m) => ({
        id: m.id,
        label: m.label,
        value: m.value,
        tone: m.tone ?? "intelligence",
      })),
      requiresJudgement:
        brief?.recommendedJudgement?.[0]?.replace(/^(Investigate|Consider acting on):\s*/i, "") ||
        "Which opportunities remain credible enough to carry forward?",
      potentialImpact:
        ageingInsight?.implication ??
        "Commercial uncertainty compounds while unexamined.",
      confidence: lead.confidence,
      actionHref: "/today",
    },
    metrics,
    heatMap: buildHeatMap(analysis),
    ageing: buildAgeingDistribution(analysis),
    queue,
    stream,
    council: buildCouncil(active),
    relationships: buildRelationships(analysis),
    timeline: buildTimeline(analysis, brief),
    evidenceCoverage: buildEvidenceCoverage(analysis, active.profileLabel),
    executiveValue: buildExecutiveValue(analysis, brief),
    talkTrack,
    walkItems: buildWalkItems(metrics, analysis),
    focusDomains: focusDomainsForProfile(active.profileId),
    overnight,
    executiveInsight:
      lead.judgement.slice(0, 180) ||
      "Active snapshot evidence requires executive judgement before binding.",
  };

  if (process.env.NODE_ENV !== "production") {
    const blob = [
      model.leadJudgement,
      model.leadSupport,
      model.darkPanel.judgement,
      model.council.framing,
      model.executiveInsight,
      ...model.talkTrack,
      ...model.queue.map((q) => q.title),
      ...model.stream.map((e) => e.title),
      ...model.metrics.map((m) => m.title + m.value),
    ].join("\n");
    assertNoDemoBusinessContext(blob);
  }

  return model;
}
