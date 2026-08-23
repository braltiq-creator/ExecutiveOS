import { notFound } from "next/navigation";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { OutcomeDetailView } from "@/components/outcomes/OutcomeDetailView";
import { OutcomeEngineProviders } from "@/components/providers/OutcomeEngineProviders";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes";

type OutcomeDetailPageProps = {
  params: Promise<{ outcomeId: string }>;
};

export default async function OutcomeDetailPage({
  params,
}: OutcomeDetailPageProps) {
  await requireAppAccess({ requireOnboarding: false });
  const { outcomeId } = await params;
  const exists = MOCK_OUTCOME_PORTFOLIO.outcomes.some(
    (outcome) => outcome.id === outcomeId,
  );
  if (!exists) notFound();

  return (
    <OutcomeEngineProviders>
      <AppFrame breadcrumb="Outcomes" title="Outcome">
        <OutcomeDetailView outcomeId={outcomeId} />
      </AppFrame>
    </OutcomeEngineProviders>
  );
}
