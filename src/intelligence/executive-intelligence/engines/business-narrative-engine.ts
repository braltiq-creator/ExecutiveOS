import { clipNarrative, ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  CapacityResult,
  EnterpriseSignals,
  IntelligentDecision,
  IntelligentOutcome,
  NarrativeBundle,
  PulseResult,
} from "@/intelligence/executive-intelligence/types";

/**
 * Business Narrative Engine — interpret, never report.
 * Tone: experienced Chief of Staff.
 */
export function deriveBusinessNarrative(input: {
  signals: EnterpriseSignals;
  pulse: PulseResult;
  capacity: CapacityResult;
  outcomes: IntelligentOutcome[];
  decisions: IntelligentDecision[];
}): NarrativeBundle {
  const { signals, pulse, capacity, outcomes, decisions } = input;
  const open = decisions.filter((d) => d.priority !== "resolved");
  const topDecision = open[0];

  const executiveSummary = clipNarrative(
    [
      pulse.narrative,
      capacity.reasoning,
      topDecision
        ? `First call: ${topDecision.question}`
        : "No Decision requires an immediate bind.",
    ].join(" "),
    60,
  );

  const sinceYesterday = buildSinceYesterday(signals, outcomes, decisions);

  const executiveBrief = ensureSentence(
    [
      `Morning position: ${pulse.label}.`,
      pulse.narrative,
      `Capacity is ${capacity.capacity} with a ${capacity.attentionBudget} attention budget.`,
      topDecision
        ? `Priority judgement: ${topDecision.question}`
        : "The Decision queue is clear of immediate binds.",
    ].join(" "),
  );

  const weeklyBrief = ensureSentence(
    [
      `This week turns on ${open.length} open Decisions and ${outcomes.filter((o) => o.momentum === "drifting").length} drifting Outcomes.`,
      outcomes[0]
        ? `${outcomes[0].shortName} remains the sharpest portfolio edge.`
        : "Portfolio edges are quiet.",
      "Protect judgement time; do not fill it with status theatre.",
    ].join(" "),
  );

  const monthlyBrief = ensureSentence(
    [
      `Across the month, leadership value compounds where Decisions clear Outcome blockers — not where meetings multiply.`,
      `Current portfolio score ${signals.overallScore} with pulse ${pulse.label.toLowerCase()}.`,
      "Hold the operating cadence: interpret overnight change, bind the few calls that matter, then force motion.",
    ].join(" "),
  );

  return {
    executiveSummary,
    sinceYesterday,
    executiveBrief,
    weeklyBrief,
    monthlyBrief,
    greeting: greetingFor(signals.executiveName),
    tone: "ceo",
  };
}

function greetingFor(name: string): string {
  const first = name.trim().split(/\s+/)[0] || "there";
  return `Good morning, ${first}`;
}

function buildSinceYesterday(
  signals: EnterpriseSignals,
  outcomes: IntelligentOutcome[],
  decisions: IntelligentDecision[],
): NarrativeBundle["sinceYesterday"] {
  const updates: NarrativeBundle["sinceYesterday"] = [];

  if (signals.executiveName === "Alex") {
    const helix = decisions.find((d) => d.id === "decision-residency");
    if (helix?.status === "approved") {
      updates.push({
        id: "since-helix-approved",
        sentence: "Helix residency was recorded — commercial motion can resume.",
        href: "/decisions/decision-residency",
      });
    } else if (helix?.status === "due_today" || helix?.status === "pending") {
      updates.push({
        id: "since-helix-open",
        sentence:
          "Helix still lacks a written residency posture — ARR health slipped overnight.",
        href: "/decisions/decision-residency",
      });
    }
  }

  for (const outcome of outcomes) {
    if (updates.length >= 3) break;
    if (outcome.movement === 0 && outcome.supportingEvidence.length === 0) {
      continue;
    }
    const signal = outcome.supportingEvidence.find((e) => e.kind === "signal");
    const sentence = signal
      ? ensureSentence(
          `${outcome.shortName}: ${shortWords(signal.label, 12)}`,
        )
      : ensureSentence(
          `${outcome.shortName} ${outcome.movement < 0 ? "slipped overnight" : outcome.movement > 0 ? "improved overnight" : "held steady"}.`,
        );
    updates.push({
      id: `since-${outcome.id}`,
      sentence,
      href: `/outcomes/${outcome.id}`,
    });
  }

  if (updates.length === 0) {
    updates.push({
      id: "since-quiet",
      sentence: "No material overnight movement across Focus Outcomes.",
      href: "/outcomes",
    });
  }

  return updates.slice(0, 3);
}

function shortWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}
