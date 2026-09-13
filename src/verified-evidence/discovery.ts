/**
 * Discovery consumes VERIFIED evidence — never connection state alone.
 */

import type { DiscoveryItem } from "@/onboarding/types";
import type {
  OrganizationEvidence,
  VerifiedProviderId,
} from "@/verified-evidence/types";
import { isEvidenceEligibleForDiscovery } from "@/verified-evidence/safety";

export type VerifiedDiscoveryInput = {
  organizationId: string;
  evidence: OrganizationEvidence[];
  verifiedProviders: VerifiedProviderId[];
};

/**
 * Map eligible verified evidence into Discovery items.
 * Empty when connected-but-unverified or verified-with-no-evidence.
 * Never invents Northline/Acme/Sarah fixtures.
 */
export function discoverFromVerifiedEvidence(
  input: VerifiedDiscoveryInput,
): DiscoveryItem[] {
  const eligible = input.evidence.filter(isEvidenceEligibleForDiscovery);
  if (eligible.length === 0) {
    return [];
  }

  return eligible.map((row) => {
    const label =
      typeof row.contentPayload.label === "string"
        ? row.contentPayload.label
        : `${row.sourceObjectType} ${row.sourceIdentifier}`;
    const summary =
      typeof row.contentPayload.summary === "string"
        ? row.contentPayload.summary
        : `Verified ${row.provider} evidence: ${label}.`;

    return {
      id: `disc-evidence-${row.id}`,
      tenantId: input.organizationId,
      kind: mapObjectTypeToKind(row.sourceObjectType),
      label,
      summary,
      confidence: Math.round((row.confidence ?? 0.7) * 100),
      source: mapProviderToDiscoverySource(row.provider),
      evidence: [
        `${row.provenance} · ${row.sourceSystem}/${row.sourceObjectType}/${row.sourceIdentifier}`,
        `Retrieved ${row.retrievedAt}`,
      ],
      status: "proposed",
      relatedEntityIds: [],
      editableValue: label,
    };
  });
}

function mapProviderToDiscoverySource(
  provider: OrganizationEvidence["provider"],
): DiscoveryItem["source"] {
  if (provider === "microsoft365") return "microsoft365";
  if (provider === "simpro") return "simpro";
  if (provider === "user_upload") return "user_stated";
  return "inferred";
}

function mapObjectTypeToKind(
  objectType: string,
): DiscoveryItem["kind"] {
  const t = objectType.toLowerCase();
  if (t.includes("customer")) return "customer";
  if (t.includes("meeting")) return "leadership_meeting";
  if (t.includes("person") || t.includes("user")) return "executive_team_member";
  if (t.includes("site")) return "site";
  if (t.includes("job")) return "job";
  if (t.includes("project")) return "project";
  if (t.includes("organisation") || t.includes("organization")) {
    return "organisation_name";
  }
  return "connector";
}
