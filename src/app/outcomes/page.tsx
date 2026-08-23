import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { OutcomePortfolioView } from "@/components/outcomes/OutcomePortfolioView";
import { OutcomeEngineProviders } from "@/components/providers/OutcomeEngineProviders";

export default async function OutcomesPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <OutcomeEngineProviders>
      <AppFrame breadcrumb="Outcomes" title="Outcomes">
        <OutcomePortfolioView />
      </AppFrame>
    </OutcomeEngineProviders>
  );
}
