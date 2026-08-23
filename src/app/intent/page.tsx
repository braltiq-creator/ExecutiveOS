import { requireAppAccess } from "@/lib/auth/access";
import { IntentDetailView } from "@/components/intent/IntentDetailView";
import { AppFrame } from "@/components/layout/AppFrame";
import { OutcomeEngineProviders } from "@/components/providers/OutcomeEngineProviders";

/** Utility route — not primary navigation (Constitution Art. III). */
export default async function IntentPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <OutcomeEngineProviders>
      <AppFrame breadcrumb="Strategic Intent" title="Strategic Intent">
        <IntentDetailView />
      </AppFrame>
    </OutcomeEngineProviders>
  );
}
