/**
 * Phase 70 — Live Executive Design Partner validation protocol.
 * Protocol + evidence schema only. No product redesign. No new engines.
 *
 * Live timings must be recorded by a facilitator with a real executive.
 * Structural simulation alone cannot close F69-06.
 */

export type LiveTaskId =
  | "T10S"
  | "T30S"
  | "T60S"
  | "T2M"
  | "T5M"
  | "RETURN";

export type CoachingLevel = 0 | 1 | 2 | 3 | 4;
/** 0 none · 1 nav hint · 2 interpretation · 3 direct instruction · 4 unable */

export type LiveVerdict = "PASS" | "PARTIAL" | "FAIL" | "NOT_ESTABLISHED";

export type VisualUsefulness =
  | "A_MATERIAL_IMPROVEMENT"
  | "B_USEFUL_CONFIRMATION"
  | "C_DEEPER_INVESTIGATION_ONLY"
  | "D_LITTLE_VALUE"
  | "E_CONFUSION"
  | "NOT_ESTABLISHED";

export type FrictionSeverity = "P0" | "P1" | "P2" | "P3";

export type LiveFriction = {
  id: string;
  severity: FrictionSeverity;
  area: string;
  observation: string;
  taskId?: LiveTaskId;
  blocksWorkflow: boolean;
};

export type TimedTaskRecord = {
  taskId: LiveTaskId;
  prompt: string;
  /** Elapsed seconds — null until live session records it. */
  elapsedSeconds: number | null;
  /** Exact / near-verbatim executive response. */
  response: string | null;
  coachingLevel: CoachingLevel | null;
  promptingRequired: boolean | null;
  passCriteria: string;
  verdict: LiveVerdict;
  observations: string[];
};

export type BehaviouralObservation = {
  lookedAtFirst: string | null;
  ignored: string | null;
  questioned: string | null;
  trusted: string | null;
  challenged: string | null;
  usedTechnicalVisuals: boolean | null;
  readNarrative: boolean | null;
  understoodDecisionQuestion: boolean | null;
  askedForMoreInfo: boolean | null;
  returnedToEvidence: boolean | null;
  attemptedDecision: boolean | null;
  thoughtAboutAccountability: boolean | null;
  notes: string[];
};

export type TrustConcerns = {
  dataConfidence: string | null;
  explanation: string | null;
  missingEvidence: string | null;
  recommendationVsJudgement: string | null;
  financialValue: string | null;
  ownership: string | null;
  freshness: string | null;
  sourceData: string | null;
  verbatimHesitation: string | null;
};

export type ExecutiveValueResponses = {
  wouldUseInsteadOfCurrent: string | null;
  wouldReturnDailyOrWeekly: string | null;
  expectTomorrow: string | null;
  missingBeforeTrust: string | null;
  wouldStartReviewHere: string | null;
};

export type LiveScorecard = {
  orientation: LiveVerdict;
  evidenceDiscovery: LiveVerdict;
  judgementComprehension: LiveVerdict;
  decisionComprehension: LiveVerdict;
  decisionNavigation: LiveVerdict;
  optionSelection: LiveVerdict;
  accountability: LiveVerdict;
  execution: LiveVerdict;
  returnContinuity: LiveVerdict;
  technicalVisualUsefulness: LiveVerdict;
  trust: LiveVerdict;
  habitPotential: LiveVerdict;
  perceivedExecutiveValue: LiveVerdict;
};

export type LiveSessionStatus =
  | "PROTOCOL_READY_AWAITING_PARTICIPANT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABORTED";

export type LiveSessionEvidence = {
  phase: 70;
  status: LiveSessionStatus;
  /** F69-06 closes only when live timings are recorded. */
  f6906: {
    id: "F69-06";
    status: "OPEN" | "CLOSED";
    reason: string;
  };
  session: {
    sessionId: string;
    conductedAt: string | null;
    facilitator: string | null;
    participantRole: string | null;
    organisationId: string | null;
    environment: "design_partner_pilot" | "internal_rehearsal" | null;
    productSurface: "/today";
    openingInstruction: string;
  };
  tasks: TimedTaskRecord[];
  behavioural: BehaviouralObservation;
  trust: TrustConcerns;
  visualUsefulness: {
    heatMap: VisualUsefulness;
    forecastVsActual: VisualUsefulness;
    facilitatorNotes: string | null;
  };
  executiveValue: ExecutiveValueResponses;
  scorecard: LiveScorecard;
  frictions: LiveFriction[];
  overallVerdict:
    | "READY_FOR_DESIGN_PARTNER_PILOT"
    | "READY_WITH_P1_FIXES"
    | "NOT_READY"
    | "NOT_ESTABLISHED";
  mustChange: string[];
  mustNotChange: string[];
};

