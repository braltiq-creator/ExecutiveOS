"use client";

import type { ExecutiveContextView } from "@/lib/snapshot/types";

type ExecutiveContextSectionProps = {
  context: ExecutiveContextView;
};

/**
 * Executive Context — Today briefing enrichment from productivity providers.
 * Renders portable executive insight — never Microsoft objects.
 */
export function ExecutiveContextSection({
  context,
}: ExecutiveContextSectionProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {context.framing}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Board readiness" value={context.boardReadiness.label} />
        <Meta
          label="Meeting saturation"
          value={
            context.meetingRisks.length > 0
              ? `${context.meetingRisks.length} flagged`
              : "Within capacity"
          }
        />
        <Meta
          label="Stakeholder engagements"
          value={`${context.keyRelationships.length}`}
        />
        <Meta
          label="Decision deadlines"
          value={`${context.upcomingDecisions.length}`}
        />
      </div>

      <Block label="Today's Executive Commitments">
        <ul className="space-y-3">
          {context.calendar.map((item) => (
            <li key={item.id} className="text-sm leading-6 text-secondary">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {item.kindLabel} · {item.when} · prep {item.preparationRisk}
              </span>
              <span className="mt-1 block font-display text-base font-semibold tracking-tight text-foreground">
                {item.title}
              </span>
              <span className="mt-1 block">{item.whyItMatters}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Upcoming Governance Events">
        <ul className="space-y-2">
          {context.calendar
            .filter((item) => /board|governance/i.test(item.kindLabel))
            .map((item) => (
              <li key={`gov-${item.id}`} className="text-sm leading-6 text-secondary">
                <span className="font-medium text-foreground">{item.title}</span>
                {" · "}
                {item.when}
              </li>
            ))}
          {context.calendar.filter((item) =>
            /board|governance/i.test(item.kindLabel),
          ).length === 0 ? (
            <li className="text-sm leading-6 text-muted">
              No governance events in the current window
            </li>
          ) : null}
        </ul>
      </Block>

      <Block label="Critical Stakeholder Engagements">
        <ul className="space-y-2">
          {context.keyRelationships.map((person) => (
            <li key={person.name} className="text-sm leading-6 text-secondary">
              <span className="font-medium text-foreground">{person.name}</span>
              {" — "}
              {person.roleHint} · {person.relationship}
              {person.neglectRisk ? " · touch required" : ""}
            </li>
          ))}
        </ul>
      </Block>

      {context.meetingRisks.length > 0 ? (
        <Block label="Meeting Saturation">
          <ul className="space-y-1">
            {context.meetingRisks.map((risk) => (
              <li key={risk} className="text-sm leading-6 text-secondary">
                {risk}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <Block label="Decision Deadlines">
        <ul className="space-y-1">
          {context.upcomingDecisions.length > 0 ? (
            context.upcomingDecisions.map((id) => (
              <li key={id} className="text-sm leading-6 text-secondary">
                {id}
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-muted">
              No Decision binds linked from context
            </li>
          )}
        </ul>
      </Block>

      <Block label="Strategic Documents Awaiting Review">
        <ul className="space-y-2">
          {context.criticalDocuments.map((doc) => (
            <li key={doc.title} className="text-sm leading-6 text-secondary">
              <span className="font-medium text-foreground">{doc.title}</span>
              <span className="block text-muted">{doc.whyItMatters}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Executive Collaboration Signals">
        <ul className="space-y-2">
          {context.strategicConversations.map((conversation) => (
            <li
              key={conversation.topic}
              className="text-sm leading-6 text-secondary"
            >
              <span className="font-medium text-foreground">
                {conversation.topic}
              </span>
              {" · "}
              <span className="uppercase tracking-wide text-muted">
                {conversation.urgency}
              </span>
              <span className="block">{conversation.summary}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Executive Signals">
        <ul className="space-y-2">
          {context.signals.map((signal) => (
            <li key={signal.label} className="text-sm leading-6 text-secondary">
              <span className="font-medium text-foreground">{signal.label}</span>
              {" — "}
              <span className="uppercase tracking-wide text-muted">
                {signal.severity}
              </span>
              {": "}
              {signal.summary}
            </li>
          ))}
        </ul>
      </Block>

      <p className="text-sm leading-6 text-muted">{context.boardReadiness.detail}</p>
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
