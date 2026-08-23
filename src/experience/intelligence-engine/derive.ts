/**
 * Executive Intelligence Engine — presentation synthesis.
 * Ranks judgement opportunities from Strategy, Decisions, Knowledge, Loop, Memory.
 * No Core / provider / routing changes.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import { orgHealthScore } from "@/experience/mission-control/derive";
import type {
  CommandBrief,
  ExecutiveIntelligenceView,
  IntelligenceScore,
  IntelligenceStreamEvent,
  IntelligenceSummary,
  IntelligenceTimelineEvent,
  JudgementItem,
} from "@/experience/intelligence-engine/types";
import type { McActivityItem } from "@/experience/mission-control/types";
import type { LoopMemory } from "@/experience/executive-loop/types";

function brief(text: string, maxWords = 14): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Weighted rank: impact, confidence, urgency, cost of delay, strategic alignment. */
function rankScore(input: {
  impact: number;
  confidence: number;
  urgency: number;
  costOfDelay: number;
  alignment: number;
}): number {
  return clamp(
    input.impact * 0.3 +
      input.confidence * 0.2 +
      input.urgency * 0.2 +
      input.costOfDelay * 0.15 +
      input.alignment * 0.15,
  );
}

function delayUrgency(text: string): number {
  const t = text.toLowerCase();
  if (/today|immediate|now|critical|hour/.test(t)) return 92;
  if (/week|compound|day|urgent/.test(t)) return 78;
  if (/month|quarter|drift/.test(t)) return 62;
  return 55;
}

function withDecisionEntry(href: string, from: string): string {
  if (!href.startsWith("/decisions")) return href;
  if (href.includes("from=")) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}from=${from}`;
}

export function buildIntelligenceScore(input: {
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
  strategicOutcomes: StrategicOutcome[];
  loopImpacts?: LoopImpactRecord[];
}): IntelligenceScore {
  const { snapshot, decisions, strategicOutcomes } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const health = orgHealthScore(snapshot);
  const evidenceCount =
    decisions.reduce((n, d) => n + d.evidence.length, 0) +
    strategicOutcomes.reduce((n, o) => n + o.evidence.length, 0) +
    snapshot.sinceYesterday.length;
  const coverage = clamp(40 + evidenceCount * 8 + (loopImpacts.length > 0 ? 10 : 0));
  const freshness = clamp(
    snapshot.sinceYesterday.length > 0
      ? 72 + snapshot.sinceYesterday.length * 6 + (loopImpacts.length > 0 ? 8 : 0)
      : 48 + (loopImpacts.length > 0 ? 20 : 0),
  );
  const recommendationQuality = clamp(
    45 +
      snapshot.recommendedActions.length * 12 +
      snapshot.priorityDecisions.length * 8 +
      (loopImpacts.length > 0 ? 10 : 0),
  );
  const dataQuality = clamp(snapshot.pulse.aiConfidence);
  const confidence = clamp(
    snapshot.pulse.confidence + (loopImpacts[0] ? loopImpacts[0].confidenceAfter - loopImpacts[0].confidenceBefore : 0),
  );

  const overall = clamp(
    confidence * 0.25 +
      coverage * 0.2 +
      freshness * 0.15 +
      recommendationQuality * 0.25 +
      dataQuality * 0.15,
  );

  const trend =
    loopImpacts.length > 0 || snapshot.pulse.level === "improving"
      ? "up"
      : snapshot.pulse.level === "critical" || snapshot.pulse.level === "attention"
        ? "down"
        : "flat";

  const severity =
    overall >= 78 ? "positive" : overall >= 60 ? "warning" : "critical";

  const explanation = loopImpacts[0]
    ? `Intelligence rose after ${brief(loopImpacts[0].decisionTitle, 8)} — Organisation Health ${loopImpacts[0].healthBefore}→${loopImpacts[0].healthAfter}, confidence ${loopImpacts[0].confidenceBefore}%→${loopImpacts[0].confidenceAfter}%.`
    : snapshot.sinceYesterday[0]
      ? `Score reflects overnight signal strength and recommendation quality. ${brief(snapshot.sinceYesterday[0].sentence, 12)}.`
      : `Score reflects organisational signal coverage (${coverage}%), freshness (${freshness}%), and recommendation quality (${recommendationQuality}%). Health baseline ${health}.`;

  return {
    overall,
    confidence,
    evidenceCoverage: coverage,
    evidenceFreshness: freshness,
    recommendationQuality,
    dataQuality,
    trend,
    severity,
    explanation: brief(explanation, 36),
    href: "/knowledge?from=intelligence",
  };
}

export function buildIntelligenceSummary(input: {
  snapshot: ExecutiveSnapshot;
  queueLength: number;
  loopImpacts?: LoopImpactRecord[];
  score: IntelligenceScore;
}): IntelligenceSummary {
  const { snapshot, score } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const health = orgHealthScore(snapshot);
  const risks = snapshot.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  ).length;
  const opportunities = snapshot.recommendedActions.filter(
    (a) => !a.potentialRisk,
  ).length;

  const bullets = [];

  if (loopImpacts[0]) {
    const delta = loopImpacts[0].healthAfter - loopImpacts[0].healthBefore;
    bullets.push({
      id: "health",
      text: `Organisation Health ${delta >= 0 ? "increased" : "moved"} by ${Math.abs(delta)} points.`,
      tone: delta >= 0 ? ("positive" as const) : ("attention" as const),
    });
  } else {
    bullets.push({
      id: "health",
      text:
        snapshot.pulse.level === "improving"
          ? `Organisation Health holding near ${health} with improving posture.`
          : `Organisation Health sits at ${health} — attention still material.`,
      tone:
        snapshot.pulse.level === "improving"
          ? ("positive" as const)
          : ("attention" as const),
    });
  }

  bullets.push({
    id: "risk",
    text:
      risks === 0
        ? "No new strategic risk elevated overnight."
        : risks === 1
          ? "One strategic risk emerged."
          : `${risks} strategic risks require judgement.`,
    tone: risks > 0 ? ("attention" as const) : ("neutral" as const),
  });

  bullets.push({
    id: "opp",
    text:
      opportunities === 0
        ? "Commercial opportunities steady."
        : opportunities === 1
          ? "One commercial opportunity strengthened."
          : `${Math.min(opportunities, 3)} commercial opportunities strengthened.`,
    tone: opportunities > 0 ? ("positive" as const) : ("neutral" as const),
  });

  bullets.push({
    id: "confidence",
    text:
      score.trend === "up"
        ? "Executive confidence improved."
        : score.trend === "down"
          ? "Executive confidence softened — corroborate before binding."
          : "Executive confidence held steady.",
    tone:
      score.trend === "up"
        ? ("positive" as const)
        : score.trend === "down"
          ? ("attention" as const)
          : ("neutral" as const),
  });

  const judgementCount = input.queueLength;
  const areaWord =
    judgementCount === 1 ? "one area" : `${judgementCount} areas`;

  return {
    bullets: bullets.slice(0, 4),
    judgementCount,
    closing: `Today's judgement is required in ${areaWord}.`,
  };
}

