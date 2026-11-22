/**
 * Presentation projection: ManufacturingAnalysis → Executive Briefing immersion model.
 * Reuses existing judgements / decision paper / map / network projectors — no invented KPIs.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import {
  resolveManufacturingLeadJudgement,
  whyItMattersFromManufacturing,
} from "@/experience/mission-control/manufacturing-evidence-hierarchy";
import { projectManufacturingOperationsMap } from "@/experience/immersion/projectManufacturingMap";
import { projectManufacturingEvidenceNetwork } from "@/experience/immersion/projectManufacturingNetwork";
import { lifecycleLabelFromDecision } from "@/experience/immersion/phase2/phase2PreviewPortfolio";
import type { Decision } from "@/lib/decisions/engine-types";
import type {
  GlobalIntelligenceMapModel,
  ImmersionNetworkModel,
  IntelligenceProvenance,
} from "@/experience/immersion/types";

export type BriefingSignal = {
  id: string;
  kind: "risk" | "opportunity" | "watch" | "signal";
  title: string;
  detail: string;
  provenance: IntelligenceProvenance;
  tone: "attention" | "watching" | "improving" | "intelligence";
};

export type BriefingTimelineEvent = {
  id: string;
  label: string;
  detail: string;
  provenance: IntelligenceProvenance;
};

export type BriefingMetric = {
  id: string;
  label: string;
  value: string;
  caption?: string;
  tone: "attention" | "watching" | "improving" | "intelligence";
};

export type ExecutiveBriefingImmersionModel = {
  title: string;
  kicker: string;
  question: string;
  leadJudgement: string;
  whyItMatters: string;
  demonstrationData: boolean;
  sourceLabel: string;
  metrics: BriefingMetric[];
  priorityDecision: {
    question: string;
    statusLabel: string;
    href: string;
    confidenceLabel: string;
    readiness: string;
    /** True when an executive recording exists on the live Decision. */
    recorded: boolean;
    selectedOptionLabel: string | null;
  } | null;
  signals: BriefingSignal[];
  forecast: Array<{
    period: string;
    forecast: number;
    actual: number;
    variancePct: number | null;
  }>;
  timeline: BriefingTimelineEvent[];
  recommendations: string[];
  map: GlobalIntelligenceMapModel;
  network: ImmersionNetworkModel;
};

