/**
 * Phase 37D — Production Studio terminology (profile-aware UI copy).
 * Copy only — no ingestion, lineage, comparison, or Command Centre changes.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getStudioIntelligenceQuestion,
  getStudioProfileQuestion,
} from "@/executive-snapshot-studio/profile-detection";
import {
  resolveStudioStepMeta,
  STUDIO_STEP_META,
} from "@/executive-snapshot-studio/wizard/steps";

const ROOT = join(process.cwd());

describe("Phase 37D — profile-aware Studio terminology", () => {
  it("Commercial Intelligence question is Commercial-specific", () => {
    expect(getStudioIntelligenceQuestion("commercial")).toBe(
      "Generate Commercial Executive Intelligence.",
    );
    expect(resolveStudioStepMeta("intelligence", "commercial").question).toBe(
      "Generate Commercial Executive Intelligence.",
    );
    expect(getStudioIntelligenceQuestion("commercial")).not.toContain(
      "Generate Manufacturing Forecast Intelligence.",
    );
  });

  it("Commercial Profile question is Commercial-specific", () => {
    expect(getStudioProfileQuestion("commercial")).toBe(
      "Confirm Commercial · Executive Intelligence.",
    );
    expect(resolveStudioStepMeta("profile", "commercial").question).toBe(
      "Confirm Commercial · Executive Intelligence.",
    );
    expect(getStudioProfileQuestion("commercial")).not.toContain(
      "Confirm Manufacturing · Forecasting.",
    );
  });

  it("Manufacturing / Operations Studio retains Manufacturing wording", () => {
    expect(getStudioProfileQuestion("manufacturing")).toBe(
      "Confirm Manufacturing · Forecasting.",
    );
    expect(getStudioIntelligenceQuestion("manufacturing")).toBe(
      "Generate Manufacturing Forecast Intelligence.",
    );
    expect(resolveStudioStepMeta("profile", "manufacturing").question).toBe(
      "Confirm Manufacturing · Forecasting.",
    );
    expect(
      resolveStudioStepMeta("intelligence", "manufacturing").question,
    ).toBe("Generate Manufacturing Forecast Intelligence.");
  });

  it("base STUDIO_STEP_META no longer hardcodes Manufacturing on profile/intelligence", () => {
    expect(STUDIO_STEP_META.profile.question).not.toBe(
      "Confirm Manufacturing · Forecasting.",
    );
    expect(STUDIO_STEP_META.intelligence.question).not.toBe(
      "Generate Manufacturing Forecast Intelligence.",
    );
  });

  it("Snapshot Summary uses Executive Intelligence wording, not Reality Lab", () => {
    const source = readFileSync(
      join(
        ROOT,
        "src/executive-snapshot-studio/preview/SnapshotSummary.tsx",
      ),
      "utf8",
    );
    expect(source).toContain(
      "Immutable · replayable · ready for Executive Intelligence",
    );
    expect(source).not.toContain("ready for Reality Lab");
  });
});
