import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { InsightsFoundation } from "@/features/insights/InsightsFoundation";

export default async function InsightsPage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <AppFrame breadcrumb="Insights" title="Insights">
      <InsightsFoundation />
    </AppFrame>
  );
}
