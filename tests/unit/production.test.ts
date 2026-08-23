import { describe, expect, it } from "vitest";
import {
  buildInsightScores,
  computePriorityScore,
  urgencyFromHours,
} from "@/lib/intelligence-center/prioritizer";
import { validateDigestType } from "@/lib/intelligence-center/validation";
import { validateAdvisorRequest } from "@/lib/agents/validation";
import { normalizeError, ValidationError, RateLimitError } from "@/lib/errors";
import { assertRateLimit, clearRateLimits } from "@/lib/security/rate-limit";

describe("prioritizer", () => {
  it("computes weighted priority score", () => {
    const score = computePriorityScore({
      impact: 80,
      urgency: 70,
      confidence: 90,
      strategicAlignment: 75,
      risk: 60,
    });

    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("increases urgency for near-term events", () => {
    expect(urgencyFromHours(2)).toBeGreaterThan(urgencyFromHours(48));
  });

  it("builds insight scores with priorityScore", () => {
    const scores = buildInsightScores({
      impact: 50,
      urgency: 50,
      confidence: 50,
      strategicAlignment: 50,
      risk: 50,
    });

    expect(scores.priorityScore).toBe(50);
  });
});

describe("validation", () => {
  it("validates digest types", () => {
    expect(validateDigestType("morning_brief").error).toBeNull();
    expect(validateDigestType("invalid" as never).error).toBeTruthy();
  });

  it("validates advisor requests", () => {
    expect(
      validateAdvisorRequest({ message: "  ", history: [] }).error,
    ).toBeTruthy();
    expect(
      validateAdvisorRequest({ message: "Hello", history: [] }).error,
    ).toBeNull();
  });
});

describe("errors", () => {
  it("normalizes unknown errors", () => {
    const error = normalizeError(new ValidationError("Invalid input"));
    expect(error.code).toBe("VALIDATION");
    expect(error.message).toBe("Invalid input");
  });
});

describe("rate limiting", () => {
  it("blocks after limit exceeded", () => {
    clearRateLimits();
    const config = { key: "test-user:action", limit: 2, windowMs: 60_000 };

    assertRateLimit(config);
    assertRateLimit(config);
    expect(() => assertRateLimit(config)).toThrow(RateLimitError);
  });
});
