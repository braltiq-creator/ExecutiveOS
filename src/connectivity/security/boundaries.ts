/**
 * Security boundaries for the connectivity platform.
 */

export const CONNECTIVITY_SECURITY_RULES = [
  "Vendor-specific objects never escape the connector boundary",
  "Secrets are referenced by opaque refs — never logged or returned in events",
  "BusinessEvents are the only enterprise language above connectors",
  "Authentication strategies are reusable and connector-agnostic",
  "Connector failures are isolated — one connector cannot poison another",
  "Webhooks require verification and idempotency",
  "Dead-letter queues retain failed payloads for controlled replay",
] as const;

export type SecurityCheckResult = {
  ok: boolean;
  violations: string[];
};

export function assertNoVendorLeakage(payload: Record<string, unknown>): SecurityCheckResult {
  const banned = ["sapObject", "maximoObject", "vendorPayload", "_raw", "odata"];
  const violations = Object.keys(payload).filter((k) => banned.includes(k));
  return {
    ok: violations.length === 0,
    violations: violations.map((k) => `Vendor key leaked: ${k}`),
  };
}

export function assertSecretNotInEvent(eventPayload: Record<string, unknown>): SecurityCheckResult {
  const secretKeys = [
    "clientSecret",
    "password",
    "apiKey",
    "accessToken",
    "refreshToken",
    "privateKey",
  ];
  const violations = Object.keys(eventPayload).filter((k) =>
    secretKeys.some((s) => k.toLowerCase().includes(s.toLowerCase())),
  );
  return {
    ok: violations.length === 0,
    violations: violations.map((k) => `Secret-like field in event: ${k}`),
  };
}
