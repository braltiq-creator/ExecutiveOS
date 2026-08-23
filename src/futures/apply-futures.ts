import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { FuturesBrief } from "@/futures/models/types";
import { projectPossibleFutures } from "@/futures/generate";

/**
 * Apply Executive Futures above Intelligence / Judgement / Council inputs.
 * Attaches a FuturesBrief — never binds the executive.
 */
export function applyExecutiveFutures(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
}): {
  futuresBrief: FuturesBrief;
  snapshot: IntelligentExecutiveSnapshot;
} {
  const futuresBrief = projectPossibleFutures({
    snapshot: input.snapshot,
    twin: input.twin,
  });

  return {
    futuresBrief,
    snapshot: {
      ...input.snapshot,
      futuresBrief,
    },
  };
}
