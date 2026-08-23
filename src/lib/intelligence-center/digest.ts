import {
  buildGreeting,
  buildMorningBriefSnapshot,
  getPreferredName,
} from "@/lib/intelligence-center/briefing";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/intelligence-center/types";
import type {
  DigestType,
  ExecutiveDigest,
  ExecutiveInsightCard,
  IntelligenceCenterData,
} from "@/lib/intelligence-center/types";
import { DIGEST_TYPE_LABELS } from "@/lib/intelligence-center/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function buildDigestSections(
  cards: IntelligenceCenterData["cards"],
  topInsights: ExecutiveInsightCard[],
): ExecutiveDigest["sections"] {
  const sections: ExecutiveDigest["sections"] = [];

  const critical = cards.critical_attention;
  if (critical.length > 0) {
    sections.push({
      id: "critical",
      title: "Requires Attention",
      items: critical.map((card) => ({
        id: card.id,
        title: card.title,
        summary: card.summary,
      })),
    });
  }

  if (topInsights.length > 0) {
    sections.push({
      id: "priorities",
      title: "Top Priorities",
      items: topInsights.slice(0, 4).map((insight) => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
      })),
    });
  }

  const opportunities = cards.strategic_opportunities;
  if (opportunities.length > 0) {
    sections.push({
      id: "opportunities",
      title: INSIGHT_CATEGORY_LABELS.strategic_opportunities,
      items: opportunities.map((card) => ({
        id: card.id,
        title: card.title,
        summary: card.summary,
      })),
    });
  }

  const meetings = cards.meeting_preparation;
  if (meetings.length > 0) {
    sections.push({
      id: "meetings",
      title: INSIGHT_CATEGORY_LABELS.meeting_preparation,
      items: meetings.map((card) => ({
        id: card.id,
        title: card.title,
        summary: card.summary,
      })),
    });
  }

  return sections;
}

function buildDigestHeadline(
  type: DigestType,
  preferredName: string,
  healthScore: number,
  insightCount: number,
): { headline: string; summary: string } {
  switch (type) {
    case "morning_brief":
      return {
        headline: `${buildGreeting(preferredName)} — here's your intelligence briefing`,
        summary: `${insightCount} insights surfaced · Portfolio health ${healthScore}/100`,
      };
    case "lunch_update":
      return {
        headline: "Midday intelligence update",
        summary: `${insightCount} active insights · Health ${healthScore}/100 · Review priorities before afternoon meetings`,
      };
    case "end_of_day":
      return {
        headline: "End-of-day executive summary",
        summary: `${insightCount} insights tracked today · Portfolio health ${healthScore}/100 · Prepare for tomorrow`,
      };
    case "weekly_review":
      return {
        headline: "Weekly executive review",
        summary: `Portfolio health ${healthScore}/100 · ${insightCount} insights across your executive operating system`,
      };
  }
}

export function buildExecutiveDigest(
  type: DigestType,
  intelligence: ExecutiveIntelligenceResult,
  cards: IntelligenceCenterData["cards"],
  topInsights: ExecutiveInsightCard[],
  insightCount: number,
): ExecutiveDigest {
  const preferredName = getPreferredName(intelligence);
  const { headline, summary } = buildDigestHeadline(
    type,
    preferredName,
    intelligence.health.score,
    insightCount,
  );

  const morningBrief = buildMorningBriefSnapshot(intelligence);

  if (type === "morning_brief") {
    return {
      type,
      typeLabel: DIGEST_TYPE_LABELS[type],
      headline,
      summary,
      sections: [
        {
          id: "focus",
          title: "Today's Focus",
          items: morningBrief.todaysFocus.priorities.map((priority, index) => ({
            id: `focus-${index}`,
            title: morningBrief.todaysFocus.headline,
            summary: priority,
          })),
        },
        ...buildDigestSections(cards, topInsights),
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  if (type === "weekly_review") {
    return {
      type,
      typeLabel: DIGEST_TYPE_LABELS[type],
      headline,
      summary,
      sections: [
        {
          id: "health",
          title: "Portfolio Health",
          items: morningBrief.executiveHealth.items.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
          })),
        },
        {
          id: "initiatives",
          title: "Initiative Status",
          items: morningBrief.initiativeHealth.items.slice(0, 4).map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
          })),
        },
        ...buildDigestSections(cards, topInsights),
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    type,
    typeLabel: DIGEST_TYPE_LABELS[type],
    headline,
    summary,
    sections: buildDigestSections(cards, topInsights),
    generatedAt: new Date().toISOString(),
  };
}
