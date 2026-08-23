/**
 * Attach scenario references to Today recommended actions (presentation layer).
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot, SnapshotAction } from "@/lib/snapshot/types";
import {
  getScenarioPackForProfile,
  type ScenarioActionReference,
} from "@/scenarios/framework";
import { runScenarioPack } from "@/scenarios/validation";

function matchScenario(
  action: SnapshotAction,
  profileId: IntelligenceProfileId,
): ScenarioActionReference | null {
  const pack = getScenarioPackForProfile(profileId);
  const haystack = `${action.title} ${action.why} ${action.expectedOutcome}`.toLowerCase();

  const scored = pack.scenarios.map((scenario) => {
    const keywords = scenario.businessQuestion
      .toLowerCase()
      .replace(/[?]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hits = keywords.filter((k) => haystack.includes(k)).length;
    const nameHit = scenario.name
      .toLowerCase()
      .split(/\s+/)
      .some((w) => w.length > 3 && haystack.includes(w));
    return { scenario, score: hits + (nameHit ? 2 : 0) };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 1) {
    // Fall back to focus-today / prioritise-today for unmatched actions
    const focus = pack.scenarios.find(
      (s) =>
        s.id === "ops-focus-today" || s.id === "com-prioritise-today",
    );
    if (!focus) return null;
    return {
      scenarioId: focus.id,
      scenarioName: focus.name,
      businessQuestion: focus.businessQuestion,
      evidence: focus.expectedEvidence.slice(0, 3),
      confidence: 55,
      expectedOutcome: focus.businessOutcome,
    };
  }

  return {
    scenarioId: best.scenario.id,
    scenarioName: best.scenario.name,
    businessQuestion: best.scenario.businessQuestion,
    evidence: best.scenario.expectedEvidence.slice(0, 3),
    confidence: Math.min(90, 50 + best.score * 10),
    expectedOutcome: best.scenario.businessOutcome,
  };
}

export function attachScenariosToTodayActions(
  snapshot: ExecutiveSnapshot,
  profileId: IntelligenceProfileId,
  tenantId?: string,
): ExecutiveSnapshot {
  const run =
    tenantId != null
      ? runScenarioPack({
          tenantId,
          profileId,
          presentation: snapshot,
        })
      : null;

  const recommendedActions = snapshot.recommendedActions.map((action) => {
    const ref = matchScenario(action, profileId);
    if (!ref) return action;
    const result = run?.results.find((r) => r.scenarioId === ref.scenarioId);
    return {
      ...action,
      scenarioId: ref.scenarioId,
      scenarioName: ref.scenarioName,
      businessQuestion: ref.businessQuestion,
      evidence: result?.evidenceFound.length
        ? result.evidenceFound.slice(0, 3)
        : ref.evidence,
      confidence: result?.confidence ?? ref.confidence,
      expectedOutcome: action.expectedOutcome || ref.expectedOutcome,
    };
  });

  return { ...snapshot, recommendedActions };
}
