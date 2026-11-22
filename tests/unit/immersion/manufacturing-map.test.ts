import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { UdgCanonicalRecord } from "@/data-gateway";
import {
  REGION_RESOLVED_HONESTY,
  projectManufacturingEvidenceNetwork,
  projectManufacturingExecutiveBriefing,
  projectManufacturingOperationsMap,
} from "@/experience/immersion";

function loadDemoRecords(): UdgCanonicalRecord[] {
  const csv = readFileSync(
    resolve(
      process.cwd(),
      "fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv",
    ),
    "utf8",
  );
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  const fieldMap: Record<string, string> = {
    Period: "period",
    Region: "region",
    Dealer: "dealer",
    Model: "model",
    Variant: "variant",
    Factory: "factory",
    "Forecast Units": "forecastQuantity",
    "Actual Units": "actualQuantity",
    "Order Bank Units": "orderBankQuantity",
    "Production Capacity Units": "productionCapacity",
    "Available Slots": "availableSlots",
    "Finished Goods Units": "finishedGoods",
    "Inventory Days": "inventoryDays",
    "Forecast Version": "forecastVersion",
  };
  const numKeys = new Set([
    "forecastQuantity",
    "actualQuantity",
    "orderBankQuantity",
    "productionCapacity",
    "availableSlots",
    "finishedGoods",
    "inventoryDays",
  ]);

  return lines.slice(1, 121).map((line, i) => {
    const cols = line.split(",");
    const fields: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const key = fieldMap[h];
      if (!key) return;
      fields[key] = numKeys.has(key) ? Number(cols[idx]) : cols[idx];
    });
    return {
      recordId: `t-${i}`,
      rowIndex: i + 1,
      sourceKind: "csv" as const,
      fields,
    };
  });
}

describe("Phase 2 manufacturing immersion projections", () => {
  it("projects region-resolved operations map with honesty label", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    expect(analysis.locationBindings.length).toBeGreaterThan(0);

    const map = projectManufacturingOperationsMap(analysis);
    expect(map.honestyLabel).toBe(REGION_RESOLVED_HONESTY);
    expect(map.domain).toBe("manufacturing");
    expect(map.defaultView).toBe("australia");
    expect(map.regions.length).toBeGreaterThan(0);
    expect(map.demandPoints.length).toBeGreaterThan(0);
    expect(map.markers.some((m) => m.kind === "factory")).toBe(true);
    expect(map.markers.every((m) => m.geoResolution === "region_resolved")).toBe(
      true,
    );
    expect(map.markers.every((m) => m.provenance === "derived")).toBe(true);
    expect(
      map.markers
        .filter((m) => m.kind === "factory" || m.kind === "dealer")
        .every((m) =>
          (m.locationConfidenceLabel ?? "").toLowerCase().includes("approximate"),
        ),
    ).toBe(true);
  });

  it("projects evidence network without inventing cross-row joins beyond co-occurrence", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const network = projectManufacturingEvidenceNetwork(analysis);
    expect(network.nodes.length).toBeGreaterThan(3);
    expect(network.links.length).toBeGreaterThan(0);
    expect(network.nodes.every((n) => n.provenance === "derived")).toBe(true);
  });

  it("projects executive briefing immersion from manufacturing analysis", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const briefing = projectManufacturingExecutiveBriefing(analysis);
    expect(briefing.leadJudgement.length).toBeGreaterThan(10);
    expect(briefing.map.domain).toBe("manufacturing");
    expect(briefing.network.nodes.length).toBeGreaterThan(0);
    expect(briefing.demonstrationData).toBe(true);
    expect(briefing.priorityDecision?.question).toBeTruthy();
  });
});
