import { loadExecutiveDayIntelligence } from "@/lib/intelligence/providers";
import { fetchOrganizationIntegrationByProvider } from "@/lib/integrations/queries";
import { runIntegrationSync } from "@/lib/integrations/sync";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import type { ExecutiveDayIntelligence } from "@/lib/intelligence/providers/types";

export async function loadCalendarPageData(userId: string): Promise<ExecutiveDayIntelligence> {
  return loadExecutiveDayIntelligence(userId);
}

export async function syncMicrosoft365Calendar(userId: string): Promise<void> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return;
  }

  const integration = await fetchOrganizationIntegrationByProvider(
    membership.organization.id,
    "microsoft_365",
  );

  if (!integration) {
    return;
  }

  await runIntegrationSync({
    integrationId: integration.id,
    triggerType: "manual",
  });
}
