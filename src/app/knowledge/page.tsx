import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { DecisionEngineProviders } from "@/components/providers/DecisionEngineProviders";
import { KnowledgeWorkspace } from "@/experience/knowledge-workspace";

export default async function KnowledgePage() {
  await requireAppAccess({ requireOnboarding: false });

  return (
    <DecisionEngineProviders>
      <AppFrame title="Knowledge" density="snapshot">
        <KnowledgeWorkspace />
      </AppFrame>
    </DecisionEngineProviders>
  );
}
