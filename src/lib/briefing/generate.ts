import type {
  ExecutiveIntelligenceResult,
  ExecutiveInitiativeContext,
  ExecutiveMemoryEntry,
  ExecutiveObjectiveContext,
} from "@/types/intelligence";
import type { ObjectivePriority } from "@/types/onboarding";
import type {
  BriefItem,
  BriefSection,
  MorningBrief,
  TodaysFocus,
} from "@/lib/briefing/types";

const PRIORITY_RANK: Record<ObjectivePriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const IMPORTANCE_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const INITIATIVE_HEALTH_RANK: Record<string, number> = {
  off_track: 3,
  at_risk: 2,
  on_track: 1,
  completed: 0,
};

const INITIATIVE_PRIORITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function getPreferredName(intelligence: ExecutiveIntelligenceResult): string {
  return (
    intelligence.executive.preferredName?.trim() ||
    intelligence.executive.fullName ||
    "Executive"
  );
}

function buildGreeting(preferredName: string): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${preferredName}`;
  }

  if (hour < 17) {
    return `Good afternoon, ${preferredName}`;
  }

  return `Good evening, ${preferredName}`;
}

function sortObjectivesByPriority(
  objectives: ExecutiveObjectiveContext[],
): ExecutiveObjectiveContext[] {
  return [...objectives].sort((left, right) => {
    const priorityCompare =
      PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority];

    if (priorityCompare !== 0) {
      return priorityCompare;
    }

    return left.sortOrder - right.sortOrder;
  });
}

function sortMemoryByImportance(
  entries: ExecutiveMemoryEntry[],
): ExecutiveMemoryEntry[] {
  return [...entries].sort((left, right) => {
    const importanceCompare =
      (IMPORTANCE_RANK[right.importance] ?? 0) -
      (IMPORTANCE_RANK[left.importance] ?? 0);

    if (importanceCompare !== 0) {
      return importanceCompare;
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

function filterMemoryByType(
  entries: ExecutiveMemoryEntry[],
  typeLabel: string,
): ExecutiveMemoryEntry[] {
  return entries.filter((entry) => entry.memoryType === typeLabel);
}

function filterImportantMemory(
  entries: ExecutiveMemoryEntry[],
): ExecutiveMemoryEntry[] {
  const important = entries.filter(
    (entry) => entry.importance === "critical" || entry.importance === "high",
  );

  return important.length > 0 ? important : entries;
}

function mapObjectiveToBriefItem(
  objective: ExecutiveObjectiveContext,
): BriefItem {
  return {
    id: objective.id,
    title: objective.title,
    summary: objective.description,
    badge: objective.priority,
  };
}

function mapMemoryToBriefItem(entry: ExecutiveMemoryEntry): BriefItem {
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.content,
    badge: entry.importance,
  };
}

function sortInitiativesByHealth(
  initiatives: ExecutiveInitiativeContext[],
): ExecutiveInitiativeContext[] {
  return [...initiatives].sort((left, right) => {
    const healthCompare =
      (INITIATIVE_HEALTH_RANK[right.healthStatus] ?? 0) -
      (INITIATIVE_HEALTH_RANK[left.healthStatus] ?? 0);

    if (healthCompare !== 0) {
      return healthCompare;
    }

    const priorityCompare =
      (INITIATIVE_PRIORITY_RANK[right.priority] ?? 0) -
      (INITIATIVE_PRIORITY_RANK[left.priority] ?? 0);

    if (priorityCompare !== 0) {
      return priorityCompare;
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

function mapInitiativeToBriefItem(
  initiative: ExecutiveInitiativeContext,
): BriefItem {
  const summaryParts = [
    `Score ${initiative.healthScore}/100`,
    `${initiative.progressPercentage}% complete`,
    initiative.healthExplanation[0] ?? null,
    initiative.owner ? `Owner: ${initiative.owner}` : null,
  ].filter(Boolean);

  return {
    id: initiative.id,
    title: initiative.title,
    summary: summaryParts.join(" · ") || initiative.description,
    badge: initiative.healthStatus.replace("_", " "),
  };
}

function buildExecutiveHealthSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const { health } = intelligence;
  const items: BriefItem[] = [
    {
      id: "executive-health-score",
      title: `Portfolio health: ${health.score}/100`,
      summary: health.explanation.join(" "),
      badge: health.trend,
    },
  ];

  for (const action of health.recommendedActions.slice(0, 3)) {
    items.push({
      id: action.id,
      title: action.title,
      summary: action.rationale,
      badge: action.priority,
    });
  }

  const decliningInitiatives = intelligence.initiatives.initiatives.filter(
    (initiative) => initiative.healthTrend === "declining",
  );
  const decliningObjectives = intelligence.objectives.filter(
    (objective) => objective.healthTrend === "declining",
  );

  for (const initiative of decliningInitiatives.slice(0, 2)) {
    items.push({
      id: `declining-initiative-${initiative.id}`,
      title: `Declining: ${initiative.title}`,
      summary:
        initiative.healthExplanation.join(" ") ||
        `Health score ${initiative.healthScore}/100`,
      badge: "declining",
    });
  }

  for (const objective of decliningObjectives.slice(0, 2)) {
    items.push({
      id: `declining-objective-${objective.id}`,
      title: `Declining objective: ${objective.title}`,
      summary:
        objective.healthExplanation?.join(" ") ||
        `Health score ${objective.healthScore}/100`,
      badge: "declining",
    });
  }

  return {
    id: "executive-health",
    title: "Executive Health",
    items,
    emptyMessage:
      "Executive health will appear as objectives, initiatives, and linked context are added.",
  };
}

function buildInitiativeHealthSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = sortInitiativesByHealth(intelligence.initiatives.initiatives)
    .slice(0, 6)
    .map(mapInitiativeToBriefItem);

  const { atRiskCount, offTrackCount, activeCount } = intelligence.initiatives;

  let emptyMessage =
    "No strategic initiatives yet. Create initiatives to track progress and health in your morning brief.";

  if (activeCount > 0 && items.length === 0) {
    emptyMessage = "All initiatives are on track. Continue monitoring progress against target dates.";
  } else if (atRiskCount > 0 || offTrackCount > 0) {
    emptyMessage = `${atRiskCount} at risk, ${offTrackCount} off track. Review initiative health on the Initiatives page.`;
  }

  return {
    id: "initiative-health",
    title: "Initiative Health",
    items,
    emptyMessage,
  };
}

function buildStrategicPrioritiesSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = sortObjectivesByPriority(intelligence.objectives).map(
    mapObjectiveToBriefItem,
  );

  return {
    id: "strategic-priorities",
    title: "Strategic Priorities",
    items,
    emptyMessage:
      "No strategic objectives recorded. Add objectives during onboarding to populate this section.",
  };
}

function buildExecutiveMemorySection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = sortMemoryByImportance(
    filterImportantMemory(intelligence.memory.entries),
  )
    .slice(0, 5)
    .map(mapMemoryToBriefItem);

  return {
    id: "executive-memory",
    title: "Executive Memory",
    items,
    emptyMessage:
      "No executive memories yet. Capture decisions, insights, and commitments to build your knowledge base.",
  };
}

function buildRisksSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = sortMemoryByImportance(
    filterMemoryByType(intelligence.memory.entries, "Risk"),
  ).map(mapMemoryToBriefItem);

  return {
    id: "risks",
    title: "Risks",
    items,
    emptyMessage:
      intelligence.challenges.business.trim()
        ? `Onboarding challenge: ${intelligence.challenges.business}`
        : "No active risks recorded. Log risks in Executive Memory to track them here.",
  };
}

function buildOpportunitiesSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = sortMemoryByImportance(
    filterMemoryByType(intelligence.memory.entries, "Opportunity"),
  ).map(mapMemoryToBriefItem);

  return {
    id: "opportunities",
    title: "Opportunities",
    items,
    emptyMessage:
      "No opportunities captured yet. Record opportunities in Executive Memory to surface them in your brief.",
  };
}

function buildTodaysCalendarSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const { calendar } = intelligence;
  const items: BriefItem[] = calendar.todaysAgenda.map((event) => ({
    id: event.id,
    title: event.title,
    summary: [
      new Date(event.startsAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
      event.location ? `Location: ${event.location}` : null,
      event.onlineMeetingUrl ? "Online meeting" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    badge: event.importance ?? undefined,
  }));

  return {
    id: "todays-calendar",
    title: "Today's Calendar",
    items,
    emptyMessage: calendar.connected
      ? "No meetings scheduled for today."
      : "Connect Microsoft 365 to sync your executive calendar.",
  };
}

function buildMeetingPreparationSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const items = intelligence.calendar.preparationNeeded.slice(0, 4).map((prep) => ({
    id: prep.meetingId,
    title: prep.meetingTitle,
    summary: [
      prep.relatedInitiatives[0]?.title
        ? `Initiative: ${prep.relatedInitiatives[0].title}`
        : null,
      prep.relatedDecisions[0]?.title
        ? `Decision: ${prep.relatedDecisions[0].title}`
        : null,
      prep.relevantMemory[0]?.title
        ? `Memory: ${prep.relevantMemory[0].title}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Review context and objectives before this meeting.",
    badge: prep.preparationScore >= 80 ? "high prep" : "prepare",
  }));

  return {
    id: "meeting-preparation",
    title: "Meeting Preparation",
    items,
    emptyMessage: "No high-priority meeting preparation required today.",
  };
}

