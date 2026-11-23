/**
 * Evidence-derived network from ManufacturingAnalysis dimensions.
 * Edges only where analysis already establishes co-occurrence (heatMap region×model,
 * locationBindings entity×region). No fabricated cross-joins.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { ImmersionNetworkModel } from "@/experience/immersion/types";

export function projectManufacturingEvidenceNetwork(
  analysis: ManufacturingAnalysis,
): ImmersionNetworkModel {
  const nodes = new Map<string, ImmersionNetworkModel["nodes"][number]>();
  const links: ImmersionNetworkModel["links"] = [];
  const linkKeys = new Set<string>();
  const disclosure = analysis.demonstrationData
    ? "Demonstration fixture — not live customer intelligence"
    : null;

  function ensureNode(input: {
    id: string;
    label: string;
    group: string;
    val?: number;
    summary?: string;
    significance?: string;
    evidenceSources?: string[];
  }) {
    const existing = nodes.get(input.id);
    if (existing) {
      if (input.summary && !existing.summary?.includes(input.summary)) {
        existing.summary = input.summary;
      }
      if (input.significance) existing.significance = input.significance;
      if (input.evidenceSources?.length) {
        existing.evidenceSources = [
          ...new Set([
            ...(existing.evidenceSources ?? []),
            ...input.evidenceSources,
          ]),
        ];
      }
      return;
    }
    nodes.set(input.id, {
      id: input.id,
      label: input.label,
      group: input.group,
      provenance: "derived",
      summary: input.summary ?? `${input.group} derived from manufacturing evidence`,
      val: input.val ?? 4,
      significance: input.significance ?? null,
      evidenceSources: input.evidenceSources ?? [],
      disclosure,
    });
  }

  function link(
    source: string,
    target: string,
    label: string,
    basis: string,
  ) {
    const key = `${source}|${target}|${label}`;
    const rev = `${target}|${source}|${label}`;
    if (linkKeys.has(key) || linkKeys.has(rev)) return;
    linkKeys.add(key);
    links.push({
      source,
      target,
      label,
      provenance: "derived",
      basis,
    });
  }

  ensureNode({
    id: "org",
    label: "Organisation",
    group: "Organisation",
    val: 14,
    summary: "Tenant hub for this manufacturing evidence projection",
    significance:
      "Anchors all region, factory, dealer and model entities present in the active snapshot",
    evidenceSources: [
      `Snapshot record count: ${analysis.recordCount}`,
      analysis.demonstrationData
        ? "Forecast version marks demonstration data"
        : "Manufacturing forecast snapshot",
    ],
  });

  for (const region of analysis.regions) {
    if (!region) continue;
    const cells = analysis.heatMap.filter((c) => c.region === region);
    const peak = cells
      .map((c) => c.variancePct)
      .filter((v): v is number => v != null)
      .sort((a, b) => Math.abs(b) - Math.abs(a))[0];
    ensureNode({
      id: `region:${region}`,
      label: region,
      group: "Region",
      val: 8,
      summary: `Geographic demand aggregation · ${cells.length} region×model cells`,
      significance:
        peak == null
          ? "Region present in evidence; variance not established"
          : `Peak region×model variance ${peak > 0 ? "+" : ""}${peak}%`,
      evidenceSources: [
        "UDG field: region",
        "Derived heatMap aggregation (6-period window)",
      ],
    });
    link(
      "org",
      `region:${region}`,
      "CONTAINS",
      "Region label appears on manufacturing evidence rows for this organisation",
    );
  }

  for (const cell of analysis.heatMap) {
    if (!cell.region || !cell.model) continue;
    const regionId = `region:${cell.region}`;
    const modelId = `model:${cell.model}`;
    ensureNode({
      id: modelId,
      label: cell.model,
      group: "MachineModel",
      val: 5,
      summary: "Product model with region demand co-occurrence",
      significance:
        cell.variancePct == null
          ? "Model demand present; variance not established"
          : `${cell.region} variance ${cell.variancePct > 0 ? "+" : ""}${cell.variancePct}%`,
      evidenceSources: [
        "UDG fields: region + model (same rows)",
        "Derived heatMap cell",
      ],
    });
    link(
      regionId,
      modelId,
      "DEMANDS",
      "Region and model co-occur on the same evidence rows in the heat aggregation",
    );
  }

  const capacityByFactory = new Map(
    analysis.capacity.map((c) => [c.factory, c]),
  );

  for (const binding of analysis.locationBindings ?? []) {
    const regionId = `region:${binding.region}`;
    const entityId = `${binding.kind}:${binding.entity}`;
    const cap = capacityByFactory.get(binding.entity);
    ensureNode({
      id: entityId,
      label: binding.entity,
      group: binding.kind === "factory" ? "Factory" : "Dealer",
      val: binding.kind === "factory" ? 9 : 4.5,
      summary:
        binding.kind === "factory"
          ? cap?.loadPct != null
            ? `Factory · demonstrated load ${cap.loadPct}%`
            : "Factory from evidence co-occurrence"
          : `Dealer · ${binding.coOccurrenceCount} co-occurring rows with ${binding.region}`,
      significance:
        binding.kind === "factory"
          ? cap?.loadPct != null
            ? `Capacity signal tone ${cap.tone}; slots ${cap.availableSlots ?? "not established"}`
            : "Factory present without quantified load"
          : `Primary region co-occurrence ${binding.region}`,
      evidenceSources: [
        `UDG fields: ${binding.kind} + region (same rows)`,
        `${binding.coOccurrenceCount} co-occurring evidence rows`,
        ...(cap
          ? ["Derived capacity aggregation (latest period)"]
          : []),
      ],
    });
    link(
      entityId,
      regionId,
      binding.kind === "dealer" ? "LOCATED_IN" : "PLANNED_AT",
      `${binding.kind} and region co-occur on the same evidence rows (${binding.coOccurrenceCount} rows)`,
    );
    link(
      "org",
      entityId,
      "CONTAINS",
      `${binding.kind} appears in the organisation manufacturing evidence set`,
    );
  }

  for (const cap of analysis.capacity) {
    const id = `factory:${cap.factory}`;
    ensureNode({
      id,
      label: cap.factory,
      group: "Factory",
      val: 9,
      summary:
        cap.loadPct != null
          ? `Load ${cap.loadPct}% · demand ${cap.demonstratedDemand}`
          : "Factory capacity signal",
      significance: `Tone ${cap.tone}`,
      evidenceSources: ["Derived capacity aggregation"],
    });
  }

  if (nodes.size <= 1) {
    return {
      title: "Manufacturing evidence network",
      nodes: [],
      links: [],
      sourceLabel: analysis.demonstrationData
        ? "Demonstration manufacturing forecast"
        : "Manufacturing forecast snapshot",
      demonstrationData: analysis.demonstrationData,
      emptyReason:
        "Insufficient manufacturing dimensions to project an evidence network.",
    };
  }

  return {
    title: "Manufacturing evidence network",
    nodes: [...nodes.values()],
    links,
    demonstrationData: analysis.demonstrationData,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration fixture · derived co-occurrence only — not live customer intelligence"
      : "Manufacturing forecast snapshot · derived co-occurrence only",
  };
}
