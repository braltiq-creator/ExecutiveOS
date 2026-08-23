import { decryptOAuthTokens } from "@/lib/integrations/oauth";
import type { ProviderRuntimeContext } from "@/lib/integrations/provider";
import {
  fetchIntegrationProviderById,
  fetchOAuthTokens,
} from "@/lib/integrations/queries";
import type { OrganizationIntegrationRecord } from "@/lib/integrations/types";
import { IntegrationError } from "@/lib/integrations/types";

export async function buildProviderRuntimeContext(
  integration: OrganizationIntegrationRecord,
): Promise<ProviderRuntimeContext> {
  const provider = await fetchIntegrationProviderById(integration.provider_id);

  if (!provider) {
    throw new IntegrationError("Integration provider not found.", "PROVIDER_NOT_FOUND");
  }

  const tokenRecord = await fetchOAuthTokens(integration.id);

  return {
    integration,
    provider,
    tokens: tokenRecord ? decryptOAuthTokens(tokenRecord) : null,
  };
}