function buildCalendarHealthSection(
  intelligence: ExecutiveIntelligenceResult,
): BriefSection {
  const { health } = intelligence.calendar;

  return {
    id: "calendar-health",
    title: "Calendar Health",
    items: [
      {
        id: "calendar-health-summary",
        title: health.summary,
        summary: `Meeting load ${health.meetingLoadRatio}% · Deep work score ${health.deepWorkScore}/100 · ${health.strategicTimeAvailableMinutes}m strategic time · ${health.focusTimeAvailableMinutes}m focus time`,
        badge: health.status,
      },
      ...intelligence.calendar.conflicts.map((conflict) => ({
        id: conflict.id,
        title: conflict.title,
        summary: conflict.message,
        badge: "conflict",
      })),
    ],
    emptyMessage: "Calendar health will appear once your schedule is synced.",
  };
}

function buildTodaysFocus(
  intelligence: ExecutiveIntelligenceResult,
  priorities: BriefSection,
  risks: BriefSection,
  opportunities: BriefSection,
  initiativeHealth: BriefSection,
  executiveHealth: BriefSection,
): TodaysFocus {
  const focusItems: string[] = [];
  const sortedObjectives = sortObjectivesByPriority(intelligence.objectives);
  const topObjective = sortedObjectives[0];
  const topRisk = risks.items[0];
  const topOpportunity = opportunities.items[0];
  const urgentInitiative = initiativeHealth.items.find((item) =>
    ["at risk", "off track"].includes(item.badge ?? ""),
  );
  const decliningItem = executiveHealth.items.find(
    (item) => item.badge === "declining",
  );

  if (decliningItem) {
    focusItems.push(`Address declining health: ${decliningItem.title}`);
  }

  if (intelligence.health.trend === "declining") {
    focusItems.push(
      `Portfolio health is declining (${intelligence.health.score}/100). Review recommended actions.`,
    );
  }

  if (intelligence.calendar.preparationNeeded[0]) {
    focusItems.push(
      `Prepare for: ${intelligence.calendar.preparationNeeded[0].meetingTitle}`,
    );
  }

  if (intelligence.calendar.health.meetingOverload) {
    focusItems.push("Calendar overload today — protect focus time and decline low-value meetings.");
  }

  if (topObjective) {
    focusItems.push(`Advance your top priority: ${topObjective.title}`);
  }

  if (urgentInitiative) {
    focusItems.push(
      `Address initiative health: ${urgentInitiative.title} (${urgentInitiative.badge})`,
    );
  }

  if (topRisk) {
    focusItems.push(`Review and mitigate risk: ${topRisk.title}`);
  }

  if (topOpportunity) {
    focusItems.push(`Evaluate opportunity: ${topOpportunity.title}`);
  }

  if (focusItems.length < 3 && intelligence.challenges.leadership.trim()) {
    focusItems.push(
      `Leadership focus: ${intelligence.challenges.leadership.trim()}`,
    );
  }

  if (focusItems.length < 3 && intelligence.challenges.productivity.trim()) {
    focusItems.push(
      `Protect deep work: ${intelligence.challenges.productivity.trim()}`,
    );
  }

  if (focusItems.length === 0 && intelligence.challenges.business.trim()) {
    focusItems.push(
      `Business priority: ${intelligence.challenges.business.trim()}`,
    );
  }

  if (focusItems.length === 0) {
    focusItems.push(
      "Review strategic priorities and update Executive Memory with today's decisions.",
    );
  }

  const headline = decliningItem
    ? `Today's focus: ${decliningItem.title.replace(/^Declining:? /, "")}`
    : urgentInitiative
      ? `Today's focus: ${urgentInitiative.title}`
      : topObjective
        ? `Today's focus: ${topObjective.title}`
        : "Today's focus: Strategic execution";

  return {
    headline,
    priorities: focusItems.slice(0, 4),
  };
}