export const LIVE_OPENING_INSTRUCTION =
  "You are looking at ExecutiveOS for the first time today. Tell me what you think requires your attention.";

export const LIVE_PROTOCOL_STEPS: ReadonlyArray<{
  taskId: LiveTaskId;
  windowLabel: string;
  targetSeconds: number | null;
  prompt: string;
  passCriteria: string;
}> = [
  {
    taskId: "T10S",
    windowLabel: "10 seconds",
    targetSeconds: 10,
    prompt: "What requires your attention?",
    passCriteria:
      "Executive identifies the correct lead issue within 10 seconds without coaching.",
  },
  {
    taskId: "T30S",
    windowLabel: "30 seconds",
    targetSeconds: 30,
    prompt: "What do you think is happening and how confident are you?",
    passCriteria:
      "Executive independently identifies demand movement, judgement confidence, and that a decision is required.",
  },
  {
    taskId: "T60S",
    windowLabel: "60 seconds",
    targetSeconds: 60,
    prompt: "Why do you think this is happening?",
    passCriteria:
      "Executive discovers Region × Model / forecast evidence and counter-signal / capacity implication without being told where to look.",
  },
  {
    taskId: "T2M",
    windowLabel: "2 minutes",
    targetSeconds: 120,
    prompt: "What decision do you think management needs to make?",
    passCriteria:
      "Executive reaches the decision paper independently and distinguishes evidence from decision options.",
  },
  {
    taskId: "T5M",
    windowLabel: "5 minutes",
    targetSeconds: 300,
    prompt:
      "If you were responsible for this decision, what would you do next?",
    passCriteria:
      "Executive selects an option, assigns owner and due date, and creates accountable action without coaching on which option to choose.",
  },
  {
    taskId: "RETURN",
    windowLabel: "Return visit",
    targetSeconds: null,
    prompt:
      "You haven't looked at ExecutiveOS since your previous review. What has changed?",
    passCriteria:
      "Executive reconstructs decision status, action/accountability, and remaining attention from Continuity without prior-session replay.",
  },
] as const;

export const TRUST_PROMPT =
  "What would make you hesitant to act on this?";

export const VISUAL_PROMPT =
  "Does the visual evidence help you understand the issue?";

export const EXECUTIVE_VALUE_PROMPTS = [
  "Would you use this instead of how you currently prepare for this type of issue?",
  "Would you come back to this every day or every week?",
  "What would you expect ExecutiveOS to show you tomorrow?",
  "What is missing before you would trust this for a real decision?",
  "Would you start your executive review here?",
] as const;

const EMPTY_BEHAVIOURAL: BehaviouralObservation = {
  lookedAtFirst: null,
  ignored: null,
  questioned: null,
  trusted: null,
  challenged: null,
  usedTechnicalVisuals: null,
  readNarrative: null,
  understoodDecisionQuestion: null,
  askedForMoreInfo: null,
  returnedToEvidence: null,
  attemptedDecision: null,
  thoughtAboutAccountability: null,
  notes: [],
};

const EMPTY_TRUST: TrustConcerns = {
  dataConfidence: null,
  explanation: null,
  missingEvidence: null,
  recommendationVsJudgement: null,
  financialValue: null,
  ownership: null,
  freshness: null,
  sourceData: null,
  verbatimHesitation: null,
};

const EMPTY_VALUE: ExecutiveValueResponses = {
  wouldUseInsteadOfCurrent: null,
  wouldReturnDailyOrWeekly: null,
  expectTomorrow: null,
  missingBeforeTrust: null,
  wouldStartReviewHere: null,
};

function emptyScorecard(): LiveScorecard {
  return {
    orientation: "NOT_ESTABLISHED",
    evidenceDiscovery: "NOT_ESTABLISHED",
    judgementComprehension: "NOT_ESTABLISHED",
    decisionComprehension: "NOT_ESTABLISHED",
    decisionNavigation: "NOT_ESTABLISHED",
    optionSelection: "NOT_ESTABLISHED",
    accountability: "NOT_ESTABLISHED",
    execution: "NOT_ESTABLISHED",
    returnContinuity: "NOT_ESTABLISHED",
    technicalVisualUsefulness: "NOT_ESTABLISHED",
    trust: "NOT_ESTABLISHED",
    habitPotential: "NOT_ESTABLISHED",
    perceivedExecutiveValue: "NOT_ESTABLISHED",
  };
}

