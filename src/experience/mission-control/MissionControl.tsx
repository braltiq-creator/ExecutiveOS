"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  computeExecutiveValueScore,
  listValueEstimates,
  synthesiseValueEstimates,
} from "@/growth/executive-value";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { useDecisionsOptional } from "@/components/providers/DecisionProvider";
import {
  buildActivityFeed,
  buildExecutivePulse,
  buildMissionKpis,
  missionHeaderModel,
} from "@/experience/mission-control/derive";
import {
  assertNoDemoBusinessContext,
} from "@/experience/mission-control/snapshot-integrity";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import { MissionHeader } from "@/experience/mission-control/MissionHeader";
import { KpiBar } from "@/experience/mission-control/KpiBar";
import { ExecutivePulse } from "@/experience/mission-control/ExecutivePulse";
import {
  applyLoopToFeed,
  applyLoopToKpis,
  applyLoopToPulse,
  buildLoopMemory,
  clearLoopHighlights,
  listLoopImpacts,
  loopHealthOverride,
  useExecutiveLoop,
} from "@/experience/executive-loop";
import {
  buildExecutiveIntelligenceView,
  intelligenceScoreToKpi,
  ExecutiveBriefPanel,
  IntelligenceStream,
  JudgementQueue,
} from "@/experience/intelligence-engine";
import {
  buildOutcomesEngineView,
  OutcomeContextStrip,
} from "@/experience/outcomes-engine";
import {
  buildExecutiveCouncilView,
  CouncilBriefStrip,
} from "@/experience/executive-council";
import { buildExecutiveRhythmView } from "@/experience/executive-rhythm";
import type { McKpi } from "@/experience/mission-control/types";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";

/**
 * Executive Command Centre — fixed cockpit.
 * Situation → Brief → Judgement | Intelligence Stream.
 * Renders from the active Executive Snapshot when present — never mixes demo.
 */