export function projectManufacturingExecutiveBriefing(
  analysis: ManufacturingAnalysis,
  options?: {
    liveDecision?: Decision | null;
    /** Override priority decision href (e.g. preview tab deep-link). */
    decisionHref?: string;
  },
): ExecutiveBriefingImmersionModel {
  const brief = undefined;
  const leadJudgement = resolveManufacturingLeadJudgement(analysis, brief);
  const whyItMatters = whyItMattersFromManufacturing(analysis, brief);
  const decisionPaper = buildManufacturingDecisionPaper(analysis, brief);
  const live = options?.liveDecision ?? null;
  const recorded = Boolean(live?.executiveRecording);
  const statusLabel = live
    ? lifecycleLabelFromDecision(live)
    : decisionPaper.readiness;
  const confidenceLabel = recorded
    ? live!.executiveRecording!.decisionConfidence.label
    : decisionPaper.confidence.decisionConfidenceLabel;

  const metrics: BriefingMetric[] = [];
  const topDemand = analysis.insights.find((i) => i.category === "demand_movement");
  if (topDemand) {
    metrics.push({
      id: "demand",
      label: "Demand signal",
      value: topDemand.title.slice(0, 42),
      caption: topDemand.detail.slice(0, 80),
      tone:
        topDemand.posture === "act"
          ? "attention"
          : topDemand.posture === "monitor"
            ? "improving"
            : "watching",
    });
  }
  const hotFactory = [...analysis.capacity].sort(
    (a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0),
  )[0];
  if (hotFactory) {
    metrics.push({
      id: "capacity",
      label: `${hotFactory.factory} load`,
      value:
        hotFactory.loadPct == null ? "Not established" : `${hotFactory.loadPct}%`,
      caption:
        hotFactory.capacity == null
          ? "Capacity not established"
          : `Capacity ${hotFactory.capacity} · demand ${hotFactory.demonstratedDemand}`,
      tone:
        (hotFactory.loadPct ?? 0) >= 95
          ? "attention"
          : (hotFactory.loadPct ?? 0) >= 80
            ? "watching"
            : "intelligence",
    });
  }
  const inv = analysis.inventory.find((i) => i.tone === "attention");
  if (inv) {
    metrics.push({
      id: "inventory",
      label: "Inventory attention",
      value: inv.variant,
      caption:
        inv.inventoryDays == null
          ? "Days not established"
          : `${inv.inventoryDays} inventory days`,
      tone: "attention",
    });
  }
  const latest = analysis.nationalSeries[analysis.nationalSeries.length - 1];
  if (latest) {
    metrics.push({
      id: "national",
      label: `National · ${latest.period}`,
      value:
        latest.variancePct == null
          ? "Variance n/a"
          : `${latest.variancePct > 0 ? "+" : ""}${latest.variancePct}%`,
      caption: `Forecast ${Math.round(latest.forecast)} · Actual ${Math.round(latest.actual)}`,
      tone:
        latest.variancePct != null && Math.abs(latest.variancePct) >= 15
          ? "attention"
          : "intelligence",
    });
  }

  const signals: BriefingSignal[] = analysis.insights.slice(0, 6).map((i) => {
    const kind: BriefingSignal["kind"] =
      i.category === "capacity_implication" || i.posture === "act"
        ? "risk"
        : i.category === "demand_movement" && i.posture === "monitor"
          ? "opportunity"
          : i.category === "inventory_implication"
            ? "watch"
            : "signal";
    return {
      id: i.id,
      kind,
      title: i.title,
      detail: i.detail,
      provenance: "derived",
      tone:
        i.posture === "act"
          ? "attention"
          : i.posture === "monitor"
            ? "improving"
            : "watching",
    };
  });

  const timeline: BriefingTimelineEvent[] = [
    ...analysis.insights.slice(0, 4).map((i) => ({
      id: `tl-${i.id}`,
      label: i.title.slice(0, 72),
      detail: i.detail.slice(0, 120),
      provenance: "derived" as const,
    })),
    ...(analysis.demonstrationData
      ? [
          {
            id: "tl-demo",
            label: "Demonstration fixture active",
            detail:
              "Manufacturing forecast CSV shape — not live customer intelligence.",
            provenance: "derived" as const,
          },
        ]
      : []),
  ];

  const recommendations = [
    ...decisionPaper.options.slice(0, 3).map((o) => o.label),
    ...(decisionPaper.missingEvidence.length > 0
      ? [
          `Evidence still required: ${decisionPaper.missingEvidence
            .slice(0, 2)
            .map((m) => m.label)
            .join("; ")}`,
        ]
      : []),
  ].filter(Boolean);

  return {
    title: "Executive Briefing",
    kicker: "Manufacturing Forecast Intelligence",
    question: "What requires executive judgement today?",
    leadJudgement,
    whyItMatters,
    demonstrationData: analysis.demonstrationData,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration manufacturing forecast"
      : "Manufacturing forecast snapshot",
    metrics,
    priorityDecision: {
      question: decisionPaper.decisionQuestion,
      statusLabel,
      href: options?.decisionHref ?? decisionPaper.href,
      confidenceLabel,
      readiness: decisionPaper.readiness,
      recorded,
      selectedOptionLabel:
        live?.selectedAlternativeLabel ??
        live?.executiveRecording?.rationale.slice(0, 80) ??
        null,
    },
    signals,
    forecast: analysis.nationalSeries.slice(-8).map((p) => ({
      period: p.period,
      forecast: p.forecast,
      actual: p.actual,
      variancePct: p.variancePct,
    })),
    timeline,
    recommendations,
    map: projectManufacturingOperationsMap(analysis),
    network: projectManufacturingEvidenceNetwork(analysis),
  };
}
