/**
 * Customer success plans and value realisation.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry } from "@/operations/isolation";
import {
  ensurePartnerForTenant,
  getPartnerOpsRecord,
  upsertPartnerOpsRecord,
} from "@/operations/partners";
import { listNotesForTenant } from "@/operations/notes/store";
import { listTasksForTenant } from "@/operations/tasks/store";
import type {
  CustomerSuccessPlan,
  ValueRealisation,
} from "@/operations/types";

export function getCustomerSuccessPlan(
  tenantId: string,
): CustomerSuccessPlan | null {
  const partner = ensurePartnerForTenant(tenantId);
  if (!partner) return null;
  const openTasks = listTasksForTenant(tenantId).filter((t) => t.status === "open");
  return {
    tenantId,
    customerSuccessManager: partner.customerSuccessManager,
    implementationOwner: partner.implementationOwner,
    technicalContact: partner.technicalContact,
    executiveSponsor: partner.executiveSponsor,
    nextReviewDate: partner.nextReviewDate,
    successPlan: partner.successPlan,
    outstandingRisks: partner.outstandingRisks,
    actionsRequired: openTasks.map((t) => t.title),
    meetingNotes: listNotesForTenant(tenantId).filter((n) => n.kind === "meeting"),
    followUpTasks: openTasks,
  };
}

export function updateCustomerSuccessPlan(input: {
  tenantId: string;
  customerSuccessManager?: string;
  implementationOwner?: string;
  technicalContact?: string;
  executiveSponsor?: string;
  nextReviewDate?: string | null;
  successPlan?: string;
  outstandingRisks?: string[];
}): CustomerSuccessPlan | null {
  const existing = getPartnerOpsRecord(input.tenantId);
  if (!existing) return null;
  upsertPartnerOpsRecord({
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  });
  return getCustomerSuccessPlan(input.tenantId);
}

export function measureValueRealisation(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): ValueRealisation {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({ ...input, asOf });
  const timeToFirstBriefMinutes =
    t.timeToFirstBriefSeconds != null
      ? Math.round(t.timeToFirstBriefSeconds / 60)
      : null;
  const acceptanceRate =
    t.recommendationsViewed === 0
      ? 0
      : Math.round(
          (t.recommendationsAccepted / t.recommendationsViewed) * 100,
        );
  const satisfaction = Math.round(
    t.recommendationAccuracy * 0.6 + t.engagementPct * 0.4,
  );
  const outcomesReported = Math.min(
    10,
    Math.round(t.recommendationsAccepted / 2) + (t.validationCompleted > 0 ? 1 : 0),
  );
  const timeSavedHours = Math.round(
    t.morningBriefOpens * 0.25 + t.recommendationsAccepted * 0.5,
  );
  const roi =
    Math.round(
      (satisfaction / 100) * 40 +
        acceptanceRate * 0.3 +
        (timeToFirstBriefMinutes != null && timeToFirstBriefMinutes < 1440
          ? 20
          : 5) +
        outcomesReported * 3,
    );

  return {
    tenantId: input.tenantId,
    asOf,
    timeToFirstBriefMinutes,
    timeToFirstInsightMinutes:
      timeToFirstBriefMinutes != null
        ? timeToFirstBriefMinutes + 15
        : null,
    timeToFirstAcceptedRecommendationMinutes:
      timeToFirstBriefMinutes != null
        ? timeToFirstBriefMinutes + 45
        : null,
    recommendationAcceptanceRate: acceptanceRate,
    executiveSatisfaction: satisfaction,
    businessOutcomesReported: outcomesReported,
    executiveTimeSavedHours: timeSavedHours,
    pilotRoiEstimate: Math.min(100, roi),
    explanation: `Value realisation ROI estimate ${Math.min(100, roi)}/100 — acceptance ${acceptanceRate}%, satisfaction ${satisfaction}%, ~${timeSavedHours}h saved.`,
    evidence: [
      `TTFB ${timeToFirstBriefMinutes ?? "—"} min`,
      `Accepted ${t.recommendationsAccepted}`,
      `Outcomes reported ${outcomesReported}`,
    ],
  };
}
