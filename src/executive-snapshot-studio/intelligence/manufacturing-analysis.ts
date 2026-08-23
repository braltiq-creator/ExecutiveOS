/**
 * Manufacturing Forecasting Intelligence — evidence from UDG records only.
 * Executive judgement layer above MRP/ERP/APS — never invents unavailable fields.
 */

import type { UdgCanonicalRecord, UdgFieldValue } from "@/data-gateway";

/** Region×Model variance / inventory averaging window (periods). Explicit, not silent. */
export const MANUFACTURING_VARIANCE_WINDOW_PERIODS = 6;

export type InsightPosture =
  | "monitor"
  | "investigate"
  | "insufficient_evidence"
  | "act";

export type ManufacturingInsightCategory =
  | "demand_movement"
  | "forecast_accuracy"
  | "regional_divergence"
  | "model_movement"
  | "capacity_implication"
  | "inventory_implication"
  | "forecast_confidence"
  | "data_quality"
  | "executive_judgement";

export type ManufacturingInsight = {
  id: string;
  category: ManufacturingInsightCategory;
  title: string;
  detail: string;
  implication?: string;
  confidence: number;
  posture: InsightPosture;
  evidence: string[];
  evidenceCoverage: number;
};

export type FieldCoverage = {
  field: string;
  present: number;
  total: number;
  rate: number;
};

export type ForecastPeriodPoint = {
  period: string;
  forecast: number;
  actual: number;
  variance: number;
  variancePct: number | null;
};

export type HeatCell = {
  id: string;
  region: string;
  model: string;
  variancePct: number | null;
  forecast: number;
  actual: number;
  tone: "attention" | "watching" | "improving" | "intelligence" | "historical";
  movement: "up" | "down" | "flat";
  label: string;
};

export type ConfidenceSlice = {
  id: string;
  scope: string;
  level: "high" | "medium" | "low" | "insufficient";
  score: number | null;
  why: string[];
};

export type CapacitySignal = {
  factory: string;
  capacity: number | null;
  demonstratedDemand: number;
  loadPct: number | null;
  availableSlots: number | null;
  tone: "attention" | "watching" | "improving" | "intelligence" | "historical";
};

export type InventorySignal = {
  variant: string;
  model: string;
  inventoryDays: number | null;
  finishedGoods: number | null;
  tone: "attention" | "watching" | "improving" | "intelligence" | "historical";
};

export type ManufacturingExecutiveValue = {
  quantified: boolean;
  narrative: string;
  revenueProtected: number | null;
  workingCapitalReleased: number | null;
  capacityUtilisation: number | null;
};

export type ManufacturingAnalysis = {
  module: "manufacturing_forecasting";
  /** True when source marks demonstration (e.g. Forecast Version contains DEMO). */
  demonstrationData: boolean;
  recordCount: number;
  periods: string[];
  regions: string[];
  models: string[];
  variants: string[];
  factories: string[];
  dealers: string[];
  fieldCoverage: FieldCoverage[];
  nationalSeries: ForecastPeriodPoint[];
  heatMap: HeatCell[];
  confidenceSlices: ConfidenceSlice[];
  capacity: CapacitySignal[];
  inventory: InventorySignal[];
  insights: ManufacturingInsight[];
  missingInformation: string[];
  unsupportedConclusions: string[];
  executiveValue: ManufacturingExecutiveValue;
  asOf: string;
};

