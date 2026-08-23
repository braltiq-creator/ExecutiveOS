import {
  ALIGNMENT_LABELS,
  type DelegationAdvice,
  type ExecutiveIntentProfile,
  type IntentNarrative,
  type IntentScore,
  type IntentScorable,
  type StrategicAlignmentLevel,
  type StrategicPriority,
} from "@/intelligence/executive-intent/types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Score a Decision / Recommendation / Outcome / Action against executive intent.
 */
export function scoreAgainstIntent(
  intent: ExecutiveIntentProfile,
  target: IntentScorable,
): IntentScore {
  const outcomeIds = target.outcomeIds ?? [];
  const matched = matchPriorities(intent, outcomeIds, target.themes ?? []);
  const conflictNotes = detectConflicts(intent, target, matched);

  let raw =
    matched.reduce((sum, priority) => sum + priority.weight, 0) /
    Math.max(1, matched.length || 1);

  if (matched.length === 0) {
    raw = 28;
  } else if (matched.length === 1) {
    raw = matched[0]!.weight * 0.85;
  } else {
    raw = Math.min(
      100,
      matched[0]!.weight * 0.7 + matched[1]!.weight * 0.25,
    );
  }

  // Quarterly objectives boost
  const qoBoost = intent.quarterlyObjectives
    .filter((objective) =>
      objective.relatedOutcomeIds.some((id) => outcomeIds.includes(id)),
    )
    .reduce((max, objective) => Math.max(max, objective.weight * 0.08), 0);

  // Theme keyword boost
  const themeBoost = intent.leadershipThemes
    .filter((theme) =>
      (target.themes ?? []).some((token) =>
        theme.title.toLowerCase().includes(token.toLowerCase()),
      ),
    )
    .reduce((sum, theme) => sum + theme.weight * 0.05, 0);

  if (conflictNotes.length > 0) {
    raw -= 35 + conflictNotes.length * 8;
  }

  const intentScore = clamp(raw + qoBoost + themeBoost);
  const businessImportance = clamp(target.businessImportance ?? 50);
  const alignment = toAlignment(intentScore, conflictNotes.length > 0);
  const attentionPriority = calculateAttentionPriority(
    businessImportance,
    intentScore,
    alignment,
  );

  return {
    targetId: target.id,
    kind: target.kind,
    intentScore,
    businessImportance,
    attentionPriority,
    alignment,
    alignmentLabel: ALIGNMENT_LABELS[alignment],
    matchedPriorities: matched.map((priority) => ({
      id: priority.id,
      title: priority.title,
      weight: priority.weight,
    })),
    conflicts: conflictNotes,
    reasoning: buildScoreReasoning({
      target,
      alignment,
      matched,
      intentScore,
      businessImportance,
      attentionPriority,
      conflicts: conflictNotes,
    }),
  };
}

export function calculateStrategicAlignment(
  intent: ExecutiveIntentProfile,
  target: IntentScorable,
): StrategicAlignmentLevel {
  return scoreAgainstIntent(intent, target).alignment;
}

/**
 * Business importance AND executive intent — not one or the other.
 */
export function calculateAttentionPriority(
  businessImportance: number,
  intentScore: number,
  alignment?: StrategicAlignmentLevel,
): number {
  const business = clamp(businessImportance);
  const intent = clamp(intentScore);
  // Weighted blend — intent can veto via conflicts
  let combined = business * 0.55 + intent * 0.45;
  if (alignment === "conflicts") {
    combined *= 0.45;
  } else if (alignment === "high") {
    combined = Math.min(100, combined + 8);
  } else if (alignment === "low") {
    combined *= 0.85;
  }
  return clamp(combined);
}

export function recommendDelegation(
  intent: ExecutiveIntentProfile,
  target: IntentScorable,
  score?: IntentScore,
): DelegationAdvice {
  const resolved = score ?? scoreAgainstIntent(intent, target);
  const minutes = target.estimatedMinutes ?? 10;
  const style = intent.delegationStyle;
  const prefs = intent.preferences.decision;

  if (resolved.alignment === "conflicts") {
    return {
      shouldDelegate: false,
      act: "escalate",
      reason: "Conflicts with executive intent — escalate rather than bury.",
      suggestedOwnerRole: intent.role,
    };
  }

  if (
    resolved.alignment === "high" &&
    resolved.intentScore >= 85 &&
    (target.kind === "decision" || target.recommendedAct === "approve")
  ) {
    return {
      shouldDelegate: false,
      act: "keep",
      reason: "High alignment with a top priority — keep for the executive.",
      suggestedOwnerRole: intent.role,
    };
  }

  if (
    style === "empowering" ||
    style === "fully_delegates" ||
    (style === "selective" &&
      resolved.alignment === "medium" &&
      minutes <= 10 &&
      prefs.biasTowardAction >= 70)
  ) {
    return {
      shouldDelegate: true,
      act: "delegate",
      reason:
        "Fits delegation style — preserve executive attention for higher-alignment binds.",
      suggestedOwnerRole: "team",
    };
  }

  if (prefs.requiresOptionPaper && resolved.intentScore < 70) {
    return {
      shouldDelegate: true,
      act: "schedule",
      reason: "Needs an option paper before executive bind — schedule preparation.",
      suggestedOwnerRole: "ChiefOfStaff",
    };
  }

  if ((target.riskSignal ?? 0) >= prefs.escalateAboveRisk) {
    return {
      shouldDelegate: false,
      act: "escalate",
      reason: "Risk signal exceeds appetite threshold.",
      suggestedOwnerRole: intent.role,
    };
  }

  return {
    shouldDelegate: false,
    act: "keep",
    reason: "Retain for executive judgement under current intent posture.",
    suggestedOwnerRole: intent.role,
  };
}

