"use server";

import {
  acknowledgeOpsAlert,
  resolveOpsAlert,
  recordSupportIssue,
  updateSupportIssue,
  upsertPartnerOpsRecord,
  getPartnerOpsRecord,
  addOpsNote,
  createOpsTask,
  completeOpsTask,
  recordPartnerReview,
  syncPartnersFromPilots,
} from "@/operations";
import type { ReviewMilestone, SupportSeverity } from "@/operations";

export async function acknowledgeAlertAction(input: {
  id: string;
  by: string;
}): Promise<{ ok: boolean; message: string }> {
  const alert = acknowledgeOpsAlert(input);
  if (!alert) return { ok: false, message: "Alert not found" };
  return { ok: true, message: `Acknowledged: ${alert.title}` };
}

export async function resolveAlertAction(input: {
  id: string;
}): Promise<{ ok: boolean; message: string }> {
  const alert = resolveOpsAlert(input);
  if (!alert) return { ok: false, message: "Alert not found" };
  return { ok: true, message: `Resolved: ${alert.title}` };
}

export async function recordSupportIssueAction(input: {
  tenantId: string;
  title: string;
  severity: SupportSeverity;
  owner: string;
  category: string;
}): Promise<{ ok: boolean; message: string }> {
  const issue = recordSupportIssue(input);
  return { ok: true, message: `Recorded issue ${issue.id}` };
}

export async function resolveSupportIssueAction(input: {
  id: string;
  resolution: string;
  rootCause?: string;
}): Promise<{ ok: boolean; message: string }> {
  const issue = updateSupportIssue({
    id: input.id,
    status: "resolved",
    resolution: input.resolution,
    rootCause: input.rootCause,
  });
  if (!issue) return { ok: false, message: "Issue not found" };
  return { ok: true, message: `Resolved ${issue.id}` };
}

export async function updatePartnerCsAction(input: {
  tenantId: string;
  customerSuccessManager?: string;
  implementationOwner?: string;
  executiveSponsor?: string;
  nextReviewDate?: string | null;
  successPlan?: string;
}): Promise<{ ok: boolean; message: string }> {
  const existing = getPartnerOpsRecord(input.tenantId);
  if (!existing) {
    syncPartnersFromPilots();
  }
  const partner = getPartnerOpsRecord(input.tenantId);
  if (!partner) return { ok: false, message: "Partner not found" };
  upsertPartnerOpsRecord({ ...partner, ...input });
  return { ok: true, message: `Updated CS plan for ${partner.companyName}` };
}

export async function addMeetingNoteAction(input: {
  tenantId: string;
  author: string;
  body: string;
}): Promise<{ ok: boolean; message: string }> {
  addOpsNote({ ...input, kind: "meeting" });
  return { ok: true, message: "Note recorded" };
}

export async function createFollowUpTaskAction(input: {
  tenantId: string;
  title: string;
  owner: string;
  dueAt?: string | null;
}): Promise<{ ok: boolean; message: string }> {
  const task = createOpsTask(input);
  return { ok: true, message: `Task ${task.id} created` };
}

export async function completeFollowUpTaskAction(input: {
  id: string;
}): Promise<{ ok: boolean; message: string }> {
  const task = completeOpsTask(input);
  if (!task) return { ok: false, message: "Task not found" };
  return { ok: true, message: "Task completed" };
}

export async function recordReviewAction(input: {
  tenantId: string;
  milestone: ReviewMilestone;
  conductedBy: string;
  achievements: string[];
  challenges: string[];
  featureRequests: string[];
  executiveFeedback: string;
  businessOutcomes: string[];
  nextActions: string[];
}): Promise<{ ok: boolean; message: string }> {
  const review = recordPartnerReview(input);
  return { ok: true, message: `Recorded ${review.milestone} review` };
}
