/**
 * Salesforce Commercial Executive Context Provider — production sync → portable brief.
 */

import type { BusinessEvent } from "@/connectors/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import {
  createSalesforceApiClient,
  type SalesforceApiClient,
} from "@/providers/salesforce/api";
import type { SalesforceOAuthCredentials } from "@/providers/salesforce/auth";
import { syncOpportunities } from "@/providers/salesforce/opportunities";
import { syncAccounts } from "@/providers/salesforce/accounts";
import { syncContacts } from "@/providers/salesforce/contacts";
import { syncCases } from "@/providers/salesforce/cases";
import { syncCampaigns } from "@/providers/salesforce/campaigns";
import { syncQuotes } from "@/providers/salesforce/quotes";
import { syncActivities } from "@/providers/salesforce/activities";
import { syncProducts } from "@/providers/salesforce/products";
import { syncForecasts } from "@/providers/salesforce/forecasts";
import { computeCommercialMomentum } from "@/providers/salesforce/analytics";
import {
  deriveCommercialSignals,
  commercialHealthFromSignals,
} from "@/providers/salesforce/executive-context/signals";
import type { CommercialContextBrief } from "@/providers/salesforce/executive-context/types";
import {
  assertSalesforceTenantIsolation,
  createSalesforceSecurityContext,
  recordSalesforceAudit,
  type SalesforceSecurityContext,
} from "@/providers/salesforce/security";
import { enrichCommercialGraph } from "@/providers/salesforce/relationships";

export type SalesforceProviderOptions = {
  executiveosTenantId?: string;
  orgId?: string;
  credentials?: SalesforceOAuthCredentials;
  client?: SalesforceApiClient;
  asOf?: string;
  modifiedSince?: string;
};

export type SalesforceProviderResult = {
  brief: CommercialContextBrief;
  events: BusinessEvent[];
  security: SalesforceSecurityContext;
  relationshipEnrichment?: {
    entitiesUpserted: number;
    relationshipsUpserted: number;
  };
};

