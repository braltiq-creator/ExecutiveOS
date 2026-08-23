"use client";

import { useState } from "react";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type {
  CouncilConsensus,
  CouncilOpinion,
  ExecutiveCouncilView,
} from "@/experience/executive-council/types";
import { cn } from "@/lib/utils/cn";

type PanelProps = {
  view: ExecutiveCouncilView;
  /** Compact list for denser surfaces. */
  compact?: boolean;
};

/**
 * Full Council Opinion set — five executive perspectives on the focal decision.
 */
export function CouncilOpinionPanel({ view, compact = false }: PanelProps) {
  return (
    <Reveal delay={3}>
      <section
        id="executive-council"
        aria-label="Executive Council"
        className="scroll-mt-6"
        data-executive-council="true"
      >
        <ExsSectionHeader
          label="Executive Council"
          icon={EXECUTIVE_ICONS.priorities}
          className={compact ? "mb-1.5" : undefined}
        />
        <p className="exs-body mb-2 text-[length:0.8rem]">
          Peer judgement on{" "}
          <span className="font-medium text-[var(--exs-text)]">
            {view.decisionTitle}
          </span>
          {" · "}
          Outcome{" "}
          <span className="font-medium text-[var(--exs-text)]">
            {view.outcomeName}
          </span>
        </p>
        <ul
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-1" : "lg:grid-cols-1",
          )}
        >
          {view.opinions.map((opinion) => (
            <li key={opinion.roleId}>
              <CouncilOpinionCard opinion={opinion} compact={compact} />
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

export function CouncilOpinionCard({
  opinion,
  compact,
}: {
  opinion: CouncilOpinion;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="exs-card">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="exs-label">{opinion.shortTitle}</p>
          <p className="exs-title mt-0.5 text-[length:0.9rem]">
            {opinion.positionLabel}
          </p>
        </div>
        <p className="exs-label shrink-0 normal-case tabular-nums">
          {opinion.confidence}%
        </p>
      </header>
      <p className="exs-body mt-1.5 line-clamp-2 text-[length:0.78rem]">
        {opinion.reasoning}
      </p>
      {!compact || open ? (
        <div className="mt-2 space-y-1 border-t border-[var(--exs-divider)] pt-2">
          <p className="exs-body text-[length:0.75rem]">
            <span className="font-medium text-[var(--exs-text)]">Impact. </span>
            {opinion.businessImpact}
          </p>
          <p className="exs-body text-[length:0.75rem]">
            <span className="font-medium text-[var(--exs-text)]">Action. </span>
            {opinion.suggestedAction}
          </p>
          <ul className="space-y-0.5">
            {opinion.keyRisks.map((r) => (
              <li key={r} className="exs-label normal-case">
                Risk · {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {compact ? (
        <button
          type="button"
          className="exs-label mt-1.5 text-[var(--exs-nav)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide detail" : "Full perspective →"}
        </button>
      ) : null}
    </article>
  );
}

type ConsensusProps = {
  consensus: CouncilConsensus;
};

export function CouncilConsensusPanel({ consensus }: ConsensusProps) {
  return (
    <Reveal delay={4}>
      <section
        id="council-consensus"
        aria-label="Council Consensus"
        className="scroll-mt-6"
        data-council-consensus="true"
      >
        <ExsSectionHeader
          label="Council Consensus"
          icon={EXECUTIVE_ICONS.decisions}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <div>
            <p className="exs-label">Overall recommendation</p>
            <p className="exs-title mt-1 text-[length:1rem]">
              {consensus.recommendation}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p className="exs-label normal-case">
              Agreement{" "}
              <span className="text-[var(--exs-text)]">
                {consensus.agreementLevel} ({consensus.agreementPct}%)
              </span>
            </p>
            <p className="exs-label normal-case">
              Confidence{" "}
              <span className="tabular-nums text-[var(--exs-text)]">
                {consensus.confidence}%
              </span>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ListBlock label="Areas of consensus" items={consensus.consensusAreas} />
            <ListBlock
              label="Areas of disagreement"
              items={consensus.disagreementAreas}
            />
            <ListBlock label="Key trade-offs" items={consensus.tradeOffs} />
            <div>
              <p className="exs-label mb-1">Recommended executive decision</p>
              <p className="exs-body text-[length:0.85rem]">
                {consensus.recommendedDecision}
              </p>
            </div>
          </div>
        </article>
      </section>
    </Reveal>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="exs-label mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="exs-body text-[length:0.8rem]">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
