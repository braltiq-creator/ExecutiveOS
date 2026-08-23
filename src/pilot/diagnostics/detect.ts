/**
 * Automatic pilot diagnostics with remediation steps.
 */

import { buildValidationSuite } from "@/validation";
import type { DesignPartnerDashboard } from "@/validation";
import type { IntelligenceProfileId } from "@/profiles";
import { buildProviderChecklists } from "@/pilot/checklists";
import type { PilotDiagnostic, PilotProviderChecklist } from "@/pilot/types";

export function diagnosePilot(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  suite?: DesignPartnerDashboard;
  checklists?: PilotProviderChecklist[];
}): PilotDiagnostic[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const suite =
    input.suite ?? buildValidationSuite({ tenantId: input.tenantId, asOf });
  const checklists =
    input.checklists ??
    buildProviderChecklists({
      tenantId: input.tenantId,
      profileId: input.profileId,
      asOf,
    });
  const diagnostics: PilotDiagnostic[] = [];

  for (const checklist of checklists.filter((c) => c.required)) {
    const connect = checklist.items.find((i) => i.id.endsWith("-connect"));
    const permissions = checklist.items.find((i) =>
      i.id.endsWith("-permissions"),
    );
    const sync = checklist.items.find((i) => i.id.endsWith("-sync"));

    if (connect?.status !== "complete") {
      diagnostics.push({
        id: `diag-connect-${checklist.providerId}`,
        severity: "critical",
        title: `${checklist.label} not connected`,
        detail: connect?.detail ?? "Provider disconnected",
        remediation: [
          `Open Administration → ${checklist.label}`,
          "Complete authentication with least-privilege scopes",
          "Run initial full synchronisation",
        ],
        relatedProviderId: checklist.providerId,
      });
    } else if (permissions?.status !== "complete") {
      diagnostics.push({
        id: `diag-perms-${checklist.providerId}`,
        severity: "high",
        title: `${checklist.label} missing permissions`,
        detail: permissions?.detail ?? "Permissions incomplete",
        remediation: [
          "Re-consent the Connected App / OAuth scopes",
          "Verify least-privilege checklist in provider docs",
          "Re-run sync after consent",
        ],
        relatedProviderId: checklist.providerId,
      });
    } else if (sync?.status !== "complete") {
      diagnostics.push({
        id: `diag-sync-${checklist.providerId}`,
        severity: "high",
        title: `${checklist.label} sync unhealthy`,
        detail: sync?.detail ?? "Sync degraded",
        remediation: [
          "Inspect provider admin errors and retry queue",
          "Run incremental sync / CDC recovery",
          "Escalate if rate limits persist beyond 1 hour",
        ],
        relatedProviderId: checklist.providerId,
      });
    }
  }

  for (const provider of suite.providers.providers) {
    if (provider.status === "degraded") {
      diagnostics.push({
        id: `diag-health-${provider.providerId}`,
        severity: "moderate",
        title: `${provider.label} health degraded`,
        detail: provider.explanation,
        remediation: [
          "Review sync freshness and context generation",
          "Confirm credentials have not expired",
        ],
      });
    }
  }

  if (suite.coverage.overallCoveragePct < 50) {
    diagnostics.push({
      id: "diag-discovery-low",
      severity: "high",
      title: "Low discovery confidence / coverage",
      detail: `Coverage ${suite.coverage.overallCoveragePct}%`,
      remediation: [
        "Re-run Executive Discovery with required providers connected",
        "Ask executive to confirm low-confidence discoveries",
      ],
    });
  }

  if (suite.graphHealth.missingRelationships > 0 || suite.graphHealth.confidence < 55) {
    diagnostics.push({
      id: "diag-kg",
      severity: "moderate",
      title: "Knowledge Graph inconsistencies",
      detail: suite.graphHealth.explanation,
      remediation: [
        "Trigger provider sync to enrich relationships",
        "Review duplicate / conflicting evidence in Validation Suite",
      ],
    });
  }

  for (const request of suite.outstandingValidationRequests.slice(0, 5)) {
    diagnostics.push({
      id: `diag-val-${request.id}`,
      severity: request.priority === "high" ? "high" : "moderate",
      title: `Outstanding validation: ${request.label}`,
      detail: request.reason,
      remediation: [
        "Schedule a short validation session with the executive",
        "Confirm, edit, or ignore the discovery item",
      ],
    });
  }

  return diagnostics.sort((a, b) => {
    const order = { critical: 0, high: 1, moderate: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}
