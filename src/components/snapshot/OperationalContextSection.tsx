"use client";

import type { OperationalContextView } from "@/lib/snapshot/types";

type OperationalContextSectionProps = {
  context: OperationalContextView;
};

/**
 * Operational Context — Today briefing from field-service providers.
 * Renders portable executive insight — never Simpro objects.
 */
export function OperationalContextSection({
  context,
}: OperationalContextSectionProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {context.framing}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Meta label="Operational health" value={context.operationalHealth.label} />
        <Meta
          label="Capacity"
          value={`${context.capacity.availableTechnicians} available`}
        />
        <Meta
          label="Jobs at risk"
          value={`${context.jobsAtRisk.length}`}
        />
        <Meta
          label="Service performance"
          value={`${context.servicePerformance.onTimePct}%`}
        />
        <Meta
          label="Cash collection"
          value={
            context.cashCollection.overdueInvoices > 0
              ? `$${context.cashCollection.overdueValue.toLocaleString()}`
              : "Clear"
          }
        />
      </div>

      <Block label="Operational Health">
        <p className="text-sm leading-6 text-secondary">
          {context.operationalHealth.detail}
        </p>
      </Block>

      <Block label="Capacity">
        <p className="text-sm leading-6 text-secondary">
          {context.capacity.detail} · utilised {context.capacity.utilisedPct}%
        </p>
      </Block>

      <Block label="Jobs at Risk">
        <ul className="space-y-2">
          {context.jobsAtRisk.length > 0 ? (
            context.jobsAtRisk.map((job) => (
              <li
                key={`${job.title}-${job.customerName}`}
                className="text-sm leading-6 text-secondary"
              >
                <span className="font-medium text-foreground">{job.title}</span>
                {" — "}
                {job.customerName}
                <span className="block text-muted">{job.reason}</span>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">No jobs at risk</li>
          )}
        </ul>
      </Block>

      <Block label="Critical Customers">
        <ul className="space-y-2">
          {context.criticalCustomers.length > 0 ? (
            context.criticalCustomers.map((risk) => (
              <li
                key={`${risk.customerName}-${risk.risk}`}
                className="text-sm leading-6 text-secondary"
              >
                <span className="font-medium text-foreground">
                  {risk.customerName}
                </span>
                {" — "}
                {risk.risk}
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No critical customers flagged
            </li>
          )}
        </ul>
      </Block>

      <Block label="Safety Signals">
        <ul className="space-y-1">
          {context.safetySignals.length > 0 ? (
            context.safetySignals.map((signal) => (
              <li key={signal} className="text-sm leading-6 text-secondary">
                {signal}
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No elevated safety signals
            </li>
          )}
        </ul>
      </Block>

      <Block label="Asset Availability">
        <p className="text-sm leading-6 text-secondary">
          {context.assetAvailability.label} — {context.assetAvailability.detail}
        </p>
      </Block>

      <Block label="Operational Bottlenecks">
        <ul className="space-y-2">
          {context.bottlenecks.length > 0 ? (
            context.bottlenecks.map((item) => (
              <li key={item.title} className="text-sm leading-6 text-secondary">
                <span className="font-medium text-foreground">{item.title}</span>
                {" · "}
                {item.kind}
                <span className="block text-muted">{item.impact}</span>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No material bottlenecks
            </li>
          )}
        </ul>
      </Block>

      <Block label="Service Performance">
        <p className="text-sm leading-6 text-secondary">
          {context.servicePerformance.label} — {context.servicePerformance.detail}
        </p>
      </Block>

      <Block label="Field Productivity">
        <p className="text-sm leading-6 text-secondary">
          {context.fieldProductivity.label} — {context.fieldProductivity.detail}
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
