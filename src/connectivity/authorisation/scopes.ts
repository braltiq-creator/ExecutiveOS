/**
 * Authorisation — scopes and permission checks at the connector boundary.
 */

export type ConnectorScope =
  | "read:events"
  | "read:entities"
  | "write:webhooks"
  | "sync:full"
  | "sync:incremental"
  | "admin:disconnect";

export type AuthorisationDecision = {
  allowed: boolean;
  scope: ConnectorScope;
  reason: string;
};

export function hasScope(
  granted: string[] | undefined,
  required: ConnectorScope,
): AuthorisationDecision {
  const scopes = granted ?? [];
  if (scopes.includes(required) || scopes.includes("*")) {
    return { allowed: true, scope: required, reason: "Scope granted" };
  }
  return {
    allowed: false,
    scope: required,
    reason: `Missing scope: ${required}`,
  };
}

export function assertScopes(
  granted: string[] | undefined,
  required: ConnectorScope[],
): AuthorisationDecision[] {
  return required.map((scope) => hasScope(granted, scope));
}
