"use client";

import { useState } from "react";
import type { PossibleFuturesView } from "@/lib/snapshot/types";
import { cn } from "@/lib/utils/cn";

type PossibleFuturesSectionProps = {
  futures: PossibleFuturesView;
};

/**
 * Possible Futures — expandable scenario reasoning on Today.
 * Renders engine output only; never derives.
 */
export function PossibleFuturesSection({
  futures,
}: PossibleFuturesSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {futures.framing}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {futures.spotlights.map((spotlight) => (
          <li key={spotlight.id}>
            <button
              type="button"
              onClick={() =>
                setOpenId(
                  openId === spotlight.futureId ? null : spotlight.futureId,
                )
              }
              className={cn(
                "w-full border-l-2 border-foreground/25 py-2 pl-3 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                openId === spotlight.futureId && "border-foreground",
              )}
            >
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {spotlight.label}
              </span>
              <span className="mt-1 block font-display text-base font-semibold tracking-tight text-foreground">
                {spotlight.title}
              </span>
              <span className="mt-1 block text-sm text-secondary">
                {spotlight.oneLiner}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ul className="divide-y divide-border border-y border-border">
        {futures.futures.map((future) => {
          const open = openId === future.id;
          return (
            <li key={future.id} className="py-3">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : future.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 text-left",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                )}
              >
                <span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    {future.caseLabel} · {future.timeHorizonLabel}
                  </span>
                  <span className="mt-1 block font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {future.title}
                  </span>
                  <span className="mt-1 block text-sm text-secondary">
                    {future.probability}% plausibility · {future.confidence}%{" "}
                    confidence
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {open ? "Hide" : "Expand"}
                </span>
              </button>

              {open ? (
                <div className="mt-4 space-y-4 pl-0 sm:pl-1">
                  <p className="text-sm leading-6 text-foreground">
                    {future.description}
                  </p>
                  <p className="text-sm leading-6 text-secondary">
                    {future.whyItExists}
                  </p>

                  <DetailList label="Assumptions that matter" items={future.keyAssumptions} />
                  <DetailList
                    label="Evidence that supports"
                    items={future.supportingEvidence}
                  />
                  <DetailList
                    label="Evidence that weakens"
                    items={future.weakeningEvidence}
                  />
                  <DetailList
                    label="How you can influence this"
                    items={future.influenceLevers}
                  />

                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                      Interventions
                    </p>
                    <ul className="space-y-2">
                      {future.interventions.map((item) => (
                        <li
                          key={`${item.kind}-${item.title}`}
                          className="text-sm leading-6 text-secondary"
                        >
                          <span className="font-medium text-foreground">
                            {item.kindLabel}
                          </span>
                          {": "}
                          {item.title}
                          <span className="block text-muted">{item.rationale}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                      Early warning signals
                    </p>
                    <ul className="space-y-2">
                      {future.signals.map((signal) => (
                        <li
                          key={signal.label}
                          className="text-sm leading-6 text-secondary"
                        >
                          <span className="font-medium text-foreground">
                            {signal.label}
                          </span>
                          <span className="block">
                            Monitor: {signal.monitor}
                          </span>
                          <span className="block text-muted">
                            Threshold: {signal.threshold} · Escalate:{" "}
                            {signal.escalationTrigger}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {future.disagreements.length > 0 ? (
                    <div className="space-y-3 border-l-2 border-foreground/20 pl-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                        Council disagreement preserved
                      </p>
                      {future.disagreements.map((disagreement) => (
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

                  {future.council.length > 0 ? (
                    <DetailList
                      label="Council perspectives"
                      items={future.council.map(
                        (p) =>
                          `${p.shortTitle} (${p.agreement}): ${p.summary}`,
                      )}
                    />
                  ) : null}

                  <DetailList
                    label="Alternative outcomes"
                    items={future.alternativeOutcomes}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-sm leading-6 text-muted">{futures.closingNote}</p>
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