export function buildExecutiveBrief(input: {
  snapshot: ExecutiveSnapshot;
  queueLength: number;
  loopImpacts?: LoopImpactRecord[];
  score: IntelligenceScore;
}): CommandBrief {
  const { snapshot, score } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const health = loopImpacts[0]
    ? loopImpacts[0].healthAfter
    : orgHealthScore(snapshot);
  const risks = snapshot.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  ).length;
  const opportunities = snapshot.recommendedActions.filter(
    (a) => !a.potentialRisk,
  ).length;

  const healthStatus =
    snapshot.pulse.level === "critical"
      ? "Critical"
      : snapshot.pulse.level === "attention"
        ? "Attention Required"
        : snapshot.pulse.level === "improving"
          ? "Improving"
          : "Stable";

  const healthTrend =
    score.trend === "up" || snapshot.pulse.level === "improving"
      ? ("up" as const)
      : snapshot.pulse.level === "critical" ||
          snapshot.pulse.level === "attention"
        ? ("down" as const)
        : ("flat" as const);

  return {
    judgementCount: Math.max(1, input.queueLength),
    healthValue: health,
    healthStatus,
    healthTrend,
    commercialLabel:
      opportunities === 0
        ? "Opportunities Steady"
        : opportunities === 1
          ? "1 Opportunity Strengthened"
          : `${Math.min(opportunities, 5)} Opportunities Strengthened`,
    riskLabel:
      risks === 0
        ? "Risks Contained"
        : risks === 1
          ? "1 Risk Increased"
          : `${risks} Risks Increased`,
    intelligence: score.overall,
    confidence: score.confidence,
    href: score.href,
  };
}

