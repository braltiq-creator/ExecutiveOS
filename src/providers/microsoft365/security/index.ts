export {
  M365_SECURITY_CONTROLS,
  LEAST_PRIVILEGE_SCOPES,
  createSecurityContext,
  assertTenantIsolation,
  assertLeastPrivilege,
  assertNoPlaintextCredentials,
  recordAudit,
  rotateSecret,
} from "@/providers/microsoft365/security/controls";
export type {
  M365SecurityControl,
  SecurityAuditEntry,
  M365SecurityContext,
} from "@/providers/microsoft365/security/controls";
