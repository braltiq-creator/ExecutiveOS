import { createEmptyIntegrationsContext } from "@/lib/intelligence/context";
import { applyIntegrationContextPayload } from "@/lib/integrations/registry";
import { listConnectedIntegrations } from "@/lib/integrations/service";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import type { IntelligenceIntegrationsContext } from "@/types/intelligence";

export async function loadIntegrationsIntelligenceContext(
  userId: string,
): Promise<IntelligenceIntegrationsContext> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return createEmptyIntegrationsContext();
  }

  const connected = await listConnectedIntegrations(membership.organization.id);

  return connected.reduce((context, integration) => {
    const payload =
      integration.config_json.lastContextPayload &&
      typeof integration.config_json.lastContextPayload === "object"
        ? (integration.config_json.lastContextPayload as Record<string, unknown>)
        : { providerId: integration.provider_id };

    return applyIntegrationContextPayload(
      context,
      integration.provider_id,
      payload,
    );
  }, createEmptyIntegrationsContext());
}
