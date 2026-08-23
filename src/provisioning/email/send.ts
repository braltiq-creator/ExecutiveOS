/**
 * Mock email queue — templates rendered, delivery simulated.
 */

import { EMAIL_TEMPLATES } from "@/provisioning/email/templates";
import { nextEmailId, queueEmailRecord, listQueuedEmails } from "@/provisioning/store";
import type { EmailTemplateId, QueuedEmail } from "@/provisioning/types";

export function queueProvisioningEmail(input: {
  templateId: EmailTemplateId;
  to: string;
  tenantId?: string | null;
  vars: Record<string, string>;
  asOf?: string;
}): QueuedEmail {
  const template = EMAIL_TEMPLATES[input.templateId];
  const email: QueuedEmail = {
    id: nextEmailId(),
    templateId: input.templateId,
    to: input.to,
    tenantId: input.tenantId ?? null,
    subject: template.subject,
    body: template.render(input.vars),
    queuedAt: input.asOf ?? new Date().toISOString(),
    status: "queued",
  };
  return queueEmailRecord(email);
}

export function markEmailSent(emailId: string): QueuedEmail | undefined {
  const email = listQueuedEmails().find((e) => e.id === emailId);
  if (!email) return undefined;
  email.status = "sent";
  return email;
}

export function listProvisioningEmails(): QueuedEmail[] {
  return listQueuedEmails();
}
