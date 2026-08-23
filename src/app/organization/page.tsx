import { requireAuth } from "@/lib/auth/actions";
import { userHasActiveOrganization } from "@/lib/organizations/queries";
import { loadOrganizationSetupPageData } from "@/lib/organizations/actions";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { OrganizationOverview } from "@/components/organizations/OrganizationOverview";
import { OrganizationSetup } from "@/components/organizations/OrganizationSetup";

export default async function OrganizationPage() {
  const user = await requireAuth();
  const hasOrganization = await userHasActiveOrganization(user.id);

  if (!hasOrganization) {
    const { pendingInvitations } = await loadOrganizationSetupPageData();

    return (
      <AppShell breadcrumb="Organization">
        <OrganizationSetup pendingInvitations={pendingInvitations} />
      </AppShell>
    );
  }

  const { membership, pendingInvitations } = await loadOrganizationSetupPageData();

  if (!membership) {
    redirect("/organization");
  }

  return (
    <AppShell breadcrumb="Organization">
      <OrganizationOverview
        membership={membership}
        pendingInvitations={pendingInvitations}
      />
    </AppShell>
  );
}