export function buildJudgementQueue(input: {
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
  strategicOutcomes: StrategicOutcome[];
  loopImpacts?: LoopImpactRecord[];
}): JudgementItem[] {
  const { snapshot, decisions, strategicOutcomes } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const items: JudgementItem[] = [];
  const seen = new Set<string>();

  const push = (item: JudgementItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const d of decisions) {
    const urgency = delayUrgency(d.deadline + " " + d.costOfDelay);
    const alignment = d.outcomeIds.length > 0 ? 85 : 55;
    const impact = clamp(55 + d.confidence * 0.35);
    const cost = delayUrgency(d.costOfDelay);
    push({
      id: `dec-${d.id}`,
      kind: "decision",
      title: brief(d.question, 14),
      whyItMatters: brief(d.why || d.businessImpact, 16),
      organisationalImpact: brief(
        d.expectedOutcomeImpact || d.businessImpact,
        14,
      ),
      confidence: d.confidence,
      costOfDelay: brief(d.costOfDelay, 10),
      recommendedAction: brief(
        d.whatShouldHappenNext || d.recommendationSummary || "Decide today",
        12,
      ),
      href: `/decisions/${d.id}`,
      rankScore: rankScore({
        impact,
        confidence: d.confidence,
        urgency,
        costOfDelay: cost,
        alignment,
      }),
      reasoning: {
        whyMatters: brief(d.businessImpact || d.why, 18),
        evidence: d.evidence.slice(0, 3).map((e) => brief(e.title, 10)),
        alternatives:
          d.alternatives[0]
            ? brief(d.alternatives[0].label || d.alternatives[0].summary, 14)
            : "Deferral compounds cost of delay without resolving uncertainty.",
        expectedOutcome: brief(
          d.expectedOutcomeImpact || d.recommendationSummary,
          14,
        ),
        confidence: d.confidence,
        suggestedAction: brief(
          d.whatShouldHappenNext || "Approve preferred path",
          12,
        ),
      },
    });
  }

  for (const pd of snapshot.priorityDecisions) {
    push({
      id: `prio-${pd.id}`,
      kind: "decision",
      title: brief(pd.title, 14),
      whyItMatters: brief(pd.businessImpact, 14),
      organisationalImpact: brief(pd.businessImpact, 12),
      confidence: 78,
      costOfDelay: brief(pd.decisionTimeLabel || "Today", 6),
      recommendedAction: "Open Decision Workspace",
      href: withDecisionEntry(pd.href, "priority"),
      rankScore: rankScore({
        impact: 80,
        confidence: 78,
        urgency: delayUrgency(pd.decisionTimeLabel || "today"),
        costOfDelay: 80,
        alignment: 75,
      }),
      reasoning: {
        whyMatters: brief(pd.businessImpact, 16),
        evidence: ["Priority decision queue", snapshot.pulse.label],
        alternatives: "Delay shifts risk into overnight drift.",
        expectedOutcome: brief(pd.businessImpact, 12),
        confidence: 78,
        suggestedAction: "Judge in Decision Workspace",
      },
    });
  }

  for (const a of snapshot.recommendedActions) {
    const isRisk = Boolean(a.potentialRisk);
    push({
      id: `act-${a.id}`,
      kind: isRisk ? "risk" : "opportunity",
      title: brief(a.title, 14),
      whyItMatters: brief(a.why, 16),
      organisationalImpact: brief(
        a.expectedImpact || a.expectedOutcome || a.supportsOutcome || "",
        14,
      ),
      confidence: clamp(snapshot.pulse.confidence - (isRisk ? 4 : 0)),
      costOfDelay: isRisk
        ? "Risk compounds without a call"
        : "Opportunity window narrows",
      recommendedAction: brief(
        isRisk ? "Contain risk now" : a.title,
        10,
      ),
      href: withDecisionEntry(a.href || "/decisions", "priority"),
      rankScore: rankScore({
        impact: isRisk ? 88 : 82,
        confidence: snapshot.pulse.confidence,
        urgency: isRisk ? 90 : 75,
        costOfDelay: isRisk ? 88 : 70,
        alignment: a.supportsOutcome ? 85 : 60,
      }),
      reasoning: {
        whyMatters: brief(a.why, 18),
        evidence: (a.evidenceSummary || a.evidence || []).slice(0, 3).map((e) =>
          brief(e, 10),
        ),
        alternatives: isRisk
          ? "Watch-only leaves exposure unowned."
          : "Pass leaves value on the table for competitors.",
        expectedOutcome: brief(
          a.expectedOutcome || a.expectedImpact || "Improves Organisation Health",
          14,
        ),
        confidence: snapshot.pulse.confidence,
        suggestedAction: brief(a.title, 10),
      },
    });
  }

  for (const o of strategicOutcomes.filter(
    (x) => x.currentHealth === "at_risk" || x.currentHealth === "off_track",
  )) {
    push({
      id: `so-${o.id}`,
      kind: "strategy",
      title: brief(`Protect ${o.name}`, 12),
      whyItMatters: brief(
        o.description || `${o.name} is ${o.currentHealth.replace(/_/g, " ")}`,
        16,
      ),
      organisationalImpact: brief(
        `Strategic outcome health: ${o.currentHealth.replace(/_/g, " ")}`,
        12,
      ),
      confidence: o.confidence,
      costOfDelay: "Strategic drift compounds",
      recommendedAction: "Open Strategy Workspace",
      href: "/strategy?from=strategic_outcomes",
      rankScore: rankScore({
        impact: 84,
        confidence: o.confidence,
        urgency: 80,
        costOfDelay: 82,
        alignment: 95,
      }),
      reasoning: {
        whyMatters: brief(o.description || o.name, 16),
        evidence: o.evidence.slice(0, 3).map((e) => brief(e, 10)),
        alternatives: "Deferral accepts further outcome deterioration.",
        expectedOutcome: "Restore outcome health trajectory",
        confidence: o.confidence,
        suggestedAction: "Align judgement to strategic outcome",
      },
    });
  }

  for (const o of snapshot.outcomes.filter(
    (x) => x.status === "at_risk" || x.status === "off_track",
  )) {
    push({
      id: `out-${o.id}`,
      kind: "risk",
      title: brief(`Stabilise ${o.name}`, 12),
      whyItMatters: brief(o.movementLabel || `${o.name} needs attention`, 14),
      organisationalImpact: brief(o.movementLabel || "Outcome at risk", 10),
      confidence: 70,
      costOfDelay: "Outcome risk compounds overnight",
      recommendedAction: "Open Strategy",
      href: o.href || "/strategy?from=priority",
      rankScore: rankScore({
        impact: 80,
        confidence: 70,
        urgency: 85,
        costOfDelay: 80,
        alignment: 88,
      }),
      reasoning: {
        whyMatters: brief(o.movementLabel || o.name, 14),
        evidence: [snapshot.pulse.label, o.status.replace(/_/g, " ")],
        alternatives: "Ignore and absorb further health decline.",
        expectedOutcome: "Contain strategic risk",
        confidence: 70,
        suggestedAction: "Review in Strategy Workspace",
      },
    });
  }

  if (loopImpacts[0]) {
    const imp = loopImpacts[0];
    push({
      id: `learn-${imp.decisionId}`,
      kind: "learning",
      title: brief(`Confirm impact of ${imp.decisionTitle}`, 12),
      whyItMatters:
        "Yesterday's judgement changed organisational health — verify the learning holds.",
      organisationalImpact: `Health ${imp.healthBefore}→${imp.healthAfter}`,
      confidence: imp.confidenceAfter,
      costOfDelay: "Missed learning weakens next recommendation",
      recommendedAction: "Review Impact History",
      href: `/knowledge?from=impact`,
      rankScore: rankScore({
        impact: 70,
        confidence: imp.confidenceAfter,
        urgency: 60,
        costOfDelay: 55,
        alignment: 70,
      }),
      reasoning: {
        whyMatters: "Operating Loop closed — organisational learning should inform today's queue.",
        evidence: [
          `Health ${imp.healthBefore}→${imp.healthAfter}`,
          `Confidence ${imp.confidenceBefore}%→${imp.confidenceAfter}%`,
        ],
        alternatives: "Treat approval as complete without checking predicted vs actual.",
        expectedOutcome: "Sharper recommendations tomorrow",
        confidence: imp.confidenceAfter,
        suggestedAction: "Open evidence behind the impact",
      },
    });
  }

  return items.sort((a, b) => b.rankScore - a.rankScore).slice(0, 5);
}

