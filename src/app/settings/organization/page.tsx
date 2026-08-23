import { requireAppAccess } from "@/lib/auth/access";
import { loadOrganizationSettingsPageData } from "@/lib/organizations/actions";
import { AppShell } from "@/components/layout/AppShell";
import { OrganizationSettingsForm } from "@/components/organizations/OrganizationSettingsForm";

export default async function OrganizationSettingsPage() {
  await requireAppAccess({ requireOnboarding: false });
  const { membership, departments } = await loadOrganizationSettingsPageData();

  return (
    <AppShell breadcrumb="Settings">
      <OrganizationSettingsForm
        membership={membership}
        departments={departments}
      />
    </AppShell>
  );
}
