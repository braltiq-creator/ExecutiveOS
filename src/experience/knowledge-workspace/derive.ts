/**
 * Knowledge Workspace presentation — organisational evidence engine.
 * Derives from snapshot / decisions / strategy / loop — no Core changes.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import type {
  KnowledgeEntryFrom,
  KnowledgeSectionId,
  KnowledgeWorkspaceView,
  KwEvidenceItem,
} from "@/experience/knowledge-workspace/types";

export function parseKnowledgeEntry(
  from: string | null | undefined,
): KnowledgeEntryFrom {
  switch (from) {
    case "priority":
    case "activity":
    case "memory":
    case "strategy":
    case "evidence":
    case "simulator":
    case "impact":
    case "customer_health":
    case "intelligence":
      return from;
    default:
      return "nav";
  }
}

export function resolveKnowledgeFocus(
  entry: KnowledgeEntryFrom,
): KnowledgeSectionId {
  switch (entry) {
    case "evidence":
    case "simulator":
      return "evidence-stack";
    case "impact":
      return "confidence";
    case "intelligence":
      return "intelligence-diagnostics";
    case "strategy":
      return "related-strategy";
    case "memory":
    case "activity":
      return "related-activity";
    case "customer_health":
      return "executive-answer";
    case "priority":
      return "executive-question";
    default:
      return "executive-question";
  }
}

function brief(text: string, maxWords = 16): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function questionForEntry(
  entry: KnowledgeEntryFrom,
  snapshot: ExecutiveSnapshot,
  topic?: string | null,
): string {
  if (topic) return topic;
  switch (entry) {
    case "customer_health":
      return "Why is Customer Health at its current level?";
    case "intelligence":
      return "Why is Executive Intelligence at its current score?";
    case "evidence":
    case "simulator":
      return "Why is this decision recommended?";
    case "impact":
      return "Why should I trust the predicted organisational impact?";
    case "strategy":
      return "Why has Organisation Health moved this way?";
    case "memory":
      return "What did yesterday's decisions teach us today?";
    case "activity":
      return "What evidence supports this overnight signal?";
    case "priority":
      return "Why does this priority require attention now?";
    default:
      return snapshot.pulse.level === "improving"
        ? "Why is Commercial Health improving?"
        : snapshot.pulse.confidence < 75
          ? `Why is confidence only ${snapshot.pulse.confidence}%?`
          : "Why should I trust this recommendation?";
  }
}

export function knowledgeEntryLabel(entry: KnowledgeEntryFrom): string {
  switch (entry) {
    case "priority":
      return "Arrived from Executive Priorities";
    case "activity":
      return "Arrived from Activity Feed";
    case "memory":
      return "Arrived from Executive Memory";
    case "strategy":
      return "Arrived from Strategy · Related Knowledge";
    case "evidence":
      return "Arrived from Decision · Supporting Evidence";
    case "simulator":
      return "Arrived from Decision · Impact Simulator";
    case "impact":
      return "Arrived from Impact History";
    case "customer_health":
      return "Arrived from Customer Health";
    case "intelligence":
      return "Arrived from Today · Executive Brief";
    default:
      return "Traceable evidence behind ExecutiveOS judgement";
  }
}

export function buildKnowledgeWorkspaceView(input: {
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
  strategicOutcomes: StrategicOutcome[];
  loopImpacts?: LoopImpactRecord[];
  entryFrom?: string | null;
  topic?: string | null;
}): KnowledgeWorkspaceView {
  const entry = parseKnowledgeEntry(input.entryFrom);
  const focusSection = resolveKnowledgeFocus(entry);
  const { snapshot, decisions, strategicOutcomes } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const topAction = snapshot.recommendedActions[0];
  const confidence = Math.min(
    96,
    snapshot.pulse.confidence + (loopImpacts[0] ? 4 : 0),
  );

  const question = questionForEntry(entry, snapshot, input.topic);

  const drivers = [
    brief(snapshot.pulse.why, 12),
    brief(snapshot.executiveState.summary, 12),
    topAction
      ? brief(topAction.why, 12)
      : brief(snapshot.sinceYesterday[0]?.sentence || "Overnight signals steady", 12),
  ].filter(Boolean);

  const answer = {
    summary: [
      `${snapshot.pulse.label}. ${brief(snapshot.pulse.why, 14)}.`,
      "Trust rests on linked decisions, outcomes, and recent organisational signals — not on a single source.",
      topAction
        ? brief(`Recommended focus: ${topAction.title}. ${topAction.why}`, 18)
        : brief(snapshot.executiveState.summary, 14),
    ]
      .filter(Boolean)
      .join(" "),
    drivers,
    impact: brief(
      topAction?.expectedImpact ||
        topAction?.expectedOutcome ||
        snapshot.priorityDecisions[0]?.businessImpact ||
        "Material to Organisation Health and executive attention.",
      16,
    ),
    focus: brief(
      topAction?.title ||
        snapshot.priorityDecisions[0]?.title ||
        "Protect the outcomes that move Organisation Health.",
      14,
    ),
    confidence,
  };

  const evidence: KwEvidenceItem[] = [];

  decisions.slice(0, 3).forEach((d) => {
    evidence.push({
      id: `dec-${d.id}`,
      bucket: "Executive Decisions",
      source: d.owner,
      date: d.deadline,
      relevance: brief(d.question, 10),
      contribution: `${Math.min(24, Math.round(d.confidence / 5))}%`,
      href: `/decisions/${d.id}`,
    });
    d.evidence.slice(0, 1).forEach((e) => {
      evidence.push({
        id: `ev-${e.id}`,
        bucket: "Documents",
        source: e.source,
        date: e.asOf,
        relevance: brief(e.title, 10),
        contribution: "8%",
        href: `/knowledge?from=evidence&topic=${encodeURIComponent(e.title)}`,
      });
    });
  });

  strategicOutcomes.slice(0, 3).forEach((o) => {
    evidence.push({
      id: `so-${o.id}`,
      bucket: "Strategy",
      source: o.executiveOwner,
      date: o.updatedAt.slice(0, 10),
      relevance: brief(o.name, 10),
      contribution: `${Math.min(20, Math.round(o.confidence / 6))}%`,
      href: `/strategy?from=strategic_outcomes`,
    });
  });

  if (snapshot.commercialContext) {
    evidence.push({
      id: "crm-1",
      bucket: "CRM",
      source: "Commercial context",
      date: snapshot.asOf.slice(0, 10),
      relevance: "Pipeline and account signal",
      contribution: "10%",
      href: "/strategy?from=commercial_health",
    });
  }

  snapshot.executiveAgenda?.items.slice(0, 2).forEach((m) => {
    evidence.push({
      id: `meet-${m.id}`,
      bucket: "Meetings",
      source: "Calendar",
      date: snapshot.asOf.slice(0, 10),
      relevance: brief(m.title, 10),
      contribution: "6%",
      href: "/calendar",
    });
  });

  if (topAction?.evidenceSummary?.[0] || topAction?.evidence?.[0]) {
    evidence.push({
      id: "fin-1",
      bucket: "Financials",
      source: "Value signals",
      date: snapshot.asOf.slice(0, 10),
      relevance: brief(
        topAction.evidenceSummary?.[0] || topAction.evidence?.[0] || "Value",
        10,
      ),
      contribution: "12%",
      href: "/reports",
    });
  }

  evidence.push({
    id: "ai-1",
    bucket: "AI Analysis",
    source: "Executive Intelligence",
    date: snapshot.pulse.refreshedLabel,
    relevance: brief(snapshot.pulse.why, 12),
    contribution: `${Math.min(18, Math.round(snapshot.pulse.aiConfidence / 6))}%`,
    href: "/knowledge?from=nav",
  });

  loopImpacts.slice(0, 2).forEach((imp) => {
    evidence.push({
      id: `loop-${imp.decisionId}`,
      bucket: "Executive Decisions",
      source: "Operating Loop",
      date: imp.approvedAt.slice(0, 10),
      relevance: `${imp.decisionTitle} — Health ${imp.healthBefore}→${imp.healthAfter}`,
      contribution: "14%",
      href: `/decisions/${imp.decisionId}`,
    });
  });

  const relationships = [
    {
      id: "rel-q",
      kind: "Question",
      label: brief(question, 12),
      href: "#executive-question",
    },
    {
      id: "rel-insight",
      kind: "Insight",
      label: brief(snapshot.pulse.label, 8),
      href: "#executive-answer",
    },
    ...snapshot.priorityDecisions.slice(0, 2).map((d) => ({
      id: `rel-d-${d.id}`,
      kind: "Decision",
      label: brief(d.title, 10),
      href: d.href,
    })),
    ...strategicOutcomes.slice(0, 2).map((o) => ({
      id: `rel-o-${o.id}`,
      kind: "Outcome",
      label: brief(o.name, 10),
      href: "/strategy?from=strategic_outcomes",
    })),
    {
      id: "rel-risk",
      kind: "Risk",
      label:
        snapshot.pulse.level === "critical" || snapshot.pulse.level === "attention"
          ? "Attention posture elevated"
          : "Risk contained",
      href: "/decisions?from=critical_risks",
    },
    {
      id: "rel-opp",
      kind: "Opportunity",
      label: brief(topAction?.title || "No ranked opportunity", 10),
      href: topAction?.href || "/decisions",
    },
  ];

  const relatedStrategy = strategicOutcomes.slice(0, 4).map((o) => ({
    id: o.id,
    title: o.name,
    detail: brief(
      `${o.currentHealth.replace(/_/g, " ")} · ${o.description || o.evidence[0] || "Supported by current evidence"}`,
      16,
    ),
    href: "/strategy?from=strategic_outcomes",
  }));

  const relatedDecisions = [
    ...decisions.slice(0, 3).map((d) => ({
      id: d.id,
      title: brief(d.question, 14),
      detail: brief(d.businessImpact || d.why, 14),
      href: `/decisions/${d.id}`,
    })),
    ...snapshot.priorityDecisions.slice(0, 2).map((d) => ({
      id: `p-${d.id}`,
      title: brief(d.title, 14),
      detail: brief(d.businessImpact, 12),
      href: `/decisions?from=priority_decisions&select=${encodeURIComponent(d.id)}`,
    })),
  ].slice(0, 5);

  const relatedActivity = [
    ...loopImpacts.slice(0, 2).map((i) => ({
      id: `act-loop-${i.decisionId}`,
      title: `${i.decisionTitle} approved`,
      detail: `Organisation Health ${i.healthBefore} → ${i.healthAfter}`,
      href: `/decisions/${i.decisionId}`,
    })),
    ...snapshot.sinceYesterday.slice(0, 4).map((u) => ({
      id: u.id,
      title: brief(u.sentence, 14),
      detail: "Overnight organisational signal",
      href: u.href || "/knowledge?from=activity",
    })),
  ].slice(0, 6);

  const sources = evidence.slice(0, 6).map((e) => ({
    id: `src-${e.id}`,
    label: `${e.bucket} · ${e.source}`,
    summary: e.relevance,
    href: e.href,
  }));

  const timeline = [
    ...loopImpacts.slice(0, 2).map((i) => ({
      id: `tl-loop-${i.decisionId}`,
      at: i.approvedAt,
      title: "Updated recommendation",
      detail: `${i.decisionTitle} — confidence ${i.confidenceBefore}% → ${i.confidenceAfter}%`,
      kind: "recommendation" as const,
    })),
    {
      id: "tl-conf",
      at: snapshot.asOf,
      title: "Changed confidence",
      detail: `Overall confidence ${confidence}% · ${snapshot.pulse.refreshedLabel}`,
      kind: "confidence" as const,
    },
    ...snapshot.sinceYesterday.slice(0, 3).map((u) => ({
      id: `tl-${u.id}`,
      at: snapshot.asOf,
      title: "New evidence",
      detail: brief(u.sentence, 16),
      kind: "evidence" as const,
    })),
  ];

  const strength =
    confidence >= 80 ? "Strong" : confidence >= 65 ? "Moderate" : "Limited";
  const freshness =
    snapshot.sinceYesterday.length > 0 ? "Fresh overnight" : "Stable";
  const coverage =
    evidence.length >= 8 ? "Broad" : evidence.length >= 4 ? "Adequate" : "Narrow";
  const quality =
    snapshot.pulse.aiConfidence >= 70 ? "Reliable" : "Needs corroboration";

  return {
    entry,
    focusSection,
    question,
    answer,
    confidence: {
      score: confidence,
      strength,
      freshness,
      coverage,
      quality,
      explanation: brief(
        `Confidence is ${confidence}% because evidence strength is ${strength.toLowerCase()}, freshness is ${freshness.toLowerCase()}, and coverage is ${coverage.toLowerCase()}. ${quality === "Reliable" ? "Source quality supports action." : "Seek one more corroborating source before binding."}`,
        40,
      ),
      severity:
        confidence >= 80 ? "positive" : confidence >= 65 ? "warning" : "critical",
    },
    evidence: evidence.slice(0, 12),
    relationships,
    relatedStrategy,
    relatedDecisions,
    relatedActivity,
    sources,
    timeline,
  };
}
