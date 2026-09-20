/**
 * Business profile detection from uploaded context.
 * Heuristic orchestration — not a new AI engine.
 */

import type { UdgRawRecord } from "@/data-gateway";
import type {
  StudioBusinessProfileId,
  StudioProfileDetection,
} from "../types";

type ProfileRule = {
  id: StudioBusinessProfileId;
  label: string;
  industryLabel: string;
  /** Studio wizard — Profile step question (profile-aware UI copy only). */
  studioProfileQuestion: string;
  /** Studio wizard — Intelligence step question (profile-aware UI copy only). */
  studioIntelligenceQuestion: string;
  keywords: string[];
};

const PROFILE_RULES: ProfileRule[] = [
  {
    id: "commercial",
    label: "Commercial Executive Intelligence",
    industryLabel: "technology",
    studioProfileQuestion: "Confirm Commercial · Executive Intelligence.",
    studioIntelligenceQuestion: "Generate Commercial Executive Intelligence.",
    keywords: [
      "pipeline",
      "opportunity",
      "arr",
      "mrr",
      "account",
      "quota",
      "winrate",
      "revenue",
      "sales",
      "customer",
      "stage",
      "owner",
      "saas",
      "closedate",
      "nextstep",
      "transaction",
      "productfamily",
      "forecast",
      "renewal",
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing Forecast Intelligence",
    industryLabel: "manufacturing",
    studioProfileQuestion: "Confirm Manufacturing · Forecasting.",
    studioIntelligenceQuestion: "Generate Manufacturing Forecast Intelligence.",
    keywords: [
      "dealer",
      "factory",
      "model",
      "variant",
      "branch",
      "production",
      "inventory",
      "plant",
      "sku",
      "bom",
      "zx",
      "forecastqty",
      "forecast_qty",
      "forecastunits",
      "actualunits",
      "actualdemand",
      "orderbank",
      "productioncapacity",
      "availableslots",
      "inventorydays",
      "finishedgoods",
      "forecastversion",
      "region",
      "period",
    ],
  },
  {
    id: "mining",
    label: "Mining Executive Intelligence",
    industryLabel: "mining",
    studioProfileQuestion: "Confirm Mining · Executive Intelligence.",
    studioIntelligenceQuestion: "Generate Mining Executive Intelligence.",
    keywords: [
      "mine",
      "ore",
      "haul",
      "fleet",
      "pit",
      "tonnage",
      "strip",
      "grade",
    ],
  },
  {
    id: "utilities",
    label: "Utilities Executive Intelligence",
    industryLabel: "utilities",
    studioProfileQuestion: "Confirm Utilities · Executive Intelligence.",
    studioIntelligenceQuestion: "Generate Utilities Executive Intelligence.",
    keywords: [
      "grid",
      "outage",
      "feeder",
      "network",
      "meter",
      "load",
      "utility",
    ],
  },
  {
    id: "field_services",
    label: "Field Services Executive Intelligence",
    industryLabel: "field_services",
    studioProfileQuestion: "Confirm Field Services · Executive Intelligence.",
    studioIntelligenceQuestion: "Generate Field Services Executive Intelligence.",
    keywords: [
      "job",
      "technician",
      "workorder",
      "dispatch",
      "sla",
      "site",
      "field",
    ],
  },
  {
    id: "technology",
    label: "Technology Executive Intelligence",
    industryLabel: "technology",
    studioProfileQuestion: "Confirm Technology · Executive Intelligence.",
    studioIntelligenceQuestion: "Generate Technology Executive Intelligence.",
    keywords: [
      "sprint",
      "release",
      "uptime",
      "incident",
      "product",
      "engagement",
      "nrr",
    ],
  },
];

function normaliseToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Detect business profile from headers + sample values.
 */
export function detectBusinessProfile(input: {
  headers: string[];
  records?: UdgRawRecord[];
}): StudioProfileDetection {
  const corpus = [
    ...input.headers,
    ...(input.records ?? [])
      .slice(0, 20)
      .flatMap((r) => Object.values(r.fields).map((v) => String(v ?? ""))),
  ]
    .map(normaliseToken)
    .join(" ");

  const scored = PROFILE_RULES.map((rule) => {
    const hits = rule.keywords.filter((k) => corpus.includes(normaliseToken(k)));
    const score = Math.min(98, Math.round((hits.length / Math.max(3, rule.keywords.length * 0.35)) * 100));
    return { rule, hits, score: hits.length === 0 ? 0 : Math.max(28, score) };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0]!;
  const second = scored[1]?.score ?? 0;
  const confidence =
    best.hits.length === 0
      ? 35
      : Math.min(96, best.score + (best.score - second > 15 ? 8 : 0));

  const selected =
    best.hits.length === 0
      ? PROFILE_RULES.find((r) => r.id === "commercial")!
      : best.rule;

  return {
    profileId: selected.id,
    label: selected.label,
    confidence,
    rationale:
      best.hits.length > 0
        ? [
            `Matched signals: ${best.hits.slice(0, 5).join(", ")}.`,
            "Profile can be overridden before creating the Executive Snapshot.",
          ]
        : [
            "Signals were limited — Commercial Executive Intelligence is suggested as a starting profile.",
            "Override if your organisation operates in another domain.",
          ],
    industryLabel: selected.industryLabel,
    overrideAllowed: true,
  };
}

export function listStudioProfiles(): Array<{
  id: StudioBusinessProfileId;
  label: string;
  industryLabel: string;
}> {
  return PROFILE_RULES.map((r) => ({
    id: r.id,
    label: r.label,
    industryLabel: r.industryLabel,
  }));
}

export function getStudioProfileLabel(id: StudioBusinessProfileId): string {
  return PROFILE_RULES.find((r) => r.id === id)?.label ?? id;
}

export function getStudioIndustryLabel(id: StudioBusinessProfileId): string {
  return PROFILE_RULES.find((r) => r.id === id)?.industryLabel ?? "technology";
}

/** Profile-aware Studio Profile-step question (UI copy only). */
export function getStudioProfileQuestion(
  id: StudioBusinessProfileId,
): string {
  return (
    PROFILE_RULES.find((r) => r.id === id)?.studioProfileQuestion ??
    `Confirm ${getStudioProfileLabel(id)}.`
  );
}

/** Profile-aware Studio Intelligence-step question (UI copy only). */
export function getStudioIntelligenceQuestion(
  id: StudioBusinessProfileId,
): string {
  return (
    PROFILE_RULES.find((r) => r.id === id)?.studioIntelligenceQuestion ??
    `Generate ${getStudioProfileLabel(id)}.`
  );
}