function buildBriefOverviewSection(
  priorities: BriefSection,
  risks: BriefSection,
  opportunities: BriefSection,
  initiativeHealth: BriefSection,
  executiveHealth: BriefSection,
  todaysFocus: TodaysFocus,
): BriefSection {
  const items: BriefItem[] = [
    {
      id: "focus-headline",
      title: todaysFocus.headline,
      summary: todaysFocus.priorities.join(" "),
    },
  ];

  const healthOverview = executiveHealth.items[0];
  if (healthOverview) {
    items.push({
      id: "brief-executive-health",
      title: healthOverview.title,
      summary: healthOverview.summary,
      badge: healthOverview.badge,
    });
  }

  if (initiativeHealth.items[0]) {
    items.push({
      id: "brief-top-initiative",
      title: "Priority initiative",
      summary: initiativeHealth.items[0].summary,
      badge: initiativeHealth.items[0].badge,
    });
  }

  if (priorities.items[0]) {
    items.push({
      id: "brief-top-priority",
      title: "Top strategic priority",
      summary: priorities.items[0].summary,
      badge: priorities.items[0].badge,
    });
  }

  if (risks.items[0]) {
    items.push({
      id: "brief-top-risk",
      title: "Priority risk",
      summary: risks.items[0].summary,
      badge: "risk",
    });
  }

  if (opportunities.items[0]) {
    items.push({
      id: "brief-top-opportunity",
      title: "Priority opportunity",
      summary: opportunities.items[0].summary,
      badge: "opportunity",
    });
  }

  return {
    id: "executive-brief",
    title: "Today's Executive Brief",
    items,
    emptyMessage:
      "Your executive brief will populate as objectives and memory are added.",
  };
}

