/**
 * Enterprise identity providers — SSO / MFA / JIT / SCIM ready.
 */

export const IDENTITY_PROVIDERS = [
  "microsoft_entra_id",
  "okta",
  "google_identity",
  "ping_identity",
  "auth0",
  "saml_future",
] as const;

export type IdentityProviderId = (typeof IDENTITY_PROVIDERS)[number];

export type IdentityCapability =
  | "sso"
  | "mfa"
  | "jit_provisioning"
  | "scim"
  | "directory_sync";

export type IdentityProviderConfig = {
  id: IdentityProviderId;
  label: string;
  enabled: boolean;
  capabilities: IdentityCapability[];
  tenantId: string;
  metadataUrl?: string;
  clientIdRef?: string;
};

export type RuntimeIdentity = {
  userId: string;
  email: string;
  displayName: string;
  provider: IdentityProviderId | "local";
  mfaSatisfied: boolean;
  externalSubject?: string;
  groups: string[];
  provisionedAt: string;
};

export const IDENTITY_PROVIDER_CATALOGUE: Record<
  IdentityProviderId,
  { label: string; capabilities: IdentityCapability[] }
> = {
  microsoft_entra_id: {
    label: "Microsoft Entra ID",
    capabilities: ["sso", "mfa", "jit_provisioning", "scim", "directory_sync"],
  },
  okta: {
    label: "Okta",
    capabilities: ["sso", "mfa", "jit_provisioning", "scim", "directory_sync"],
  },
  google_identity: {
    label: "Google Identity",
    capabilities: ["sso", "mfa", "jit_provisioning", "directory_sync"],
  },
  ping_identity: {
    label: "Ping Identity",
    capabilities: ["sso", "mfa", "jit_provisioning", "scim"],
  },
  auth0: {
    label: "Auth0",
    capabilities: ["sso", "mfa", "jit_provisioning", "scim"],
  },
  saml_future: {
    label: "Future SAML Provider",
    capabilities: ["sso", "mfa", "jit_provisioning"],
  },
};

export function createIdentityProviderConfig(input: {
  id: IdentityProviderId;
  tenantId: string;
  enabled?: boolean;
}): IdentityProviderConfig {
  const catalog = IDENTITY_PROVIDER_CATALOGUE[input.id];
  return {
    id: input.id,
    label: catalog.label,
    enabled: input.enabled ?? true,
    capabilities: catalog.capabilities,
    tenantId: input.tenantId,
    clientIdRef: `secret:idp-${input.id}`,
  };
}

/** Just-in-time provisioning from IdP assertion — deterministic mock. */
export function provisionIdentityJustInTime(input: {
  email: string;
  displayName: string;
  provider: IdentityProviderId;
  groups?: string[];
  asOf?: string;
}): RuntimeIdentity {
  return {
    userId: `user-${input.email.split("@")[0]}`,
    email: input.email,
    displayName: input.displayName,
    provider: input.provider,
    mfaSatisfied: true,
    externalSubject: `${input.provider}:${input.email}`,
    groups: input.groups ?? [],
    provisionedAt: input.asOf ?? new Date().toISOString(),
  };
}
