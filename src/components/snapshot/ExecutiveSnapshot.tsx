"use client";

import { useMemo, type ReactNode } from "react";
import { DecisionLoopAck } from "@/components/briefing/DecisionLoopAck";
import { BusinessPulseCard } from "@/components/snapshot/BusinessPulseCard";
import { ExecutiveCompassView } from "@/components/snapshot/ExecutiveCompass";
import { ExecutiveStateCard } from "@/components/snapshot/ExecutiveStateCard";
import { OutcomeHealthStrip } from "@/components/snapshot/OutcomeHealthStrip";
import { PriorityDecisionsStrip } from "@/components/snapshot/PriorityDecisionsStrip";
import { RecommendedActionsStrip } from "@/components/snapshot/RecommendedActionsStrip";
import { SinceYesterday } from "@/components/snapshot/SinceYesterday";
import { SnapshotMetrics } from "@/components/snapshot/SnapshotMetrics";
import { ExecutiveCouncilSection } from "@/components/snapshot/ExecutiveCouncilSection";
import { PossibleFuturesSection } from "@/components/snapshot/PossibleFuturesSection";
import { ExecutiveAgendaSection } from "@/components/snapshot/ExecutiveAgendaSection";
import { ExecutiveContextSection } from "@/components/snapshot/ExecutiveContextSection";
import { OperationalContextSection } from "@/components/snapshot/OperationalContextSection";
import { CommercialContextSection } from "@/components/snapshot/CommercialContextSection";
import { LearningBanner } from "@/components/snapshot/LearningBanner";
import { ValidationTrustStrip } from "@/components/snapshot/ValidationTrustStrip";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import {
  bootstrapNorthlineRuntime,
  projectExperienceForTenant,
} from "@/runtime";
import {
  buildLearningMaturity,
  loadDiscoverySession,
  scoreConfidence,
} from "@/onboarding";
import { ExecutiveBadge, ExecutiveSection } from "@/design-system";
import { cn } from "@/lib/utils/cn";
import type { BriefSectionId } from "@/profiles";
import type { ExecutiveSnapshot as SnapshotModel } from "@/lib/snapshot/types";

/**
 * Presentation layer — renders IntelligentExecutiveSnapshot only.
 * Runtime projects tenant / role / workspace / Intelligence Profile
 * without changing Core. Profile only changes prioritisation.
 */
