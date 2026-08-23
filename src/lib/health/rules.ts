import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import type {
  InitiativeLinkRecord,
  InitiativeWithLinks,
  StrategicInitiativeRecord,
} from "@/lib/initiatives/types";
import type {
  ExecutiveMeetingRecord,
  MeetingActionRecord,
} from "@/lib/meetings/types";
import type { ExecutiveMemoryRecord } from "@/lib/memory/types";
import type { StrategicObjective } from "@/types/onboarding";
import type { HealthSignal } from "@/lib/health/types";

export type HealthRuleContext = {
  objectives: StrategicObjective[];
  decisions: ExecutiveDecisionRecord[];
  memories: ExecutiveMemoryRecord[];
  meetings: Array<{
    meeting: ExecutiveMeetingRecord;
    actions: MeetingActionRecord[];
  }>;
  now: Date;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function isActionOutstanding(action: MeetingActionRecord, now: Date): boolean {
  return action.status === "open" || action.status === "in_progress";
}

function isActionOverdue(action: MeetingActionRecord, now: Date): boolean {
  if (!action.due_date || !isActionOutstanding(action, now)) {
    return false;
  }

  return new Date(action.due_date) < now;
}

function linkedRecords<T extends { id: string }>(
  links: InitiativeLinkRecord[],
  linkType: InitiativeLinkRecord["link_type"],
  catalog: T[],
): T[] {
  const linkedIds = new Set(
    links.filter((link) => link.link_type === linkType).map((link) => link.linked_id),
  );

  return catalog.filter((item) => linkedIds.has(item.id));
}

function linkedMemoriesByType(
  links: InitiativeLinkRecord[],
  memories: ExecutiveMemoryRecord[],
  memoryType: ExecutiveMemoryRecord["memory_type"],
): ExecutiveMemoryRecord[] {
  const typeLinks = links.filter(
    (link) =>
      link.link_type === memoryType ||
      (memoryType === "risk" && link.link_type === "risk") ||
      (memoryType === "opportunity" && link.link_type === "opportunity") ||
      (link.link_type === "memory" &&
        memories.find((memory) => memory.id === link.linked_id)?.memory_type ===
          memoryType),
  );

  const linkedIds = new Set(typeLinks.map((link) => link.linked_id));

  return memories.filter(
    (memory) => linkedIds.has(memory.id) && memory.memory_type === memoryType,
  );
}

function linkedActions(
  links: InitiativeLinkRecord[],
  meetings: HealthRuleContext["meetings"],
): MeetingActionRecord[] {
  const actionIds = new Set(
    links
      .filter((link) => link.link_type === "meeting_action")
      .map((link) => link.linked_id),
  );

  return meetings.flatMap(({ actions }) =>
    actions.filter((action) => actionIds.has(action.id)),
  );
}

function linkedMeetings(
  links: InitiativeLinkRecord[],
  meetings: HealthRuleContext["meetings"],
): ExecutiveMeetingRecord[] {
  const meetingIds = new Set(
    links.filter((link) => link.link_type === "meeting").map((link) => link.linked_id),
  );

  return meetings
    .filter(({ meeting }) => meetingIds.has(meeting.id))
    .map(({ meeting }) => meeting);
}

export function evaluateInitiativeProgressRule(
  initiative: StrategicInitiativeRecord,
  now: Date,
): HealthSignal[] {
  const signals: HealthSignal[] = [];

  if (initiative.status === "completed" || initiative.progress_percentage >= 100) {
    signals.push({
      id: "initiative-completed",
      label: "Initiative marked complete",
      impact: 0,
      category: "progress",
    });
    return signals;
  }

  if (initiative.status === "on_hold") {
    signals.push({
      id: "initiative-on-hold",
      label: "Initiative is on hold",
      impact: -10,
      category: "progress",
    });
  }

  if (initiative.target_date) {
    const target = new Date(initiative.target_date);
    const start = new Date(initiative.start_date);

    if (now > target && initiative.progress_percentage < 100) {
      signals.push({
        id: "initiative-past-target",
        label: "Past target date with incomplete progress",
        impact: -25,
        category: "progress",
      });
    } else if (target > start) {
      const totalDays = daysBetween(start, target);
      const elapsedDays = Math.max(0, daysBetween(start, now));
      const expectedProgress = Math.min(
        100,
        Math.round((elapsedDays / totalDays) * 100),
      );
      const gap = expectedProgress - initiative.progress_percentage;

      if (gap >= 20) {
        signals.push({
          id: "initiative-behind-schedule",
          label: `Progress ${gap}% behind expected schedule`,
          impact: Math.max(-20, -Math.round(gap / 2)),
          category: "progress",
        });
      } else if (gap <= -10) {
        signals.push({
          id: "initiative-ahead-schedule",
          label: "Progress ahead of schedule",
          impact: 8,
          category: "progress",
        });
      }
    }
  } else if (
    initiative.status === "active" &&
    initiative.progress_percentage < 20
  ) {
    signals.push({
      id: "initiative-low-progress",
      label: "Active initiative with low progress and no target date",
      impact: -8,
      category: "progress",
    });
  }

  return signals;
}

export function evaluateInitiativeRiskRule(
  links: InitiativeLinkRecord[],
  memories: ExecutiveMemoryRecord[],
): HealthSignal[] {
  const risks = linkedMemoriesByType(links, memories, "risk");

  return risks.map((risk, index) => ({
    id: `initiative-risk-${risk.id}-${index}`,
    label: `Linked risk: ${risk.title}`,
    impact:
      risk.importance === "critical"
        ? -15
        : risk.importance === "high"
          ? -10
          : -6,
    category: "risk",
  }));
}

export function evaluateInitiativeOpportunityRule(
  links: InitiativeLinkRecord[],
  memories: ExecutiveMemoryRecord[],
): HealthSignal[] {
  const opportunities = linkedMemoriesByType(links, memories, "opportunity");

  return opportunities.slice(0, 5).map((opportunity, index) => ({
    id: `initiative-opportunity-${opportunity.id}-${index}`,
    label: `Linked opportunity: ${opportunity.title}`,
    impact: 4,
    category: "opportunity",
  }));
}

export function evaluateInitiativeActionRule(
  links: InitiativeLinkRecord[],
  meetings: HealthRuleContext["meetings"],
  now: Date,
): HealthSignal[] {
  const actions = linkedActions(links, meetings);
  const signals: HealthSignal[] = [];

  for (const action of actions) {
    if (isActionOverdue(action, now)) {
      signals.push({
        id: `initiative-overdue-action-${action.id}`,
        label: `Overdue action: ${action.title}`,
        impact: -12,
        category: "action",
      });
      continue;
    }

    if (isActionOutstanding(action, now)) {
      signals.push({
        id: `initiative-open-action-${action.id}`,
        label: `Outstanding action: ${action.title}`,
        impact: -4,
        category: "action",
      });
    }
  }

  return signals;
}

export function evaluateInitiativeDecisionRule(
  links: InitiativeLinkRecord[],
  decisions: ExecutiveDecisionRecord[],
  now: Date,
): HealthSignal[] {
  const linked = linkedRecords(links, "decision", decisions);
  const signals: HealthSignal[] = [];

  for (const decision of linked) {
    if (decision.risk_level === "critical") {
      signals.push({
        id: `initiative-decision-critical-${decision.id}`,
        label: `Critical-risk decision linked: ${decision.title}`,
        impact: -12,
        category: "decision",
      });
    } else if (decision.risk_level === "high") {
      signals.push({
        id: `initiative-decision-high-${decision.id}`,
        label: `High-risk decision linked: ${decision.title}`,
        impact: -8,
        category: "decision",
      });
    }

    if (
      decision.review_date &&
      new Date(decision.review_date) < now &&
      decision.status !== "implemented" &&
      decision.status !== "archived"
    ) {
      signals.push({
        id: `initiative-decision-review-${decision.id}`,
        label: `Decision review overdue: ${decision.title}`,
        impact: -10,
        category: "decision",
      });
    }
  }

  return signals;
}

export function evaluateInitiativeMeetingRule(
  links: InitiativeLinkRecord[],
  meetings: HealthRuleContext["meetings"],
  initiative: StrategicInitiativeRecord,
  now: Date,
): HealthSignal[] {
  if (initiative.status !== "active" && initiative.status !== "planned") {
    return [];
  }

  const linked = linkedMeetings(links, meetings);
  const signals: HealthSignal[] = [];

  if (linked.length === 0 && links.length > 0) {
    signals.push({
      id: `initiative-no-meetings-${initiative.id}`,
      label: "No recent meeting activity linked",
      impact: -5,
      category: "meeting",
    });
    return signals;
  }

  const recentMeeting = linked.find((meeting) => {
    const meetingDate = new Date(meeting.meeting_date);
    return daysBetween(meetingDate, now) <= 21;
  });

  if (recentMeeting) {
    signals.push({
      id: `initiative-recent-meeting-${recentMeeting.id}`,
      label: `Recent meeting activity: ${recentMeeting.title}`,
      impact: 6,
      category: "meeting",
    });
  } else if (linked.length > 0) {
    signals.push({
      id: `initiative-stale-meetings-${initiative.id}`,
      label: "Linked meetings are more than three weeks old",
      impact: -6,
      category: "meeting",
    });
  }

  return signals;
}

export function evaluateInitiativeRules(
  item: InitiativeWithLinks,
  context: HealthRuleContext,
): HealthSignal[] {
  const { initiative, links } = item;

  return [
    ...evaluateInitiativeProgressRule(initiative, context.now),
    ...evaluateInitiativeRiskRule(links, context.memories),
    ...evaluateInitiativeOpportunityRule(links, context.memories),
    ...evaluateInitiativeActionRule(links, context.meetings, context.now),
    ...evaluateInitiativeDecisionRule(links, context.decisions, context.now),
    ...evaluateInitiativeMeetingRule(
      links,
      context.meetings,
      initiative,
      context.now,
    ),
  ];
}

export function evaluateObjectiveRules(
  objective: StrategicObjective,
  initiativeAssessments: Array<{
    initiative: StrategicInitiativeRecord;
    links: InitiativeLinkRecord[];
    score: number;
  }>,
  decisions: ExecutiveDecisionRecord[],
): HealthSignal[] {
  const signals: HealthSignal[] = [];
  const linkedInitiatives = initiativeAssessments.filter(({ links }) =>
    links.some(
      (link) => link.link_type === "objective" && link.linked_id === objective.id,
    ),
  );

  if (linkedInitiatives.length === 0) {
    signals.push({
      id: `objective-no-initiatives-${objective.id}`,
      label: "No initiatives linked to this objective",
      impact: objective.priority === "high" ? -15 : -8,
      category: "objective",
    });
  } else {
    const avgScore =
      linkedInitiatives.reduce((sum, item) => sum + item.score, 0) /
      linkedInitiatives.length;

    if (avgScore < 50) {
      signals.push({
        id: `objective-weak-initiatives-${objective.id}`,
        label: "Linked initiatives are significantly off track",
        impact: -18,
        category: "objective",
      });
    } else if (avgScore < 75) {
      signals.push({
        id: `objective-at-risk-initiatives-${objective.id}`,
        label: "Linked initiatives show elevated risk",
        impact: -10,
        category: "objective",
      });
    } else {
      signals.push({
        id: `objective-healthy-initiatives-${objective.id}`,
        label: "Linked initiatives are performing well",
        impact: 8,
        category: "objective",
      });
    }
  }

  const linkedDecisions = decisions.filter(
    (decision) => decision.strategic_objective_id === objective.id,
  );

  for (const decision of linkedDecisions) {
    if (decision.risk_level === "critical" || decision.risk_level === "high") {
      signals.push({
        id: `objective-decision-risk-${decision.id}`,
        label: `High-risk decision tied to objective: ${decision.title}`,
        impact: decision.risk_level === "critical" ? -12 : -8,
        category: "decision",
      });
    }
  }

  return signals;
}

export function evaluatePortfolioRules(
  context: HealthRuleContext,
  initiativeLinks: InitiativeLinkRecord[],
): HealthSignal[] {
  const signals: HealthSignal[] = [];
  const linkedMemoryIds = new Set(
    initiativeLinks
      .filter((link) => link.link_type === "memory" || link.link_type === "risk")
      .map((link) => link.linked_id),
  );

  const unlinkedCriticalRisks = context.memories.filter(
    (memory) =>
      memory.memory_type === "risk" &&
      (memory.importance === "critical" || memory.importance === "high") &&
      !linkedMemoryIds.has(memory.id),
  );

  for (const risk of unlinkedCriticalRisks.slice(0, 3)) {
    signals.push({
      id: `portfolio-unlinked-risk-${risk.id}`,
      label: `Unaddressed risk in memory: ${risk.title}`,
      impact: -8,
      category: "memory",
    });
  }

  const outstandingActions = context.meetings
    .flatMap(({ actions }) => actions)
    .filter((action) => isActionOutstanding(action, context.now));

  const overdueActions = outstandingActions.filter((action) =>
    isActionOverdue(action, context.now),
  );

  if (overdueActions.length > 0) {
    signals.push({
      id: "portfolio-overdue-actions",
      label: `${overdueActions.length} overdue meeting action${overdueActions.length === 1 ? "" : "s"} across the portfolio`,
      impact: Math.max(-20, overdueActions.length * -4),
      category: "action",
    });
  } else if (outstandingActions.length >= 5) {
    signals.push({
      id: "portfolio-open-actions",
      label: `${outstandingActions.length} outstanding actions need attention`,
      impact: -8,
      category: "action",
    });
  }

  const recentMeetings = context.meetings.filter(
    ({ meeting }) =>
      daysBetween(new Date(meeting.meeting_date), context.now) <= 14,
  );

  if (recentMeetings.length > 0) {
    signals.push({
      id: "portfolio-recent-meetings",
      label: `${recentMeetings.length} meeting${recentMeetings.length === 1 ? "" : "s"} in the last two weeks`,
      impact: 6,
      category: "meeting",
    });
  }

  return signals;
}
