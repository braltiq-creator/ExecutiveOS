"use client";

import type { CommercialContextView } from "@/lib/snapshot/types";

type CommercialContextSectionProps = {
  context: CommercialContextView;
};

/**
 * Commercial Context — Today briefing from CRM providers.
 * Renders portable executive insight — never Salesforce objects.
 */
export function CommercialContextSection({
  context,
}: CommercialContextSectionProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {context.framing}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Meta label="Commercial health" value={context.commercialHealth.label} />
        <Meta
          label="Pipeline"
          value={`$${context.pipelineHealth.openPipelineValue.toLocaleString()}`}
        />
        <Meta
          label="Forecast"
          value={`$${context.revenueForecast.forecastValue.toLocaleString()}`}
        />
        <Meta
          label="Forecast confidence"
          value={`${context.forecastConfidence.accuracyPct}%`}
        />
        <Meta label="Sales momentum" value={context.salesMomentum.label} />
      </div>

      <Block label="Pipeline Health">
        <p className="text-sm leading-6 text-secondary">
          {context.pipelineHealth.detail}
        </p>
        <p className="mt-1 text-sm text-muted">
          {context.pipelineHealth.openDeals} open deal(s)
        </p>
      </Block>

      <Block label="Revenue Forecast">
        <p className="text-sm leading-6 text-secondary">
          {context.revenueForecast.detail}
        </p>
      </Block>

      <Block label="Commercial Risks">
        <ul className="space-y-2">
          {context.commercialRisks.length > 0 ? (
            context.commercialRisks.map((risk) => (
              <li
                key={`${risk.title}-${risk.kind}`}
                className="text-sm leading-6 text-secondary"
              >
                <span className="font-medium text-foreground">{risk.title}</span>
                {" · "}
                {risk.kind}
                <span className="ml-1 uppercase tracking-wide text-muted">
                  {risk.severity}
                </span>
                <span className="block text-muted">{risk.detail}</span>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No elevated commercial risks
            </li>
          )}
        </ul>
      </Block>

      <Block label="Strategic Accounts Requiring Attention">
        <ul className="space-y-2">
          {context.strategicAccounts.length > 0 ? (
            context.strategicAccounts.map((account) => (
              <li
                key={account.name}
                className="text-sm leading-6 text-secondary"
              >
                <span className="font-medium text-foreground">
                  {account.name}
                </span>
                {" — "}
                {account.attention}
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No strategic accounts flagged
            </li>
          )}
        </ul>
      </Block>

      <Block label="Renewal Risks">
        <ul className="space-y-2">
          {context.renewalRisks.length > 0 ? (
            context.renewalRisks.map((risk) => (
              <li key={risk.title} className="text-sm leading-6 text-secondary">
                <span className="font-medium text-foreground">{risk.title}</span>
                <span className="block text-muted">{risk.detail}</span>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No elevated renewal risks
            </li>
          )}
        </ul>
      </Block>

      <Block label="Large Deals at Risk">
        <ul className="space-y-2">
          {context.largeDealsAtRisk.length > 0 ? (
            context.largeDealsAtRisk.map((deal) => (
              <li key={deal.title} className="text-sm leading-6 text-secondary">
                <span className="font-medium text-foreground">{deal.title}</span>
                {" — $"}
                {deal.amount.toLocaleString()}
                <span className="block text-muted">{deal.reason}</span>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No large deals at risk
            </li>
          )}
        </ul>
      </Block>

      <Block label="Customer Health">
        <p className="text-sm leading-6 text-secondary">
          {context.customerHealth.label} — {context.customerHealth.detail}
        </p>
      </Block>

      <Block label="Sales Momentum">
        <p className="text-sm leading-6 text-secondary">
          {context.salesMomentum.label} — {context.salesMomentum.detail}
        </p>
      </Block>

      <Block label="Executive Recommendations">
        <ul className="space-y-2">
          {context.recommendations.map((rec) => (
            <li key={rec.title} className="text-sm leading-6 text-secondary">
              <span className="font-medium text-foreground">{rec.title}</span>
              {" · "}
              <span className="uppercase tracking-wide text-muted">
                {rec.urgency}
              </span>
              <span className="block">{rec.why}</span>
            </li>
          ))}
        </ul>
      </Block>

      <p className="text-sm leading-6 text-muted">{context.closingNote}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-foreground/20 py-1 pl-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-base font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
