import type { ExecutiveContext } from "@/types/intelligence";

function formatObjectivePriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}`;
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildIdentitySection(context: ExecutiveContext): string {
  const { executive } = context;
  const displayName = executive.preferredName || executive.fullName;

  return bulletList([
    `Name: ${executive.fullName}`,
    executive.preferredName
      ? `Preferred name: ${executive.preferredName}`
      : "Preferred name: Not specified",
    `Display as: ${displayName}`,
    `Job title: ${executive.jobTitle}`,
    `Company: ${executive.company}`,
    `Industry: ${executive.industry}`,
    `Country: ${executive.country}`,
    `Time zone: ${executive.timezone}`,
    executive.email ? `Email: ${executive.email}` : "Email: Not available",
  ]);
}

function buildOrganisationSection(context: ExecutiveContext): string {
  const { organisation } = context;

  return bulletList([
    `Company size: ${organisation.companySize}`,
    `Annual revenue band: ${organisation.annualRevenueBand}`,
    `Team size: ${organisation.teamSize}`,
    `Direct reports: ${organisation.directReports}`,
    `Departments responsible for: ${organisation.departmentsResponsibleFor}`,
    `Geographic responsibility: ${organisation.geographicResponsibility}`,
  ]);
}

function buildObjectivesSection(context: ExecutiveContext): string {
  if (context.objectives.length === 0) {
    return "No strategic objectives recorded.";
  }

  return context.objectives
    .map((objective) => {
      return [
        `### Objective ${objective.sortOrder}: ${objective.title}`,
        `Priority: ${formatObjectivePriority(objective.priority)}`,
        objective.description,
      ].join("\n");
    })
    .join("\n\n");
}

function buildChallengesSection(context: ExecutiveContext): string {
  const { challenges } = context;

  return bulletList([
    `Biggest business challenge: ${challenges.business}`,
    `Biggest leadership challenge: ${challenges.leadership}`,
    `Biggest personal productivity challenge: ${challenges.productivity}`,
  ]);
}

function buildSystemsSection(context: ExecutiveContext): string {
  if (context.systems.businessSystems.length === 0) {
    return "No business systems selected.";
  }

  return bulletList(context.systems.businessSystems);
}

function buildOnboardingSection(context: ExecutiveContext): string {
  const { onboarding } = context;

  return bulletList([
    `Onboarding complete: ${onboarding.isComplete ? "Yes" : "No"}`,
    onboarding.completedAt
      ? `Completed at: ${onboarding.completedAt}`
      : "Completed at: Not completed",
  ]);
}

function buildMemorySection(context: ExecutiveContext): string {
  if (context.memory.entries.length === 0) {
    return "Executive Memory is not yet populated.";
  }

  const header = context.memory.lastUpdatedAt
    ? `Last updated: ${context.memory.lastUpdatedAt}`
    : null;

  const entries = context.memory.entries
    .map((entry) => {
      return [
        `### ${entry.title}`,
        `- Type: ${entry.memoryType}`,
        `- Importance: ${entry.importance}`,
        `- Source: ${entry.source}`,
        entry.content,
      ].join("\n");
    })
    .join("\n\n");

  return [header, entries].filter(Boolean).join("\n\n");
}

