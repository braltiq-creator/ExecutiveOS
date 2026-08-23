"use client";

import { useState } from "react";
import type { ExecutiveCouncilView } from "@/lib/snapshot/types";
import { cn } from "@/lib/utils/cn";

type ExecutiveCouncilSectionProps = {
  council: ExecutiveCouncilView;
};

/**
 * Executive Council — expandable perspectives.
 * Presents disagreement; never averages opinions.
 */
export function ExecutiveCouncilSection({
  council,
}: ExecutiveCouncilSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-secondary sm:text-[15px]">
        {council.framing}
      </p>

      {council.conflicts.length > 0 ? (
        <div className="space-y-3 border-l-2 border-foreground/20 pl-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Disagreement preserved
          </p>
          {council.conflicts.map((conflict) => (
            <div key={conflict.topic} className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {conflict.topic}
              </p>
              <ul className="space-y-2">
                {conflict.positions.map((position) => (
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
                {conflict.facilitation}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <ul className="divide-y divide-border border-y border-border">
        {council.perspectives.map((perspective) => {
          const open = openId === perspective.agentId;
          return (
            <li key={perspective.agentId} className="py-3">
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setOpenId(open ? null : perspective.agentId)
                }
                className={cn(
                  "flex w-full items-start justify-between gap-4 text-left",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                )}
              >
                <span>
                  <span className="block font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {perspective.title}
                  </span>
                  <span className="mt-1 block text-sm text-secondary">
                    {perspective.stanceLabel}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {open ? "Hide" : "Expand"}
                </span>
              </button>

              {open ? (
                <div className="mt-4 space-y-4 pl-0 sm:pl-1">
                  <p className="text-sm leading-6 text-foreground">
                    {perspective.summary}
                  </p>
                  {perspective.recommendations.length > 0 ? (
                    <PerspectiveList
                      label="Recommendations"
                      items={perspective.recommendations}
                    />
                  ) : null}
                  {perspective.strategicOutcomeContributions &&
                  perspective.strategicOutcomeContributions.length > 0 ? (
                    <PerspectiveList
                      label="Strategic outcome contribution"
                      items={perspective.strategicOutcomeContributions}
                    />
                  ) : null}
                  {perspective.challenges.length > 0 ? (
                    <PerspectiveList
                      label="Challenges"
                      items={perspective.challenges}
                    />
                  ) : null}
                  {perspective.risks.length > 0 ? (
                    <PerspectiveList label="Risks" items={perspective.risks} />
                  ) : null}
                  {perspective.opportunities.length > 0 ? (
                    <PerspectiveList
                      label="Opportunities"
                      items={perspective.opportunities}
                    />
                  ) : null}
                  <PerspectiveList
                    label="Reasoning"
                    items={perspective.reasoning}
                  />
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Confidence {perspective.confidence}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {council.decisionSequence.length > 0 ? (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Decision sequence
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-secondary">
            {council.decisionSequence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="text-sm leading-6 text-secondary">{council.closingNote}</p>
    </div>
  );
}

function PerspectiveList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