export async function syncSalesforceExecutiveContext(input: {
  options?: SalesforceProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
}): Promise<SalesforceProviderResult> {
  const asOf =
    input.options?.asOf ?? input.snapshot?.asOf ?? new Date().toISOString();
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const orgId = input.options?.orgId ?? "northline-sf";
  let security = createSalesforceSecurityContext({
    tenantId: executiveosTenantId,
    orgId,
  });

  const isolation = assertSalesforceTenantIsolation(
    security,
    executiveosTenantId,
  );
  if (!isolation.ok) throw new Error(isolation.message);

  const credentials: SalesforceOAuthCredentials = input.options?.credentials ?? {
    strategy: "oauth2",
    clientId: "connected-app-client",
    clientSecretRef: "vault:sf-client-secret",
    accessToken: "sf_access_mock",
    refreshToken: "sf_refresh_mock",
    instanceUrl: "https://northline.my.salesforce.com",
    expiresAt: new Date(new Date(asOf).getTime() + 3600_000).toISOString(),
    scopes: ["api", "refresh_token", "offline_access", "id", "profile"],
  };

  const client =
    input.options?.client ??
    createSalesforceApiClient({
      orgId,
      getCredentials: () => credentials,
      asOf,
    });

  security = recordSalesforceAudit(
    security,
    "authenticate",
    "Salesforce client ready",
    asOf,
  );
  void input.options?.modifiedSince;

  const [
    opportunities,
    accounts,
    contacts,
    cases,
    campaigns,
    quotes,
    activities,
    products,
  ] = await Promise.all([
    syncOpportunities(client, asOf),
    syncAccounts(client, asOf),
    syncContacts(client, asOf),
    syncCases(client, asOf),
    syncCampaigns(client, asOf),
    syncQuotes(client, asOf),
    syncActivities(client, asOf),
    syncProducts(client, asOf),
  ]);

  const forecasts = await syncForecasts({
    weightedForecast: opportunities.weightedForecast,
    wonValue: opportunities.wonValue,
    openPipelineValue: opportunities.openPipelineValue,
    asOf,
  });

  const signals = deriveCommercialSignals({
    openPipelineValue: opportunities.openPipelineValue,
    openDeals: opportunities.openDeals,
    weightedForecast: opportunities.weightedForecast,
    wonValue: opportunities.wonValue,
    lostValue: opportunities.lostValue,
    atRiskDealCount: opportunities.atRiskDealCount,
    atRiskDealValue: opportunities.atRiskDealValue,
    strategicAccountCount: accounts.strategicAccountCount,
    escalatedCases: cases.escalatedCases,
    renewalCount: opportunities.renewalCount,
    forecastAccuracyPct: forecasts.forecastAccuracyPct,
    campaignPipelineValue: campaigns.campaignPipelineValue,
  });

  const commercialHealth = commercialHealthFromSignals(signals);
  const momentum = computeCommercialMomentum({
    wonValue: opportunities.wonValue,
    lostValue: opportunities.lostValue,
    atRiskDealCount: opportunities.atRiskDealCount,
  });

  const strategicAccounts = accounts.strategicAccounts.map((account) => {
    const escalated = cases.events.some(
      (e) =>
        e.payload.executiveMeaning === "Customer Satisfaction Risk Increased" &&
        String(e.payload.account ?? "") === account.name,
    );
    return {
      ...account,
      attention: escalated
        ? "Escalation pressure — executive attention required"
        : account.attention,
      severity: escalated ? ("high" as const) : account.severity,
    };
  });

  const renewalRisks = opportunities.events
    .filter((e) => /renew/i.test(String(e.payload.title ?? "")))
    .slice(0, 5)
    .map((e, index) => ({
      id: `renewal-${index}`,
      title: String(e.payload.title ?? "Renewal"),
      kind: "renewal" as const,
      severity: "high" as const,
      detail: "Renewal-shaped pursuit requires retention attention",
    }));

  const commercialRisks = [
    ...opportunities.largeDealsAtRisk.map((d) => ({
      id: `deal-risk-${d.id}`,
      title: d.title,
      kind: "deal" as const,
      severity: "high" as const,
      detail: d.reason,
    })),
    ...renewalRisks,
    ...(cases.escalatedCases > 0
      ? [
          {
            id: "cust-sat-risk",
            title: "Customer satisfaction pressure",
            kind: "customer" as const,
            severity: "high" as const,
            detail: `${cases.escalatedCases} escalated case(s)`,
          },
        ]
      : []),
    ...(forecasts.forecastAccuracyPct < 70
      ? [
          {
            id: "forecast-risk",
            title: "Forecast confidence soft",
            kind: "forecast" as const,
            severity: "moderate" as const,
            detail: `Accuracy ${forecasts.forecastAccuracyPct}%`,
          },
        ]
      : []),
  ];

  const recommendations = [
    ...(opportunities.largeDealsAtRisk.length > 0
      ? [
          {
            id: "rec-deals",
            title: "Engage on large deals at risk",
            why: `${opportunities.largeDealsAtRisk.length} large pursuit(s) below conversion confidence.`,
            urgency: "now" as const,
          },
        ]
      : []),
    ...(renewalRisks.length > 0
      ? [
          {
            id: "rec-renewal",
            title: "Protect renewals this week",
            why: "Renewal-shaped opportunities need retention sponsorship.",
            urgency: "today" as const,
          },
        ]
      : []),
    ...(cases.escalatedCases > 0
      ? [
          {
            id: "rec-customer",
            title: "Stabilise escalated customer health",
            why: "Customer satisfaction risk is elevated.",
            urgency: "today" as const,
          },
        ]
      : []),
    ...(forecasts.forecastAccuracyPct < 75
      ? [
          {
            id: "rec-forecast",
            title: "Tighten forecast assumptions",
            why: `Forecast confidence at ${forecasts.forecastAccuracyPct}%.`,
            urgency: "this_week" as const,
          },
        ]
      : []),
  ];

  const pipelineLevel =
    opportunities.atRiskDealCount >= 2
      ? ("strained" as const)
      : opportunities.atRiskDealCount > 0
        ? ("watch" as const)
        : ("healthy" as const);

  const forecastLevel =
    forecasts.forecastAccuracyPct < 60
      ? ("strained" as const)
      : forecasts.forecastAccuracyPct < 75
        ? ("watch" as const)
        : ("healthy" as const);

  const customerLevel =
    cases.escalatedCases >= 2
      ? ("strained" as const)
      : cases.escalatedCases > 0
        ? ("watch" as const)
        : ("healthy" as const);

  const brief: CommercialContextBrief = {
    asOf,
    providerId: "salesforce",
    framing: [
      "Commercial context from live revenue activity.",
      commercialHealth.label + ".",
      `${opportunities.openDeals} open deal(s), $${opportunities.weightedForecast.toLocaleString()} weighted forecast.`,
    ].join(" "),
    commercialHealth,
    pipelineHealth: {
      level: pipelineLevel,
      label: "Pipeline Health",
      openPipelineValue: opportunities.openPipelineValue,
      openDeals: opportunities.openDeals,
      weightedForecast: opportunities.weightedForecast,
      detail: `$${opportunities.openPipelineValue.toLocaleString()} open · $${opportunities.atRiskDealValue.toLocaleString()} at risk`,
    },
    revenueForecast: {
      level: forecastLevel,
      label: "Revenue Forecast",
      forecastValue: forecasts.forecastValue,
      accuracyPct: forecasts.forecastAccuracyPct,
      detail: `$${forecasts.forecastValue.toLocaleString()} · ${forecasts.forecastAccuracyPct}% confidence`,
    },
    commercialMomentum: momentum,
    strategicAccounts,
    commercialRisks,
    renewalRisks,
    largeDealsAtRisk: opportunities.largeDealsAtRisk,
    customerHealth: {
      level: customerLevel,
      label:
        customerLevel === "healthy"
          ? "Customer health calm"
          : "Customer health elevated",
      detail:
        cases.escalatedCases > 0
          ? `${cases.escalatedCases} escalated case(s)`
          : "No elevated satisfaction risks",
    },
    salesMomentum: {
      level: momentum.level,
      label: momentum.label,
      detail: momentum.detail,
    },
    signals,
    recommendations,
    closingNote:
      "This is commercial executive context, not a CRM console. Replace the provider — keep the brief shape.",
  };

  const events: BusinessEvent[] = [
    ...opportunities.events,
    ...accounts.events,
    ...contacts.events,
    ...cases.events,
    ...campaigns.events,
    ...quotes.events,
    ...activities.events,
    ...products.events,
    ...forecasts.events,
  ];

  if (input.twin) {
    input.twin.apply(events);
    security = recordSalesforceAudit(
      security,
      "publish_business_events",
      `Applied ${events.length} BusinessEvents to Digital Twin`,
      asOf,
    );
  }

  let relationshipEnrichment;
  if (input.graph) {
    relationshipEnrichment = enrichCommercialGraph(input.graph, brief, events);
    security = recordSalesforceAudit(
      security,
      "enrich_relationships",
      `Upserted ${relationshipEnrichment.entitiesUpserted} entities`,
      asOf,
    );
  }

  return { brief, events, security, relationshipEnrichment };
}

