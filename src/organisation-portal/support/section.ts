import type { SupportSection } from "@/organisation-portal/types";

export function buildSupportSection(): SupportSection {
  return {
    knowledgeBaseUrl: "/organisation/support#knowledge-base",
    releaseNotesUrl: "/organisation/support#release-notes",
    raiseRequestUrl: "/organisation/support#request",
    training: [
      "First 15 minutes with ExecutiveOS",
      "Connecting Microsoft 365",
      "Reading your Executive Brief",
      "Working with Executive Council",
    ],
    videos: [
      "Morning Command Centre walkthrough",
      "Organisation Portal tour",
      "Intelligence Packs explained",
    ],
    designPartnerResources: [
      "Design Partner success checklist",
      "Executive discovery guide",
      "Office hours calendar",
    ],
  };
}