function buildDecisionsSection(context: ExecutiveContext): string {
  if (context.decisions.decisions.length === 0) {
    return "No executive decisions recorded.";
  }

  return context.decisions.decisions
    .map((decision) => {
      return [
        `### ${decision.title}`,
        `- Status: ${decision.statusLabel}`,
        `- Owner: ${decision.owner}`,
        `- Decision date: ${decision.decisionDate}`,
        decision.reviewDate ? `- Review date: ${decision.reviewDate}` : null,
        `- Risk level: ${decision.riskLevelLabel}`,
        `- Summary: ${decision.summary}`,
        `- Reason: ${decision.decisionReason}`,
        decision.alternativesConsidered
          ? `- Alternatives: ${decision.alternativesConsidered}`
          : null,
        `- Expected outcome: ${decision.expectedOutcome}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function buildInitiativesSection(context: ExecutiveContext): string {
  if (context.initiatives.initiatives.length === 0) {
    return "No strategic initiatives recorded.";
  }

  const summary = [
    `Active initiatives: ${context.initiatives.activeCount}`,
    `At risk: ${context.initiatives.atRiskCount}`,
    `Off track: ${context.initiatives.offTrackCount}`,
  ].join("\n");

  const entries = context.initiatives.initiatives
    .map((initiative) => {
      return [
        `### ${initiative.title}`,
        `- Status: ${initiative.statusLabel}`,
        `- Health: ${initiative.healthLabel} (${initiative.healthScore}/100, ${initiative.healthTrend})`,
        `- Priority: ${initiative.priorityLabel}`,
        `- Owner: ${initiative.owner}`,
        `- Progress: ${initiative.progressPercentage}%`,
        `- Start date: ${initiative.startDate}`,
        initiative.targetDate ? `- Target date: ${initiative.targetDate}` : null,
        initiative.description ? `- Description: ${initiative.description}` : null,
        initiative.healthExplanation.length > 0
          ? `- Health signals: ${initiative.healthExplanation.join("; ")}`
          : null,
        `- Linked items: ${initiative.linkCount}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [summary, entries].filter(Boolean).join("\n\n");
}

function buildExecutiveHealthSection(context: ExecutiveContext): string {
  if (!context.health) {
    return "Executive health analysis is not available.";
  }

  const { health } = context;
  const summary = [
    `Portfolio health score: ${health.score}/100`,
    `Trend: ${health.trendLabel}`,
    `Declining entities: ${health.decliningCount}`,
  ].join("\n");

  const explanation = health.explanation.map((line) => `- ${line}`).join("\n");
  const actions =
    health.recommendedActions.length > 0
      ? health.recommendedActions
          .map((action) => `- ${action.title}: ${action.rationale}`)
          .join("\n")
      : "No recommended actions generated.";

  return [summary, explanation, "Recommended actions:", actions]
    .filter(Boolean)
    .join("\n\n");
}

function buildOrganizationOverviewSection(context: ExecutiveContext): string {
  if (!context.organization) {
    return "No organization workspace configured.";
  }

  const org = context.organization;

  return bulletList([
    `Organization: ${org.name}`,
    org.legalName ? `Legal name: ${org.legalName}` : null,
    org.industry ? `Industry: ${org.industry}` : null,
    org.companySize ? `Company size: ${org.companySize}` : null,
    org.country ? `Country: ${org.country}` : null,
    `Timezone: ${org.timezone}`,
    org.website ? `Website: ${org.website}` : null,
    `Subscription plan: ${org.subscriptionPlan}`,
  ].filter((item): item is string => Boolean(item)));
}

function buildExecutiveTeamSection(context: ExecutiveContext): string {
  if (context.teamMembers.length === 0) {
    return "No executive team members recorded.";
  }

  return context.teamMembers
    .map((member) => {
      const name = member.displayName || member.email || member.userId;
      return `- ${name} (${member.roleLabel})${member.email ? ` · ${member.email}` : ""}`;
    })
    .join("\n");
}

function buildOrganizationContextSection(context: ExecutiveContext): string {
  if (!context.organization) {
    return "Organization context unavailable.";
  }

  const departmentLines =
    context.departments.length > 0
      ? context.departments.map(
          (department) =>
            `- ${department.name}${department.description ? `: ${department.description}` : ""}`,
        )
      : ["- No departments defined"];

  return [
    `Enterprise workspace: ${context.organization.name}`,
    `Active team members: ${context.teamMembers.length}`,
    "Departments:",
    ...departmentLines,
  ].join("\n");
}

function buildExecutiveCalendarSection(context: ExecutiveContext): string {
  if (!context.calendar) {
    return "Calendar intelligence is not available.";
  }

  const { calendar } = context;
  const lines = [
    `Connected: ${calendar.connected ? "Yes" : "No"}`,
    `Meetings today: ${calendar.todaysAgenda.length}`,
    `Meeting load: ${calendar.meetingLoadMinutes} minutes`,
    `Strategic time: ${calendar.strategicTimeMinutes} minutes`,
    `Focus time: ${calendar.focusTimeMinutes} minutes`,
    `Deep work score: ${calendar.health.deepWorkScore}/100`,
    `Calendar status: ${calendar.health.status}`,
    calendar.health.summary,
  ];

  if (calendar.todaysAgenda.length > 0) {
    lines.push("", "Today's agenda:");
    lines.push(
      ...calendar.todaysAgenda.map(
        (event) =>
          `- ${event.title} (${event.startsAt})${event.location ? ` @ ${event.location}` : ""}`,
      ),
    );
  }

  if (calendar.conflicts.length > 0) {
    lines.push("", "Conflicts:");
    lines.push(...calendar.conflicts.map((conflict) => `- ${conflict.title}`));
  }

  if (calendar.preparationNeeded.length > 0) {
    lines.push("", "Preparation needed:");
    lines.push(
      ...calendar.preparationNeeded.slice(0, 5).map((prep) => `- ${prep.meetingTitle}`),
    );
  }

  return bulletList(lines);
}

function buildKnowledgeGraphSection(context: ExecutiveContext): string {
  const graph = context.integrations.knowledgeGraph;

  if (!graph.connected || graph.nodes.length === 0) {
    return "Knowledge graph is not yet populated for this organization.";
  }

  const lines = [
    `Connected entities: ${graph.nodes.length}`,
    `Relationships: ${graph.edges.length}`,
    "",
    "Sample nodes:",
    ...graph.nodes.slice(0, 12).map(
      (node) =>
        `- [${node.nodeType ?? "entity"}] ${node.label}${node.summary ? `: ${node.summary}` : ""}`,
    ),
  ];

  if (graph.edges.length > 0) {
    lines.push("", "Sample relationships:");
    lines.push(
      ...graph.edges.slice(0, 10).map((edge) => {
        const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
        const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
        return `- ${source} ${edge.edgeType ?? "related_to"} ${target}`;
      }),
    );
  }

  return bulletList(lines);
}

function buildIntegrationsSection(context: ExecutiveContext): string {
  const { integrations } = context;

  const lines = [
    `Calendar: ${integrations.calendar.connected ? `Connected (${integrations.calendar.events.length} events)` : "Not connected"}`,
    `Email: ${integrations.email.connected ? `Connected (${integrations.email.threads.length} threads)` : "Not connected"}`,
    `CRM: ${integrations.crm.connected ? `Connected (${integrations.crm.records.length} records)` : "Not connected"}`,
    `Meetings: ${integrations.meetings.connected ? `Connected (${integrations.meetings.meetings.length} meetings)` : "Not connected"}`,
    `Tasks: ${integrations.tasks.connected ? `Connected (${integrations.tasks.tasks.length} tasks)` : "Not connected"}`,
    `Documents: ${integrations.documents.connected ? `Connected (${integrations.documents.documents.length} documents)` : "Not connected"}`,
    `Knowledge graph: ${integrations.knowledgeGraph.connected ? `Connected (${integrations.knowledgeGraph.nodes.length} nodes)` : "Not connected"}`,
  ];

  if (integrations.calendar.connected && integrations.calendar.events.length > 0) {
    lines.push(
      "Upcoming calendar events:",
      ...integrations.calendar.events.slice(0, 5).map(
        (event) => `- ${event.title} (${event.startsAt}) via ${event.source}`,
      ),
    );
  }

  return bulletList(lines);
}

export function buildExecutiveIntelligencePrompt(
  context: ExecutiveContext,
): string {
  const displayName =
    context.executive.preferredName || context.executive.fullName;

  const sections = [
    "# Executive Intelligence Context",
    "",
    "You are supporting an executive through ExecutiveOS. Use the following context to provide strategic, operational, and decision-support guidance tailored to this leader and organisation.",
    "",
    section("Executive Identity", buildIdentitySection(context)),
    section("Organization Overview", buildOrganizationOverviewSection(context)),
    section("Executive Team", buildExecutiveTeamSection(context)),
    section("Organization Context", buildOrganizationContextSection(context)),
    section("Executive Profile Organisation", buildOrganisationSection(context)),
    section(
      "Strategic Objectives (Next 12 Months)",
      buildObjectivesSection(context),
    ),
    section("Executive Challenges", buildChallengesSection(context)),
    section("Executive Operating System", buildSystemsSection(context)),
    section("Onboarding Status", buildOnboardingSection(context)),
    section("Executive Memory", buildMemorySection(context)),
    section("Executive Decisions", buildDecisionsSection(context)),
    section("Strategic Initiatives", buildInitiativesSection(context)),
    section("Executive Health Analysis", buildExecutiveHealthSection(context)),
    section("Executive Calendar Intelligence", buildExecutiveCalendarSection(context)),
    section("Executive Knowledge Graph", buildKnowledgeGraphSection(context)),
    section("Connected Integrations", buildIntegrationsSection(context)),
    section(
      "Guidance Principles",
      bulletList([
        `Address the executive as ${displayName} when appropriate.`,
        "Prioritise decisions aligned with the stated strategic objectives.",
        "Account for organisational scale, revenue context, and leadership scope.",
        "Surface risks and trade-offs related to the executive's stated challenges.",
        "Recommend actions compatible with the executive's existing business systems.",
        "Maintain an executive-level tone: concise, strategic, and action-oriented.",
      ]),
    ),
  ];

  return sections.join("\n\n");
}
