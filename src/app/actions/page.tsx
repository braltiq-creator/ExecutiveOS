import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { DecisionEngineProviders } from "@/components/providers/DecisionEngineProviders";
import { ActionsFoundation } from "@/features/actions/ActionsFoundation";

export default async function ActionsPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <DecisionEngineProviders>
      <AppFrame breadcrumb="Actions" title="Actions">
        <ActionsFoundation />
      </AppFrame>
    </DecisionEngineProviders>
  );
}