export function ExecutiveSnapshot() {
  const { portfolio } = useOutcomes();
  const experience = useMemo(() => {
    const core = buildExecutiveSnapshotForUi(portfolio);
    const { context } = bootstrapNorthlineRuntime({ role: "ceo" });
    return projectExperienceForTenant(context, core);
  }, [portfolio]);
  const snapshot = experience.snapshot;

  const learningMaturity = useMemo(() => {
    const session = loadDiscoverySession(experience.tenantId);
    if (session?.maturity) return session.maturity;
    const confidence = scoreConfidence({
      discoveries: session?.discoveries ?? [],
      organisationConfidence: session?.organisation?.confidence ?? 55,
      profileConfidence: session?.profile?.confidence ?? 48,
      graphCompleteness: session?.bootstrap?.completeness ?? 40,
    });
    return buildLearningMaturity({
      tenantId: experience.tenantId,
      startedAt: session?.startedAt ?? snapshot.asOf,
      asOf: snapshot.asOf,
      connectedSystems: session?.progress.systemsConnected ?? [
        "microsoft365",
        "simpro",
      ],
      confidence:
        session?.discoveries.length === 0
          ? {
              discoveryConfidence: 58,
              organisationCoverage: 52,
              executiveProfileConfidence: 48,
              knowledgeGraphCompleteness: 45,
              overall: 54,
            }
          : confidence,
      knowledgeGraphGrowth: session?.bootstrap?.entitiesCreated ?? 12,
    });
  }, [experience.tenantId, snapshot.asOf]);

  const layoutSections = experience.briefLayout
    .map((section) => ({
      id: section.id,
      node: renderBriefSection(section.id, snapshot),
    }))
    .filter((item) => item.node != null);

  return (
    <div
      className={cn(
        "eos-snapshot eos-command eos-signature eos-brand mx-auto flex w-full max-w-5xl flex-col",
      )}
    >
      <header className="eos-reveal eos-brand-greeting">
        <ExecutiveBadge>{snapshot.greeting}</ExecutiveBadge>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {experience.tenantName} · {experience.intelligenceProfile.name} ·{" "}
          {experience.briefingMode} · {experience.role.replace(/_/g, " ")}
        </p>
      </header>

      <LearningBanner maturity={learningMaturity} />
      <ValidationTrustStrip tenantId={experience.tenantId} />

      <DecisionLoopAck />

      <div className="eos-reveal eos-reveal-delay-4 eos-signature-bottom space-y-8">
        {layoutSections.map((section, index) => (
          <div
            key={section.id}
            className={
              index === 0
                ? "eos-reveal eos-reveal-delay-0 eos-brand-anchor"
                : undefined
            }
          >
            {section.node}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderBriefSection(
  id: BriefSectionId,
  snapshot: SnapshotModel,
): ReactNode {
  switch (id) {
    case "pulse":
      return <BusinessPulseCard pulse={snapshot.pulse} />;
    case "compass":
      return <ExecutiveCompassView compass={snapshot.compass} />;
    case "outcomes":
      return (
        <>
          <OutcomeHealthStrip outcomes={snapshot.outcomes} />
          <ExecutiveStateCard state={snapshot.executiveState} />
        </>
      );
    case "metrics":
      return <SnapshotMetrics metrics={snapshot.metrics} />;
    case "decisions":
      return (
        <ExecutiveSection id="cc-decisions" label="Priority Decisions">
          <PriorityDecisionsStrip decisions={snapshot.priorityDecisions} />
        </ExecutiveSection>
      );
    case "actions":
      return (
        <ExecutiveSection id="cc-actions" label="Recommended Actions">
          <RecommendedActionsStrip actions={snapshot.recommendedActions} />
        </ExecutiveSection>
      );
    case "since_yesterday":
      return (
        <ExecutiveSection id="cc-since" label="Since Yesterday">
          <SinceYesterday updates={snapshot.sinceYesterday} />
        </ExecutiveSection>
      );
    case "executive_context":
      return snapshot.executiveContext ? (
        <ExecutiveSection id="cc-context" label="Executive Context">
          <ExecutiveContextSection context={snapshot.executiveContext} />
        </ExecutiveSection>
      ) : null;
    case "operational_context":
      return snapshot.operationalContext ? (
        <ExecutiveSection id="cc-operations" label="Operational Context">
          <OperationalContextSection context={snapshot.operationalContext} />
        </ExecutiveSection>
      ) : null;
    case "commercial_context":
      return snapshot.commercialContext ? (
        <ExecutiveSection id="cc-commercial" label="Commercial Context">
          <CommercialContextSection context={snapshot.commercialContext} />
        </ExecutiveSection>
      ) : null;
    case "council":
      return snapshot.executiveCouncil ? (
        <ExecutiveSection id="cc-council" label="Executive Council">
          <ExecutiveCouncilSection council={snapshot.executiveCouncil} />
        </ExecutiveSection>
      ) : null;
    case "futures":
      return snapshot.possibleFutures ? (
        <ExecutiveSection id="cc-futures" label="Possible Futures">
          <PossibleFuturesSection futures={snapshot.possibleFutures} />
        </ExecutiveSection>
      ) : null;
    case "agenda":
      return snapshot.executiveAgenda ? (
        <ExecutiveSection id="cc-agenda" label="Executive Agenda">
          <ExecutiveAgendaSection agenda={snapshot.executiveAgenda} />
        </ExecutiveSection>
      ) : null;
    default:
      return null;
  }
}
