/**
 * Phase 59 / 59B — Manufacturing Forecasting Command Centre projection.
 * Presentation-only mapping from ManufacturingAnalysis → shared experience model.
 * Phase 59B: single lead judgement + semantic evidence hierarchy (no formula changes).
 */

import type { NarrativeEvidenceMetric } from "@/design-system/executive-experience";
import type {
  ExdsCouncilSeat,
  ExdsHeatCell,
  ExdsSemanticTone,
} from "@/design-system/executive-experience";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { MANUFACTURING_VARIANCE_WINDOW_PERIODS } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { ManufacturingExecutiveBrief } from "@/executive-snapshot-studio/intelligence/manufacturing-brief";
import {
  assertNoDemoBusinessContext,
  buildSnapshotIntelligenceStream,
  buildSnapshotJudgementQueue,
  containsDemoBusinessPhrase,
} from "@/experience/mission-control/snapshot-integrity";
import type {
  CommandCentreExperienceModel,
  CommandCentreMetricCard,
  CommandCentreOvernightItem,
  CommandCentreWalkItem,
} from "@/experience/mission-control/command-centre-experience";
import {
  buildManufacturingEvidenceHierarchy,
  buildManufacturingNarrativeChain,
  isGenericFramingTitle,
  resolveJudgementConfidence,
  resolveManufacturingLeadJudgement,
  whyItMattersFromManufacturing,
} from "@/experience/mission-control/manufacturing-evidence-hierarchy";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import {
  commandCentreStatusFromDecision,
  commandCentreStatusLabel,
  decisionHasLinkedAction,
} from "@/lib/decisions/decision-execution-linkage";
import {
  buildContinuityBundle,
  buildDesignPartnerStatus,
  buildManufacturingExpansionSignals,
  findPreviousSnapshot,
} from "@/design-partner";
import { getPilotByOrganisation } from "@/pilot";
import { listStoredExecutiveSnapshots } from "@/executive-snapshot-studio/launch";

function mapHeatTone(
  tone: ManufacturingAnalysis["heatMap"][number]["tone"],
): ExdsSemanticTone {
  switch (tone) {
    case "attention":
      return "attention";
    case "watching":
      return "watching";
    case "improving":
      return "improving";
    case "historical":
      return "historical";
    default:
      return "intelligence";
  }
}

function mapCapacityTone(
  tone: ManufacturingAnalysis["capacity"][number]["tone"],
): ExdsSemanticTone {
  return mapHeatTone(tone);
}

function metricsFromManufacturing(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
  judgementConfidence: number,
): CommandCentreMetricCard[] {
  const cards: CommandCentreMetricCard[] = [];
  const demand = analysis.insights.find((i) => i.category === "demand_movement");
  if (demand) {
    cards.push({
      id: "demand-movement",
      title: "Demand Movement",
      value: demand.evidence[0]?.match(/[+\-]?\d+(\.\d+)?%/)?.[0] ?? "Moved",
      meaning: "Where is demand accelerating or declining?",
      trend: "up",
      trendLabel: demand.title.slice(0, 72),
      confidence: demand.confidence,
      tone: "attention",
      href: "/today",
    });
  }

  const national = analysis.confidenceSlices.find((s) => s.id === "national");
  cards.push({
    id: "forecast-confidence",
    title: "Forecast Confidence",
    value: national?.level?.toUpperCase() ?? "INSUFFICIENT",
    meaning:
      "National forecast health (dataset) — not the same as judgement confidence.",
    trend: "flat",
    trendLabel: national?.why[0] ?? "Insufficient evidence",
    confidence: national?.score ?? 40,
    tone:
      national?.level === "high"
        ? "improving"
        : national?.level === "medium"
          ? "watching"
          : "attention",
    href: "/today",
  });

  cards.push({
    id: "judgement-confidence",
    title: "Judgement Confidence",
    value: `${judgementConfidence}%`,
    meaning: "Confidence associated with the lead manufacturing judgement.",
    trend: "flat",
    trendLabel: "Model / demand scoped — not national rollup",
    confidence: judgementConfidence,
    tone:
      judgementConfidence >= 75
        ? "improving"
        : judgementConfidence >= 55
          ? "watching"
          : "attention",
    href: "/today",
  });

  const cap = [...analysis.capacity]
    .filter((c) => c.loadPct != null)
    .sort((a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0))[0];
  if (cap?.loadPct != null) {
    const multiple = (cap.loadPct / 100).toFixed(2);
    cards.push({
      id: "capacity-load",
      title: "Capacity Implication",
      value: `${cap.loadPct}% of plant capacity`,
      meaning:
        cap.capacity != null
          ? `${cap.demonstratedDemand} units demand vs ${cap.capacity} plant capacity (${multiple}×) at ${cap.factory}`
          : "Where does demand begin to exceed available plant capacity?",
      trend: "up",
      trendLabel: `${cap.factory} · ${multiple}× demonstrated load`,
      confidence: 78,
      tone: mapCapacityTone(cap.tone),
      href: "/today",
    });
  }

  const inv = analysis.inventory.find((i) => i.tone === "attention");
  if (inv) {
    cards.push({
      id: "inventory-exposure",
      title: "Inventory Implication",
      value:
        inv.inventoryDays != null ? `${inv.inventoryDays}d` : "Elevated",
      meaning: "Where does the forecast create excess inventory risk?",
      trend: "down",
      trendLabel: inv.variant,
      confidence: 72,
      tone: "attention",
      href: "/today",
    });
  }

  if (brief?.forecastConfidence && cards.length < 5) {
    cards.push({
      id: "mfg-health",
      title: "Forecast Health",
      value: brief.forecastConfidence.slice(0, 18),
      meaning: "What is manufacturing forecast health signalling?",
      trend: "flat",
      trendLabel: brief.forecastConfidence.slice(0, 72),
      confidence: brief.confidence,
      tone: "intelligence",
      href: "/today",
    });
  }

  return cards.slice(0, 5);
}

