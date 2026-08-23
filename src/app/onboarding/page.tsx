import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/actions";
import {
  getExecutiveProfile,
  isExecutiveOnboardingComplete,
} from "@/lib/onboarding/queries";
import { userHasActiveOrganization } from "@/lib/organizations/queries";
import { DiscoveryExperience } from "@/components/onboarding/discovery/DiscoveryExperience";

/**
 * Executive Discovery — replaces traditional multi-step configuration.
 * Target: first Executive Briefing in under 15 minutes.
 */
export default async function OnboardingPage() {
  const user = await requireAuth();

  if (!(await userHasActiveOrganization(user.id))) {
    redirect("/organization");
  }

  if (await isExecutiveOnboardingComplete(user.id)) {
    redirect("/today");
  }

  const executiveProfile = await getExecutiveProfile(user.id);

  return (
    <DiscoveryExperience
      tenantId="tenant-northline"
      userId={user.id}
      preferredName={
        executiveProfile?.preferred_name ??
        executiveProfile?.full_name?.split(" ")[0] ??
        undefined
      }
    />
  );
}