/**
 * Create an empty live-session evidence shell for facilitator capture.
 * Does not invent timings or executive responses.
 */
export function createLiveSessionEvidenceShell(input?: {
  sessionId?: string;
  facilitator?: string;
}): LiveSessionEvidence {
  const tasks: TimedTaskRecord[] = LIVE_PROTOCOL_STEPS.map((step) => ({
    taskId: step.taskId,
    prompt: step.prompt,
    elapsedSeconds: null,
    response: null,
    coachingLevel: null,
    promptingRequired: null,
    passCriteria: step.passCriteria,
    verdict: "NOT_ESTABLISHED",
    observations: [],
  }));

  return {
    phase: 70,
    status: "PROTOCOL_READY_AWAITING_PARTICIPANT",
    f6906: {
      id: "F69-06",
      status: "OPEN",
      reason:
        "Live executive timings have not been recorded. Structural Phase 69 simulation is insufficient to close F69-06.",
    },
    session: {
      sessionId: input?.sessionId ?? `live-session-${Date.now()}`,
      conductedAt: null,
      facilitator: input?.facilitator ?? null,
      participantRole: null,
      organisationId: null,
      environment: null,
      productSurface: "/today",
      openingInstruction: LIVE_OPENING_INSTRUCTION,
    },
    tasks,
    behavioural: { ...EMPTY_BEHAVIOURAL, notes: [] },
    trust: { ...EMPTY_TRUST },
    visualUsefulness: {
      heatMap: "NOT_ESTABLISHED",
      forecastVsActual: "NOT_ESTABLISHED",
      facilitatorNotes: null,
    },
    executiveValue: { ...EMPTY_VALUE },
    scorecard: emptyScorecard(),
    frictions: [
      {
        id: "F69-06",
        severity: "P1",
        area: "Live user timing",
        observation:
          "Carried from Phase 69 — awaiting live executive session measurement.",
        blocksWorkflow: false,
      },
      {
        id: "F70-01",
        severity: "P1",
        area: "Live session execution",
        observation:
          "Protocol and evidence shell ready; real executive participant session not yet conducted.",
        blocksWorkflow: false,
      },
    ],
    overallVerdict: "NOT_ESTABLISHED",
    mustChange: [
      "Conduct a live executive / Design Partner session and record actual elapsed times for 10s / 30s / 60s / 2m / 5m / return.",
    ],
    mustNotChange: [
      "Signature /today Brief → Investigate → Decide → Execute composition",
      "Decision Engine selection semantics",
      "Action / accountability honesty rules",
      "Snapshot immutability and originSnapshotId lineage",
      "Manufacturing / commercial isolation",
      "Heat map and Actual vs Forecast formulas",
      "No Inventory / ERP / new intelligence engines",
    ],
  };
}

/** True only when every timed task has a recorded elapsedSeconds value. */
export function hasLiveTimings(evidence: LiveSessionEvidence): boolean {
  return evidence.tasks.every(
    (t) => t.elapsedSeconds != null && Number.isFinite(t.elapsedSeconds),
  );
}

/**
 * F69-06 closes only when live timings exist and session is completed.
 * Never close from structural simulation alone.
 */
export function resolveF6906Status(evidence: LiveSessionEvidence): {
  status: "OPEN" | "CLOSED";
  reason: string;
} {
  if (evidence.status !== "COMPLETED") {
    return {
      status: "OPEN",
      reason: `Session status is ${evidence.status}; live completion required.`,
    };
  }
  if (!hasLiveTimings(evidence)) {
    return {
      status: "OPEN",
      reason:
        "Session marked complete but one or more task timings are missing.",
    };
  }
  return {
    status: "CLOSED",
    reason:
      "Live executive timings recorded for all protocol windows including return visit.",
  };
}

function verdictFromTimedTask(task: TimedTaskRecord): LiveVerdict {
  if (task.elapsedSeconds == null || task.response == null) {
    return "NOT_ESTABLISHED";
  }
  return task.verdict;
}

/**
 * Derive scorecard from a (possibly incomplete) live evidence record.
 * Does not invent PASS for unrecorded tasks.
 */
