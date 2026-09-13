import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/actions";
import {
  getExecutiveProfile,
  isExecutiveOnboardingComplete,
} from "@/lib/onboarding/queries";
import { userHasActiveOrganization } from "@/lib/organizations/queries";
import { DiscoveryExperience } from "@/components/onboarding/discovery/DiscoveryExperience";
import { requireAppSession } from "@/services/session";

/**
 * Executive Discovery — replaces traditional multi-step configuration.
 * Production uses real AppSession organisation (Phase 35B / 36 Truth Boundary).
 */
export default async function OnboardingPage() {
  const user = await requireAuth();

  if (!(await userHasActiveOrganization(user.id))) {
    redirect("/organization");
  }

  if (await isExecutiveOnboardingComplete(user.id)) {
    redirect("/today");
  }

  const appSession = await requireAppSession();
  const executiveProfile = await getExecutiveProfile(user.id);

  return (
    <DiscoveryExperience
      tenantId={appSession.company.id}
      organisationName={appSession.company.name}
      userId={appSession.userId}
      preferredName={
        executiveProfile?.preferred_name ??
        executiveProfile?.full_name?.split(" ")[0] ??
        appSession.profile.preferredName
      }
    />
  );
}
