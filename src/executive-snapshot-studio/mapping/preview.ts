import type { UdgMappingDefinition } from "@/data-gateway";
import { UDG_CANONICAL_FIELD_LABELS } from "@/data-gateway";
import type { StudioMappingPreview } from "../types";

const ENTITY_FIELDS = new Set([
  "dealer",
  "branch",
  "model",
  "variant",
  "region",
  "customer",
  "product",
  "opportunity",
  "owner",
  "organisation",
  "industry",
]);
const MEASURE_FIELDS = new Set([
  "forecastQuantity",
  "quantity",
  "amount",
  "saasValue",
  "maintenanceValue",
  "licenseValue",
  "oneTimeServicesValue",
  "recurringValue",
  "pipelineValue",
  "stageDuration",
]);
const HIERARCHY_HINTS = [
  ["model", "variant"],
  ["branch", "dealer"],
  ["region", "branch"],
  ["customer", "product"],
];

/**
 * Mapping preview for executives — entities, relationships, measures, hierarchy.
 */
export function buildMappingPreview(
  mapping: UdgMappingDefinition,
  confirmed = false,
): StudioMappingPreview {
  const canonical = mapping.fields.map((f) => f.canonicalField);

  const entities = canonical
    .filter((f) => ENTITY_FIELDS.has(f))
    .map((f) => UDG_CANONICAL_FIELD_LABELS[f] ?? f);

  const measures = canonical
    .filter((f) => MEASURE_FIELDS.has(f))
    .map((f) => UDG_CANONICAL_FIELD_LABELS[f] ?? f);

  const commercialLinks = [
    ["opportunity", "owner"],
    ["opportunity", "product"],
    ["opportunity", "stage"],
    ["opportunity", "industry"],
    ["opportunity", "transactionType"],
    ["opportunity", "closeDate"],
  ].filter(
    ([a, b]) => canonical.includes(a!) && canonical.includes(b!),
  );

  const hierarchy = HIERARCHY_HINTS.filter(
    ([parent, child]) => canonical.includes(parent!) && canonical.includes(child!),
  ).map(([parent, child]) => {
    const p = UDG_CANONICAL_FIELD_LABELS[parent!] ?? parent;
    const c = UDG_CANONICAL_FIELD_LABELS[child!] ?? child;
    return `${p} → ${c}`;
  });

  const flatCommercial =
    canonical.includes("opportunity") &&
    !canonical.includes("dealer") &&
    !canonical.includes("branch") &&
    !canonical.includes("region");

  const relationships = [
    ...commercialLinks.map(([a, b]) => {
      const left = UDG_CANONICAL_FIELD_LABELS[a!] ?? a;
      const right = UDG_CANONICAL_FIELD_LABELS[b!] ?? b;
      return `${left} → ${right}`;
    }),
    ...hierarchy,
    ...entities
      .slice(0, 3)
      .map((e) => `${e} informs executive judgement`),
  ];

  return {
    entities: unique(entities),
    relationships: unique(relationships),
    measures: unique(measures.length ? measures : ["Volume / value measures"]),
    hierarchy: unique(
      hierarchy.length
        ? hierarchy
        : flatCommercial
          ? [
              "Flat commercial opportunity dataset detected. Organisational hierarchy is not present in this source.",
            ]
          : ["Flat structure detected"],
    ),
    mapping,
    confirmed,
  };
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