export function buildLiveScorecardFromEvidence(
  evidence: LiveSessionEvidence,
): LiveScorecard {
  const byId = Object.fromEntries(
    evidence.tasks.map((t) => [t.taskId, t]),
  ) as Record<LiveTaskId, TimedTaskRecord>;

  const t10 = verdictFromTimedTask(byId.T10S);
  const t30 = verdictFromTimedTask(byId.T30S);
  const t60 = verdictFromTimedTask(byId.T60S);
  const t2 = verdictFromTimedTask(byId.T2M);
  const t5 = verdictFromTimedTask(byId.T5M);
  const ret = verdictFromTimedTask(byId.RETURN);

  const visual =
    evidence.visualUsefulness.heatMap === "NOT_ESTABLISHED" &&
    evidence.visualUsefulness.forecastVsActual === "NOT_ESTABLISHED"
      ? "NOT_ESTABLISHED"
      : evidence.visualUsefulness.heatMap === "E_CONFUSION" ||
          evidence.visualUsefulness.forecastVsActual === "E_CONFUSION"
        ? "FAIL"
        : evidence.visualUsefulness.heatMap === "A_MATERIAL_IMPROVEMENT" ||
            evidence.visualUsefulness.heatMap === "B_USEFUL_CONFIRMATION"
          ? "PASS"
          : "PARTIAL";

  const habitRaw = evidence.executiveValue.wouldReturnDailyOrWeekly;
  const habit: LiveVerdict =
    habitRaw == null
      ? "NOT_ESTABLISHED"
      : /every day|daily|weekly|yes/i.test(habitRaw)
        ? "PASS"
        : /maybe|not sure|partial/i.test(habitRaw)
          ? "PARTIAL"
          : "FAIL";

  const startHere = evidence.executiveValue.wouldStartReviewHere;
  const value: LiveVerdict =
    startHere == null
      ? "NOT_ESTABLISHED"
      : /yes/i.test(startHere)
        ? "PASS"
        : /maybe|not yet|partial/i.test(startHere)
          ? "PARTIAL"
          : "FAIL";

  // Part 10 goal is capture, not absence of concern.
  const trust: LiveVerdict =
    evidence.trust.verbatimHesitation == null
      ? "NOT_ESTABLISHED"
      : /would not act|cannot trust|refuse/i.test(
            evidence.trust.verbatimHesitation,
          )
        ? "FAIL"
        : "PASS";

  return {
    orientation: t10,
    evidenceDiscovery: t60,
    judgementComprehension: t30,
    decisionComprehension: t2,
    decisionNavigation: t2,
    optionSelection: t5,
    accountability: t5,
    execution: t5,
    returnContinuity: ret,
    technicalVisualUsefulness: visual,
    trust,
    habitPotential: habit,
    perceivedExecutiveValue: value,
  };
}

/**
 * Finalize overall verdict from completed live evidence.
 * Without live timings → NOT_ESTABLISHED or READY_WITH_P1_FIXES.
 */
export function finalizeLiveSessionVerdict(
  evidence: LiveSessionEvidence,
): LiveSessionEvidence["overallVerdict"] {
  const f69 = resolveF6906Status(evidence);
  if (f69.status === "OPEN") {
    if (evidence.status === "PROTOCOL_READY_AWAITING_PARTICIPANT") {
      return "NOT_ESTABLISHED";
    }
    return "READY_WITH_P1_FIXES";
  }

  const scorecard = buildLiveScorecardFromEvidence(evidence);
  const values = Object.values(scorecard);
  if (values.some((v) => v === "FAIL")) return "NOT_READY";
  if (values.some((v) => v === "PARTIAL" || v === "NOT_ESTABLISHED")) {
    return "READY_WITH_P1_FIXES";
  }
  return "READY_FOR_DESIGN_PARTNER_PILOT";
}

/**
 * Apply finalization helpers onto an evidence object (immutable).
 */
export function sealLiveSessionEvidence(
  evidence: LiveSessionEvidence,
): LiveSessionEvidence {
  const f6906 = resolveF6906Status(evidence);
  const scorecard = buildLiveScorecardFromEvidence(evidence);
  const overallVerdict = finalizeLiveSessionVerdict({
    ...evidence,
    f6906: { ...evidence.f6906, ...f6906 },
    scorecard,
  });
  return {
    ...evidence,
    f6906: { id: "F69-06", ...f6906 },
    scorecard,
    overallVerdict,
  };
}

/** Surfaces a live facilitator must be able to find on /today (regression aid). */
export const LIVE_REQUIRED_CC_SURFACES = [
  "What requires executive judgement today",
  "Judgement confidence",
  "Open decision",
  "data-evidence-lab",
  "data-exds-heatmap",
  "data-exds-forecast-actual",
  "data-since-last-looked",
  "Council position not yet established",
] as const;