export function generateMorningBrief(
  intelligence: ExecutiveIntelligenceResult,
): MorningBrief {
  const preferredName = getPreferredName(intelligence);
  const strategicPriorities = buildStrategicPrioritiesSection(intelligence);
  const executiveHealth = buildExecutiveHealthSection(intelligence);
  const initiativeHealth = buildInitiativeHealthSection(intelligence);
  const executiveMemory = buildExecutiveMemorySection(intelligence);
  const risks = buildRisksSection(intelligence);
  const opportunities = buildOpportunitiesSection(intelligence);
  const todaysCalendar = buildTodaysCalendarSection(intelligence);
  const meetingPreparation = buildMeetingPreparationSection(intelligence);
  const calendarHealth = buildCalendarHealthSection(intelligence);
  const todaysFocus = buildTodaysFocus(
    intelligence,
    strategicPriorities,
    risks,
    opportunities,
    initiativeHealth,
    executiveHealth,
  );
  const brief = buildBriefOverviewSection(
    strategicPriorities,
    risks,
    opportunities,
    initiativeHealth,
    executiveHealth,
    todaysFocus,
  );

  return {
    generatedAt: new Date().toISOString(),
    greeting: buildGreeting(preferredName),
    preferredName,
    jobTitle: intelligence.executive.jobTitle,
    company: intelligence.executive.company,
    brief,
    executiveHealth,
    strategicPriorities,
    initiativeHealth,
    executiveMemory,
    risks,
    opportunities,
    todaysCalendar,
    meetingPreparation,
    calendarHealth,
    todaysFocus,
  };
}
