"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { compareManufacturingSnapshots } from "@/design-partner";
import { SnapshotComparisonPanel } from "@/experience/design-partner";
import { compareLibraryEntries, listLibrary } from "../history";
import {
  launchCommandCentreHref,
  listStoredExecutiveSnapshots,
  persistActivatedExecutiveSnapshot,
  resolveAndActivateExecutiveSnapshot,
  revokeFailedExecutiveSnapshotActivation,
} from "../launch";
import { usePortfolioStore } from "@/store/portfolio-store";

type SnapshotLibraryProps = {
  organisationId: string;
  className?: string;
};

/**
 * Executive Snapshot Library — immutable entries, comparable, no editing.
 * Opening restores the corresponding Command Centre context.
 */
export function SnapshotLibrary({
  organisationId,
  className,
}: SnapshotLibraryProps) {
  const router = useRouter();
  const entries = listLibrary(organisationId);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comparison = useMemo(() => {
    if (!compareA || !compareB) return null;
    return compareLibraryEntries(compareA, compareB);
  }, [compareA, compareB]);

  const manufacturingComparison = useMemo(() => {
    if (!compareA || !compareB) return null;
    const stored = listStoredExecutiveSnapshots().filter(
      (s) => s.organisationId === organisationId,
    );
    const a = stored.find((s) => s.studioId === compareA);
    const b = stored.find((s) => s.studioId === compareB);
    if (!a?.manufacturingAnalysis && !b?.manufacturingAnalysis) return null;
    return compareManufacturingSnapshots({
      currentId: a?.snapshotId ?? compareA,
      previousId: b?.snapshotId ?? compareB,
      currentLabel: a?.filename ?? "This snapshot",
      previousLabel: b?.filename ?? "Previous snapshot",
      currentConfidence: a?.confidenceOverall ?? null,
      previousConfidence: b?.confidenceOverall ?? null,
      currentReadiness: a?.readiness ?? null,
      previousReadiness: b?.readiness ?? null,
      currentAnalysis: a?.manufacturingAnalysis ?? null,
      previousAnalysis: b?.manufacturingAnalysis ?? null,
    });
  }, [compareA, compareB, organisationId]);

  async function openCommandCentre(studioId: string) {
    setError(null);
    const ctx = resolveAndActivateExecutiveSnapshot(studioId);
    if (!ctx) {
      setError(
        "Executive Snapshot unavailable. Re-run Intelligence for this snapshot before opening Command Centre.",
      );
      return;
    }
    const durable = await persistActivatedExecutiveSnapshot(ctx);
    if (!durable.ok) {
      revokeFailedExecutiveSnapshotActivation(ctx.studioId);
      setError(
        durable.error ||
          "Unable to persist Executive Snapshot to Production. Command Centre was not opened.",
      );
      return;
    }
    usePortfolioStore.getState().loadExternalPortfolio(ctx.portfolio, {
      snapshotId: ctx.snapshotId,
      persist: true,
    });
    router.push(launchCommandCentreHref(studioId));
  }

  if (entries.length === 0) {
    return (
      <section
        className={cn(
          "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
          "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
          className,
        )}
      >
        <p className={ds.type.label}>Executive Snapshot Library</p>
        <p className="eos-type-body mt-2 text-[var(--eos-color-text)]">
          Snapshots you create will appear here. They cannot be edited.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <p className={ds.type.label}>Executive Snapshot Library</p>
      <p className="eos-type-caption mt-1">Immutable · comparable · no editing</p>

      <ul className="mt-[var(--eos-space-md)] space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.studioId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--eos-radius-sm)] border border-[var(--exds-card-border)] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="eos-type-subheading text-[var(--eos-color-text)]">
                {entry.profileLabel}
              </p>
              <p className="eos-type-caption mt-0.5">
                {entry.createdAt.replace("T", " ").slice(0, 19)} · Confidence{" "}
                {entry.confidence}% · Readiness {entry.executiveReadiness}% ·{" "}
                {entry.recordCount} records
              </p>
              <p className="eos-type-caption">
                Brief {entry.briefGenerated ? "generated" : "pending"} · Command
                Centre {entry.commandCentreReady ? "ready" : "pending"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="eos-type-caption text-[var(--exds-intelligence)]"
                onClick={() => setCompareA(entry.studioId)}
              >
                Compare A
              </button>
              <button
                type="button"
                className="eos-type-caption text-[var(--exds-intelligence)]"
                onClick={() => setCompareB(entry.studioId)}
              >
                Compare B
              </button>
              <button
                type="button"
                className="eos-type-caption font-semibold text-[var(--exds-decision)]"
                onClick={() => openCommandCentre(entry.studioId)}
              >
                Open →
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p
          className="eos-type-supporting mt-3"
          style={{ color: "var(--exds-attention)" }}
        >
          {error}
        </p>
      ) : null}

      {manufacturingComparison ? (
        <div className="mt-[var(--eos-space-md)]">
          <SnapshotComparisonPanel comparison={manufacturingComparison} />
        </div>
      ) : comparison?.a && comparison.b ? (
        <div className="mt-[var(--eos-space-md)] border-t border-[var(--eos-color-divider)] pt-[var(--eos-space-md)]">
          <p className={ds.type.label}>Comparison</p>
          <p className="eos-type-supporting mt-2 text-[var(--eos-color-text)]">
            Readiness Δ {comparison.readinessDelta} · Confidence Δ{" "}
            {comparison.confidenceDelta} · Volume Δ {comparison.volumeDelta}
          </p>
        </div>
      ) : null}
    </section>
  );
}