export function buildIntelligenceTimeline(input: {
  snapshot: ExecutiveSnapshot;
  loopImpacts?: LoopImpactRecord[];
  queue: JudgementItem[];
}): IntelligenceTimelineEvent[] {
  const { snapshot, queue } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const events: IntelligenceTimelineEvent[] = [];

  for (const imp of loopImpacts.slice(0, 2)) {
    events.push({
      id: `tl-dec-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Decision approved",
      detail: brief(imp.decisionTitle, 12),
      kind: "decision",
    });
    events.push({
      id: `tl-health-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Commercial health improved",
      detail: `${imp.commercialBefore} → ${imp.commercialAfter} · Health ${imp.healthBefore}→${imp.healthAfter}`,
      kind: "health",
    });
  }

  for (const u of snapshot.sinceYesterday.slice(0, 2)) {
    events.push({
      id: `tl-opp-${u.id}`,
      at: snapshot.asOf,
      title: "Opportunity detected",
      detail: brief(u.sentence, 14),
      kind: "opportunity",
    });
  }

  if (snapshot.recommendedActions[0]) {
    events.push({
      id: "tl-rec",
      at: snapshot.asOf,
      title: "Recommendation generated",
      detail: brief(snapshot.recommendedActions[0].title, 12),
      kind: "recommendation",
    });
  }

  if (queue[0]) {
    events.push({
      id: `tl-judge-${queue[0].id}`,
      at: snapshot.asOf,
      title: "Executive judgement requested",
      detail: brief(queue[0].title, 12),
      kind: "judgement",
    });
  }

  return events.slice(0, 8);
}

