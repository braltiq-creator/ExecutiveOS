import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { portfolioFromManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-portfolio-bridge";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import {
  commandCentreStatusFromDecision,
  deriveExecutiveSelectionState,
  recordExecutiveDecision,
} from "@/lib/decisions/decision-execution-linkage";
import { projectManufacturingExecutiveBriefing } from "@/experience/immersion";
import type { UdgCanonicalRecord } from "@/data-gateway";

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

describe("Stage 4 durable executive decision recording", () => {
  it("records through Decision Engine portfolio without fabricating confidence inheritance", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const paper = buildManufacturingDecisionPaper(analysis, undefined);
    expect(paper.decisionId).toBeTruthy();
    const portfolio = portfolioFromManufacturingAnalysis(analysis);
    const decision = portfolio.decisions.find((d) => d.id === paper.decisionId);
    expect(decision).toBeTruthy();
    expect(decision!.alternatives.some((a) => a.id === "opt-protect")).toBe(
      true,
    );

    const result = recordExecutiveDecision(portfolio, {
      decisionId: paper.decisionId!,
      alternativeId: "opt-protect",
      actor: "Executive",
      owner: "Executive",
      rationale:
        "Protect Model H demand given evidenced QLD and NSW acceleration and Plant 2 load pressure.",
      acceptedAssumptions: [
        "Demand trajectory continues unless new evidence arrives.",
      ],
      acceptedRisks: [
        "Plant capacity is already under demonstrated load pressure",
      ],
      followUps: ["Brief operations on allocation change"],
      evidenceIds: decision!.evidence.slice(0, 2).map((e) => e.id),
    });

    expect(result.recording.decisionConfidence.established).toBe(true);
    expect(result.recording.decisionConfidence.explanation.toLowerCase()).toContain(
      "not copied",
    );
    expect(result.decision.executiveRecording?.rationale).toContain("Model H");
    expect(result.decision.selectedAlternativeId).toBe("opt-protect");
    expect(result.decision.owner).toBe("Executive");
    expect(result.decision.evidenceAtDecision?.length).toBeGreaterThan(0);
    expect(result.decision.history.some((h) => /EXECUTIVE_RECORDED/i.test(h.note))).toBe(
      true,
    );
    expect(deriveExecutiveSelectionState(result.decision)).toBe(
      "OPTION_SELECTED",
    );
    expect(
      commandCentreStatusFromDecision(result.decision, false),
    ).toBe("decision_selected");

    // Dataset/judgement scores from paper are independent — recording does not overwrite them.
    expect(paper.confidence.datasetConfidence).not.toBeNull();
    expect(paper.confidence.decisionConfidence).toBeNull();
    expect(result.decision.executiveRecording?.decisionConfidence.established).toBe(
      true,
    );
  });

  it("surfaces recorded status on the Executive Briefing projection", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const paper = buildManufacturingDecisionPaper(analysis, undefined);
    const portfolio = portfolioFromManufacturingAnalysis(analysis);
    const recorded = recordExecutiveDecision(portfolio, {
      decisionId: paper.decisionId!,
      alternativeId: "opt-protect",
      actor: "Executive",
      rationale:
        "Protect Model H demand given evidenced QLD and NSW acceleration and Plant 2 load pressure.",
      acceptedAssumptions: ["Demand continues"],
      acceptedRisks: ["Capacity pressure"],
      followUps: ["Brief ops"],
      evidenceIds: ["ev-1"],
    });

    const briefing = projectManufacturingExecutiveBriefing(analysis, {
      liveDecision: recorded.decision,
      decisionHref: "/dev/phase2-preview?tab=decisions",
    });
    expect(briefing.priorityDecision?.recorded).toBe(true);
    expect(briefing.priorityDecision?.statusLabel).toBe("Recorded");
    expect(briefing.priorityDecision?.href).toContain("tab=decisions");
    expect(briefing.priorityDecision?.confidenceLabel.toLowerCase()).toContain(
      "executive",
    );
  });
});
