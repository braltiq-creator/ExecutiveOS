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
  const nodes = new Map<
    string,
    ImmersionNetworkModel["nodes"][number]
  >();
  const links: ImmersionNetworkModel["links"] = [];
  const linkKeys = new Set<string>();

  function ensureNode(
    id: string,
    label: string,
    group: string,
    val = 4,
  ) {
    if (nodes.has(id)) return;
    nodes.set(id, {
      id,
      label,
      group,
      provenance: "derived",
      summary: `${group} from manufacturing evidence analysis`,
      val,
    });
  }

  function link(
    source: string,
    target: string,
    label: string,
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
    });
  }

  ensureNode("org", "Organisation", "Organisation", 10);

  for (const region of analysis.regions) {
    if (!region) continue;
    const id = `region:${region}`;
    ensureNode(id, region, "Region", 6);
    link("org", id, "CONTAINS");
  }

  for (const cell of analysis.heatMap) {
    if (!cell.region || !cell.model) continue;
    const regionId = `region:${cell.region}`;
    const modelId = `model:${cell.model}`;
    ensureNode(regionId, cell.region, "Region", 6);
    ensureNode(modelId, cell.model, "MachineModel", 5);
    link(regionId, modelId, "DEMANDS");
  }

  for (const binding of analysis.locationBindings ?? []) {
    const regionId = `region:${binding.region}`;
    const entityId = `${binding.kind}:${binding.entity}`;
    ensureNode(regionId, binding.region, "Region", 6);
    ensureNode(
      entityId,
      binding.entity,
      binding.kind === "factory" ? "Factory" : "Dealer",
      binding.kind === "factory" ? 7 : 4,
    );
    link(
      entityId,
      regionId,
      binding.kind === "dealer" ? "LOCATED_IN" : "PLANNED_AT",
    );
    link("org", entityId, "CONTAINS");
  }

  for (const cap of analysis.capacity) {
    const id = `factory:${cap.factory}`;
    ensureNode(id, cap.factory, "Factory", 7);
    if (cap.loadPct != null) {
      nodes.get(id)!.summary = `Load ${cap.loadPct}% · derived capacity signal`;
    }
  }

  if (nodes.size <= 1) {
    return {
      title: "Manufacturing evidence network",
      nodes: [],
      links: [],
      sourceLabel: analysis.demonstrationData
        ? "Demonstration manufacturing forecast"
        : "Manufacturing forecast snapshot",
      emptyReason:
        "Insufficient manufacturing dimensions to project an evidence network.",
    };
  }

  return {
    title: "Manufacturing evidence network",
    nodes: [...nodes.values()],
    links,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration manufacturing forecast · derived co-occurrence only"
      : "Manufacturing forecast snapshot · derived co-occurrence only",
  };
}
