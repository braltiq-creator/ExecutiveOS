import { requireAppAccess } from "@/lib/auth/access";
import { loadTeamPageData } from "@/lib/organizations/actions";
import { AppShell } from "@/components/layout/AppShell";
import { TeamManagement } from "@/components/organizations/TeamManagement";

export default async function TeamPage() {
  await requireAppAccess({ requireOnboarding: false });
  const { membership, members, invitations, seatLicense } = await loadTeamPageData();

  return (
    <AppShell breadcrumb="Team">
      <TeamManagement
        membership={membership}
        initialMembers={members}
        initialInvitations={invitations}
        seatLicense={seatLicense}
      />
    </AppShell>
  );
}
