import type { AdaptiveExecutiveProfile, PreferenceRecord } from "@/adaptive/framework/types";
import type { IntelligenceProfileId } from "@/profiles";

const profiles = new Map<string, AdaptiveExecutiveProfile>();

function key(tenantId: string, executiveId: string): string {
  return `${tenantId}::${executiveId}`;
}

export function resetAdaptiveProfiles(): void {
  profiles.clear();
}

export function ensureAdaptiveProfile(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
}): AdaptiveExecutiveProfile {
  const id = key(input.tenantId, input.executiveId);
  const existing = profiles.get(id);
  if (existing) return existing;
  const now = new Date().toISOString();
  const profile: AdaptiveExecutiveProfile = {
    id,
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    profileId: input.profileId,
    decisionPreferences: ["outcome_linked", "evidence_backed"],
    workingHours: { startHour: 7, endHour: 19, timezone: "Australia/Sydney" },
    briefingBehaviour: {
      opensPerWeek: 0,
      avgMinutes: 8,
      preferredStartSection: "executive-value",
    },
    recommendationAcceptanceRate: 50,
    recommendationDismissalRate: 20,
    reviewCompletionRate: 30,
    preferredDetailLevel: "balanced",
    preferredCommunicationStyle: "direct",
    preferredConfidenceThreshold: 60,
    strategicPriorities: [],
    businessFocus: [],
    learningConfidence: 40,
    enabled: true,
    explanations: [
      "New adaptive profile — learning begins from observed briefing and recommendation behaviour.",
    ],
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return profile;
}

export function getAdaptiveProfile(
  tenantId: string,
  executiveId: string,
): AdaptiveExecutiveProfile | undefined {
  return profiles.get(key(tenantId, executiveId));
}

export function listAdaptiveProfiles(tenantId?: string): AdaptiveExecutiveProfile[] {
  return [...profiles.values()]
    .filter((p) => (tenantId ? p.tenantId === tenantId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function updateAdaptiveProfile(
  tenantId: string,
  executiveId: string,
  patch: Partial<
    Omit<AdaptiveExecutiveProfile, "id" | "tenantId" | "executiveId" | "createdAt">
  >,
): AdaptiveExecutiveProfile | null {
  const current = getAdaptiveProfile(tenantId, executiveId);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  profiles.set(current.id, next);
  return next;
}

export function deleteAdaptiveProfile(
  tenantId: string,
  executiveId: string,
): boolean {
  return profiles.delete(key(tenantId, executiveId));
}

export function preferencesFromProfile(
  profile: AdaptiveExecutiveProfile,
): PreferenceRecord[] {
  return [
    {
      key: "detail_level",
      value: profile.preferredDetailLevel,
      explanation: `Prefers ${profile.preferredDetailLevel} explanations based on expansion behaviour.`,
      confidence: profile.learningConfidence,
      updatedAt: profile.updatedAt,
    },
    {
      key: "communication_style",
      value: profile.preferredCommunicationStyle,
      explanation: `Communication style learned as ${profile.preferredCommunicationStyle}.`,
      confidence: profile.learningConfidence,
      updatedAt: profile.updatedAt,
    },
    {
      key: "confidence_threshold",
      value: profile.preferredConfidenceThreshold,
      explanation:
        "Recommendations below this confidence are de-emphasised in presentation.",
      confidence: profile.learningConfidence,
      updatedAt: profile.updatedAt,
    },
    {
      key: "adaptive_enabled",
      value: profile.enabled,
      explanation: profile.enabled
        ? "Adaptive learning is active for this executive."
        : "Adaptive learning disabled by executive governance.",
      confidence: 100,
      updatedAt: profile.updatedAt,
    },
  ];
}
