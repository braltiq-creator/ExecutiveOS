"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import {
  buildExecutiveSnapshotForUi,
  runIsolatedExecutiveIntelligence,
  toPresentationSnapshot,
} from "@/intelligence/executive-intelligence";
import {
  bootstrapExecutiveSnapshotRuntime,
  bootstrapNorthlineRuntime,
  projectExperienceForTenant,
} from "@/runtime";
import { listStrategicOutcomes } from "@/strategy";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  getActiveExecutiveSnapshot,
  getExperienceIntent,
  listStoredExecutiveSnapshots,
  resolveAndActivateExecutiveSnapshot,
  resolveIntelligenceProfileIdFromBusinessProfile,
  setExperienceIntent,
  shouldForbidDemoFallback,
  snapshotCommandCentreTitle,
  type ActiveExecutiveSnapshotContext,
} from "@/executive-snapshot-studio/launch";
import { resetLoopStore } from "@/experience/executive-loop";

export type ExperienceDataMode =
  | "loading"
  | "demo"
  | "executive_snapshot"
  | "unavailable";

/**
 * Assembles Today experience data without changing Core engines.
 * Real Executive Snapshot context always takes precedence over demo.
 * Phase 65 — never silently fall back to demo after Design Partner / Studio use.
 */
export function useExperienceData() {
  const { portfolio } = useOutcomes();
  const loadExternalPortfolio = usePortfolioStore(
    (s) => s.loadExternalPortfolio,
  );
  const searchParams = useSearchParams();
  const studioParam = searchParams.get("studio");
  const demoParam = searchParams.get("demo");

  const [active, setActive] = useState<ActiveExecutiveSnapshotContext | null>(
    null,
  );
  const [unavailable, setUnavailable] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next: ActiveExecutiveSnapshotContext | null = null;
    let missing = false;
    let reason: string | null = null;

    if (demoParam === "1") {
      setExperienceIntent("demo");
    }

    if (studioParam) {
      next = resolveAndActivateExecutiveSnapshot(studioParam);
      if (!next) {
        missing = true;
        reason =
          "Executive Snapshot unavailable. Re-open the snapshot from Snapshot Studio.";
      }
    } else {
      next = getActiveExecutiveSnapshot();
    }

    if (next) {
      resetLoopStore();
      loadExternalPortfolio(next.portfolio, {
        snapshotId: next.snapshotId,
        persist: true,
      });
      setActive(next);
      setUnavailable(false);
      setUnavailableReason(null);
    } else {
      const intent = getExperienceIntent();
      const libraryCount = listStoredExecutiveSnapshots().length;
      // M3.1 — never silent Northline/Alex/Helix for authenticated empty state.
      // Explicit ?demo=1 / intent demo remains the only demo entry.
      const forbid = shouldForbidDemoFallback({
        studioParam,
        hasActiveSnapshot: false,
        libraryCount,
        demoParam,
        intent,
        forbidSilentDemo: true,
      });

      if (forbid) {
        missing = true;
        reason =
          reason ??
          "Executive Snapshot unavailable. Re-open the snapshot from Snapshot Studio.";
      }

      setActive(null);
      setUnavailable(missing);
      setUnavailableReason(reason);
    }
    setReady(true);
  }, [studioParam, demoParam, loadExternalPortfolio]);

  return useMemo(() => {
    if (!ready) {
      return {
        mode: "loading" as ExperienceDataMode,
        experience: null,
        snapshot: null,
        strategicOutcomes: [],
        activeSnapshot: null as ActiveExecutiveSnapshotContext | null,
        headerTitle: "",
        useGreeting: true,
        executiveValueQuantified: true,
        unavailableReason: null as string | null,
        intelligenceProfileId: null as string | null,
      };
    }

    if (unavailable) {
      return {
        mode: "unavailable" as ExperienceDataMode,
        experience: null,
        snapshot: null,
        strategicOutcomes: [],
        activeSnapshot: null,
        headerTitle: "Executive Snapshot unavailable",
        useGreeting: false,
        executiveValueQuantified: false,
        unavailableReason:
          unavailableReason ??
          "Executive Snapshot unavailable. Re-open the snapshot from Snapshot Studio.",
        intelligenceProfileId: null,
      };
    }

    if (active) {
      const intelligenceProfileId =
        active.intelligenceProfileId ??
        resolveIntelligenceProfileIdFromBusinessProfile(active.profileId);

      let core;
      let experience;
      try {
        core = toPresentationSnapshot(
          runIsolatedExecutiveIntelligence(active.portfolio, {
            executiveName: active.organisationName?.trim() || "Executive",
            asOf: active.portfolio.refreshedAt,
          }),
        );
        const { context } = bootstrapExecutiveSnapshotRuntime({
          organisationId: active.organisationId,
          organisationName: active.organisationName,
          profileLabel: active.profileLabel,
          snapshotId: active.snapshotId,
          intelligenceProfileId,
          asOf: active.portfolio.refreshedAt,
        });
        experience = projectExperienceForTenant(context, core);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The snapshot's business profile could not be resolved.";
        return {
          mode: "unavailable" as ExperienceDataMode,
          experience: null,
          snapshot: null,
          strategicOutcomes: [],
          activeSnapshot: active,
          headerTitle: "Executive Snapshot unavailable",
          useGreeting: false,
          executiveValueQuantified: false,
          unavailableReason: message,
          intelligenceProfileId: null,
        };
      }

      const strategicOutcomes = listStrategicOutcomes(experience.tenantId);

      return {
        mode: "executive_snapshot" as ExperienceDataMode,
        experience,
        snapshot: experience.snapshot,
        strategicOutcomes,
        activeSnapshot: active,
        headerTitle: snapshotCommandCentreTitle(active),
        useGreeting: false,
        executiveValueQuantified: false,
        unavailableReason: null,
        intelligenceProfileId,
      };
    }

    // Explicit demo only (?demo=1 / intent). Never silent production fallback.
    const intent = getExperienceIntent();
    const explicitDemo = demoParam === "1" || intent === "demo";
    if (!explicitDemo) {
      return {
        mode: "unavailable" as ExperienceDataMode,
        experience: null,
        snapshot: null,
        strategicOutcomes: [],
        activeSnapshot: null,
        headerTitle: "Executive Snapshot unavailable",
        useGreeting: false,
        executiveValueQuantified: false,
        unavailableReason:
          "Executive Snapshot unavailable. Re-open the snapshot from Snapshot Studio.",
        intelligenceProfileId: null,
      };
    }

    const core = buildExecutiveSnapshotForUi(portfolio);
    const { context } = bootstrapNorthlineRuntime({ role: "ceo" });
    const experience = projectExperienceForTenant(context, core);
    const strategicOutcomes = listStrategicOutcomes(experience.tenantId);

    return {
      mode: "demo" as ExperienceDataMode,
      experience,
      snapshot: experience.snapshot,
      strategicOutcomes,
      activeSnapshot: null,
      headerTitle: "",
      useGreeting: true,
      executiveValueQuantified: true,
      unavailableReason: null,
      intelligenceProfileId: "operations_executive",
    };
  }, [ready, unavailable, unavailableReason, active, portfolio, demoParam]);
}
