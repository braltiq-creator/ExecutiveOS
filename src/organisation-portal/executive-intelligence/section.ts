import { getProvisioningProfile } from "@/provisioning/executive-profile/catalog";
import { listProvisioningProfiles } from "@/provisioning/executive-profile/catalog";
import type { ProvisioningExecutiveProfileId } from "@/provisioning/types";
import type { ExecutiveIntelligenceSection } from "@/organisation-portal/types";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";

export function buildExecutiveIntelligenceSection(input: {
  executiveProfileId: ProvisioningExecutiveProfileId | string;
  packIds: string[];
}): ExecutiveIntelligenceSection {
  const profileId = (
    ["operations_executive", "commercial_executive", "manufacturing_executive"].includes(
      input.executiveProfileId,
    )
      ? input.executiveProfileId
      : "operations_executive"
  ) as ProvisioningExecutiveProfileId;

  const profile = getProvisioningProfile(profileId);
  const installedPacks = input.packIds.map((id) => ({
    id,
    name:
      id === MANUFACTURING_PACK_ID
        ? "Manufacturing Executive Intelligence Pack"
        : id,
    industry: id === MANUFACTURING_PACK_ID ? "manufacturing" : "general",
    health: "healthy" as const,
    learningStatus: "Learning from executive judgements",
  }));

  const available: Array<{ id: string; name: string; summary: string }> =
    listProvisioningProfiles()
      .filter((p) => p.id !== profileId)
      .map((p) => ({
        id: p.id,
        name: p.name,
        summary: p.summary,
      }));

  if (
    !input.packIds.includes(MANUFACTURING_PACK_ID) &&
    profileId !== "manufacturing_executive"
  ) {
    available.push({
      id: MANUFACTURING_PACK_ID,
      name: "Manufacturing Executive Intelligence Pack",
      summary: "Demand, factory, inventory, dealers, and working capital.",
    });
  }

  return {
    currentProfileId: profileId,
    currentProfileName: profile.name,
    installedPacks,
    availablePacks: available,
    recommendations: [
      installedPacks.length === 0
        ? "Connect systems so Discovery can recommend the right Intelligence Pack"
        : "Review pack health after connecting Dynamics or Simpro",
      "Keep Executive Profile aligned to the decisions you make each week",
    ],
    packHealthLabel:
      installedPacks.length === 0 ? "No packs installed" : "Packs healthy",
    learningStatus: "Adaptive learning active for this organisation",
  };
}
