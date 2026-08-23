"use client";

import { useState } from "react";
import type { ExecutiveAgendaView } from "@/lib/snapshot/types";
import { cn } from "@/lib/utils/cn";

type ExecutiveAgendaSectionProps = {
  agenda: ExecutiveAgendaView;
};

/**
 * Executive Agenda — strategic priorities for ELT / Board preparation.
 * Not a project board. Renders engine output only.
 */
export function ExecutiveAgendaSection({
  agenda,
}: ExecutiveAgendaSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {agenda.framing}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta
          label="Agenda health"
          value={agenda.overallHealthLabel}
        />
        <Meta
          label="Strategic momentum"
          value={agenda.momentumLabel}
        />
        <Meta
          label="Confidence"
          value={`${agenda.confidence}%`}
        />
        <Meta
          label="Board readiness"
          value={agenda.boardReadiness.label}
        />
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {agenda.items.map((item) => {
          const open = openId === item.id;
          return (
            <li key={item.id} className="py-3">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 text-left",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                )}
              >
                <span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    {item.priorityLabel} · {item.strategicTheme}
                    {item.attentionRequired ? " · Attention" : ""}
                  </span>
                  <span className="mt-1 block font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-secondary">
                    Sponsor {item.executiveSponsorTitle} · {item.healthLabel} ·{" "}
                    {item.momentumLabel} · {item.confidence}% confidence
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {open ? "Hide" : "Expand"}
                </span>
              </button>

              {open ? (
                <div className="mt-4 space-y-4 pl-0 sm:pl-1">
                  <p className="text-sm leading-6 text-foreground">
                    {item.initiative.executiveOutcome}
                  </p>
                  <p className="text-sm leading-6 text-secondary">
                    {item.initiative.whyItExists}
                  </p>

                  <DetailList
                    label="Strategic initiative"
                    items={[
                      `${item.initiative.title} — ${item.initiative.progressLabel} (${item.initiative.progressPercent}%)`,
                      item.initiative.businessObjective,
                      item.initiative.whatSuccessLooksLike,
                    ]}
                  />

                  <DetailList label="Evidence" items={item.evidence} />
                  <DetailList
                    label="Business drivers"
                    items={item.businessDrivers}
                  />
                  <DetailList
                    label="Critical dependencies"
                    items={item.criticalDependencies}
                  />
                  <DetailList
                    label="Related futures"
                    items={
                      item.relatedFutures.length > 0
                        ? item.relatedFutures
                        : ["No linked futures in current foresight set"]
                    }
                  />
                  <DetailList
                    label="Upcoming executive decisions"
                    items={
                      item.upcomingDecisions.length > 0
                        ? item.upcomingDecisions
                        : ["No open Decision binds linked yet"]
                    }
                  />
                  <DetailList
                    label="Success measures"
                    items={item.initiative.successMeasures}
                  />

                  {item.disagreements.length > 0 ? (
                    <div className="space-y-3 border-l-2 border-foreground/20 pl-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                        Council disagreement preserved
                      </p>
                      {item.disagreements.map((disagreement) => (
                        <div key={disagreement.topic} className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            {disagreement.topic}
                          </p>
                          <ul className="space-y-2">
                            {disagreement.positions.map((position) => (
                              <li
                                key={`${position.agent}-${position.stance}`}
                                className="text-sm leading-6 text-secondary"
                              >
                                <span className="font-medium text-foreground">
                                  {position.agent}
                                </span>
                                {" — "}
                                <span className="uppercase tracking-wide text-muted">
                                  {position.stance}
                                </span>
                                {": "}
                                {position.statement}
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm leading-6 text-foreground">
                            {disagreement.facilitation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <DetailList
                    label="Council perspectives"
                    items={item.councilAlignment.map(
                      (p) =>
                        `${p.shortTitle} (${p.agreement}): ${p.contribution}`,
                    )}
                  />

                  <DetailList
                    label="Operational links (execution owns delivery)"
                    items={item.initiative.operationalLinks.map(
                      (link) =>
                        `${link.system} — owns ${link.owns} (not ExecutiveOS)`,
                    )}
                  />

                  <DetailList
                    label="Reasoning"
                    items={item.initiative.reasoning}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-sm leading-6 text-muted">{agenda.boardReadiness.detail}</p>
      <p className="text-sm leading-6 text-muted">{agenda.closingNote}</p>
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

function DetailList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
