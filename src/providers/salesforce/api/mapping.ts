/**
 * Canonical mapping — Salesforce shapes → BusinessEvents with executive meaning.
 * Salesforce objects never leave this module's private types.
 */

import type { BusinessEvent, CanonicalEntityType } from "@/connectors/types";

type RawOpportunity = {
  Id: string;
  Name?: string;
  StageName?: string;
  Amount?: number;
  Probability?: number;
  CloseDate?: string;
  Account?: { Name?: string };
  IsClosed?: boolean;
  IsWon?: boolean;
  LastModifiedDate?: string;
};

type RawAccount = {
  Id: string;
  Name?: string;
  Type?: string;
  AnnualRevenue?: number;
  Owner?: { Name?: string };
  LastModifiedDate?: string;
};

type RawCase = {
  Id: string;
  Subject?: string;
  Priority?: string;
  Status?: string;
  Account?: { Name?: string };
  LastModifiedDate?: string;
};

type RawContact = {
  Id: string;
  Name?: string;
  Title?: string;
  Account?: { Name?: string };
  LastModifiedDate?: string;
};

type RawCampaign = {
  Id: string;
  Name?: string;
  Status?: string;
  NumberOfLeads?: number;
  AmountAllOpportunities?: number;
};

type RawQuote = {
  Id: string;
  Name?: string;
  Status?: string;
  GrandTotal?: number;
  OpportunityId?: string;
};

function event(input: {
  id: string;
  at: string;
  entityType: CanonicalEntityType;
  entityId: string;
  eventType: string;
  importance: number;
  meaning: string;
  payload: Record<string, unknown>;
  labels?: string[];
}): BusinessEvent {
  return {
    id: input.id,
    timestamp: input.at,
    sourceSystem: "salesforce",
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    importance: input.importance,
    confidence: 86,
    relationships: [],
    payload: {
      executiveMeaning: input.meaning,
      ...input.payload,
    },
    metadata: {
      connectorId: "provider-salesforce",
      labels: ["commercial-context", ...(input.labels ?? [])],
    },
  };
}

export function mapOpportunitiesToEvents(
  opportunities: RawOpportunity[],
  asOf: string,
): BusinessEvent[] {
  const events: BusinessEvent[] = [];
  for (const opp of opportunities) {
    const id = opp.Id;
    const at = opp.LastModifiedDate ?? asOf;
    const amount = opp.Amount ?? 0;
    const account = opp.Account?.Name;

    if (opp.IsWon) {
      events.push(
        event({
          id: `evt-crm-won-${id}`,
          at,
          entityType: "Opportunity",
          entityId: `opp-${id}`,
          eventType: "opportunity_moved",
          importance: 90,
          meaning: "Revenue Secured",
          payload: {
            title: opp.Name ?? id,
            amount,
            account,
            stage: opp.StageName,
          },
          labels: ["opportunity", "won"],
        }),
      );
      continue;
    }

    if (opp.IsClosed && !opp.IsWon) {
      events.push(
        event({
          id: `evt-crm-lost-${id}`,
          at,
          entityType: "Risk",
          entityId: `opp-${id}`,
          eventType: "risk_raised",
          importance: 78,
          meaning: "Revenue Risk Increased",
          payload: {
            title: opp.Name ?? id,
            amount,
            account,
            stage: opp.StageName,
          },
          labels: ["opportunity", "lost"],
        }),
      );
      continue;
    }

    const stage = (opp.StageName ?? "").toLowerCase();
    if (stage.includes("prospect") || stage.includes("qualification")) {
      events.push(
        event({
          id: `evt-crm-created-${id}`,
          at,
          entityType: "Opportunity",
          entityId: `opp-${id}`,
          eventType: "opportunity_moved",
          importance: 65,
          meaning: "Revenue Opportunity Created",
          payload: { title: opp.Name ?? id, amount, account, stage: opp.StageName },
          labels: ["opportunity", "created"],
        }),
      );
    } else {
      events.push(
        event({
          id: `evt-crm-stage-${id}`,
          at,
          entityType: "Opportunity",
          entityId: `opp-${id}`,
          eventType: "opportunity_moved",
          importance: amount >= 500000 ? 88 : 72,
          meaning: "Revenue Forecast Changed",
          payload: {
            title: opp.Name ?? id,
            amount,
            account,
            stage: opp.StageName,
            probability: opp.Probability,
            atRisk: (opp.Probability ?? 100) < 50 && amount >= 400000,
          },
          labels: ["opportunity", "forecast"],
        }),
      );
    }
  }
  return events;
}

export function mapAccountsToEvents(
  accounts: RawAccount[],
  asOf: string,
): BusinessEvent[] {
  return accounts.map((account) =>
    event({
      id: `evt-crm-acc-${account.Id}`,
      at: account.LastModifiedDate ?? asOf,
      entityType: "Customer",
      entityId: `account-${account.Id}`,
      eventType: "entity_upserted",
      importance: (account.AnnualRevenue ?? 0) > 20_000_000 ? 80 : 55,
      meaning:
        (account.AnnualRevenue ?? 0) > 20_000_000
          ? "Strategic Customer Expanded"
          : "Customer Relationship Updated",
      payload: {
        name: account.Name ?? account.Id,
        type: account.Type,
        annualRevenue: account.AnnualRevenue,
        owner: account.Owner?.Name,
      },
      labels: ["account", "customer"],
    }),
  );
}

