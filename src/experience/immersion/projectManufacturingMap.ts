/**
 * Presentation projection: ManufacturingAnalysis → interactive operations map model.
 * No invented coordinates; region centroids are presentation reference data only.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import {
  REGION_RESOLVED_HONESTY,
  centroidForRegion,
  offsetAroundCentroid,
  resolveAuRegionCode,
} from "@/experience/immersion/geo/au-regions";
import type {
  ImmersionMapMarker,
  ImmersionRegionIntensity,
  ManufacturingOperationsMapModel,
} from "@/experience/immersion/types";

export function projectManufacturingOperationsMap(
  analysis: ManufacturingAnalysis,
): ManufacturingOperationsMapModel {
  const regionAgg = new Map<
    string,
    { forecast: number; actual: number; absVar: number; signed: number | null }
  >();

  for (const cell of analysis.heatMap) {
    const code = resolveAuRegionCode(cell.region) ?? cell.region;
    const entry = regionAgg.get(code) ?? {
      forecast: 0,
      actual: 0,
      absVar: 0,
      signed: null,
    };
    entry.forecast += cell.forecast;
    entry.actual += cell.actual;
    if (cell.variancePct != null) {
      entry.absVar = Math.max(entry.absVar, Math.abs(cell.variancePct));
      entry.signed = cell.variancePct;
    }
    regionAgg.set(code, entry);
  }

  const maxAbs = Math.max(1, ...[...regionAgg.values()].map((v) => v.absVar));

  const regions: ImmersionRegionIntensity[] = [...regionAgg.entries()].map(
    ([regionCode, v]) => {
      const variancePct =
        v.forecast > 0
          ? Math.round(((v.actual - v.forecast) / v.forecast) * 1000) / 10
          : v.signed;
      return {
        regionCode,
        intensity: Math.round((v.absVar / maxAbs) * 100),
        variancePct,
        forecast: v.forecast,
        actual: v.actual,
        provenance: "derived" as const,
        label:
          variancePct == null
            ? `${regionCode} · insufficient variance`
            : `${regionCode} · ${variancePct > 0 ? "+" : ""}${variancePct}%`,
      };
    },
  );

  const markers: ImmersionMapMarker[] = [];
  const unplaced: ManufacturingOperationsMapModel["unplaced"] = [];
  const factoryIndex = new Map<string, number>();
  const dealerIndex = new Map<string, number>();

  for (const region of regions) {
    const centroid = centroidForRegion(region.regionCode);
    if (!centroid) {
      unplaced.push({
        id: `region-${region.regionCode}`,
        kind: "region",
        label: region.regionCode,
        reason: "Region code not in AU reference table",
      });
      continue;
    }
    markers.push({
      id: `region-${region.regionCode}`,
      kind: "region",
      label: region.regionCode,
      longitude: centroid.longitude,
      latitude: centroid.latitude,
      geoResolution: "region_resolved",
      provenance: "derived",
      regionCode: region.regionCode,
      tone:
        region.intensity >= 70
          ? "attention"
          : region.intensity >= 40
            ? "watching"
            : "intelligence",
      detail: region.label,
      metrics: [
        { label: "Forecast", value: String(Math.round(region.forecast)) },
        { label: "Actual", value: String(Math.round(region.actual)) },
        {
          label: "Variance",
          value:
            region.variancePct == null
              ? "Not established"
              : `${region.variancePct > 0 ? "+" : ""}${region.variancePct}%`,
        },
      ],
    });
  }

  const capacityByFactory = new Map(
    analysis.capacity.map((c) => [c.factory, c]),
  );
  const inventoryAttention = analysis.inventory.filter(
    (i) => i.tone === "attention",
  ).length;

  for (const binding of analysis.locationBindings ?? []) {
    const centroid = centroidForRegion(binding.region);
    if (!centroid) {
      unplaced.push({
        id: `${binding.kind}-${binding.entity}`,
        kind: binding.kind,
        label: binding.entity,
        reason: `Co-occurs with region "${binding.region}" — not in AU reference table`,
      });
      continue;
    }

    const idxMap = binding.kind === "factory" ? factoryIndex : dealerIndex;
    const idx = idxMap.get(binding.region) ?? 0;
    idxMap.set(binding.region, idx + 1);
    const pos = offsetAroundCentroid(centroid, idx, binding.kind);

    const cap = capacityByFactory.get(binding.entity);
    markers.push({
      id: `${binding.kind}-${binding.entity}`,
      kind: binding.kind,
      label: binding.entity,
      longitude: pos.longitude,
      latitude: pos.latitude,
      geoResolution: "region_resolved",
      provenance: "derived",
      regionCode: resolveAuRegionCode(binding.region) ?? binding.region,
      tone: cap?.tone ?? "intelligence",
      detail: `${binding.kind} · ${binding.region} (${binding.coOccurrenceCount} co-occurring rows)`,
      metrics:
        binding.kind === "factory" && cap
          ? [
              {
                label: "Load",
                value:
                  cap.loadPct == null ? "Not established" : `${cap.loadPct}%`,
              },
              {
                label: "Demand",
                value: String(cap.demonstratedDemand),
              },
              {
                label: "Capacity",
                value:
                  cap.capacity == null ? "Not established" : String(cap.capacity),
              },
              {
                label: "Available slots",
                value:
                  cap.availableSlots == null
                    ? "Not established"
                    : String(cap.availableSlots),
              },
              {
                label: "Inventory attention",
                value:
                  inventoryAttention > 0
                    ? `${inventoryAttention} variants (dataset)`
                    : "None flagged",
              },
            ]
          : [
              {
                label: "Evidence rows",
                value: String(binding.coOccurrenceCount),
              },
              {
                label: "Primary region",
                value: binding.region,
              },
            ],
    });
  }

  // Factories/dealers listed in analysis but without region co-occurrence
  for (const factory of analysis.factories) {
    if (!factory) continue;
    if (markers.some((m) => m.id === `factory-${factory}`)) continue;
    if (unplaced.some((u) => u.id === `factory-${factory}`)) continue;
    unplaced.push({
      id: `factory-${factory}`,
      kind: "factory",
      label: factory,
      reason: "No region co-occurrence on evidence rows",
    });
  }
  for (const dealer of analysis.dealers) {
    if (!dealer) continue;
    if (markers.some((m) => m.id === `dealer-${dealer}`)) continue;
    if (unplaced.some((u) => u.id === `dealer-${dealer}`)) continue;
    unplaced.push({
      id: `dealer-${dealer}`,
      kind: "dealer",
      label: dealer,
      reason: "No region co-occurrence on evidence rows",
    });
  }

  return {
    title: "Manufacturing operations",
    question: "Where is demand and capacity concentrating?",
    regions,
    markers,
    unplaced,
    honestyLabel: REGION_RESOLVED_HONESTY,
    demonstrationData: analysis.demonstrationData,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration manufacturing forecast"
      : "Manufacturing forecast snapshot",
  };
}
