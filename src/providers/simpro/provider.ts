/**
 * Simpro Executive Context Provider — production sync → portable operational brief.
 */

import type { BusinessEvent } from "@/connectors/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import {
  createSimproApiClient,
  type SimproApiClient,
} from "@/providers/simpro/api";
import type { SimproCredentials } from "@/providers/simpro/auth";
import { syncJobs } from "@/providers/simpro/jobs";
import { syncQuotes } from "@/providers/simpro/quotes";
import { syncCustomers } from "@/providers/simpro/customers";
import { syncSites } from "@/providers/simpro/sites";
import { syncAssets } from "@/providers/simpro/assets";
import { syncTechnicians } from "@/providers/simpro/technicians";
import { syncProjects } from "@/providers/simpro/projects";
import { syncWorkOrders } from "@/providers/simpro/workorders";
import { syncPurchaseOrders } from "@/providers/simpro/purchase-orders";
import { syncInvoices } from "@/providers/simpro/invoices";
import { syncScheduling } from "@/providers/simpro/scheduling";
import { syncTimesheets } from "@/providers/simpro/timesheets";
import {
  computeFieldProductivity,
  computeServicePerformance,
  computeOperationalOpportunities,
} from "@/providers/simpro/analytics";
import {
  deriveOperationalSignals,
  operationalHealthFromSignals,
} from "@/providers/simpro/executive-context/signals";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";
import {
  assertSimproTenantIsolation,
  createSimproSecurityContext,
  recordSimproAudit,
  type SimproSecurityContext,
} from "@/providers/simpro/security";
import { enrichOperationalGraph } from "@/providers/simpro/relationships";

export type SimproProviderOptions = {
  executiveosTenantId?: string;
  companyId?: string;
  credentials?: SimproCredentials;
  client?: SimproApiClient;
  asOf?: string;
  modifiedSince?: string;
};

export type SimproProviderResult = {
  brief: OperationalContextBrief;
  events: BusinessEvent[];
  security: SimproSecurityContext;
  relationshipEnrichment?: {
    entitiesUpserted: number;
    relationshipsUpserted: number;
  };
};

