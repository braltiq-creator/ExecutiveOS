import { describe, expect, it } from "vitest";
import { collectIntelligenceSignals } from "@/lib/intelligence-center/signals";
import { buildExecutiveCards } from "@/lib/intelligence-center/recommendations";
import { buildIntelligenceCenter } from "@/lib/intelligence-center/engine";
import { planAdvisorOrchestration } from "@/lib/agents/planner";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function createMockIntelligence(): ExecutiveIntelligenceResult {
  return {
    executive: {
      userId: "user-1",
      email: "exec@example.com",
      fullName: "Alex Executive",
      preferredName: "Alex",
      jobTitle: "CEO",
      company: "Acme Corp",
      industry: "Technology",
      country: "US",
      timezone: "UTC",
    },
    organisation: {
      companySize: "100-500",
      annualRevenueBand: "$10M-$50M",
      teamSize: 12,
      directReports: 5,
      departmentsResponsibleFor: "All",
      geographicResponsibility: "Global",
    },
    objectives: [
      {
        id: "obj-1",
        title: "Grow revenue",
        description: "Increase ARR",
        priority: "high",
        sortOrder: 1,
        healthTrend: "declining",
        healthLabel: "At risk",
        healthExplanation: ["Momentum slowing"],
      },
    ],
    challenges: { business: "", leadership: "", productivity: "" },
    systems: { businessSystems: [] },
    memory: {
      entries: [
        {
          id: "mem-1",
          memoryType: "Risk",
          title: "Pipeline concentration",
          content: "Top 3 deals represent 60% of forecast",
          importance: "high",
          source: "manual",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      lastUpdatedAt: new Date().toISOString(),
    },
    decisions: {
      decisions: [
        {
          id: "dec-1",
          title: "Approve expansion",
          summary: "Enter EMEA market",
          decisionReason: "Growth",
          alternativesConsidered: null,
          expectedOutcome: "New revenue stream",
          status: "draft",
          statusLabel: "Draft",
          owner: "Alex",
          decisionDate: new Date().toISOString(),
          reviewDate: null,
          strategicObjectiveId: "obj-1",
          riskLevel: "high",
          riskLevelLabel: "High",
          updatedAt: new Date().toISOString(),
        },
      ],
      lastUpdatedAt: new Date().toISOString(),
    },
    initiatives: {
      initiatives: [
        {
          id: "init-1",
          title: "Initiative Alpha",
          description: "Core growth program",
          status: "active",
          statusLabel: "Active",
          priority: "high",
          priorityLabel: "High",
          owner: "Alex",
          startDate: new Date().toISOString(),
          targetDate: new Date(Date.now() + 86400000 * 14).toISOString(),
          progressPercentage: 45,
          healthScore: 55,
          healthTrend: "declining",
          healthStatus: "at_risk",
          healthLabel: "At risk",
          healthExplanation: ["Behind schedule"],
          linkCount: 2,
          updatedAt: new Date().toISOString(),
        },
      ],
      lastUpdatedAt: new Date().toISOString(),
      atRiskCount: 1,
      offTrackCount: 0,
      activeCount: 1,
    },
    health: {
      score: 62,
      trend: "declining",
      trendLabel: "Declining",
      explanation: ["Portfolio momentum slowing"],
      recommendedActions: [
        {
          id: "act-1",
          title: "Review at-risk initiatives",
          rationale: "One initiative is at risk",
          priority: "high",
        },
      ],
      decliningCount: 1,
      computedAt: new Date().toISOString(),
    },
    organization: {
      id: "org-1",
      name: "Acme Corp",
      legalName: null,
      industry: "Technology",
      companySize: "100-500",
      country: "US",
      timezone: "UTC",
      website: null,
      logoUrl: null,
      subscriptionPlan: "executive",
    },
    teamMembers: [],
    departments: [],
    integrations: {
      calendar: { events: [], connected: false },
      email: { threads: [], connected: false },
      crm: { records: [], connected: false },
      meetings: { meetings: [], connected: false },
      tasks: { tasks: [], connected: false },
      documents: { documents: [], connected: false },
      knowledgeGraph: { nodes: [], edges: [], connected: false },
    },
    executivePrompt: "Executive context",
    executiveDay: {
      calendar: {
        connected: false,
        syncedAt: null,
        todaysAgenda: [],
        upcomingMeetings: [],
        meetingLoadMinutes: 0,
        strategicTimeMinutes: 0,
        focusTimeMinutes: 0,
        conflicts: [],
        travelGaps: [],
        preparationNeeded: [],
        meetingPreparation: [],
        health: {
          meetingOverload: false,
          meetingLoadRatio: 0,
          strategicTimeAvailableMinutes: 120,
          focusTimeAvailableMinutes: 90,
          deepWorkScore: 70,
          conflictCount: 0,
          status: "balanced",
          summary: "Calendar balanced",
        },
      },
      meetings: {
        connected: false,
        totalMeetingsToday: 0,
        onlineMeetingsToday: 0,
        highPriorityMeetings: [],
        teamsReady: false,
      },
      email: { connected: false, unreadCount: 0, recentThreads: [] },
    },
    calendar: {
      connected: false,
      syncedAt: null,
      todaysAgenda: [],
      upcomingMeetings: [],
      meetingLoadMinutes: 0,
      strategicTimeMinutes: 0,
      focusTimeMinutes: 0,
      conflicts: [],
      travelGaps: [],
      preparationNeeded: [],
      meetingPreparation: [],
      health: {
        meetingOverload: false,
        meetingLoadRatio: 0,
        strategicTimeAvailableMinutes: 120,
        focusTimeAvailableMinutes: 90,
        deepWorkScore: 70,
        conflictCount: 0,
        status: "balanced",
        summary: "Calendar balanced",
      },
    },
  };
}

describe("intelligence center integration", () => {
  it("builds prioritized cards from intelligence", () => {
    const intelligence = createMockIntelligence();
    const signals = collectIntelligenceSignals(intelligence, null);
    const { topInsights, cards } = buildExecutiveCards(signals);

    expect(signals.length).toBeGreaterThan(0);
    expect(topInsights.length).toBeGreaterThan(0);
    expect(cards.critical_attention.length + cards.upcoming_risks.length).toBeGreaterThan(0);
  });

  it("builds full intelligence center payload", () => {
    const data = buildIntelligenceCenter(createMockIntelligence(), null);
    expect(data.topInsights.length).toBeGreaterThan(0);
    expect(data.advisorSummaries).toHaveLength(10);
    expect(data.digest.headline).toBeTruthy();
  });
});

describe("advisor planner integration", () => {
  it("routes strategy questions to strategy advisor", () => {
    const plan = planAdvisorOrchestration(
      "What is our long-term strategic direction for the portfolio?",
    );
    expect(plan.primaryAgentId).toBe("strategy_advisor");
  });

  it("uses collaborative mode for trade-off questions", () => {
    const plan = planAdvisorOrchestration(
      "Should we evaluate the trade-off between growth and risk?",
    );
    expect(plan.mode).toBe("collaborative");
  });
});
