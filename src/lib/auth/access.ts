import { requireAuth } from "@/lib/auth/actions";
import { isMockMode } from "@/lib/mock/mode";
import { isExecutiveOnboardingComplete } from "@/lib/onboarding/queries";
import { userHasActiveOrganization } from "@/lib/organizations/queries";
import { redirect } from "next/navigation";

type RequireAppAccessOptions = {
  requireOnboarding?: boolean;
};

export async function requireAppAccess(
  options: RequireAppAccessOptions = {},
) {
  const { requireOnboarding = true } = options;
  const user = await requireAuth();

  if (isMockMode()) {
    return user;
  }

  if (!(await userHasActiveOrganization(user.id))) {
    redirect("/organization");
  }

  if (
    requireOnboarding &&
    !(await isExecutiveOnboardingComplete(user.id))
  ) {
    redirect("/onboarding");
  }

  return user;
}