/** Deterministic builder for snapshot pipeline (sync path). */
export function buildCommercialContextBriefFromMock(input: {
  options?: SalesforceProviderOptions;
  snapshot?: IntelligentExecutiveSnapshot;
}): CommercialContextBrief {
  const asOf =
    input.options?.asOf ?? input.snapshot?.asOf ?? "2026-07-26T07:30:00+10:00";
  const signals = deriveCommercialSignals({
    openPipelineValue: 1_390_000,
    openDeals: 2,
    weightedForecast: 700_000,
    wonValue: 220_000,
    lostValue: 0,
    atRiskDealCount: 1,
    atRiskDealValue: 910_000,
    strategicAccountCount: 2,
    escalatedCases: 1,
    renewalCount: 1,
    forecastAccuracyPct: 75,
    campaignPipelineValue: 350_000,
  });
  const commercialHealth = commercialHealthFromSignals(signals);
  const momentum = computeCommercialMomentum({
    wonValue: 220_000,
    lostValue: 0,
    atRiskDealCount: 1,
  });
  return {
    asOf,
    providerId: "salesforce",
    framing:
      "Commercial context from live revenue activity. Commercial health on watch. 2 open deal(s), $700,000 weighted forecast.",
    commercialHealth,
    pipelineHealth: {
      level: "watch",
      label: "Pipeline Health",
      openPipelineValue: 1_390_000,
      openDeals: 2,
      weightedForecast: 700_000,
      detail: "$1,390,000 open · $910,000 at risk",
    },
    revenueForecast: {
      level: "watch",
      label: "Revenue Forecast",
      forecastValue: 700_000,
      accuracyPct: 75,
      detail: "$700,000 · 75% confidence",
    },
    commercialMomentum: momentum,
    strategicAccounts: [
      {
        id: "001ACC001",
        name: "Acme Facilities",
        attention: "Escalation pressure — executive attention required",
        severity: "high",
        relatedEntityIds: ["account-001ACC001"],
      },
      {
        id: "001ACC002",
        name: "Harbour Group",
        attention: "Strategic account — monitor growth and risk",
        severity: "high",
        relatedEntityIds: ["account-001ACC002"],
      },
    ],
    commercialRisks: [
      {
        id: "deal-risk-006OPP003",
        title: "Harbour Group — Platform Deal",
        kind: "deal",
        severity: "high",
        detail: "Probability 40% on a large pursuit",
      },
      {
        id: "renewal-0",
        title: "Northline Retail — Renewal",
        kind: "renewal",
        severity: "high",
        detail: "Renewal-shaped pursuit requires retention attention",
      },
      {
        id: "cust-sat-risk",
        title: "Customer satisfaction pressure",
        kind: "customer",
        severity: "high",
        detail: "1 escalated case(s)",
      },
    ],
    renewalRisks: [
      {
        id: "renewal-0",
        title: "Northline Retail — Renewal",
        kind: "renewal",
        severity: "high",
        detail: "Renewal-shaped pursuit requires retention attention",
      },
    ],
    largeDealsAtRisk: [
      {
        id: "006OPP003",
        title: "Harbour Group — Platform Deal",
        amount: 910000,
        reason: "Probability 40% on a large pursuit",
      },
    ],
    customerHealth: {
      level: "watch",
      label: "Customer health elevated",
      detail: "1 escalated case(s)",
    },
    salesMomentum: {
      level: momentum.level,
      label: momentum.label,
      detail: momentum.detail,
    },
    signals,
    recommendations: [
      {
        id: "rec-deals",
        title: "Engage on large deals at risk",
        why: "1 large pursuit(s) below conversion confidence.",
        urgency: "now",
      },
      {
        id: "rec-renewal",
        title: "Protect renewals this week",
        why: "Renewal-shaped opportunities need retention sponsorship.",
        urgency: "today",
      },
      {
        id: "rec-customer",
        title: "Stabilise escalated customer health",
        why: "Customer satisfaction risk is elevated.",
        urgency: "today",
      },
    ],
    closingNote:
      "This is commercial executive context, not a CRM console. Replace the provider — keep the brief shape.",
  };
}