export function MissionControl() {
  const searchParams = useSearchParams();
  const {
    mode,
    experience,
    snapshot,
    strategicOutcomes,
    activeSnapshot,
    headerTitle,
    useGreeting,
    executiveValueQuantified,
  } = useExperienceData();
  const decisionsCtx = useDecisionsOptional();
  const loop = useExecutiveLoop();
  const [monitorStamp, setMonitorStamp] = useState(() =>
    formatMonitorStamp(new Date()),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setMonitorStamp(formatMonitorStamp(new Date()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (searchParams.get("loop") !== "1") return;
    const id = window.setTimeout(() => clearLoopHighlights(), 4500);
    return () => window.clearTimeout(id);
  }, [searchParams, loop.version]);

  if (mode === "loading") {
    return (
      <div
        className="mc-root flex h-full min-h-0 flex-col gap-2"
        data-mission-control="true"
        data-snapshot-context="loading"
        aria-label="Executive Command Centre"
      >
        <header className="mc-header border-b border-[var(--exs-divider)] pb-2.5">
          <p className="exs-label">Executive Command Centre</p>
          <h1 className="exs-title text-[length:1.3rem] tracking-tight">
            Loading executive context…
          </h1>
        </header>
      </div>
    );
  }

  if (mode === "unavailable" || !experience || !snapshot) {
    return <MissionControlFirstRun />;
  }

  if (mode === "executive_snapshot" && activeSnapshot) {
    return <MissionControlSnapshot activeSnapshot={activeSnapshot} />;
  }

  return (
    <MissionControlDemo
      experienceTenantId={experience.tenantId}
      snapshot={snapshot}
      strategicOutcomes={strategicOutcomes}
      headerTitle={headerTitle}
      useGreeting={useGreeting}
      executiveValueQuantified={executiveValueQuantified}
      decisions={decisionsCtx?.decisions ?? []}
      loop={loop}
      monitorStamp={monitorStamp}
      searchParams={searchParams}
    />
  );
}

/**
 * Phase 35A — first-run empty state when no Executive Snapshot is active.
 * Guides new organisations to Snapshot Studio; never invents demo context.
 */
function MissionControlFirstRun() {
  return (
    <div
      className="mc-root flex h-full min-h-0 flex-col gap-2"
      data-mission-control="true"
      data-snapshot-context="first-run"
      aria-label="Executive Command Centre"
    >
      <header className="mc-header border-b border-[var(--exs-divider)] pb-2.5">
        <p className="exs-label">Executive Command Centre</p>
        <h1 className="exs-title text-[length:1.3rem] tracking-tight">
          Your Executive Command Centre is ready to be created.
        </h1>
        <p className="exs-body mt-2 max-w-2xl text-[length:0.85rem]">
          ExecutiveOS needs your business context before it can generate your
          first Executive Snapshot.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/onboarding/snapshot"
            className="inline-flex h-10 items-center justify-center rounded-[var(--eos-radius-sm)] bg-[var(--eos-color-text)] px-4 text-[length:0.8rem] font-semibold text-[var(--eos-color-surface)] transition-opacity hover:opacity-90"
            data-first-run-cta="create-snapshot"
          >
            Create Your Executive Snapshot
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center justify-center rounded-[var(--eos-radius-sm)] border border-[var(--exs-divider)] px-4 text-[length:0.8rem] font-medium text-[var(--eos-color-text)] transition-colors hover:bg-[var(--eos-color-surface-muted)]"
            data-first-run-cta="return-onboarding"
          >
            Return to Onboarding
          </Link>
        </div>
      </header>
    </div>
  );
}

/** Real Executive Snapshot projection — Phase 58 EXDS experience; no demo mix. */
function MissionControlSnapshot(props: {
  activeSnapshot: ActiveExecutiveSnapshotContext;
}) {
  const { activeSnapshot } = props;
  const livePortfolio = usePortfolioStore((s) => s.portfolio);

  const model = useMemo(
    () => buildCommandCentreExperience(activeSnapshot, livePortfolio),
    [activeSnapshot, livePortfolio],
  );

  if (process.env.NODE_ENV !== "production") {
    assertNoDemoBusinessContext(
      [
        model.leadJudgement,
        model.darkPanel.judgement,
        model.council.framing,
        ...model.queue.map((q) => q.title),
        ...model.stream.map((e) => e.title),
      ].join("\n"),
    );
  }

  return <CommandCentreExperience model={model} />;
}

/** Demo / Northline Command Centre — unchanged when no real snapshot is active. */
function MissionControlDemo(props: {
  experienceTenantId: string;
  snapshot: NonNullable<ReturnType<typeof useExperienceData>["snapshot"]>;
  strategicOutcomes: NonNullable<
    ReturnType<typeof useExperienceData>["strategicOutcomes"]
  >;
  headerTitle: string;
  useGreeting: boolean;
  executiveValueQuantified: boolean;
  decisions: NonNullable<
    ReturnType<typeof useDecisionsOptional>
  >["decisions"];
  loop: ReturnType<typeof useExecutiveLoop>;
  monitorStamp: string;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const {
    experienceTenantId,
    snapshot,
    strategicOutcomes,
    headerTitle,
    useGreeting,
    executiveValueQuantified,
    decisions,
    loop,
    monitorStamp,
  } = props;

  const value = useMemo(() => {
    if (!executiveValueQuantified) {
      return {
        last30Days: null as number | null,
        confidence: snapshot.pulse.confidence,
        trend: "flat" as const,
      };
    }
    if (listValueEstimates(experienceTenantId).length === 0) {
      synthesiseValueEstimates({ organizationId: experienceTenantId });
    }
    return computeExecutiveValueScore({
      organizationId: experienceTenantId,
    });
  }, [executiveValueQuantified, experienceTenantId, snapshot.pulse.confidence]);

  const valueTrend =
    value.trend === "up" ? "up" : value.trend === "down" ? "down" : "flat";

  const intelligence = useMemo(() => {
    const feed = applyLoopToFeed(buildActivityFeed(snapshot), loop);
    const memory = buildLoopMemory(loop);
    return buildExecutiveIntelligenceView({
      snapshot,
      decisions,
      strategicOutcomes,
      loopImpacts: listLoopImpacts(),
      feed,
      memory,
    });
  }, [snapshot, decisions, strategicOutcomes, loop]);

  const outcomesView = useMemo(
    () =>
      buildOutcomesEngineView({
        strategicOutcomes,
        snapshot,
        decisions,
        loopImpacts: listLoopImpacts(),
        workspace: "today",
      }),
    [strategicOutcomes, snapshot, decisions, loop],
  );

  const council = useMemo(
    () =>
      buildExecutiveCouncilView({
        snapshot,
        strategicOutcomes,
        decisions,
        loopImpacts: listLoopImpacts(),
      }),
    [snapshot, strategicOutcomes, decisions, loop],
  );

  const rhythm = useMemo(
    () =>
      buildExecutiveRhythmView({
        snapshot,
        strategicOutcomes,
        decisions,
        observations: council.agency.briefingObservations,
        loopImpacts: listLoopImpacts(),
      }),
    [snapshot, strategicOutcomes, decisions, council, loop],
  );

  const baseHeader = missionHeaderModel(snapshot);
  const header = {
    ...baseHeader,
    name: useGreeting ? baseHeader.name : headerTitle || baseHeader.name,
    health: loopHealthOverride(baseHeader.health, loop),
    refreshedLabel: loop.lastRecalculatedAt
      ? `Updated ${formatMonitorStamp(new Date(loop.lastRecalculatedAt))}`
      : baseHeader.refreshedLabel,
  };

  const baseKpis = buildMissionKpis({
    snapshot,
    strategicOutcomes,
    monthlyValue: executiveValueQuantified ? (value.last30Days ?? 0) : null,
    valueTrend,
    valueConfidence: value.confidence,
  }).map((kpi) => ({ ...kpi, updatedLabel: monitorStamp }));

  const withIntelligence: McKpi[] = [
    baseKpis[0]!,
    {
      ...intelligenceScoreToKpi(intelligence.score, monitorStamp),
    },
    ...baseKpis.slice(1),
  ];

  const kpis = applyLoopToKpis(withIntelligence, loop);
  const pulse = applyLoopToPulse(
    buildExecutivePulse({ snapshot, valueTrend }),
    loop,
  );

  return (
    <div
      className="mc-root flex h-full min-h-0 flex-col gap-2"
      data-mission-control="true"
      data-exs="1.0"
      data-intelligence="1.0"
      data-snapshot-context="demo"
      data-loop={loop.impacts.length > 0 ? "live" : "idle"}
      aria-label="Executive Command Centre"
    >
      <MissionHeader
        name={header.name}
        health={header.health}
        refreshedLabel={header.refreshedLabel}
        asOf={snapshot.asOf}
        useGreeting={useGreeting}
      />

      <KpiBar kpis={kpis} />
      <ExecutivePulse pulse={pulse} />
      <ExecutiveBriefPanel
        brief={intelligence.brief}
        observations={council.agency.briefingObservations}
        rhythm={rhythm.awareness}
      />
      {outcomesView.focus ? (
        <OutcomeContextStrip context={outcomesView.focus} compact />
      ) : null}
      <CouncilBriefStrip
        brief={council.brief}
        decisionTitle={council.decisionTitle}
        outcomeName={council.outcomeName}
        compact
      />

      <div className="mc-main grid min-h-0 flex-1 gap-2.5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <JudgementQueue items={intelligence.queue} />
        <IntelligenceStream events={intelligence.stream} />
      </div>
    </div>
  );
}

function formatMonitorStamp(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
