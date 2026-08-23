/**
 * Phase 59B — Manufacturing evidence hierarchy (presentation only).
 * Classifies existing analysis signals into semantic roles for Command Centre.
 * Does not alter manufacturing formulas or ranking of demand accelerators.
 */

import type { ExdsSemanticTone } from "@/design-system/executive-experience";
import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { MANUFACTURING_VARIANCE_WINDOW_PERIODS } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { ManufacturingExecutiveBrief } from "@/executive-snapshot-studio/intelligence/manufacturing-brief";

export type ManufacturingEvidenceRole =
  | "PRIMARY_SUPPORT"
  | "COUNTER_SIGNAL"
  | "OPERATIONAL_IMPLICATION"
  | "CONTEXT";

export type ManufacturingEvidenceItem = {
  id: string;
  label: string;
  value: string;
  tone: ExdsSemanticTone;
  role: ManufacturingEvidenceRole;
  roleLabel: string;
  /** Executive-friendly window language for variance metrics. */
  windowLabel?: string;
};

export type ManufacturingNarrativeChain = {
  signal: string;
  demandImplication: string;
  operationalImplication: string;
  judgement: string;
};

const ROLE_ORDER: ManufacturingEvidenceRole[] = [
  "PRIMARY_SUPPORT",
  "COUNTER_SIGNAL",
  "OPERATIONAL_IMPLICATION",
  "CONTEXT",
];

const ROLE_LABEL: Record<ManufacturingEvidenceRole, string> = {
  PRIMARY_SUPPORT: "Supports lead judgement",
  COUNTER_SIGNAL: "Material counter-signal",
  OPERATIONAL_IMPLICATION: "Operational capacity implication",
  CONTEXT: "Context",
};

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