function num(value: UdgFieldValue | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(value: UdgFieldValue | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function coverageFor(
  records: UdgCanonicalRecord[],
  field: string,
): FieldCoverage {
  let present = 0;
  for (const record of records) {
    const v = record.fields[field];
    if (v !== null && v !== undefined && str(v) !== "") present += 1;
  }
  const total = records.length;
  return {
    field,
    present,
    total,
    rate: total === 0 ? 0 : Math.round((present / total) * 100),
  };
}

function variancePct(forecast: number, actual: number): number | null {
  if (forecast <= 0) return null;
  return Math.round(((actual - forecast) / forecast) * 1000) / 10;
}

function toneFromVariance(
  pct: number | null,
): HeatCell["tone"] {
  if (pct === null) return "historical";
  const abs = Math.abs(pct);
  if (abs >= 15) return pct > 0 ? "attention" : "watching";
  if (abs >= 8) return "watching";
  if (pct > 2) return "improving";
  if (pct < -2) return "watching";
  return "intelligence";
}

function movementFromVariance(pct: number | null): HeatCell["movement"] {
  if (pct === null || Math.abs(pct) < 3) return "flat";
  return pct > 0 ? "up" : "down";
}

function confidenceLevel(
  score: number | null,
): ConfidenceSlice["level"] {
  if (score === null) return "insufficient";
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

/**
 * Analyse manufacturing forecasting records from an Executive Snapshot.
 */
export function analyseManufacturingSnapshot(
  records: UdgCanonicalRecord[],
  asOf = new Date().toISOString(),
): ManufacturingAnalysis {
  const fieldCoverage = [
    "period",
    "region",
    "dealer",
    "model",
    "variant",
    "factory",
    "forecastQuantity",
    "actualQuantity",
    "orderBankQuantity",
    "productionCapacity",
    "availableSlots",
    "finishedGoods",
    "inventoryDays",
    "forecastVersion",
  ].map((f) => coverageFor(records, f));

  const missingInformation: string[] = [];
  for (const cov of fieldCoverage) {
    if (cov.rate === 0) {
      missingInformation.push(`${cov.field} not available`);
    } else if (cov.rate < 40) {
      missingInformation.push(`${cov.field} coverage thin (${cov.rate}%)`);
    }
  }

  const periods = uniqueSorted(records.map((r) => str(r.fields.period) || str(r.fields.asOfDate)));
  const regions = uniqueSorted(records.map((r) => str(r.fields.region)));
  const models = uniqueSorted(records.map((r) => str(r.fields.model)));
  const variants = uniqueSorted(records.map((r) => str(r.fields.variant)));
  const factories = uniqueSorted(records.map((r) => str(r.fields.factory)));
  const dealers = uniqueSorted(records.map((r) => str(r.fields.dealer)));

  const hasActual = (fieldCoverage.find((f) => f.field === "actualQuantity")?.rate ?? 0) > 0;
  const hasForecast = (fieldCoverage.find((f) => f.field === "forecastQuantity")?.rate ?? 0) > 0;

  // National series by period
  const periodMap = new Map<string, { forecast: number; actual: number }>();
  for (const r of records) {
    const period = str(r.fields.period) || str(r.fields.asOfDate) || "unknown";
    const entry = periodMap.get(period) ?? { forecast: 0, actual: 0 };
    entry.forecast += num(r.fields.forecastQuantity) ?? 0;
    entry.actual += num(r.fields.actualQuantity) ?? 0;
    periodMap.set(period, entry);
  }
  const nationalSeries: ForecastPeriodPoint[] = [...periodMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, v]) => {
      const vp = hasActual ? variancePct(v.forecast, v.actual) : null;
      return {
        period,
        forecast: Math.round(v.forecast),
        actual: Math.round(v.actual),
        variance: Math.round(v.actual - v.forecast),
        variancePct: vp,
      };
    });

  // Region × Model heat map (latest half of periods for recency)
  const recentPeriods = nationalSeries
    .slice(-MANUFACTURING_VARIANCE_WINDOW_PERIODS)
    .map((p) => p.period);
  const recentSet = new Set(recentPeriods.length > 0 ? recentPeriods : periods);
  const heatAgg = new Map<string, { forecast: number; actual: number; region: string; model: string }>();
  for (const r of records) {
    const period = str(r.fields.period) || str(r.fields.asOfDate);
    if (recentSet.size > 0 && period && !recentSet.has(period)) continue;
    const region = str(r.fields.region) || "(unspecified)";
    const model = str(r.fields.model) || "(unspecified)";
    const key = `${region}||${model}`;
    const entry = heatAgg.get(key) ?? { forecast: 0, actual: 0, region, model };
    entry.forecast += num(r.fields.forecastQuantity) ?? 0;
    entry.actual += num(r.fields.actualQuantity) ?? 0;
    heatAgg.set(key, entry);
  }
  const heatMap: HeatCell[] = [...heatAgg.values()].map((v) => {
    const vp = hasActual && hasForecast ? variancePct(v.forecast, v.actual) : null;
    const tone = toneFromVariance(vp);
    const movement = movementFromVariance(vp);
    return {
      id: `heat-${v.region}-${v.model}`,
      region: v.region,
      model: v.model,
      variancePct: vp,
      forecast: Math.round(v.forecast),
      actual: Math.round(v.actual),
      tone,
      movement,
      label:
        vp === null
          ? `${v.region} · ${v.model}`
          : `${v.region} · ${v.model} ${vp > 0 ? "+" : ""}${vp}%`,
    };
  });

  // Capacity by factory (latest period demand vs capacity)
  const latestPeriod = nationalSeries[nationalSeries.length - 1]?.period;
  const capacityAgg = new Map<
    string,
    { demand: number; capacity: number | null; slots: number | null }
  >();
  for (const r of records) {
    const period = str(r.fields.period) || str(r.fields.asOfDate);
    if (latestPeriod && period !== latestPeriod) continue;
    const factory = str(r.fields.factory) || "(unspecified)";
    const entry = capacityAgg.get(factory) ?? {
      demand: 0,
      capacity: null,
      slots: null,
    };
    entry.demand +=
      num(r.fields.actualQuantity) ??
      num(r.fields.forecastQuantity) ??
      0;
    const cap = num(r.fields.productionCapacity);
    if (cap != null) entry.capacity = Math.max(entry.capacity ?? 0, cap);
    const slots = num(r.fields.availableSlots);
    if (slots != null) {
      entry.slots =
        entry.slots == null ? slots : Math.min(entry.slots, slots);
    }
    capacityAgg.set(factory, entry);
  }
  const capacity: CapacitySignal[] = [...capacityAgg.entries()].map(
    ([factory, v]) => {
      const loadPct =
        v.capacity != null && v.capacity > 0
          ? Math.round((v.demand / v.capacity) * 1000) / 10
          : null;
      const tone: CapacitySignal["tone"] =
        loadPct == null
          ? "historical"
          : loadPct >= 100
            ? "attention"
            : loadPct >= 85
              ? "watching"
              : "improving";
      return {
        factory,
        capacity: v.capacity,
        demonstratedDemand: Math.round(v.demand),
        loadPct,
        availableSlots: v.slots,
        tone,
      };
    },
  );

  // Inventory by variant (avg inventory days in recent window)
  const invAgg = new Map<
    string,
    { model: string; days: number[]; fg: number[] }
  >();
  for (const r of records) {
    const period = str(r.fields.period) || str(r.fields.asOfDate);
    if (recentSet.size > 0 && period && !recentSet.has(period)) continue;
    const variant = str(r.fields.variant);
    if (!variant) continue;
    const entry = invAgg.get(variant) ?? {
      model: str(r.fields.model),
      days: [],
      fg: [],
    };
    const days = num(r.fields.inventoryDays);
    const fg = num(r.fields.finishedGoods);
    if (days != null) entry.days.push(days);
    if (fg != null) entry.fg.push(fg);
    invAgg.set(variant, entry);
  }
  const inventory: InventorySignal[] = [...invAgg.entries()].map(
    ([variant, v]) => {
      const avgDays =
        v.days.length > 0
          ? Math.round(v.days.reduce((a, b) => a + b, 0) / v.days.length)
          : null;
      const avgFg =
        v.fg.length > 0
          ? Math.round(v.fg.reduce((a, b) => a + b, 0) / v.fg.length)
          : null;
      const tone: InventorySignal["tone"] =
        avgDays == null
          ? "historical"
          : avgDays >= 50
            ? "attention"
            : avgDays >= 35
              ? "watching"
              : "improving";
      return {
        variant,
        model: v.model,
        inventoryDays: avgDays,
        finishedGoods: avgFg,
        tone,
      };
    },
  );

  // Confidence slices
  const absErrors = nationalSeries
    .map((p) => p.variancePct)
    .filter((v): v is number => v != null)
    .map((v) => Math.abs(v));
  const meanAbsError =
    absErrors.length > 0
      ? absErrors.reduce((a, b) => a + b, 0) / absErrors.length
      : null;
  const nationalScore =
    meanAbsError == null
      ? null
      : Math.round(clamp(100 - meanAbsError * 2.2));

  const confidenceSlices: ConfidenceSlice[] = [
    {
      id: "national",
      scope: "National",
      level: confidenceLevel(nationalScore),
      score: nationalScore,
      why:
        meanAbsError == null
          ? ["Insufficient evidence — actual vs forecast not established"]
          : [
              `Mean absolute forecast error ≈ ${meanAbsError.toFixed(1)}%`,
              `${nationalSeries.length} periods in view`,
            ],
    },
  ];

  for (const region of regions.slice(0, 5)) {
    const cells = heatMap.filter((c) => c.region === region);
    const errs = cells
      .map((c) => c.variancePct)
      .filter((v): v is number => v != null)
      .map((v) => Math.abs(v));
    const mae =
      errs.length > 0 ? errs.reduce((a, b) => a + b, 0) / errs.length : null;
    const score = mae == null ? null : Math.round(clamp(100 - mae * 2.4));
    confidenceSlices.push({
      id: `region-${region}`,
      scope: `Region ${region}`,
      level: confidenceLevel(score),
      score,
      why:
        mae == null
          ? ["Insufficient regional actual evidence"]
          : [`Regional MAE ≈ ${mae.toFixed(1)}%`],
    });
  }

  for (const model of models.slice(0, 4)) {
    const cells = heatMap.filter((c) => c.model === model);
    const errs = cells
      .map((c) => c.variancePct)
      .filter((v): v is number => v != null)
      .map((v) => Math.abs(v));
    const mae =
      errs.length > 0 ? errs.reduce((a, b) => a + b, 0) / errs.length : null;
    const score = mae == null ? null : Math.round(clamp(100 - mae * 2.4));
    confidenceSlices.push({
      id: `model-${model}`,
      scope: model,
      level: confidenceLevel(score),
      score,
      why:
        mae == null
          ? ["Insufficient model actual evidence"]
          : [`Model MAE ≈ ${mae.toFixed(1)}%`],
    });
  }

  for (const inv of inventory.filter((i) => i.tone === "attention").slice(0, 2)) {
    confidenceSlices.push({
      id: `variant-${inv.variant}`,
      scope: `Variant ${inv.variant}`,
      level: "low",
      score: 42,
      why: [
        inv.inventoryDays != null
          ? `Inventory days ≈ ${inv.inventoryDays}`
          : "Inventory days not established",
        "Variant volatility / ageing pressure",
      ],
    });
  }

  const insights = buildInsights({
    heatMap,
    capacity,
    inventory,
    nationalSeries,
    hasActual,
    hasForecast,
    fieldCoverage,
  });

  const unsupportedConclusions = [
    "Financial value-at-risk not established from this dataset",
  ];
  const demonstrationData = records.some((r) =>
    /demo/i.test(str(r.fields.forecastVersion)),
  );
  if (demonstrationData) {
    unsupportedConclusions.push(
      "Do not treat demonstration patterns as customer confidential evidence",
    );
  }
  if (!hasActual) {
    unsupportedConclusions.push(
      "Forecast accuracy cannot be concluded without actual demand",
    );
  }

  const peakLoad = capacity
    .map((c) => c.loadPct)
    .filter((v): v is number => v != null)
    .sort((a, b) => b - a)[0];

  return {
    module: "manufacturing_forecasting",
    demonstrationData,
    recordCount: records.length,
    periods,
    regions,
    models,
    variants,
    factories,
    dealers,
    fieldCoverage,
    nationalSeries,
    heatMap,
    confidenceSlices,
    capacity,
    inventory,
    insights,
    missingInformation,
    unsupportedConclusions,
    executiveValue: {
      quantified: false,
      narrative: "Not yet quantified — units and capacity evidence only",
      revenueProtected: null,
      workingCapitalReleased: null,
      capacityUtilisation: peakLoad ?? null,
    },
    asOf,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function buildInsights(input: {
  heatMap: HeatCell[];
  capacity: CapacitySignal[];
  inventory: InventorySignal[];
  nationalSeries: ForecastPeriodPoint[];
  hasActual: boolean;
  hasForecast: boolean;
  fieldCoverage: FieldCoverage[];
}): ManufacturingInsight[] {
  const insights: ManufacturingInsight[] = [];

  if (!input.hasForecast) {
    insights.push({
      id: "dq-forecast-missing",
      category: "data_quality",
      title: "Forecast units not established",
      detail: "Source does not carry forecast quantity evidence.",
      confidence: 90,
      posture: "insufficient_evidence",
      evidence: ["forecastQuantity coverage 0%"],
      evidenceCoverage: 0,
    });
    return insights;
  }

  if (!input.hasActual) {
    insights.push({
      id: "dq-actual-missing",
      category: "data_quality",
      title: "Actual demand not established",
      detail: "Forecast confidence and accuracy cannot be judged without actuals.",
      confidence: 88,
      posture: "insufficient_evidence",
      evidence: ["actualQuantity coverage 0%"],
      evidenceCoverage: 0,
    });
  }

  const accelerators = input.heatMap
    .filter((c) => c.variancePct != null && c.variancePct >= 10)
    .sort((a, b) => (b.variancePct ?? 0) - (a.variancePct ?? 0));
  if (accelerators.length > 0) {
    const top = accelerators.slice(0, 3);
    insights.push({
      id: "demand-acceleration",
      category: "demand_movement",
      title: `${top[0]!.model} demand has moved above plan`,
      detail: top
        .map((c) => `${c.region} ${c.variancePct! >= 0 ? "+" : ""}${c.variancePct}%`)
        .join("; "),
      implication:
        "Regional uplift may challenge capacity and allocation priorities.",
      confidence: 82,
      posture: "investigate",
      evidence: top.map((c) => c.label),
      evidenceCoverage: 85,
    });
  }

  const decliners = input.heatMap
    .filter((c) => c.variancePct != null && c.variancePct <= -10)
    .sort((a, b) => (a.variancePct ?? 0) - (b.variancePct ?? 0));
  if (decliners.length > 0) {
    const top = decliners[0]!;
    insights.push({
      id: "demand-decline",
      category: "demand_movement",
      title: `${top.model} demand is softening in ${top.region}`,
      detail: `${top.region} actual vs forecast ${top.variancePct}%`,
      implication: "Softening may free capacity or create inventory exposure.",
      confidence: 78,
      posture: "investigate",
      evidence: [top.label],
      evidenceCoverage: 80,
    });
  }

  const constrained = input.capacity.filter(
    (c) => c.loadPct != null && c.loadPct >= 95,
  );
  for (const c of constrained.slice(0, 2)) {
    insights.push({
      id: `capacity-${c.factory}`,
      category: "capacity_implication",
      title: `${c.factory} capacity under pressure`,
      detail:
        c.capacity != null && c.loadPct != null
          ? `Demonstrated load ${c.loadPct}% of plant capacity (${c.demonstratedDemand} units demand vs ${c.capacity} capacity · ${(c.loadPct / 100).toFixed(2)}×)${
              c.availableSlots != null
                ? ` · available slots ${c.availableSlots}`
                : ""
            }`
          : `Demonstrated load ${c.loadPct}%${
              c.availableSlots != null
                ? ` · available slots ${c.availableSlots}`
                : ""
            }`,
      implication:
        "Protecting accelerating demand may require reallocation or accepting deferral risk.",
      confidence: 80,
      posture: c.loadPct != null && c.loadPct >= 105 ? "act" : "investigate",
      evidence: [
        `${c.factory} Σ line actuals ${c.demonstratedDemand} units`,
        c.capacity != null
          ? `plant capacity ${c.capacity} units (denominator)`
          : "capacity not established",
      ],
      evidenceCoverage: c.capacity != null ? 88 : 40,
    });
  }

  const ageing = input.inventory.filter((i) => i.tone === "attention");
  for (const inv of ageing.slice(0, 2)) {
    insights.push({
      id: `inventory-${inv.variant}`,
      category: "inventory_implication",
      title: `${inv.variant} inventory above comfortable policy band`,
      detail: `Inventory days ≈ ${inv.inventoryDays ?? "not established"}`,
      implication: "Ageing stock creates capital and service-risk exposure.",
      confidence: inv.inventoryDays != null ? 76 : 40,
      posture: inv.inventoryDays != null ? "investigate" : "insufficient_evidence",
      evidence: [
        inv.inventoryDays != null
          ? `${inv.variant} ${inv.inventoryDays} inventory days`
          : "Inventory days not available",
      ],
      evidenceCoverage: inv.inventoryDays != null ? 75 : 20,
    });
  }

  const last = input.nationalSeries[input.nationalSeries.length - 1];
  if (last?.variancePct != null && Math.abs(last.variancePct) >= 8) {
    insights.push({
      id: "forecast-accuracy-national",
      category: "forecast_accuracy",
      title: "National actual demand diverging from forecast",
      detail: `${last.period}: variance ${last.variancePct}% (forecast ${last.forecast}, actual ${last.actual})`,
      implication: "Forecast credibility requires executive review before binding.",
      confidence: 84,
      posture: "investigate",
      evidence: [
        `${last.period} forecast ${last.forecast}`,
        `${last.period} actual ${last.actual}`,
      ],
      evidenceCoverage: 90,
    });
  }

  if (accelerators.length > 0 || constrained.length > 0) {
    const lead = accelerators[0];
    insights.push({
      id: "exec-judgement-forecast",
      category: "executive_judgement",
      title: "Manufacturing forecast requires executive judgement",
      detail: lead
        ? `${lead.model} uplift is material in ${lead.region}; capacity and inventory implications need ranking.`
        : "Capacity and demand signals require ranking before bind.",
      implication: lead
        ? `Whether to protect strategic ${lead.model} demand by reallocating capacity or accepting deferral risk elsewhere.`
        : "Whether to adjust allocation before the next planning freeze.",
      confidence: 80,
      posture: "investigate",
      evidence: insights.slice(0, 3).flatMap((i) => i.evidence).slice(0, 4),
      evidenceCoverage: 82,
    });
  }

  return insights;
}

export function fieldCoverageRatesFromManufacturingAnalysis(
  analysis: ManufacturingAnalysis,
): Record<string, number> {
  const rates: Record<string, number> = {};
  for (const f of analysis.fieldCoverage) {
    rates[f.field] = f.rate;
  }
  return rates;
}
