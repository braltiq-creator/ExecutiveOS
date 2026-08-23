import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { BriefingProviders } from "@/components/providers/BriefingProviders";
import { TodayShell } from "@/features/today";

export default async function TodayPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <BriefingProviders>
      <AppFrame title="Today" density="mission">
        <TodayShell />
      </AppFrame>
    </BriefingProviders>
  );
}
