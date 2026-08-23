import {
  ensureAdaptiveProfile,
  getAdaptiveProfile,
  updateAdaptiveProfile,
  deleteAdaptiveProfile,
} from "@/adaptive/preferences/store";
import { appendLearningHistory } from "@/adaptive/governance/history";
import type { IntelligenceProfileId } from "@/profiles";
import { preferencesFromProfile } from "@/adaptive/preferences/store";

export function viewLearnedPreferences(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
}) {
  const profile = ensureAdaptiveProfile(input);
  return {
    profile,
    preferences: preferencesFromProfile(profile),
    enabled: profile.enabled,
  };
}

export function disableAdaptiveLearning(input: {
  tenantId: string;
  executiveId: string;
}): boolean {
  const updated = updateAdaptiveProfile(input.tenantId, input.executiveId, {
    enabled: false,
    explanations: [
      "Adaptive learning disabled by executive. Presentation returns to default Intelligence Profile packaging.",
    ],
  });
  if (!updated) return false;
  appendLearningHistory({
    ...input,
    category: "governance",
    summary: "Adaptive learning disabled",
  });
  return true;
}

export function enableAdaptiveLearning(input: {
  tenantId: string;
  executiveId: string;
}): boolean {
  const updated = updateAdaptiveProfile(input.tenantId, input.executiveId, {
    enabled: true,
    explanations: ["Adaptive learning re-enabled by executive."],
  });
  if (!updated) return false;
  appendLearningHistory({
    ...input,
    category: "governance",
    summary: "Adaptive learning enabled",
  });
  return true;
}

export function resetAdaptiveProfile(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
}) {
  deleteAdaptiveProfile(input.tenantId, input.executiveId);
  const fresh = ensureAdaptiveProfile(input);
  appendLearningHistory({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    category: "governance",
    summary: "Adaptive profile reset to defaults",
  });
  return fresh;
}

export function isAdaptiveEnabled(
  tenantId: string,
  executiveId: string,
): boolean {
  const profile = getAdaptiveProfile(tenantId, executiveId);
  return profile ? profile.enabled : true;
}