export async function syncSimproExecutiveContext(input: {
  options?: SimproProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
}): Promise<SimproProviderResult> {
  const asOf =
    input.options?.asOf ?? input.snapshot?.asOf ?? new Date().toISOString();
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const companyId = input.options?.companyId ?? "northline-simpro";
  let security = createSimproSecurityContext({
    tenantId: executiveosTenantId,
    companyId,
  });

  const isolation = assertSimproTenantIsolation(security, executiveosTenantId);
  if (!isolation.ok) throw new Error(isolation.message);

  const credentials: SimproCredentials = input.options?.credentials ?? {
    strategy: "api_key",
    apiKeyRef: "vault:simpro-api-key",
    apiKey: "mock-simpro-key",
  };

  const client =
    input.options?.client ??
    createSimproApiClient({
      companyId,
      getCredentials: () => credentials,
      asOf,
    });

  security = recordSimproAudit(security, "authenticate", "Simpro client ready", asOf);

  const modifiedSince = input.options?.modifiedSince;
  const [
    jobs,
    quotes,
    customers,
    sites,
    assets,
    technicians,
    projects,
    workorders,
    purchaseOrders,
    invoices,
    scheduling,
    timesheets,
  ] = await Promise.all([
    syncJobs(client, asOf, modifiedSince),
    syncQuotes(client, asOf, modifiedSince),
    syncCustomers(client, asOf),
    syncSites(client, asOf),
    syncAssets(client, asOf),
    syncTechnicians(client, asOf),
    syncProjects(client, asOf),
    syncWorkOrders(client, asOf, modifiedSince),
    syncPurchaseOrders(client, asOf),
    syncInvoices(client, asOf),
    syncScheduling(client, asOf),
    syncTimesheets(client, asOf, modifiedSince),
  ]);

  const signals = deriveOperationalSignals({
    openJobs: jobs.openJobs,
    criticalJobs: jobs.criticalJobs,
    availableTechnicians: technicians.available,
    unavailableTechnicians: technicians.unavailable,
    acceptedQuotesValue: quotes.acceptedValue,
    openOpportunities: quotes.openOpportunities,
    overdueInvoices: invoices.overdueCount,
    overdueValue: invoices.overdueValue,
    delayedPurchaseOrders: purchaseOrders.delayed,
    marginRiskCount: projects.marginRiskCount,
    unavailableAssets: assets.unavailable,
    overloadedDays: scheduling.overloadedDays,
  });

  const operationalHealth = operationalHealthFromSignals(signals);
  const utilisedPct =
    technicians.available + technicians.unavailable === 0
      ? 0
      : Math.round(
          (jobs.openJobs /
            Math.max(1, (technicians.available + technicians.unavailable) * 4)) *
            100,
        );

  const completedToday = jobs.events.filter(
    (e) => e.payload.executiveMeaning === "Service Delivered",
  ).length;

  const fieldProductivity = computeFieldProductivity({
    availableTechnicians: technicians.available,
    unavailableTechnicians: technicians.unavailable,
    openJobs: jobs.openJobs,
    completedToday,
    overtimeHours: timesheets.overtimeHours,
    productiveHours: timesheets.productiveHours,
  });

  const servicePerformance = computeServicePerformance({
    openJobs: jobs.openJobs,
    criticalJobs: jobs.criticalJobs,
    completedToday,
    delayedJobs: jobs.delayedJobs,
  });

  const operationalOpportunities = computeOperationalOpportunities({
    acceptedQuotesValue: quotes.acceptedValue,
    availableTechnicians: technicians.available,
    openJobs: jobs.openJobs,
  });

  const customerRisks = jobs.events
    .filter(
      (e) =>
        e.payload.executiveMeaning === "Customer Delivery Risk Increased" ||
        e.payload.executiveMeaning === "Customer Satisfaction Risk Increased",
    )
    .slice(0, 5)
    .map((e, index) => ({
      id: `cust-risk-${index}`,
      customerName: String(e.payload.customer ?? "Customer"),
      risk: String(e.payload.title ?? "Delivery risk"),
      severity: "high" as const,
      relatedEntityIds: [e.entityId],
    }));

  if (invoices.overdueCount > 0) {
    customerRisks.push({
      id: "cust-risk-cash",
      customerName: "Collections",
      risk: `$${invoices.overdueValue.toLocaleString()} overdue`,
      severity: "high",
      relatedEntityIds: [],
    });
  }

  const criticalCustomers = customerRisks.filter(
    (r) => r.severity === "high" || r.severity === "critical",
  );

  const bottlenecks = [
    ...(purchaseOrders.delayed > 0
      ? [
          {
            id: "bn-supply",
            title: "Supply chain delay",
            kind: "supply" as const,
            impact: `${purchaseOrders.delayed} purchase order(s) delayed`,
          },
        ]
      : []),
    ...(scheduling.overloadedDays > 0
      ? [
          {
            id: "bn-sched",
            title: "Schedule saturation",
            kind: "scheduling" as const,
            impact: "Field schedule overloaded in the current window",
          },
        ]
      : []),
    ...(technicians.unavailable > 0
      ? [
          {
            id: "bn-capacity",
            title: "Technician shortage",
            kind: "capacity" as const,
            impact: `${technicians.unavailable} technician(s) unavailable`,
          },
        ]
      : []),
  ];

  const recommendations = [
    ...(jobs.criticalJobs > 0
      ? [
          {
            id: "rec-critical",
            title: "Escalate critical service commitments",
            why: `${jobs.criticalJobs} critical job(s) threaten customer delivery.`,
            urgency: "now" as const,
          },
        ]
      : []),
    ...(invoices.overdueCount > 0
      ? [
          {
            id: "rec-cash",
            title: "Chase overdue collections",
            why: `$${invoices.overdueValue.toLocaleString()} cash at risk.`,
            urgency: "today" as const,
          },
        ]
      : []),
    ...(technicians.unavailable > 0
      ? [
          {
            id: "rec-capacity",
            title: "Rebalance field capacity",
            why: "Unavailable technicians are constraining operational capacity.",
            urgency: "today" as const,
          },
        ]
      : []),
    ...(projects.marginRiskCount > 0
      ? [
          {
            id: "rec-margin",
            title: "Review margin-eroded projects",
            why: `${projects.marginRiskCount} project(s) below margin tolerance.`,
            urgency: "this_week" as const,
          },
        ]
      : []),
  ];

  const brief: OperationalContextBrief = {
    asOf,
    providerId: "simpro",
    framing: [
      "Operational context from live field service activity.",
      operationalHealth.label + ".",
      `${jobs.openJobs} open commitment(s), ${technicians.available} technicians available.`,
    ].join(" "),
    operationalHealth,
    capacity: {
      level:
        technicians.unavailable > technicians.available
          ? "strained"
          : technicians.unavailable > 0
            ? "watch"
            : "healthy",
      label: "Field capacity",
      utilisedPct: Math.min(100, utilisedPct),
      availableTechnicians: technicians.available,
      unavailableTechnicians: technicians.unavailable,
      detail: `${technicians.available} available · ${technicians.unavailable} unavailable`,
    },
    serviceDelivery: {
      openJobs: jobs.openJobs,
      criticalJobs: jobs.criticalJobs,
      completedToday,
      backlogLabel:
        jobs.openJobs > 8
          ? "Elevated backlog"
          : jobs.openJobs > 3
            ? "Moderate backlog"
            : "Backlog under control",
      detail: `${jobs.criticalJobs} critical of ${jobs.openJobs} open`,
    },
    revenuePipeline: {
      acceptedQuotesValue: quotes.acceptedValue,
      openOpportunities: quotes.openOpportunities,
      label: "Revenue pipeline",
      detail: `$${quotes.acceptedValue.toLocaleString()} accepted · ${quotes.openOpportunities} open`,
    },
    cashCollection: {
      overdueInvoices: invoices.overdueCount,
      overdueValue: invoices.overdueValue,
      riskLevel:
        invoices.overdueCount >= 2
          ? "critical"
          : invoices.overdueCount > 0
            ? "strained"
            : "healthy",
      detail:
        invoices.overdueCount > 0
          ? `$${invoices.overdueValue.toLocaleString()} overdue`
          : "No overdue invoices",
    },
    customerRisks,
    bottlenecks,
    safetySignals: [
      ...(jobs.criticalJobs > 0
        ? ["Critical field work requires safety escalation awareness"]
        : []),
      ...jobs.events
        .filter((e) => e.payload.executiveMeaning === "Safety Risk Increased")
        .map((e) => String(e.payload.title ?? "Safety incident")),
    ],
    assetAvailability: {
      level: assets.unavailable > 0 ? "watch" : "healthy",
      label:
        assets.unavailable > 0
          ? "Asset constraints present"
          : "Assets available",
      detail: `${assets.unavailable} asset(s) unavailable or in fault`,
    },
    fieldProductivity,
    technicianUtilisation: {
      level: fieldProductivity.level,
      utilisedPct: fieldProductivity.utilisationPct,
      label: "Technician utilisation",
      detail: fieldProductivity.detail,
    },
    servicePerformance,
    jobsAtRisk: jobs.jobsAtRisk,
    criticalCustomers,
    operationalOpportunities,
    signals,
    recommendations,
    closingNote:
      "This is operational executive context, not a field-service console. Replace the provider — keep the brief shape.",
  };

  // Deduplicate work-order overlap with jobs by id prefix preference
  const events: BusinessEvent[] = [
    ...jobs.events,
    ...quotes.events,
    ...customers.events,
    ...sites.events,
    ...assets.events,
    ...technicians.events,
    ...projects.events,
    ...purchaseOrders.events,
    ...invoices.events,
    ...scheduling.events,
    ...timesheets.events,
    // workorders intentionally omitted when jobs already cover — keep labels via jobs
  ];

  // Silence unused if tree shakes oddly
  void workorders;

  if (input.twin) {
    input.twin.apply(events);
    security = recordSimproAudit(
      security,
      "publish_business_events",
      `Applied ${events.length} BusinessEvents to Digital Twin`,
      asOf,
    );
  }

  let relationshipEnrichment;
  if (input.graph) {
    relationshipEnrichment = enrichOperationalGraph(input.graph, brief, events);
    security = recordSimproAudit(
      security,
      "enrich_relationships",
      `Upserted ${relationshipEnrichment.entitiesUpserted} entities`,
      asOf,
    );
  }

  return { brief, events, security, relationshipEnrichment };
}

