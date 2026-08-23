import { AGENT_DEFINITIONS } from "@/lib/agents/registry";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/intelligence-center/types";
import type {
  AdvisorInsightSummary,
  ExecutiveInsightCard,
  InsightCategory,
  IntelligenceSignal,
} from "@/lib/intelligence-center/types";
import { rankByPriority } from "@/lib/intelligence-center/prioritizer";

const ALL_CATEGORIES: InsightCategory[] = [
  "critical_attention",
  "strategic_opportunities",
  "recommended_decisions",
  "upcoming_risks",
  "delegated_actions",
  "people_issues",
  "meeting_preparation",
  "sales_highlights",
  "financial_highlights",
];

function signalToCard(signal: IntelligenceSignal): ExecutiveInsightCard {
  return {
    id: signal.id,
    category: signal.category,
    categoryLabel: INSIGHT_CATEGORY_LABELS[signal.category],
    title: signal.title,
    summary: signal.summary,
    badge: signal.badge,
    href: signal.href,
    priorityScore: signal.scores.priorityScore,
    scores: signal.scores,
  };
}

function createEmptyCardGroups(): Record<InsightCategory, ExecutiveInsightCard[]> {
  return ALL_CATEGORIES.reduce(
    (groups, category) => {
      groups[category] = [];
      return groups;
    },
    {} as Record<InsightCategory, ExecutiveInsightCard[]>,
  );
}

export function buildExecutiveCards(
  signals: IntelligenceSignal[],
): {
  cards: Record<InsightCategory, ExecutiveInsightCard[]>;
  topInsights: ExecutiveInsightCard[];
} {
  const ranked = rankByPriority(signals);
  const cards = createEmptyCardGroups();

  for (const signal of ranked) {
    if (cards[signal.category].length < 4) {
      cards[signal.category].push(signalToCard(signal));
    }
  }

  const topInsights = ranked.slice(0, 6).map(signalToCard);

  return { cards, topInsights };
}

export function buildAdvisorSummaries(
  signals: IntelligenceSignal[],
): AdvisorInsightSummary[] {
  const topSignals = rankByPriority(signals).slice(0, 10);

  const advisorMap: Record<
    string,
    { insight: IntelligenceSignal | null; recommendation: string; confidence: number }
  > = {};

  const advisorSignalMapping: Array<{
    agentId: string;
    categories: InsightCategory[];
    recommend: (signal: IntelligenceSignal) => string;
  }> = [
    {
      agentId: "chief_of_staff",
      categories: ["critical_attention", "delegated_actions"],
      recommend: (s) => `Prioritize: ${s.title}`,
    },
    {
      agentId: "strategy_advisor",
      categories: ["strategic_opportunities"],
      recommend: (s) => `Evaluate strategic fit: ${s.title}`,
    },
    {
      agentId: "risk_advisor",
      categories: ["upcoming_risks", "critical_attention"],
      recommend: (s) => `Mitigate: ${s.title}`,
    },
    {
      agentId: "execution_advisor",
      categories: ["delegated_actions"],
      recommend: (s) => `Drive delivery on: ${s.title}`,
    },
    {
      agentId: "financial_advisor",
      categories: ["financial_highlights"],
      recommend: (s) => `Review financial impact: ${s.title}`,
    },
    {
      agentId: "sales_advisor",
      categories: ["sales_highlights", "strategic_opportunities"],
      recommend: (s) => `Advance pipeline: ${s.title}`,
    },
    {
      agentId: "people_advisor",
      categories: ["people_issues"],
      recommend: (s) => `Address people matter: ${s.title}`,
    },
    {
      agentId: "operations_advisor",
      categories: ["critical_attention"],
      recommend: (s) => `Resolve operational blocker: ${s.title}`,
    },
    {
      agentId: "board_advisor",
      categories: ["recommended_decisions"],
      recommend: (s) => `Prepare board narrative for: ${s.title}`,
    },
    {
      agentId: "communications_advisor",
      categories: ["meeting_preparation"],
      recommend: (s) => `Prepare messaging for: ${s.title}`,
    },
  ];

  for (const mapping of advisorSignalMapping) {
    const match = topSignals.find((signal) =>
      mapping.categories.includes(signal.category),
    );
    if (match) {
      advisorMap[mapping.agentId] = {
        insight: match,
        recommendation: mapping.recommend(match),
        confidence: match.scores.confidence,
      };
    }
  }

  return AGENT_DEFINITIONS.map((agent) => {
    const mapped = advisorMap[agent.id];
    const fallbackInsight =
      topSignals.find((signal) => signal.source === "executive_health") ??
      topSignals[0];

    const insightSignal = mapped?.insight ?? fallbackInsight;

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentTitle: agent.title,
      insight: insightSignal
        ? insightSignal.summary.slice(0, 160)
        : "Monitoring executive context for emerging insights.",
      recommendation:
        mapped?.recommendation ??
        "Continue monitoring — no immediate action required.",
      confidence: mapped?.confidence ?? (fallbackInsight ? 65 : 50),
      accentColor: agent.accentColor,
    };
  });
}
