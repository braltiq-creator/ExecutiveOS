"use client";

import Link from "next/link";
import { DecisionWorkspace } from "@/components/decisions/workspace/DecisionWorkspace";
import { useDecisionsOptional } from "@/components/providers/DecisionProvider";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import { useEffect, useState } from "react";

/** Decision detail entry — Sprint 3 Decision Workspace + Phase 60 snapshot IDs. */
export function DecisionDetailView({ decisionId }: { decisionId: string }) {
  const decisions = useDecisionsOptional();
  const { portfolio, hydrated } = usePortfolioHydration();

  if (!hydrated || !decisions) {
    return (
      <p className="eos-type-body text-[var(--eos-color-text-secondary)]">
        Preparing decision context…
      </p>
    );
  }

  const found = decisions.getDecisionById(decisionId);
  if (!found) {
    return (
      <div className="space-y-3" data-decision-missing="true">
        <p className="eos-type-body text-[var(--eos-color-text)]">
          Decision not found in the active portfolio.
        </p>
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          Re-open from Command Centre or Decisions after activating an Executive
          Snapshot. Portfolio has {portfolio.decisions.length} decision
          {portfolio.decisions.length === 1 ? "" : "s"}.
        </p>
        <Link
          href="/decisions"
          className="eos-type-caption font-semibold"
          style={{ color: "var(--exds-electric)" }}
        >
          ← Decision Workspace
        </Link>
      </div>
    );
  }

  return <DecisionWorkspace decisionId={decisionId} />;
}

function usePortfolioHydration() {
  const { portfolio } = useOutcomes();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, [portfolio]);
  return { portfolio, hydrated };
}