function formatVariance(pct: number): string {
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function windowCaption(): string {
  return `${MANUFACTURING_VARIANCE_WINDOW_PERIODS}-period actual vs forecast`;
}

/**
 * Specific lead signal title (demand / capacity), never the generic framing phrase alone.
 */
export function resolveManufacturingLeadJudgement(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
): string {
  const demand = analysis.insights.find((i) => i.category === "demand_movement");
  const fromBrief = brief?.whatChanged?.[0]?.trim();
  if (fromBrief && !isGenericFramingTitle(fromBrief)) {
    return fromBrief.slice(0, 220);
  }
  if (demand?.title && !isGenericFramingTitle(demand.title)) {
    return demand.title.slice(0, 220);
  }
  if (
    brief?.executiveJudgement?.trim() &&
    !isGenericFramingTitle(brief.executiveJudgement)
  ) {
    return brief.executiveJudgement.slice(0, 220);
  }
  return (
    demand?.title ??
    analysis.insights.find((i) => i.category === "capacity_implication")?.title ??
    "Manufacturing forecast evidence is establishing — material judgement has not yet been framed."
  ).slice(0, 220);
}

export function isGenericFramingTitle(text: string): boolean {
  return /manufacturing forecast requires executive judgement/i.test(text);
}

/**
 * Lead model name derived from ranked demand acceleration / decline insights.
 */
export function resolveLeadModel(
  analysis: ManufacturingAnalysis,
  leadJudgement: string,
): string | null {
  const accel = analysis.insights.find((i) => i.id === "demand-acceleration");
  if (accel) {
    const fromTitle = accel.title.match(/^(Model\s+\S+)/i);
    if (fromTitle) return fromTitle[1]!;
  }
  const fromLead = leadJudgement.match(/\b(Model\s+\S+)/i);
  if (fromLead) return fromLead[1]!;
  const decline = analysis.insights.find((i) => i.id === "demand-decline");
  if (decline) {
    const m = decline.title.match(/^(Model\s+\S+)/i);
    if (m) return m[1]!;
  }
  return null;
}

/**
 * Confidence for THIS judgement — model-scoped slice preferred; never national alone.
 */
export function resolveJudgementConfidence(
  analysis: ManufacturingAnalysis,
  leadJudgement: string,
): number {
  const leadModel = resolveLeadModel(analysis, leadJudgement);
  if (leadModel) {
    const slice = analysis.confidenceSlices.find(
      (s) =>
        s.id === `model-${leadModel}` ||
        s.scope.toLowerCase() === leadModel.toLowerCase() ||
        s.scope.toLowerCase().includes(leadModel.toLowerCase()),
    );
    if (slice?.score != null) return slice.score;
  }

  const demandInsight =
    analysis.insights.find(
      (i) =>
        i.category === "demand_movement" &&
        (i.title === leadJudgement ||
          leadJudgement.includes(i.title.slice(0, 24))),
    ) ?? analysis.insights.find((i) => i.category === "demand_movement");

  if (demandInsight) return demandInsight.confidence;

  const capacity = analysis.insights.find(
    (i) => i.category === "capacity_implication",
  );
  return capacity?.confidence ?? 55;
}

/**
 * Build ordered evidence with semantic roles from existing analysis.
 */
export function buildManufacturingEvidenceHierarchy(
  analysis: ManufacturingAnalysis,
  leadJudgement: string,
  limit = 4,
): ManufacturingEvidenceItem[] {
  const leadModel = resolveLeadModel(analysis, leadJudgement);
  const items: ManufacturingEvidenceItem[] = [];
  const used = new Set<string>();

  const accelerators = analysis.heatMap
    .filter((c) => c.variancePct != null && c.variancePct >= 10)
    .sort((a, b) => (b.variancePct ?? 0) - (a.variancePct ?? 0));

  const primaryPool = leadModel
    ? accelerators.filter((c) => c.model === leadModel)
    : accelerators;

  for (const cell of primaryPool.slice(0, 2)) {
    used.add(cell.id);
    items.push({
      id: cell.id,
      label: `${cell.region} · ${cell.model}`,
      value: formatVariance(cell.variancePct!),
      tone: mapHeatTone(cell.tone),
      role: "PRIMARY_SUPPORT",
      roleLabel: ROLE_LABEL.PRIMARY_SUPPORT,
      windowLabel: windowCaption(),
    });
  }

  const decliners = analysis.heatMap
    .filter((c) => c.variancePct != null && c.variancePct <= -10)
    .sort((a, b) => (a.variancePct ?? 0) - (b.variancePct ?? 0));

  for (const cell of decliners) {
    if (used.has(cell.id)) continue;
    if (leadModel && cell.model === leadModel) continue;
    used.add(cell.id);
    items.push({
      id: cell.id,
      label: `${cell.region} · ${cell.model}`,
      value: formatVariance(cell.variancePct!),
      tone: mapHeatTone(cell.tone),
      role: "COUNTER_SIGNAL",
      roleLabel: ROLE_LABEL.COUNTER_SIGNAL,
      windowLabel: windowCaption(),
    });
    break;
  }

  const plants = [...analysis.capacity]
    .filter((c) => c.loadPct != null && c.loadPct >= 95)
    .sort((a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0));

  for (const plant of plants.slice(0, 1)) {
    const id = `cap-${plant.factory}`;
    if (used.has(id)) continue;
    used.add(id);
    const multiple = (plant.loadPct! / 100).toFixed(2);
    items.push({
      id,
      label: plant.factory,
      value: `${plant.loadPct}%`,
      tone: mapHeatTone(plant.tone),
      role: "OPERATIONAL_IMPLICATION",
      roleLabel: ROLE_LABEL.OPERATIONAL_IMPLICATION,
      windowLabel:
        plant.capacity != null
          ? `of plant capacity · ${plant.demonstratedDemand} units demand vs ${plant.capacity} capacity (${multiple}×)`
          : "of plant capacity",
    });
  }

  const inventory = analysis.inventory.find((i) => i.tone === "attention");
  if (inventory && items.length < limit) {
    const id = `inv-${inventory.variant}`;
    if (!used.has(id)) {
      used.add(id);
      items.push({
        id,
        label: inventory.variant,
        value:
          inventory.inventoryDays != null
            ? `${inventory.inventoryDays}d`
            : "Elevated",
        tone: "attention",
        role: "CONTEXT",
        roleLabel: ROLE_LABEL.CONTEXT,
        windowLabel: inventory.model,
      });
    }
  }

  if (items.length < limit) {
    const contextMovers = [...analysis.heatMap]
      .filter(
        (c) =>
          c.variancePct != null &&
          Math.abs(c.variancePct) >= 8 &&
          !used.has(c.id),
      )
      .sort(
        (a, b) => Math.abs(b.variancePct ?? 0) - Math.abs(a.variancePct ?? 0),
      );
    for (const cell of contextMovers) {
      if (items.length >= limit) break;
      used.add(cell.id);
      items.push({
        id: cell.id,
        label: `${cell.region} · ${cell.model}`,
        value: formatVariance(cell.variancePct!),
        tone: mapHeatTone(cell.tone),
        role: "CONTEXT",
        roleLabel: ROLE_LABEL.CONTEXT,
        windowLabel: windowCaption(),
      });
    }
  }

  return items
    .sort(
      (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
    )
    .slice(0, limit);
}

/**
 * Causal chain only from existing insights — no invented relationships.
 */
export function buildManufacturingNarrativeChain(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
  leadJudgement: string,
): ManufacturingNarrativeChain | null {
  const demand =
    analysis.insights.find((i) => i.id === "demand-acceleration") ??
    analysis.insights.find((i) => i.category === "demand_movement");
  const capacity = analysis.insights.find(
    (i) => i.category === "capacity_implication",
  );
  const framing = analysis.insights.find(
    (i) => i.category === "executive_judgement",
  );

  if (!demand && !capacity) return null;

  const topSupport = buildManufacturingEvidenceHierarchy(
    analysis,
    leadJudgement,
    1,
  )[0];

  return {
    signal: topSupport
      ? `${topSupport.label} ${topSupport.value}`
      : (demand?.detail ?? leadJudgement),
    demandImplication: demand
      ? /above plan/i.test(demand.title)
        ? "Demand is above plan"
        : /softening/i.test(demand.title)
          ? "Demand is softening vs plan"
          : (demand.implication ?? demand.title)
      : "Demand movement requires ranking",
    operationalImplication: capacity
      ? /under pressure|capacity/i.test(capacity.title)
        ? "Capacity becomes constrained"
        : (capacity.implication ?? capacity.title)
      : "Operational capacity implication is establishing",
    judgement:
      brief?.whatRequiresJudgement?.[0] ??
      framing?.implication ??
      demand?.implication ??
      leadJudgement,
  };
}

export function whyItMattersFromManufacturing(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
): string {
  const framing = analysis.insights.find(
    (i) => i.category === "executive_judgement",
  );
  return (
    brief?.whatRequiresJudgement?.[0] ??
    brief?.whyItMatters ??
    framing?.implication ??
    analysis.insights.find((i) => i.category === "capacity_implication")
      ?.implication ??
    "Forecast movement without ranked judgement creates capacity and inventory exposure."
  ).slice(0, 280);
}
