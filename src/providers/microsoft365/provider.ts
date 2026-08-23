import type { BusinessEvent } from "@/connectors/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import {
  createMicrosoftGraphClient,
  type GraphClient,
} from "@/providers/microsoft365/graph";
import { syncCalendarContext } from "@/providers/microsoft365/calendar";
import { syncMailContext } from "@/providers/microsoft365/mail";
import { syncTeamsContext } from "@/providers/microsoft365/teams";
import {
  syncDocumentsContext,
  syncSharePointContext,
} from "@/providers/microsoft365/sharepoint";
import { syncPlannerContext } from "@/providers/microsoft365/planner";
import { syncContactsContext } from "@/providers/microsoft365/contacts";
import { syncPresenceContext } from "@/providers/microsoft365/presence";
import { syncFilesContext } from "@/providers/microsoft365/files";
import { enrichRelationshipGraph } from "@/providers/microsoft365/relationships";
import {
  boardReadinessFromSignals,
  deriveExecutiveSignals,
} from "@/providers/microsoft365/executive-context/signals";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";
import {
  assertTenantIsolation,
  createSecurityContext,
  recordAudit,
  type M365SecurityContext,
} from "@/providers/microsoft365/security";
import type { AuthCredentials } from "@/connectivity/authentication";

export type Microsoft365ProviderOptions = {
  tenantId?: string;
  credentials?: AuthCredentials;
  asOf?: string;
  client?: GraphClient;
};

export type Microsoft365ProviderResult = {
  brief: ExecutiveContextBrief;
  events: BusinessEvent[];
  security: M365SecurityContext;
  relationshipEnrichment?: {
    entitiesUpserted: number;
    relationshipsUpserted: number;
  };
};

/**
 * Production-quality Microsoft 365 Executive Context Provider.
 * Emits BusinessEvents + portable ExecutiveContextBrief — never Microsoft objects.
 */
export async function syncMicrosoft365ExecutiveContext(input: {
  options?: Microsoft365ProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
}): Promise<Microsoft365ProviderResult> {
  const asOf = input.options?.asOf ?? input.snapshot?.asOf ?? new Date().toISOString();
  const tenantId = input.options?.tenantId ?? "northline-tenant";
  let security = createSecurityContext({ tenantId });

  const isolation = assertTenantIsolation(security, tenantId);
  if (!isolation.ok) {
    throw new Error(isolation.message);
  }

  const credentials: AuthCredentials = input.options?.credentials ?? {
    strategy: "oauth2",
    clientId: "executiveos-m365",
    clientSecretRef: "secret:m365",
    scopes: [...security.leastPrivilegeScopes],
  };

  const client =
    input.options?.client ??
    createMicrosoftGraphClient({
      tenantId,
      credentials,
      asOf,
    });

  const auth = client.authenticate();
  security = recordAudit(
    security,
    "authenticate",
    auth.message,
    asOf,
  );
  if (!auth.ok) {
    throw new Error(`M365 authentication failed: ${auth.message}`);
  }

  const [
    calendar,
    mail,
    teams,
    sharepoint,
    documents,
    planner,
    contacts,
    presence,
    files,
  ] = await Promise.all([
    syncCalendarContext(client, asOf),
    syncMailContext(client, asOf),
    syncTeamsContext(client, asOf),
    syncSharePointContext(client, asOf),
    syncDocumentsContext(client, asOf),
    syncPlannerContext(client, asOf),
    syncContactsContext(client, asOf),
    syncPresenceContext(client, asOf),
    syncFilesContext(client, asOf),
  ]);

  // Dedupe documents from sharepoint + documents + OneDrive
  const documentsMerged = [
    ...sharepoint.documents,
    ...documents.documents.filter(
      (d) => !sharepoint.documents.some((s) => s.id === d.id),
    ),
    ...files.documents.filter(
      (d) =>
        !sharepoint.documents.some((s) => s.title === d.title) &&
        !documents.documents.some((s) => s.title === d.title),
    ),
  ];

  const signals = deriveExecutiveSignals({
    commitments: calendar.commitments,
    stakeholders: contacts.stakeholders,
    communicationsCount: mail.communications.length,
    availability: presence.availability,
    snapshot: input.snapshot,
  });

  const boardReadiness = boardReadinessFromSignals(signals, calendar.commitments);
  const upcomingDecisionIds = [
    ...new Set([
      ...calendar.commitments.flatMap((c) => c.relatedDecisionIds),
      ...(input.snapshot?.decisions
        .filter((d) => d.priority === "immediate" || d.priority === "today")
        .map((d) => d.id) ?? []),
    ]),
  ].slice(0, 6);

  const brief: ExecutiveContextBrief = {
    asOf,
    providerId: "microsoft365",
    framing: [
      "Executive context from the working day — commitments, relationships, and readiness.",
      `Board: ${boardReadiness.label}.`,
      `${calendar.commitments.length} commitment(s), ${contacts.stakeholders.length} key relationship(s).`,
    ].join(" "),
    commitments: calendar.commitments,
    signals,
    stakeholders: contacts.stakeholders,
    documents: documentsMerged,
    conversations: teams.conversations,
    communications: mail.communications,
    initiativeProgress: planner.initiativeProgress,
    boardReadiness,
    upcomingDecisionIds,
    closingNote:
      "This is executive context, not a Microsoft inbox. Replace the provider — keep the brief shape.",
  };

  const events: BusinessEvent[] = [
    ...calendar.events,
    ...mail.events,
    ...teams.events,
    ...sharepoint.events,
    ...planner.events,
    ...contacts.events,
    ...presence.events,
    ...files.events,
  ];

  if (input.twin) {
    input.twin.apply(events);
    security = recordAudit(
      security,
      "publish_business_events",
      `Applied ${events.length} BusinessEvents to Digital Twin`,
      asOf,
    );
  }

  let relationshipEnrichment;
  if (input.graph) {
    relationshipEnrichment = enrichRelationshipGraph(input.graph, brief);
    security = recordAudit(
      security,
      "enrich_relationships",
      `Upserted ${relationshipEnrichment.entitiesUpserted} entities`,
      asOf,
    );
  }

  return { brief, events, security, relationshipEnrichment };
}

