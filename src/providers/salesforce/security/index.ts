export {
  SALESFORCE_SECURITY_CONTROLS,
  SALESFORCE_LEAST_PRIVILEGE_SCOPES,
  createSalesforceSecurityContext,
  assertSalesforceTenantIsolation,
  assertSalesforceLeastPrivilege,
  assertNoPlaintextSalesforceCredentials,
  recordSalesforceAudit,
  rotateSalesforceSecret,
} from "@/providers/salesforce/security/controls";
export type {
  SalesforceSecurityControl,
  SalesforceSecurityAuditEntry,
  SalesforceSecurityContext,
} from "@/providers/salesforce/security/controls";