export function mapCasesToEvents(
  cases: RawCase[],
  asOf: string,
): BusinessEvent[] {
  return cases.map((item) => {
    const escalated = /escalat|high|critical/i.test(
      `${item.Status ?? ""} ${item.Priority ?? ""}`,
    );
    return event({
      id: `evt-crm-case-${item.Id}`,
      at: item.LastModifiedDate ?? asOf,
      entityType: escalated ? "Risk" : "Signal",
      entityId: `case-${item.Id}`,
      eventType: escalated ? "risk_raised" : "signal_emitted",
      importance: escalated ? 84 : 50,
      meaning: escalated
        ? "Customer Satisfaction Risk Increased"
        : "Customer Case Updated",
      payload: {
        title: item.Subject ?? item.Id,
        account: item.Account?.Name,
        priority: item.Priority,
        status: item.Status,
      },
      labels: ["case", "customer-health"],
    });
  });
}

export function mapContactsToEvents(
  contacts: RawContact[],
  asOf: string,
): BusinessEvent[] {
  return contacts.map((contact) =>
    event({
      id: `evt-crm-con-${contact.Id}`,
      at: contact.LastModifiedDate ?? asOf,
      entityType: "Person",
      entityId: `contact-${contact.Id}`,
      eventType: "relationship_asserted",
      importance: /ceo|cfo|coo|chief|md|owner/i.test(contact.Title ?? "")
        ? 75
        : 45,
      meaning: "Executive Relationship Updated",
      payload: {
        name: contact.Name ?? contact.Id,
        title: contact.Title,
        account: contact.Account?.Name,
      },
      labels: ["contact", "relationship"],
    }),
  );
}

export function mapCampaignsToEvents(
  campaigns: RawCampaign[],
  asOf: string,
): BusinessEvent[] {
  return campaigns.map((campaign) =>
    event({
      id: `evt-crm-camp-${campaign.Id}`,
      at: asOf,
      entityType: "Opportunity",
      entityId: `campaign-${campaign.Id}`,
      eventType: "signal_emitted",
      importance: 60,
      meaning: "Market Opportunity Changed",
      payload: {
        title: campaign.Name ?? campaign.Id,
        status: campaign.Status,
        leads: campaign.NumberOfLeads,
        pipelineAmount: campaign.AmountAllOpportunities,
      },
      labels: ["campaign", "market"],
    }),
  );
}

export function mapQuotesToEvents(
  quotes: RawQuote[],
  asOf: string,
): BusinessEvent[] {
  return quotes.map((quote) =>
    event({
      id: `evt-crm-quote-${quote.Id}`,
      at: asOf,
      entityType: "Opportunity",
      entityId: `quote-${quote.Id}`,
      eventType: "entity_upserted",
      importance: 58,
      meaning: "Commercial Quote Updated",
      payload: {
        title: quote.Name ?? quote.Id,
        status: quote.Status,
        amount: quote.GrandTotal,
        opportunityId: quote.OpportunityId,
      },
      labels: ["quote"],
    }),
  );
}

export function mapForecastUpdate(
  input: { amount: number; accuracyPct: number },
  asOf: string,
): BusinessEvent {
  return event({
    id: `evt-crm-forecast-${asOf}`,
    at: asOf,
    entityType: "Metric",
    entityId: "commercial-forecast",
    eventType: "signal_emitted",
    importance: 85,
    meaning: "Commercial Confidence Changed",
    payload: {
      forecastAmount: input.amount,
      accuracyPct: input.accuracyPct,
    },
    labels: ["forecast"],
  });
}

/** Large CRM simulation for tests. */
export function simulateLargeCrmPortfolio(input: {
  accounts: number;
  oppsPerAccount: number;
  asOf: string;
}): BusinessEvent[] {
  const events: BusinessEvent[] = [];
  for (let a = 0; a < input.accounts; a += 1) {
    events.push(
      ...mapAccountsToEvents(
        [
          {
            Id: `ACC${a}`,
            Name: `Customer ${a + 1}`,
            AnnualRevenue: 1_000_000 + a * 50_000,
          },
        ],
        input.asOf,
      ),
    );
    for (let o = 0; o < input.oppsPerAccount; o += 1) {
      events.push(
        ...mapOpportunitiesToEvents(
          [
            {
              Id: `OPP${a}-${o}`,
              Name: `Deal ${a}-${o}`,
              StageName: o % 3 === 0 ? "Negotiation" : "Proposal",
              Amount: 100000 + o * 25000,
              Probability: 40 + o * 10,
              Account: { Name: `Customer ${a + 1}` },
              IsClosed: false,
              IsWon: false,
              LastModifiedDate: input.asOf,
            },
          ],
          input.asOf,
        ),
      );
    }
  }
  return events;
}
