/**
 * Implementation playbooks for Design Partner profiles.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type PilotPlaybook = {
  id: string;
  profileId: IntelligenceProfileId;
  title: string;
  preparation: string[];
  deployment: string[];
  validation: string[];
  successCriteria: string[];
  commonIssues: Array<{ issue: string; response: string }>;
  escalation: string[];
};

export const OPERATIONS_EXECUTIVE_PLAYBOOK: PilotPlaybook = {
  id: "playbook-operations-executive",
  profileId: "operations_executive",
  title: "Operations Executive Implementation Playbook",
  preparation: [
    "Confirm Design Partner sponsor (MD / COO / Owner)",
    "Collect Simpro company ID and admin contact",
    "Collect Microsoft Entra tenant admin for consent",
    "Schedule 45-minute discovery + validation workshop",
  ],
  deployment: [
    "Provision tenant with Operations Executive template",
    "Connect Microsoft 365 and grant least-privilege scopes",
    "Connect Simpro (API key or OAuth) and run full sync",
    "Run Executive Discovery; confirm recommended profile",
    "Clear outstanding validation requests with the executive",
  ],
  validation: [
    "Confirm Operational Context appears on Today",
    "Confirm jobs at risk / capacity / cash collection are populated",
    "Run Operations profile validation scenarios",
    "Achieve Pilot Readiness Score ≥ 70",
  ],
  successCriteria: [
    "First Executive Brief within one business day of provider connect",
    "Executive opens Today on ≥3 of first 5 weekdays",
    "At least one recommendation marked useful",
    "No critical diagnostics outstanding",
  ],
  commonIssues: [
    {
      issue: "Simpro sync empty jobs",
      response: "Verify company ID and API permissions; re-run full sync",
    },
    {
      issue: "M365 consent blocked",
      response: "Escalate to partner IT admin; use least-privilege scope list",
    },
    {
      issue: "Low discovery coverage",
      response: "Ensure both providers connected before Discovery; re-run",
    },
  ],
  escalation: [
    "Provider auth failures > 2 hours → Engineering on-call",
    "Executive cannot find operational value → CS lead + product review",
    "Data residency concerns → Compliance checklist before go-live",
  ],
};

export const COMMERCIAL_EXECUTIVE_PLAYBOOK: PilotPlaybook = {
  id: "playbook-commercial-executive",
  profileId: "commercial_executive",
  title: "Commercial Executive Implementation Playbook",
  preparation: [
    "Confirm Design Partner sponsor (CEO / CRO / VP Sales)",
    "Collect Salesforce org ID and Connected App owner",
    "Collect Microsoft Entra tenant admin for consent",
    "Schedule forecast / pipeline validation workshop",
  ],
  deployment: [
    "Provision tenant with Commercial Executive template",
    "Connect Microsoft 365 and grant least-privilege scopes",
    "Connect Salesforce Connected App; enable CDC",
    "Run Executive Discovery; confirm Commercial profile",
    "Clear outstanding validation requests with the executive",
  ],
  validation: [
    "Confirm Commercial Context appears on Today",
    "Confirm forecast confidence / strategic accounts populated",
    "Run Commercial profile validation scenarios",
    "Achieve Pilot Readiness Score ≥ 70",
  ],
  successCriteria: [
    "First Executive Brief within one business day of provider connect",
    "CRO/CEO engages with commercial recommendations in week one",
    "Forecast risk visible without Salesforce terminology",
    "No critical diagnostics outstanding",
  ],
  commonIssues: [
    {
      issue: "Salesforce token expired",
      response: "Refresh via Connected App; confirm refresh token policy",
    },
    {
      issue: "CDC gaps",
      response: "Recover from replay ID; run CDC sync from Admin → Salesforce",
    },
    {
      issue: "Empty pipeline brief",
      response: "Verify Opportunity object access; re-run full sync",
    },
  ],
  escalation: [
    "Connected App / OAuth failures → Engineering on-call",
    "Forecast trust issues → CS + product commercial review",
    "Security review requested → share Permissions + Connected App guides",
  ],
};

export function getPlaybook(profileId: IntelligenceProfileId): PilotPlaybook {
  return profileId === "commercial_executive"
    ? COMMERCIAL_EXECUTIVE_PLAYBOOK
    : OPERATIONS_EXECUTIVE_PLAYBOOK;
}

export function listPlaybooks(): PilotPlaybook[] {
  return [OPERATIONS_EXECUTIVE_PLAYBOOK, COMMERCIAL_EXECUTIVE_PLAYBOOK];
}
