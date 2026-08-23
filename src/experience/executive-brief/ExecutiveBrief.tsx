"use client";

import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { deriveTodaysFocus } from "@/experience/executive-brief/briefFocus";
import {
  buildLeadJudgementProse,
  countJudgementAreas,
  dayPartLabel,
  estimateReviewMinutes,
  evidenceSourcesLabel,
  parseGreetingName,
} from "@/experience/executive-brief/briefCopy";
import {
  ExecutiveHero,
  TodaysFocus,
  LeadJudgement,
  ExecutiveValueStatement,
  StrategicOutcomesSection,
  PriorityDecisionsSection,
  CriticalInsightsSection,
  CalendarContextSection,
  RecommendedActionsSection,
} from "@/experience/executive-brief/sections";

/**
 * Executive Snapshot Experience v2.2 — front page of the organisation.
 * Level One: Know. Execution always continues elsewhere.
 * Presentation only — Core, routing, providers, and data models unchanged.
 */
export function ExecutiveBrief() {
  const { mode, experience, snapshot, strategicOutcomes, unavailableReason } =
    useExperienceData();

  if (mode === "loading") {
    return (
      <ExperiencePage width="brief" className="ex-snapshot pb-10" aria-label="Executive Snapshot">
        <p className="exs-body mt-6">Loading executive context…</p>
      </ExperiencePage>
    );
  }

  if (mode === "unavailable" || !experience || !snapshot) {
    return (
      <ExperiencePage width="brief" className="ex-snapshot pb-10" aria-label="Executive Snapshot">
        <p className="exs-title mt-6 text-[length:1.3rem] tracking-tight">
          Executive Snapshot unavailable
        </p>
        <p className="exs-body mt-2 text-[length:0.85rem]">
          {unavailableReason ??
            "Re-open the snapshot from Snapshot Studio to restore executive context."}
        </p>
      </ExperiencePage>
    );
  }

  const focus = deriveTodaysFocus(snapshot);
  const name = parseGreetingName(snapshot.greeting);
  const dayPart = dayPartLabel(snapshot.asOf);
  const reviewMinutes = estimateReviewMinutes(snapshot);
  const judgementAreas = countJudgementAreas(snapshot);
  const leadProse = buildLeadJudgementProse(snapshot);
  const evidenceSources = evidenceSourcesLabel(snapshot);

  const pulseTone =
    snapshot.pulse.level === "critical"
      ? "critical"
      : snapshot.pulse.level === "attention"
        ? "attention"
        : snapshot.pulse.level === "improving"
          ? "success"
          : "accent";

  const nextDecisionByOutcome: Record<string, string> = {};
  for (const action of snapshot.recommendedActions) {
    if (action.supportsOutcomeId && action.title) {
      nextDecisionByOutcome[action.supportsOutcomeId] = action.title;
    }
  }

  const focusAnswer = snapshot.pulse.why;
  const focusWhy =
    snapshot.executiveState.summary ||
    "This focus shapes where judgement belongs today.";

  return (
    <ExperiencePage
      width="brief"
      className="ex-snapshot pb-10"
      data-brief-focus={focus.toLowerCase()}
      aria-label="Executive Snapshot"
    >
      {/*
        Reveal: Lead Judgement first (centrepiece), then Hero, then snapshot cards.
        One-screen orientation: what changed, why it matters, where to go next.
      */}
      <LeadJudgement
        pulse={snapshot.pulse}
        prose={leadProse}
        evidenceSources={evidenceSources}
        tone={pulseTone}
        delay={0}
      />

      <ExecutiveHero
        dayPart={dayPart}
        name={name}
        judgementAreas={judgementAreas}
        reviewMinutes={reviewMinutes}
        delay={1}
      />

      <TodaysFocus
        focus={focus}
        answer={focusAnswer}
        why={focusWhy}
        delay={2}
      />

      <ExecutiveValueStatement
        organizationId={experience.tenantId}
        delay={3}
      />

      <StrategicOutcomesSection
        strategicOutcomes={strategicOutcomes}
        snapshotOutcomes={snapshot.outcomes}
        nextDecisionByOutcome={nextDecisionByOutcome}
        delay={4}
      />

      <PriorityDecisionsSection
        decisions={snapshot.priorityDecisions}
        actions={snapshot.recommendedActions}
        delay={5}
      />

      <CriticalInsightsSection
        updates={snapshot.sinceYesterday}
        delay={6}
      />

      <CalendarContextSection snapshot={snapshot} delay={7} />

      <RecommendedActionsSection
        actions={snapshot.recommendedActions}
        delay={8}
      />
    </ExperiencePage>
  );
}
