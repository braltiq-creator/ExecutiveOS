/**
 * Email templates for self-service provisioning lifecycle.
 */

import type { EmailTemplateId } from "@/provisioning/types";

export type EmailTemplate = {
  id: EmailTemplateId;
  subject: string;
  render: (vars: Record<string, string>) => string;
};

export const EMAIL_TEMPLATES: Record<EmailTemplateId, EmailTemplate> = {
  welcome: {
    id: "welcome",
    subject: "Welcome to ExecutiveOS",
    render: (v) =>
      `Hi ${v.name},\n\nYour ExecutiveOS workspace for ${v.company} is ready.\nStart onboarding: ${v.onboardingUrl}\n\nConfidence Through Clarity.`,
  },
  verify_email: {
    id: "verify_email",
    subject: "Verify your ExecutiveOS email",
    render: (v) =>
      `Hi ${v.name},\n\nVerify your email to secure your trial:\n${v.verifyUrl}\n`,
  },
  connect_microsoft_365: {
    id: "connect_microsoft_365",
    subject: "Connect Microsoft 365 to ExecutiveOS",
    render: (v) =>
      `Hi ${v.name},\n\nConnect Microsoft 365 so ExecutiveOS can discover your organisation automatically:\n${v.connectUrl}\n`,
  },
  connect_simpro: {
    id: "connect_simpro",
    subject: "Connect Simpro to ExecutiveOS",
    render: (v) =>
      `Hi ${v.name},\n\nConnect Simpro for operational intelligence:\n${v.connectUrl}\n`,
  },
  connect_salesforce: {
    id: "connect_salesforce",
    subject: "Connect Salesforce to ExecutiveOS",
    render: (v) =>
      `Hi ${v.name},\n\nConnect Salesforce for commercial intelligence:\n${v.connectUrl}\n`,
  },
  trial_reminder: {
    id: "trial_reminder",
    subject: "Your ExecutiveOS trial ends soon",
    render: (v) =>
      `Hi ${v.name},\n\nYour trial for ${v.company} has ${v.daysRemaining} days remaining.\nUpgrade: ${v.upgradeUrl}\n`,
  },
  executive_brief_ready: {
    id: "executive_brief_ready",
    subject: "Your Executive Brief is ready",
    render: (v) =>
      `Hi ${v.name},\n\nYour first Executive Brief is ready:\n${v.briefUrl}\n`,
  },
  subscription_confirmation: {
    id: "subscription_confirmation",
    subject: "ExecutiveOS subscription confirmed",
    render: (v) =>
      `Hi ${v.name},\n\nSubscription confirmed for ${v.company} (${v.plan}).\nThank you.`,
  },
};

export function listEmailTemplateIds(): EmailTemplateId[] {
  return Object.keys(EMAIL_TEMPLATES) as EmailTemplateId[];
}
