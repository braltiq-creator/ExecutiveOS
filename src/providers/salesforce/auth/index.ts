export {
  SALESFORCE_OAUTH_SCOPES,
  createSalesforceTokenVault,
  validateSalesforceCredentials,
  createSalesforceAuthSession,
  logoutSalesforceSession,
  refreshSalesforceOAuth,
} from "@/providers/salesforce/auth/credentials";
export type {
  SalesforceAuthStrategy,
  SalesforceOAuthCredentials,
  EncryptedSalesforceCredentials,
  SalesforceAuthSession,
  SalesforceTokenVault,
} from "@/providers/salesforce/auth/credentials";
