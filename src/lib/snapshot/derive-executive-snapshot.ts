/**
 * Presentation facade — Today UI continues to call deriveExecutiveSnapshot.
 * Intelligence now lives in @/intelligence/executive-intelligence.
 */
import { buildExecutiveSnapshotForUi, clipNarrative } from "@/intelligence/executive-intelligence";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

export { clipNarrative };

/** Pure Command Centre derivation — portfolio SoT via Executive Intelligence Engine. */
export function deriveExecutiveSnapshot(
  portfolio: OutcomePortfolio,
): ExecutiveSnapshot {
  return buildExecutiveSnapshotForUi(portfolio);
}
