export {
  ENTRA_AUTHORITY_COMMON,
  ENTRA_AUTHORITY_ORGANIZATIONS,
  PRODUCTION_GRAPH_SCOPES,
  createPkcePair,
  buildAuthorizationRequest,
  createMockTokenTransport,
  exchangeAuthorizationCode,
  refreshAccessToken,
  validateAccessToken,
  discoverTenantFromIss,
  createAuthSession,
  logoutSession,
} from "@/providers/microsoft365/auth/entra";
export type {
  PkcePair,
  EntraAppRegistration,
  AuthorizationRequest,
  TokenSet,
  EncryptedTokenSet,
  AuthSession,
  TokenEndpointTransport,
} from "@/providers/microsoft365/auth/entra";

export { createTokenVault } from "@/providers/microsoft365/auth/vault";
export type { TokenVault } from "@/providers/microsoft365/auth/vault";
