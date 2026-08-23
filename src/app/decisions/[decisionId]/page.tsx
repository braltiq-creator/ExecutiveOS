import { requireAppAccess } from "@/lib/auth/access";
import { DecisionDetailView } from "@/components/decisions/DecisionDetailView";
import { AppFrame } from "@/components/layout/AppFrame";
import { DecisionEngineProviders } from "@/components/providers/DecisionEngineProviders";

type DecisionDetailPageProps = {
  params: Promise<{ decisionId: string }>;
};

/**
 * Decision detail — portfolio resolved client-side from OutcomeProvider
 * (active Executive Snapshot or demo). Server cannot read sessionStorage.
 */
export default async function DecisionDetailPage({
  params,
}: DecisionDetailPageProps) {
  await requireAppAccess({ requireOnboarding: false });
  const { decisionId } = await params;

  return (
    <DecisionEngineProviders>
      <AppFrame breadcrumb="Decisions" title="Decision">
        <DecisionDetailView decisionId={decisionId} />
      </AppFrame>
    </DecisionEngineProviders>
  );
}
