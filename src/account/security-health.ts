import { listOrganisationApiKeys } from "@/account/api-keys";
import { getMfaStatus } from "@/account/mfa";
import { listSessions } from "@/account/sessions";
import type { SecurityHealth } from "@/account/types";

export function assessSecurityHealth(input: {
  accountId: string;
  organisationId: string;
}): SecurityHealth {
  const mfa = getMfaStatus(input.accountId);
  const sessions = listSessions(input.accountId);
  const keys = listOrganisationApiKeys(input.organisationId);
  const findings: string[] = [];
  let score = 70;

  if (mfa.enabled) {
    score += 15;
  } else {
    findings.push("Enable MFA for the account owner");
    score -= 10;
  }

  if (sessions.every((s) => s.trusted)) {
    score += 5;
  } else {
    findings.push("Review untrusted devices");
  }

  if (keys.some((k) => k.status === "active")) {
    score += 5;
  } else {
    findings.push("No active API keys — create one if integrations need them");
  }

  score = Math.max(0, Math.min(100, score));
  const grade =
    score >= 85 ? "strong" : score >= 65 ? "good" : "needs_attention";

  if (findings.length === 0) {
    findings.push("Security posture is healthy");
  }

  return { score, grade, findings };
}