function heatMapFromManufacturing(
  analysis: ManufacturingAnalysis,
): CommandCentreExperienceModel["heatMap"] {
  if (analysis.heatMap.length === 0) return null;
  const windowLabel = `${MANUFACTURING_VARIANCE_WINDOW_PERIODS}-period actual vs forecast`;
  const cells: ExdsHeatCell[] = analysis.heatMap.slice(0, 20).map((c) => ({
    id: c.id,
    label: `${c.region} · ${c.model}`,
    value:
      c.variancePct == null
        ? 0
        : Math.min(100, Math.round(Math.abs(c.variancePct) * 4)),
    detail:
      c.variancePct == null
        ? "—"
        : `${c.variancePct > 0 ? "+" : ""}${c.variancePct}% · ${windowLabel}`,
    tone: mapHeatTone(c.tone),
    href: "/today",
  }));

  return {
    title: "Region × Model Exposure",
    question: `Where is demand diverging from forecast (${windowLabel})?`,
    cells,
    confidence: 84,
    columns: 4,
  };
}

/**
 * Project manufacturing forecasting snapshot into the shared Command Centre model.
 */
export function buildManufacturingCommandCentreExperience(
  active: ActiveExecutiveSnapshotContext,
  livePortfolio?: OutcomePortfolio | null,
): CommandCentreExperienceModel {
  const analysis = active.manufacturingAnalysis!;
  const brief = active.manufacturingBrief;

  const leadJudgement = resolveManufacturingLeadJudgement(analysis, brief);
  const whyItMatters = whyItMattersFromManufacturing(analysis, brief);
  const judgementConfidence = resolveJudgementConfidence(
    analysis,
    leadJudgement,
  );
  const evidenceHierarchy = buildManufacturingEvidenceHierarchy(
    analysis,
    leadJudgement,
    4,
  );
  const narrativeChain = buildManufacturingNarrativeChain(
    analysis,
    brief,
    leadJudgement,
  );
  const decisionPaper = buildManufacturingDecisionPaper(analysis, brief);

  const evidenceMetrics: NarrativeEvidenceMetric[] = evidenceHierarchy.map(
    (item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      tone: item.tone,
      caption: item.roleLabel,
      detail: item.windowLabel,
      role: item.role,
    }),
  );

  const metrics = metricsFromManufacturing(
    analysis,
    brief,
    judgementConfidence,
  );
  const queue = buildSnapshotJudgementQueue(active);
  const stream = buildSnapshotIntelligenceStream(active);

  const framingInsight = analysis.insights.find(
    (i) => i.category === "executive_judgement",
  );
  const domainFraming =
    framingInsight && isGenericFramingTitle(framingInsight.title)
      ? framingInsight.title
      : "Manufacturing Forecast Intelligence";

  const talkTrack = [
    leadJudgement,
    whyItMatters.slice(0, 140),
    domainFraming !== leadJudgement ? domainFraming : undefined,
  ]
    .filter((s): s is string => Boolean(s && !containsDemoBusinessPhrase(s)))
    .slice(0, 3);

  if (talkTrack.length === 0) {
    talkTrack.push("Manufacturing forecast evidence is establishing.");
  }

  const walkItems: CommandCentreWalkItem[] = [
    { id: "demand", index: "01", title: "Demand Movement", detail: "" },
    { id: "heat", index: "02", title: "Region × Model", detail: "" },
    { id: "forecast", index: "03", title: "Forecast vs Actual", detail: "" },
    { id: "capacity", index: "04", title: "Capacity & Inventory", detail: "" },
  ];

  const overnight: CommandCentreOvernightItem[] = analysis.insights
    .filter((i) => i.category !== "executive_judgement")
    .slice(0, 4)
    .map((insight) => ({
      id: insight.id,
      title: insight.title.slice(0, 48),
      detail: insight.evidence[0] ?? insight.detail.slice(0, 72),
      impact:
        insight.posture === "act"
          ? "High"
          : insight.posture === "investigate"
            ? "High"
            : "Watch",
      tone:
        insight.category === "capacity_implication" ||
        insight.category === "inventory_implication"
          ? "attention"
          : insight.category === "forecast_confidence"
            ? "watching"
            : insight.category === "demand_movement"
              ? "attention"
              : "intelligence",
      href: "/today",
    }));

  const established = Boolean(
    brief?.councilPosition?.trim() &&
      !/not yet established/i.test(brief.councilPosition),
  );

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
      : "Manufacturing forecasting has not established a seat-level Council position for this snapshot.",
    evidence: brief?.evidence?.slice(0, 3),
    agreement: 0,
  }));

  const model: CommandCentreExperienceModel = {
    profileId: active.profileId,
    profileLabel: active.profileLabel,
    recordCount: active.recordCount,
    snapshotId: active.snapshotId,
    asOf: brief?.asOf ?? analysis.asOf ?? active.activatedAt,
    experienceModule: "manufacturing_forecasting",
    experienceKicker: "Manufacturing Forecast Intelligence",
    leadJudgement,
    leadSupport: whyItMatters,
    evidenceMetrics,
    narrativeChain: narrativeChain
      ? {
          signal: narrativeChain.signal,
          demandImplication: narrativeChain.demandImplication,
          operationalImplication: narrativeChain.operationalImplication,
          judgement: narrativeChain.judgement,
        }
      : null,
    darkPanel: {
      judgement: whyItMatters.slice(0, 220),
      headline: leadJudgement.slice(0, 160),
      support: whyItMatters.slice(0, 180),
      evidence: evidenceHierarchy.map((item, i) => ({
        id: `mfg-e-${i}`,
        text: `${item.label} ${item.value} — ${item.roleLabel}`,
      })),
      evidenceStrip: evidenceHierarchy.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.value,
        tone: item.tone,
        caption: item.roleLabel,
        detail: item.windowLabel,
        role: item.role,
      })),
      requiresJudgement: whyItMatters.slice(0, 280),
      potentialImpact: whyItMatters,
      confidence: judgementConfidence,
      confidenceLabel: "Judgement confidence",
      actionHref: decisionPaper.href,
    },
    metrics,
    heatMap: heatMapFromManufacturing(analysis),
    ageing: null,
    forecastVsActual: {
      question: "Is demand tracking the forecast?",
      points: analysis.nationalSeries.slice(-8).map((p) => ({
        period: p.period,
        forecast: p.forecast,
        actual: p.actual,
        variancePct: p.variancePct,
      })),
    },
    confidenceBoard: analysis.confidenceSlices.slice(0, 6).map((s) => ({
      id: s.id,
      scope: s.scope,
      level: s.level,
      score: s.score,
      why: s.why,
    })),
    capacityBoard: analysis.capacity.map((c) => ({
      id: c.factory,
      factory: c.factory,
      loadPct: c.loadPct,
      demonstratedDemand: c.demonstratedDemand,
      availableSlots: c.availableSlots,
      capacity: c.capacity,
      tone: mapCapacityTone(c.tone),
    })),
    inventoryBoard: analysis.inventory.slice(0, 4).map((i) => ({
      id: i.variant,
      variant: i.variant,
      model: i.model,
      inventoryDays: i.inventoryDays,
      finishedGoods: i.finishedGoods,
      tone: mapHeatTone(i.tone),
    })),
    queue,
    stream,
    council: {
      framing: established
        ? brief!.councilPosition
        : "Council position not yet established.",
      seats,
      established,
    },
    relationships: null,
    timeline: [],
    evidenceCoverage: {
      supported: analysis.fieldCoverage
        .filter((f) => f.rate >= 60)
        .map((f) => f.field)
        .slice(0, 8),
      notEstablished: analysis.missingInformation.slice(0, 6),
      sourceLabel: analysis.demonstrationData
        ? "Demonstration manufacturing forecast"
        : "Manufacturing forecast snapshot",
    },
    executiveValue: {
      status: analysis.executiveValue.quantified
        ? analysis.executiveValue.narrative.slice(0, 48)
        : "Not yet quantified",
      explanation: analysis.executiveValue.narrative,
      evidenceRequired: [
        "Unit economics",
        "Working capital baseline",
        "Decision impact",
      ],
    },
    talkTrack,
    walkItems,
    focusDomains: [
      { id: "demand", label: "Demand" },
      { id: "factory", label: "Factory" },
      { id: "inventory", label: "Inventory" },
      { id: "capacity", label: "Capacity" },
    ],
    overnight,
    executiveInsight: leadJudgement.slice(0, 180),
    decisionPaper: (() => {
      const portfolio = livePortfolio ?? active.portfolio;
      const liveDecision = decisionPaper.decisionId
        ? portfolio.decisions.find((d) => d.id === decisionPaper.decisionId)
        : undefined;
      const hasAction = decisionPaper.decisionId
        ? decisionHasLinkedAction(portfolio, decisionPaper.decisionId)
        : false;
      const executionStatus = commandCentreStatusFromDecision(
        liveDecision,
        hasAction,
      );
      const executionStatusLabel = commandCentreStatusLabel(executionStatus);
      return {
        readiness: decisionPaper.readiness,
        decisionQuestion: decisionPaper.decisionQuestion,
        href: decisionPaper.href,
        selectionMessage:
          executionStatus === "decision_required"
            ? decisionPaper.selectionMessage
            : executionStatusLabel,
        decisionConfidenceLabel:
          decisionPaper.confidence.decisionConfidenceLabel,
        decisionId: decisionPaper.decisionId,
        executionStatus,
        executionStatusLabel,
        selectedOptionLabel: liveDecision?.selectedAlternativeLabel ?? null,
      };
    })(),
    designPartner: (() => {
      const pilot = getPilotByOrganisation(active.organisationId) ?? null;
      const status = buildDesignPartnerStatus({
        mode: "executive_snapshot",
        pilot,
        activeSnapshot: active,
      });
      const expansion = buildManufacturingExpansionSignals({
        analysis,
        forecastingActive: true,
      });
      const previous = findPreviousSnapshot(
        active,
        typeof window !== "undefined" ? listStoredExecutiveSnapshots() : [],
      );
      const continuity = buildContinuityBundle({
        current: active,
        previous,
        portfolio: livePortfolio ?? active.portfolio,
        leadJudgement,
      });
      return {
        organisationId: active.organisationId,
        environmentLabel: status.label,
        focusLabel: status.focusLabel,
        snapshotLabel: status.snapshotLabel,
        dataHealth: status.dataHealth,
        executiveReadiness: status.executiveReadiness,
        datasetReadiness: status.datasetReadiness,
        pilotDayLabel: status.pilotDayLabel,
        retentionPolicyLabel: status.retentionPolicyLabel,
        isolationDisclosure: continuity.isolationDisclosure,
        expansion,
      };
    })(),
    continuity: (() => {
      const previous = findPreviousSnapshot(
        active,
        typeof window !== "undefined" ? listStoredExecutiveSnapshots() : [],
      );
      const bundle = buildContinuityBundle({
        current: active,
        previous,
        portfolio: livePortfolio ?? active.portfolio,
        leadJudgement,
      });
      return {
        sinceYouLastLooked: bundle.sinceYouLastLooked,
        nothingMaterialChanged: bundle.nothingMaterialChanged,
        judgement: bundle.judgement,
        accountability: bundle.accountability,
      };
    })(),
  };

  if (process.env.NODE_ENV !== "production") {
    const blob = [
      model.leadJudgement,
      model.darkPanel.judgement,
      model.executiveInsight,
      ...model.talkTrack,
      ...model.queue.map((q) => q.title),
    ].join("\n");
    assertNoDemoBusinessContext(blob);
    if (/pipeline exposure|stage-duration|next-step evidence/i.test(blob)) {
      throw new Error(
        "Manufacturing Command Centre leaked commercial instruments.",
      );
    }
    if (
      isGenericFramingTitle(model.leadJudgement) &&
      analysis.insights.some((i) => i.category === "demand_movement")
    ) {
      throw new Error(
        "Manufacturing Command Centre dual-lead: generic framing must not replace specific demand lead.",
      );
    }
  }

  return model;
}
