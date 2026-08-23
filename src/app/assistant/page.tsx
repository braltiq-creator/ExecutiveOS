import { requireAppAccess } from "@/lib/auth/access";
import { buildExecutiveIntelligenceForUser } from "@/lib/intelligence/engine";
import { getFeatureEntitlementsForUser } from "@/lib/features";
import { FeatureGate } from "@/lib/features/FeatureGate";
import { AppShell } from "@/components/layout/AppShell";
import { ExecutiveAssistant } from "@/components/assistant/ExecutiveAssistant";

export default async function AssistantPage() {
  const user = await requireAppAccess();

  const [intelligence, entitlements] = await Promise.all([
    buildExecutiveIntelligenceForUser(user.id, user.email ?? null),
    getFeatureEntitlementsForUser(user.id),
  ]);

  const preferredName =
    intelligence.executive.preferredName ||
    intelligence.executive.fullName ||
    "Executive";

  return (
    <AppShell breadcrumb="Assistant" maxWidth="5xl">
      {entitlements ? (
        <FeatureGate feature="ai_chief_of_staff" entitlements={entitlements}>
          <ExecutiveAssistant preferredName={preferredName} />
        </FeatureGate>
      ) : (
        <ExecutiveAssistant preferredName={preferredName} />
      )}
    </AppShell>
  );
}