export function generateIntentNarrative(
  intent: ExecutiveIntentProfile,
  scores: IntentScore[],
): IntentNarrative {
  const topPriorities = [...intent.strategicPriorities]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
  const prioritiesEstablished = topPriorities.length > 0;
  const high = scores
    .filter((score) => score.alignment === "high")
    .sort((a, b) => b.attentionPriority - a.attentionPriority);
  const conflicts = scores.filter((score) => score.alignment === "conflicts");

  const morningFocus = !prioritiesEstablished
    ? "Strategic priorities have not yet been established. Judgement is ranked by materiality, evidence, confidence and potential business impact."
    : high[0] != null
      ? `Today turns on what advances ${topPriorities[0]?.title ?? "your priorities"} — start with ${high[0].kind} “${trim(high[0].targetId)}”.`
      : `Protect attention for ${topPriorities.map((p) => p.title).join(", ")} — nothing else earns the morning.`;

  const priorityLens = !prioritiesEstablished
    ? "Strategic priorities have not yet been established. Judgement is ranked by materiality, evidence, confidence and potential business impact."
    : `Your lens: ${topPriorities
        .map((priority) => `${priority.title} (${priority.weight})`)
        .join(" · ")}.`;

  const sinceYesterdayLens = !prioritiesEstablished
    ? "No configured strategic priorities — overnight movement is ranked by materiality and evidence only."
    : high.length > 0
      ? `Overnight movement that affects YOUR priorities: ${high
          .slice(0, 3)
          .map((score) => score.matchedPriorities[0]?.title ?? score.kind)
          .join(", ")}.`
      : `Little overnight movement touched ${topPriorities[0]?.title ?? "your stated priorities"}.`;

  const operatingPosture = [
    intent.narrative,
    conflicts.length > 0
      ? `${conflicts.length} item(s) conflict with intent — do not let them steal Focus time.`
      : prioritiesEstablished
        ? "No material conflicts with stated intent."
        : "No configured strategic priorities to conflict with.",
    `Delegation style: ${intent.delegationStyle}; risk appetite: ${intent.riskAppetite}.`,
  ].join(" ");

  return {
    morningFocus,
    priorityLens,
    sinceYesterdayLens,
    operatingPosture,
  };
}

function matchPriorities(
  intent: ExecutiveIntentProfile,
  outcomeIds: string[],
  themes: string[],
): StrategicPriority[] {
  return intent.strategicPriorities
    .filter((priority) => {
      const outcomeHit = priority.relatedOutcomeIds.some((id) =>
        outcomeIds.includes(id),
      );
      const themeHit = (priority.relatedThemeIds ?? []).some((themeId) =>
        themes.some((token) => themeId.includes(token) || token.includes(themeId)),
      );
      const titleHit = themes.some((token) =>
        priority.title.toLowerCase().includes(token.toLowerCase()),
      );
      return outcomeHit || themeHit || titleHit;
    })
    .sort((a, b) => b.weight - a.weight);
}

function detectConflicts(
  intent: ExecutiveIntentProfile,
  target: IntentScorable,
  matched: StrategicPriority[],
): string[] {
  const notes: string[] = [];
  const meetingPriority = intent.strategicPriorities.find((p) =>
    p.title.toLowerCase().includes("meeting load"),
  );

  if (
    target.kind === "meeting" &&
    meetingPriority &&
    meetingPriority.weight >= 75 &&
    intent.preferences.meeting.declineDuplicateForums
  ) {
    notes.push("Adds meeting load against a stated capacity priority.");
  }

  if (
    intent.riskAppetite === "conservative" &&
    (target.riskSignal ?? 0) >= 80 &&
    matched.some((p) => p.title.toLowerCase().includes("arr"))
  ) {
    notes.push("Aggressive commercial path against conservative risk appetite.");
  }

  if (
    intent.preferences.meeting.protectStrategyBlocks &&
    target.kind === "meeting" &&
    (target.estimatedMinutes ?? 0) >= 60
  ) {
    notes.push("Long meeting threatens protected strategy blocks.");
  }

  return notes;
}

function toAlignment(
  intentScore: number,
  hasConflict: boolean,
): StrategicAlignmentLevel {
  if (hasConflict && intentScore < 55) return "conflicts";
  if (hasConflict && intentScore < 70) return "conflicts";
  if (intentScore >= 75) return "high";
  if (intentScore >= 50) return "medium";
  return "low";
}

function buildScoreReasoning(input: {
  target: IntentScorable;
  alignment: StrategicAlignmentLevel;
  matched: StrategicPriority[];
  intentScore: number;
  businessImportance: number;
  attentionPriority: number;
  conflicts: string[];
}): string {
  const matchText =
    input.matched.length > 0
      ? `Matches ${input.matched
          .slice(0, 2)
          .map((p) => `${p.title} (${p.weight})`)
          .join(", ")}`
      : "No direct priority match";
  const conflictText =
    input.conflicts.length > 0
      ? ` Conflicts: ${input.conflicts.join(" ")}`
      : "";
  return `${ALIGNMENT_LABELS[input.alignment]}. ${matchText}. Business ${input.businessImportance} × Intent ${input.intentScore} → Attention ${input.attentionPriority}.${conflictText}`;
}

function trim(id: string): string {
  return id.replace(/^(decision|outcome|rec|action)-/, "");
}
