import { describe, expect, it, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { portfolioFromManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-portfolio-bridge";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import {
  commandCentreStatusFromDecision,
  deriveExecutiveSelectionState,
  recordExecutiveDecision,
  selectDecisionOption,
  createActionFromSelectedDecision,
} from "@/lib/decisions/decision-execution-linkage";
import { resolveDecisionPersistenceStatus } from "@/lib/decisions/decision-persistence-mode";
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

describe("Stage 4 persistence mode honesty", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error restore node env
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
    vi.restoreAllMocks();
  });

  it("reports ui_cache_only when no active snapshot id is present", () => {
    // Simulate browser without activated snapshot
    // @ts-expect-error test shim
    globalThis.window = {};
    const status = resolveDecisionPersistenceStatus(null);
    expect(status.mode).toBe("ui_cache_only");
    expect(status.willAttemptServerWrite).toBe(false);
    expect(status.reason.toLowerCase()).toContain("snapshot");
  });

  it("reports ui_cache_only when snapshot id exists but organisation session is absent", () => {
    // @ts-expect-error test shim
    globalThis.window = {};
    const status = resolveDecisionPersistenceStatus("snap-preview-1");
    expect(status.mode).toBe("ui_cache_only");
    expect(status.willAttemptServerWrite).toBe(false);
    expect(status.organisationId).toBeNull();
    expect(status.reason.toLowerCase()).toMatch(/organisation|localstorage|ui cache/);
  });
});

describe("Stage 4 decision lifecycle remains distinct", () => {
  it("recording does not imply execution has commenced", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const paper = buildManufacturingDecisionPaper(analysis, undefined);
    const portfolio = portfolioFromManufacturingAnalysis(analysis);

    const selected = selectDecisionOption(portfolio, {
      decisionId: paper.decisionId!,
      alternativeId: "opt-protect",
      actor: "Executive",
    });
    expect(deriveExecutiveSelectionState(selected.decision)).toBe(
      "OPTION_SELECTED",
    );
    expect(
      commandCentreStatusFromDecision(selected.decision, false),
    ).toBe("decision_selected");

    const recorded = recordExecutiveDecision(selected.portfolio, {
      decisionId: paper.decisionId!,
      alternativeId: "opt-protect",
      actor: "Executive",
      owner: "Executive",
      rationale:
        "Protect Model H demand given evidenced QLD and NSW acceleration and Plant 2 load pressure.",
      acceptedAssumptions: ["Demand trajectory continues"],
      acceptedRisks: ["Plant capacity under load"],
      followUps: ["Brief operations"],
      evidenceIds: selected.decision.evidence.slice(0, 2).map((e) => e.id),
    });

    // Recorded ≠ approved ≠ in execution
    expect(deriveExecutiveSelectionState(recorded.decision)).toBe(
      "OPTION_SELECTED",
    );
    expect(
      commandCentreStatusFromDecision(recorded.decision, false),
    ).toBe("decision_selected");
    expect(recorded.decision.status).not.toBe("approved");
    expect(
      commandCentreStatusFromDecision(recorded.decision, false),
    ).not.toBe("execution_underway");

    const withAction = createActionFromSelectedDecision(recorded.portfolio, {
      decisionId: paper.decisionId!,
      actor: "Executive",
    });
    expect(
      commandCentreStatusFromDecision(
        withAction.decision,
        true,
      ),
    ).toBe("execution_underway");
  });

  it("retains frozen evidence ids, rationale, owner, assumptions, risks, follow-ups, history", () => {
    const analysis = analyseManufacturingSnapshot(loadDemoRecords());
    const paper = buildManufacturingDecisionPaper(analysis, undefined);
    const portfolio = portfolioFromManufacturingAnalysis(analysis);
    const decision = portfolio.decisions.find((d) => d.id === paper.decisionId)!;
    const evidenceIds = decision.evidence.slice(0, 3).map((e) => e.id);

    const result = recordExecutiveDecision(portfolio, {
      decisionId: paper.decisionId!,
      alternativeId: "opt-protect",
      actor: "COO",
      owner: "COO",
      rationale:
        "Protect Model H demand — QLD/NSW acceleration evidenced; Plant 2 pressure accepted.",
      acceptedAssumptions: ["Demand continues unless new evidence"],
      acceptedRisks: ["Capacity pressure at Plant 2"],
      followUps: ["Notify plant ops", "Revisit in 2 weeks"],
      evidenceIds,
    });

    const er = result.decision.executiveRecording!;
    expect(er.evidenceIds).toEqual(evidenceIds);
    expect(er.rationale).toContain("Plant 2");
    expect(er.recordedBy).toBe("COO");
    expect(er.acceptedAssumptions).toContain(
      "Demand continues unless new evidence",
    );
    expect(er.acceptedRisks).toContain("Capacity pressure at Plant 2");
    expect(er.followUps).toEqual(["Notify plant ops", "Revisit in 2 weeks"]);
    expect(
      (result.decision.evidenceAtDecision ?? []).map((e) => e.id),
    ).toEqual(evidenceIds);
    expect(
      result.decision.history.some((h) => /EXECUTIVE_RECORDED/i.test(h.note)),
    ).toBe(true);
  });
});

describe("Stage 4 persistence architecture contracts (static)", () => {
  it("portfolio store gates durable writes on organisation snapshot", () => {
    const storeSrc = readFileSync(
      resolve(process.cwd(), "src/store/portfolio-store.ts"),
      "utf8",
    );
    expect(storeSrc).toContain("persistDurablePortfolio");
    expect(storeSrc).toContain("resolveDecisionPersistenceStatus");
    expect(storeSrc).toContain("persistPilotPortfolioAction");
    expect(storeSrc).toContain("willAttemptServerWrite");
    expect(storeSrc).toContain("recordExecutiveDecision");
  });

  it("does not introduce a second decision persistence system", () => {
    const immersionSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/experience/immersion/decision/DecisionIntelligenceImmersion.tsx",
      ),
      "utf8",
    );
    expect(immersionSrc).toContain("recordExecutiveDecision");
    expect(immersionSrc).toContain("data-persistence-mode");
    expect(immersionSrc).not.toMatch(/createClient|supabase\.from\(/i);
  });
});
