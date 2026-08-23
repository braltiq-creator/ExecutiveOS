/**
 * Resolve Intelligence Profile from Snapshot Studio business profile.
 *
 * Snapshot Context (workflow) ≠ Intelligence Profile (runtime catalogue).
 * Never pass "executive_snapshot" into the intelligence profile registry.
 */

import {
  getIntelligenceProfile,
  isIntelligenceProfileId,
  type IntelligenceProfile,
  type IntelligenceProfileId,
} from "@/profiles";
import type { StudioBusinessProfileId } from "../types";

/**
 * Workflow / context identifiers that must never be treated as Intelligence Profiles.
 */
export const SNAPSHOT_WORKFLOW_IDS = ["executive_snapshot"] as const;

export type SnapshotWorkflowId = (typeof SNAPSHOT_WORKFLOW_IDS)[number];

export function isSnapshotWorkflowId(value: string): value is SnapshotWorkflowId {
  return (SNAPSHOT_WORKFLOW_IDS as readonly string[]).includes(value);
}

/**
 * Map Studio business profile → existing Intelligence Profile catalogue id.
 * Uses only profiles already defined in `@/profiles` (operations | commercial).
 */
export function resolveIntelligenceProfileIdFromBusinessProfile(
  businessProfileId: StudioBusinessProfileId,
): IntelligenceProfileId {
  switch (businessProfileId) {
    case "commercial":
      return "commercial_executive";
    case "manufacturing":
    case "mining":
    case "utilities":
    case "field_services":
    case "technology":
      return "operations_executive";
    default: {
      const exhaustive: never = businessProfileId;
      throw new Error(
        `The snapshot's business profile could not be resolved to an intelligence profile (${String(exhaustive)}).`,
      );
    }
  }
}

/**
 * Resolve the Intelligence Profile for an active Executive Snapshot.
 * Rejects workflow ids such as `executive_snapshot`.
 */
export function resolveIntelligenceProfileFromSnapshot(input: {
  businessProfileId: StudioBusinessProfileId;
  /** Optional override — must be a real catalogue id, never a workflow id. */
  intelligenceProfileId?: string | null;
}): IntelligenceProfile {
  if (
    input.intelligenceProfileId &&
    isSnapshotWorkflowId(input.intelligenceProfileId)
  ) {
    throw new Error(
      "The snapshot's business profile could not be resolved. \"executive_snapshot\" is a Snapshot Studio workflow identifier, not an intelligence profile.",
    );
  }

  if (
    input.intelligenceProfileId &&
    isIntelligenceProfileId(input.intelligenceProfileId)
  ) {
    return getIntelligenceProfile(input.intelligenceProfileId);
  }

  const resolved = resolveIntelligenceProfileIdFromBusinessProfile(
    input.businessProfileId,
  );
  return getIntelligenceProfile(resolved);
}

/**
 * Safe guard for tenant configuration values before profile projection.
 */
export function assertNotWorkflowIntelligenceProfile(
  profileId: string,
): asserts profileId is IntelligenceProfileId {
  if (isSnapshotWorkflowId(profileId)) {
    throw new Error(
      "The snapshot's business profile could not be resolved. \"executive_snapshot\" is a Snapshot Studio workflow identifier, not an intelligence profile.",
    );
  }
  if (!isIntelligenceProfileId(profileId)) {
    throw new Error(
      `The snapshot's business profile could not be resolved to an intelligence profile (${profileId}).`,
    );
  }
}