/** Deterministic sync builder for snapshot pipeline (no Promise required). */
export function buildExecutiveContextBriefFromMock(input: {
  options?: Microsoft365ProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
}): Microsoft365ProviderResult {
  const asOf = input.options?.asOf ?? input.snapshot?.asOf ?? "2026-07-26T07:30:00+10:00";
  const tenantId = input.options?.tenantId ?? "northline-tenant";
  const security = createSecurityContext({ tenantId });

  // Use a tiny inline deterministic fixture mirroring mock Graph
  const commitments = [
    {
      id: "commit-m365-board-q3",
      title: "Board Strategy Review",
      kind: "governance_event" as const,
      startsAt: "2026-07-26T09:00:00.000Z",
      endsAt: "2026-07-26T11:00:00.000Z",
      stakeholders: ["Alex", "Chair"],
      relatedDecisionIds: ["decision-residency"],
      relatedOutcomeIds: ["outcome-enterprise-arr"],
      preparationRisk: "high" as const,
      whyItMatters:
        '"Board Strategy Review" is a board/governance commitment — preparation quality affects board readiness.',
    },
    {
      id: "commit-m365-elt-ops",
      title: "ELT Operating Review",
      kind: "strategic_coordination" as const,
      startsAt: "2026-07-26T14:00:00.000Z",
      endsAt: "2026-07-26T15:00:00.000Z",
      stakeholders: ["Alex", "COO"],
      relatedDecisionIds: [],
      relatedOutcomeIds: [],
      preparationRisk: "moderate" as const,
      whyItMatters:
        '"ELT Operating Review" coordinates leadership on strategic priorities.',
    },
  ];

  const stakeholders = [
    {
      id: "stakeholder-person-chair",
      name: "Board Chair",
      roleHint: "Chair",
      relationship: "board" as const,
      lastTouchAt: asOf,
      neglectRisk: true,
      relatedEntityIds: [],
    },
    {
      id: "stakeholder-person-helix",
      name: "Helix Sponsor",
      roleHint: "CIO",
      relationship: "customer" as const,
      lastTouchAt: asOf,
      neglectRisk: true,
      relatedEntityIds: ["customer-helix"],
    },
  ];

  const signals = deriveExecutiveSignals({
    commitments,
    stakeholders,
    communicationsCount: 1,
    availability: "Busy",
    snapshot: input.snapshot,
  });

  const brief: ExecutiveContextBrief = {
    asOf,
    providerId: "microsoft365",
    framing:
      "Executive context from the working day — commitments, relationships, and readiness. Board preparation needs attention before 08:00.",
    commitments,
    signals,
    stakeholders,
    documents: [
      {
        id: "doc-doc-board-pack",
        title: "Q3 Board Pack.docx",
        kind: "board_pack",
        whyItMatters: "Board pack is critical evidence for governance readiness.",
        relatedDecisionIds: ["decision-residency"],
        relatedOutcomeIds: [],
      },
    ],
    conversations: [
      {
        id: "collab-teams-helix",
        topic: "Helix renewal risk",
        channel: "teams",
        summary:
          "Collaboration signal indicating active executive coordination — preview redacted.",
        stakeholders: [],
        relatedInitiativeIds: ["initiative-reduce_customer_churn"],
        urgency: "high",
      },
    ],
    communications: [
      {
        id: "comm-mail-board-pack",
        subject: "Board pack draft for review",
        from: "CoS",
        receivedAt: asOf,
        attention: "critical",
        whyItMatters:
          "Board-related communication requiring executive attention before the meeting.",
        relatedDecisionIds: ["decision-residency"],
      },
    ],
    initiativeProgress: [
      {
        id: "init-progress-task-cash",
        title: "Close cash conversion actions",
        progressHint: "40% complete",
        relatedInitiativeIds: ["initiative-improve_cash_flow"],
        status: "watch",
      },
    ],
    boardReadiness: boardReadinessFromSignals(signals, commitments),
    upcomingDecisionIds: ["decision-residency"],
    closingNote:
      "This is executive context, not a Microsoft inbox. Replace the provider — keep the brief shape.",
  };

  return {
    brief,
    events: [],
    security,
  };
}