function streamTimeLabel(at: string, fallback: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Merge timeline, memory, and activity into one chronological stream. */
export function buildIntelligenceStream(input: {
  timeline: IntelligenceTimelineEvent[];
  feed: McActivityItem[];
  memory: LoopMemory | null;
  snapshotAsOf: string;
}): IntelligenceStreamEvent[] {
  const events: IntelligenceStreamEvent[] = [];

  for (const t of input.timeline) {
    events.push({
      id: `stream-${t.id}`,
      at: t.at,
      timeLabel: streamTimeLabel(t.at, "Today"),
      title: t.title,
      detail: t.detail,
      href:
        t.kind === "judgement"
          ? "/decisions?from=priority"
          : t.kind === "opportunity"
            ? "/knowledge?from=activity"
            : "/decisions",
      highlight: t.kind === "decision" || t.kind === "health",
    });
  }

  for (const f of input.feed) {
    events.push({
      id: `feed-${f.id}`,
      at: f.at,
      timeLabel: f.timeLabel,
      title: f.headline,
      href: f.href,
      highlight: f.highlight,
    });
  }

  if (input.memory) {
    for (const y of input.memory.yesterday) {
      events.push({
        id: `mem-y-${y.decisionTitle}`,
        at: `${input.snapshotAsOf.slice(0, 10)}T00:00:00.000Z`,
        timeLabel: "Yesterday",
        title: y.decisionTitle,
        href: y.href,
        highlight: true,
      });
    }
    for (const t of input.memory.today) {
      events.push({
        id: `mem-t-${t.label}`,
        at: input.snapshotAsOf,
        timeLabel: "Today",
        title: t.label,
        detail: t.value,
        href: "/knowledge?from=memory",
      });
    }
  }

  const seen = new Set<string>();
  return events
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((e) => {
      const key = `${e.timeLabel}|${e.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 24);
}

export function buildExecutiveIntelligenceView(input: {
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
  strategicOutcomes: StrategicOutcome[];
  loopImpacts?: LoopImpactRecord[];
  feed?: McActivityItem[];
  memory?: LoopMemory | null;
}): ExecutiveIntelligenceView {
  const score = buildIntelligenceScore(input);
  const queue = buildJudgementQueue(input);
  const summary = buildIntelligenceSummary({
    snapshot: input.snapshot,
    queueLength: queue.length,
    loopImpacts: input.loopImpacts,
    score,
  });
  const brief = buildExecutiveBrief({
    snapshot: input.snapshot,
    queueLength: queue.length,
    loopImpacts: input.loopImpacts,
    score,
  });
  const timeline = buildIntelligenceTimeline({
    snapshot: input.snapshot,
    loopImpacts: input.loopImpacts,
    queue,
  });
  const stream = buildIntelligenceStream({
    timeline,
    feed: input.feed ?? [],
    memory: input.memory ?? null,
    snapshotAsOf: input.snapshot.asOf,
  });

  return { score, summary, brief, queue, timeline, stream };
}

/** Map Intelligence Score into Mission Control KPI shape. */
export function intelligenceScoreToKpi(
  score: IntelligenceScore,
  updatedLabel?: string,
): {
  id: "executive_intelligence";
  label: string;
  value: string;
  status: string;
  trend: IntelligenceScore["trend"];
  severity: IntelligenceScore["severity"];
  confidence: number;
  href: string;
  updatedLabel?: string;
} {
  return {
    id: "executive_intelligence",
    label: "Intelligence",
    value: String(score.overall),
    status:
      score.trend === "up"
        ? "Improving"
        : score.trend === "down"
          ? "Softening"
          : "Steady",
    trend: score.trend,
    severity: score.severity,
    confidence: score.confidence,
    href: score.href,
    updatedLabel,
  };
}