/** Deterministic builder for snapshot pipeline (sync wrapper). */
export function buildOperationalContextBriefFromMock(input: {
  options?: SimproProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
}): OperationalContextBrief {
  // Synchronous path uses a precomputed mock via blocked async — callers should use apply which awaits or uses registry.
  // For sync snapshot pipeline we run a minimal deterministic brief without I/O.
  const asOf =
    input.options?.asOf ?? input.snapshot?.asOf ?? "2026-07-26T07:30:00+10:00";
  const signals = deriveOperationalSignals({
    openJobs: 2,
    criticalJobs: 1,
    availableTechnicians: 1,
    unavailableTechnicians: 1,
    acceptedQuotesValue: 240000,
    openOpportunities: 0,
    overdueInvoices: 1,
    overdueValue: 48000,
    delayedPurchaseOrders: 1,
    marginRiskCount: 1,
    unavailableAssets: 1,
    overloadedDays: 1,
  });
  const operationalHealth = operationalHealthFromSignals(signals);
  const fieldProductivity = computeFieldProductivity({
    availableTechnicians: 1,
    unavailableTechnicians: 1,
    openJobs: 2,
    completedToday: 0,
    overtimeHours: 1.5,
    productiveHours: 9.5,
  });
  const servicePerformance = computeServicePerformance({
    openJobs: 2,
    criticalJobs: 1,
    completedToday: 0,
    delayedJobs: 0,
  });
  const customerRisks = [
    {
      id: "cust-risk-0",
      customerName: "Northline Retail",
      risk: "Emergency chiller repair",
      severity: "high" as const,
      relatedEntityIds: ["job-502"],
    },
  ];
  return {
    asOf,
    providerId: "simpro",
    framing:
      "Operational context from field service activity. Operations on watch. 2 open commitment(s), 1 technician available.",
    operationalHealth,
    capacity: {
      level: "watch",
      label: "Field capacity",
      utilisedPct: 50,
      availableTechnicians: 1,
      unavailableTechnicians: 1,
      detail: "1 available · 1 unavailable",
    },
    fieldProductivity,
    technicianUtilisation: {
      level: fieldProductivity.level,
      utilisedPct: fieldProductivity.utilisationPct,
      label: "Technician utilisation",
      detail: fieldProductivity.detail,
    },
    serviceDelivery: {
      openJobs: 2,
      criticalJobs: 1,
      completedToday: 0,
      backlogLabel: "Moderate backlog",
      detail: "1 critical of 2 open",
    },
    servicePerformance,
    revenuePipeline: {
      acceptedQuotesValue: 240000,
      openOpportunities: 0,
      label: "Revenue pipeline",
      detail: "$240,000 accepted · 0 open",
    },
    cashCollection: {
      overdueInvoices: 1,
      overdueValue: 48000,
      riskLevel: "strained",
      detail: "$48,000 overdue",
    },
    jobsAtRisk: [
      {
        id: "502",
        title: "Emergency chiller repair",
        customerName: "Northline Retail",
        reason: "Critical commitment at risk",
        severity: "high",
      },
    ],
    criticalCustomers: customerRisks,
    customerRisks,
    bottlenecks: [
      {
        id: "bn-supply",
        title: "Supply chain delay",
        kind: "supply",
        impact: "1 purchase order(s) delayed",
      },
      {
        id: "bn-capacity",
        title: "Technician shortage",
        kind: "capacity",
        impact: "1 technician(s) unavailable",
      },
    ],
    safetySignals: [
      "Critical field work requires safety escalation awareness",
    ],
    assetAvailability: {
      level: "watch",
      label: "Asset constraints present",
      detail: "1 asset(s) unavailable or in fault",
    },
    operationalOpportunities: computeOperationalOpportunities({
      acceptedQuotesValue: 240000,
      availableTechnicians: 1,
      openJobs: 2,
    }),
    signals,
    recommendations: [
      {
        id: "rec-critical",
        title: "Escalate critical service commitments",
        why: "1 critical job(s) threaten customer delivery.",
        urgency: "now",
      },
      {
        id: "rec-cash",
        title: "Chase overdue collections",
        why: "$48,000 cash at risk.",
        urgency: "today",
      },
    ],
    closingNote:
      "This is operational executive context, not a field-service console. Replace the provider — keep the brief shape.",
  };
}
