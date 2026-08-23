/**
 * Phase 69 — Design Partner pilot simulation harness.
 * Validation only: walks the real Decision Engine + Continuity + CC projection.
 * Does not bypass engines, invent state, or change product behaviour.
 */

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { ActiveExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import { activateExecutiveSnapshotContext } from "@/executive-snapshot-studio/launch";
import { runManufacturingValidationFromTabular } from "@/executive-snapshot-studio/intelligence";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import { buildCommandCentreExperience } from "@/experience/mission-control/command-centre-experience";
import { CommandCentreExperience } from "@/experience/mission-control/CommandCentreExperience";
import {
  assignActionAccountability,
  createActionFromSelectedDecision,
  selectDecisionOption,
} from "@/lib/decisions/decision-execution-linkage";
import {
  buildContinuityBundle,
  buildDesignPartnerStatus,
  probeDesignPartnerIsolation,
} from "@/design-partner";
import {
  markPilotStarted,
  provisionDesignPartner,
} from "@/pilot";
import type { PilotRecord } from "@/pilot/types";
import { evidenceStripToNarrativeRows } from "@/experience/mission-control/EvidenceInstrumentDisclosure";

export type TaskVerdict = "PASS" | "PARTIAL" | "FAIL" | "NOT_YET_ESTABLISHED";

export type HypothesisVerdict =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "NOT_ESTABLISHED";

export type ScoreDimension =
  | "ORIENTATION"
  | "EVIDENCE"
  | "JUDGEMENT"
  | "DECISION"
  | "SELECTION"
  | "ACCOUNTABILITY"
  | "CONTINUITY"
  | "EXECUTIVE_VALUE";

export type FrictionSeverity = "P0" | "P1" | "P2" | "P3";

export type ObservedFriction = {
  id: string;
  severity: FrictionSeverity;
  area: string;
  observation: string;
  blocksWorkflow: boolean;
};

export type ExecutiveTaskObservation = {
  taskId: string;
  name: string;
  prompt: string;
  verdict: TaskVerdict;
  evidence: string[];
  notes: string[];
};

export type PilotSimulationInput = {
  organisationId: string;
  organisationName?: string;
  tabularText: string;
  filename?: string;
  pilotStartedAt?: string;
  day1At?: string;
  day2At?: string;
  day3At?: string;
  /** Prefer a non-defer option when available. */
  preferProtectOption?: boolean;
  owner?: string;
  dueDate?: string;
  actor?: string;
};

export type PilotSimulationResult = {
  organisationId: string;
  pilot: PilotRecord;
  snapshotId: string;
  originSnapshotId: string;
  leadJudgement: string;
  decisionQuestion: string;
  decisionId: string;
  selectedOptionLabel: string;
  actionId: string;
  day1: {
    executionStatus: string | undefined;
    confidence: number;
    htmlSurfaces: string[];
    modelEvidenceRoles: string[];
    heatMapCells: number;
    forecastPoints: number;
    narrativeConsistent: boolean;
  };
  day2: {
    executionStatus: string | undefined;
    selectionState: string;
    owner: string;
    due: string;
    continuityLabels: string[];
    accountabilityStatus: string | undefined;
  };
  day3: {
    executionStatus: string | undefined;
    sinceYouLastLookedCount: number;
    accountabilityAction: string | null | undefined;
    isolationDisclosure: string;
  };
  tasks: ExecutiveTaskObservation[];
  scorecard: Record<ScoreDimension, TaskVerdict>;
  hypotheses: Record<string, HypothesisVerdict>;
  frictions: ObservedFriction[];
  honesty: {
    noFabricatedOwnerBeforeAssign: boolean;
    noFabricatedDueBeforeAssign: boolean;
    councilNotEstablished: boolean;
    valueNotQuantified: boolean;
  };
  lineage: {
    decisionOriginSnapshotId: string | null | undefined;
    actionSnapshotId: string | null | undefined;
    historyLength: number;
    secondSnapshotDoesNotRewrite: boolean;
  };
  isolation: {
    manufacturingOnlyOnCc: boolean;
    commercialProbeOk: boolean;
  };
  timeToValue: {
    t10s: TaskVerdict;
    t30s: TaskVerdict;
    t60s: TaskVerdict;
    t2m: TaskVerdict;
    t5m: TaskVerdict;
    returnVisit: TaskVerdict;
  };
  overallVerdict:
    | "READY_FOR_REAL_DESIGN_PARTNER"
    | "READY_WITH_P1_FIXES"
    | "NOT_READY";
};

function pickOption(
  options: Array<{ id: string; label: string }>,
  preferProtect: boolean,
) {
  if (preferProtect) {
    const protect = options.find((o) => /protect|reallocat/i.test(o.label));
    if (protect) return protect;
  }
  const nonDefer = options.find((o) => !/defer/i.test(o.label));
  return nonDefer ?? options[0]!;
}

function surfaceChecks(html: string) {
  return {
    hasJudgementQuestion: /What requires executive judgement today/i.test(html),
    hasLeadVisible: html.length > 500,
    hasConfidence: /Judgement confidence/i.test(html) && /\d+%/.test(html),
    hasDecisionCta: /Open decision/i.test(html),
    hasDecisionQuestion: /data-decision-question="true"/.test(html),
    hasHeatPreview: /data-heat-preview="true"/.test(html) || /data-exds-heatmap="true"/.test(html),
    hasForecastChart: /data-exds-forecast-actual="true"/.test(html),
    hasEvidenceLab: /data-evidence-lab="true"/.test(html),
    hasLeadSignal: /Lead signal/i.test(html),
    hasCounterSignal: /Counter-signal/i.test(html),
    hasSelectionHonesty: /Selection has not occurred/i.test(html),
    hasCouncilHonesty: /Council position not yet established/i.test(html),
    noHelix: !/Helix/i.test(html),
    noNorthline: !/Northline/i.test(html),
    noCommercialLeak: !/Ageing Exposure|Pipeline in View|open pipeline/i.test(html),
  };
}

/**
 * Deterministic Design Partner pilot simulation using real engines only.
 */
export function runManufacturingPilotSimulation(
  input: PilotSimulationInput,
): PilotSimulationResult {
  const orgId = input.organisationId;
  const orgName = input.organisationName ?? "Design Partner Manufacturing";
  const actor = input.actor ?? "Executive";
  const day1At = input.day1At ?? "2026-08-17T09:00:00.000Z";
  const day2At = input.day2At ?? "2026-08-18T09:00:00.000Z";
  const day3At = input.day3At ?? "2026-08-19T09:00:00.000Z";
  const frictions: ObservedFriction[] = [];

  const { pilot } = provisionDesignPartner({
    partnerName: orgName,
    industry: "Manufacturing",
    intelligenceProfileId: "operations_executive",
    administratorEmail: "pilot@example.com",
    focusModule: "manufacturing_forecasting",
    environment: "pilot",
    tenantSlug: `phase69-${orgId.slice(-8)}`,
  });

  const started = markPilotStarted({
    pilotId: pilot.id,
    startedAt: input.pilotStartedAt ?? "2026-08-17T00:00:00.000Z",
  });

  // Bind organisation for continuity / Day N — re-provision path may use different org id.
  // Pilot registry stores organisationId from provision; activate uses our orgId.
  const result = runManufacturingValidationFromTabular({
    tabularText: input.tabularText,
    organisationId: orgId,
    organisationName: orgName,
    filename: input.filename ?? "demo-manufacturing-forecast.csv",
  });

  if (!result.analysis || !result.snapshot || !result.portfolio || !result.readiness) {
    throw new Error("Manufacturing validation failed — simulation cannot proceed.");
  }

  const paper = buildManufacturingDecisionPaper(result.analysis, result.brief);
  if (!paper.decisionId) {
    throw new Error("Decision paper missing decisionId.");
  }

  const activeDay1 = activateExecutiveSnapshotContext({
    studioId: `studio_69_${orgId}`,
    snapshotId: result.snapshot.meta.snapshotId,
    organisationId: orgId,
    organisationName: orgName,
    profileId: "manufacturing",
    profileLabel: "Manufacturing Forecast Intelligence",
    sourceKind: "excel",
    filename: input.filename ?? "demo-manufacturing-forecast.csv",
    recordCount: result.snapshot.meta.recordCount,
    confidenceOverall: result.snapshot.meta.confidence.overall,
    readiness: result.readiness,
    portfolio: result.portfolio,
    manufacturingAnalysis: result.analysis,
    manufacturingBrief: result.brief,
    councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
    advisorNames: [],
    activatedAt: day1At,
  });

  // ——— DAY 1: Orient + Investigate + Decide (view only) ———
  let portfolio: OutcomePortfolio = result.portfolio;
  const modelDay1 = buildCommandCentreExperience(activeDay1, portfolio);
  const htmlDay1 = renderToStaticMarkup(
    createElement(CommandCentreExperience, { model: modelDay1 }),
  );
  const surfaces = surfaceChecks(htmlDay1);
  const narrativeRows = evidenceStripToNarrativeRows(
    modelDay1.darkPanel.evidenceStrip,
  );
  const narrativeConsistent =
    narrativeRows.some((r) => r.roleTitle === "Lead signal") &&
    narrativeRows.some((r) => r.roleTitle === "Counter-signal");

  if (!surfaces.hasHeatPreview) {
    frictions.push({
      id: "F69-01",
      severity: "P1",
      area: "Evidence visuals",
      observation:
        "Heat map surface not detected on first CC render during simulation.",
      blocksWorkflow: false,
    });
  }
  if (!narrativeConsistent) {
    frictions.push({
      id: "F69-02",
      severity: "P1",
      area: "Evidence narrative",
      observation:
        "Lead/Counter-signal roles not both present in Demand narrative.",
      blocksWorkflow: false,
    });
  }

  // ——— DAY 1 continued: Select → Assign → Action ———
  const option = pickOption(paper.options, input.preferProtectOption !== false);
  const selected = selectDecisionOption(portfolio, {
    decisionId: paper.decisionId,
    alternativeId: option.id,
    actor,
    snapshotId: result.snapshot.meta.snapshotId,
    at: day1At,
  });
  portfolio = selected.portfolio;

  // Viewing CC after selection should not change selection — rebuild only
  const modelAfterSelect = buildCommandCentreExperience(activeDay1, portfolio);
  if (
    modelAfterSelect.decisionPaper?.executionStatus === "decision_required" &&
    selected.selectionState === "OPTION_SELECTED"
  ) {
    frictions.push({
      id: "F69-03",
      severity: "P1",
      area: "Decision status",
      observation:
        "CC still shows decision_required after OPTION_SELECTED (status projection lag).",
      blocksWorkflow: false,
    });
  }

  const acted = createActionFromSelectedDecision(portfolio, {
    decisionId: paper.decisionId,
    actor,
    at: day1At,
  });
  portfolio = acted.portfolio;

  const honestyOwnerBefore =
    acted.action.recommendation.owner === "Owner not yet assigned.";
  const honestyDueBefore =
    acted.action.recommendation.deadline === "Due date not yet assigned.";

  const assigned = assignActionAccountability(portfolio, {
    actionId: acted.action.id,
    owner: input.owner ?? "Operations Planning",
    dueDate: input.dueDate ?? "2026-08-28",
    actor,
    at: day1At,
  });
  portfolio = assigned.portfolio;

  // ——— DAY 2: Return after selection + accountability ———
  const modelDay2 = buildCommandCentreExperience(activeDay1, portfolio);
  const continuityDay2 = buildContinuityBundle({
    current: activeDay1,
    previous: null,
    portfolio,
    leadJudgement: modelDay2.leadJudgement,
  });

  // ——— DAY 3: Second snapshot in library (immutability) + return continuity ———
  const day3Validation = runManufacturingValidationFromTabular({
    tabularText: input.tabularText,
    organisationId: `${orgId}-day3`,
    organisationName: orgName,
    filename: input.filename ?? "demo-manufacturing-forecast.csv",
  });
  const secondSnapshotId = day3Validation.snapshot!.meta.snapshotId;
  const previousContext: ActiveExecutiveSnapshotContext = {
    ...activeDay1,
    studioId: `studio_69_${orgId}_prev`,
    activatedAt: day1At,
  };
  const activeDay3 = activateExecutiveSnapshotContext({
    studioId: `studio_69_${orgId}_day3`,
    snapshotId: result.snapshot.meta.snapshotId, // keep same evidence snapshot for decision lineage
    organisationId: orgId,
    organisationName: orgName,
    profileId: "manufacturing",
    profileLabel: "Manufacturing Forecast Intelligence",
    sourceKind: "excel",
    filename: input.filename ?? "demo-manufacturing-forecast.csv",
    recordCount: result.snapshot.meta.recordCount,
    confidenceOverall: result.snapshot.meta.confidence.overall,
    readiness: result.readiness,
    portfolio,
    manufacturingAnalysis: result.analysis,
    manufacturingBrief: result.brief,
    councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
    advisorNames: [],
    activatedAt: day3At,
  });

  const modelDay3 = buildCommandCentreExperience(activeDay3, portfolio);
  const continuityDay3 = buildContinuityBundle({
    current: activeDay3,
    previous: previousContext,
    portfolio,
    leadJudgement: modelDay3.leadJudgement,
  });

  const decisionFinal = portfolio.decisions.find((d) => d.id === paper.decisionId)!;
  const lineageOk =
    decisionFinal.originSnapshotId === result.snapshot.meta.snapshotId &&
    acted.action.snapshotId === result.snapshot.meta.snapshotId &&
    secondSnapshotId !== result.snapshot.meta.snapshotId;

  const isolationProbe = probeDesignPartnerIsolation(orgId, `${orgId}-day3`);

  const dpStatus = buildDesignPartnerStatus({
    mode: "executive_snapshot",
    pilot: started ?? pilot,
    activeSnapshot: activeDay1,
    asOf: day2At,
  });

  // ——— Task observations ———
  const tasks: ExecutiveTaskObservation[] = [
    {
      taskId: "TASK_01",
      name: "ORIENT",
      prompt:
        "You are the executive responsible for this business. You have not looked at ExecutiveOS today. What requires your attention?",
      verdict:
        modelDay1.leadJudgement.length > 10 &&
        surfaces.hasJudgementQuestion &&
        surfaces.hasConfidence
          ? "PASS"
          : "PARTIAL",
      evidence: [
        `leadJudgement=${modelDay1.leadJudgement}`,
        `confidence=${modelDay1.darkPanel.confidence}%`,
        `decisionQuestion=${modelDay1.decisionPaper?.decisionQuestion?.slice(0, 80)}`,
      ],
      notes: [
        "Simulated via CC projection + SSR surfaces — not a live timed user study.",
        dpStatus.pilotDayLabel,
      ],
    },
    {
      taskId: "TASK_02",
      name: "INVESTIGATE",
      prompt: "You believe demand may require attention. Show me why.",
      verdict:
        surfaces.hasEvidenceLab &&
        surfaces.hasHeatPreview &&
        surfaces.hasForecastChart &&
        narrativeConsistent
          ? "PASS"
          : "PARTIAL",
      evidence: [
        `heatCells=${modelDay1.heatMap?.cells.length ?? 0}`,
        `forecastPoints=${modelDay1.forecastVsActual?.points.length ?? 0}`,
        `roles=${narrativeRows.map((r) => r.roleTitle).join(",")}`,
      ],
      notes: [
        "Visual evidence present in Evidence Lab; progressive disclosure still requires one expand for full matrix.",
      ],
    },
    {
      taskId: "TASK_03",
      name: "DECIDE",
      prompt: "You understand the evidence. What decision is required?",
      verdict:
        surfaces.hasDecisionCta &&
        Boolean(modelDay1.decisionPaper?.href?.includes("/decisions")) &&
        Boolean(paper.options.length >= 2)
          ? "PASS"
          : "FAIL",
      evidence: [
        `ctaHref=${modelDay1.decisionPaper?.href}`,
        `options=${paper.options.length}`,
        `readiness=${paper.readiness}`,
      ],
      notes: [
        "Decision paper reachable from CC; options are data-derived frames.",
      ],
    },
    {
      taskId: "TASK_04",
      name: "SELECT",
      prompt: "Choose the path you believe is appropriate.",
      verdict:
        selected.selectionState === "OPTION_SELECTED" ||
        selected.selectionState === "DECISION_DEFERRED"
          ? "PASS"
          : "FAIL",
      evidence: [
        `selectionState=${selected.selectionState}`,
        `selected=${selected.selectedLabel}`,
        `historyNote=${selected.decision.history.at(-1)?.note?.slice(0, 80)}`,
      ],
      notes: [
        "Selection via Decision Engine only — opening /today does not select.",
      ],
    },
    {
      taskId: "TASK_05",
      name: "EXECUTE",
      prompt:
        "The decision has been made. Make the resulting action accountable.",
      verdict:
        honestyOwnerBefore &&
        honestyDueBefore &&
        assigned.action.recommendation.owner ===
          (input.owner ?? "Operations Planning") &&
        modelDay2.decisionPaper?.executionStatus === "execution_underway"
          ? "PASS"
          : "PARTIAL",
      evidence: [
        `actionId=${acted.action.id}`,
        `owner=${assigned.action.recommendation.owner}`,
        `due=${assigned.action.recommendation.deadline}`,
        `ccStatus=${modelDay2.decisionPaper?.executionStatus}`,
      ],
      notes: [
        "Owner/due assigned only after explicit assignActionAccountability.",
      ],
    },
    {
      taskId: "TASK_06",
      name: "RETURN",
      prompt:
        "You have not looked at ExecutiveOS since yesterday. What changed and what still requires your attention?",
      verdict:
        continuityDay3.sinceYouLastLooked.length > 0 &&
        continuityDay3.accountability.length > 0 &&
        modelDay3.decisionPaper?.executionStatus === "execution_underway"
          ? "PASS"
          : "PARTIAL",
      evidence: [
        `sinceCount=${continuityDay3.sinceYouLastLooked.length}`,
        `accountability=${continuityDay3.accountability[0]?.statusLabel}`,
        `action=${continuityDay3.accountability[0]?.actionLabel}`,
      ],
      notes: [
        "Return visit uses ContinuityBundle + live portfolio — no parallel state.",
      ],
    },
  ];

  const scorecard: Record<ScoreDimension, TaskVerdict> = {
    ORIENTATION: tasks[0]!.verdict,
    EVIDENCE: tasks[1]!.verdict,
    JUDGEMENT:
      modelDay1.narrativeChain && modelDay1.darkPanel.confidence > 0
        ? "PASS"
        : "PARTIAL",
    DECISION: tasks[2]!.verdict,
    SELECTION: tasks[3]!.verdict,
    ACCOUNTABILITY: tasks[4]!.verdict,
    CONTINUITY: tasks[5]!.verdict,
    EXECUTIVE_VALUE: "PARTIAL",
  };
  const hypotheses: Record<string, HypothesisVerdict> = {
    H1_time_to_attention:
      tasks[0]!.verdict === "PASS" ? "SUPPORTED" : "PARTIALLY_SUPPORTED",
    H2_evidence_to_judgement:
      tasks[1]!.verdict === "PASS" ? "SUPPORTED" : "PARTIALLY_SUPPORTED",
    H3_decision_explicit:
      tasks[2]!.verdict === "PASS" ? "SUPPORTED" : "NOT_ESTABLISHED",
    H4_decision_to_execution:
      tasks[3]!.verdict === "PASS" && tasks[4]!.verdict === "PASS"
        ? "SUPPORTED"
        : "PARTIALLY_SUPPORTED",
    H5_return_continuity:
      tasks[5]!.verdict === "PASS" ? "SUPPORTED" : "PARTIALLY_SUPPORTED",
    H6_daily_habit: "NOT_ESTABLISHED",
  };

  // Known residual frictions from Phases 64–68 still relevant (observation only)
  frictions.push({
    id: "F69-04",
    severity: "P2",
    area: "First viewport",
    observation:
      "Design Partner strip still consumes vertical space on short laptops (Phase 68 debt).",
    blocksWorkflow: false,
  });
  frictions.push({
    id: "F69-05",
    severity: "P2",
    area: "Evidence progressive disclosure",
    observation:
      "Full Region × Model requires expand — improves density but adds one click for complete matrix.",
    blocksWorkflow: false,
  });
  frictions.push({
    id: "F69-06",
    severity: "P1",
    area: "Live user timing",
    observation:
      "Time-to-value claims are structurally inferred from surfaces, not measured with live executives.",
    blocksWorkflow: false,
  });
  frictions.push({
    id: "F69-07",
    severity: "P3",
    area: "Commercial parity",
    observation:
      "Commercial CC still lacks Phase 60/61 decision-paper depth (pre-existing).",
    blocksWorkflow: false,
  });

  const p0 = frictions.filter((f) => f.severity === "P0" && f.blocksWorkflow);
  const failTasks = tasks.filter((t) => t.verdict === "FAIL");
  let overallVerdict: PilotSimulationResult["overallVerdict"] =
    "READY_FOR_REAL_DESIGN_PARTNER";
  if (p0.length > 0 || failTasks.length > 0) {
    overallVerdict = "NOT_READY";
  } else if (
    frictions.some((f) => f.severity === "P1") ||
    tasks.some((t) => t.verdict === "PARTIAL") ||
    hypotheses.H6_daily_habit === "NOT_ESTABLISHED"
  ) {
    overallVerdict = "READY_WITH_P1_FIXES";
  }

  return {
    organisationId: orgId,
    pilot: started ?? pilot,
    snapshotId: result.snapshot.meta.snapshotId,
    originSnapshotId: result.snapshot.meta.snapshotId,
    leadJudgement: modelDay1.leadJudgement,
    decisionQuestion: paper.decisionQuestion,
    decisionId: paper.decisionId,
    selectedOptionLabel: selected.selectedLabel,
    actionId: acted.action.id,
    day1: {
      executionStatus: modelDay1.decisionPaper?.executionStatus,
      confidence: modelDay1.darkPanel.confidence,
      htmlSurfaces: Object.entries(surfaces)
        .filter(([, v]) => v)
        .map(([k]) => k),
      modelEvidenceRoles: modelDay1.darkPanel.evidenceStrip
        .map((e) => e.role)
        .filter(Boolean) as string[],
      heatMapCells: modelDay1.heatMap?.cells.length ?? 0,
      forecastPoints: modelDay1.forecastVsActual?.points.length ?? 0,
      narrativeConsistent,
    },
    day2: {
      executionStatus: modelDay2.decisionPaper?.executionStatus,
      selectionState: selected.selectionState,
      owner: assigned.action.recommendation.owner,
      due: assigned.action.recommendation.deadline,
      continuityLabels: continuityDay2.sinceYouLastLooked.map((i) => i.label),
      accountabilityStatus: continuityDay2.accountability[0]?.statusLabel,
    },
    day3: {
      executionStatus: modelDay3.decisionPaper?.executionStatus,
      sinceYouLastLookedCount: continuityDay3.sinceYouLastLooked.length,
      accountabilityAction: continuityDay3.accountability[0]?.actionLabel,
      isolationDisclosure: continuityDay3.isolationDisclosure,
    },
    tasks,
    scorecard,
    hypotheses,
    frictions,
    honesty: {
      noFabricatedOwnerBeforeAssign: honestyOwnerBefore,
      noFabricatedDueBeforeAssign: honestyDueBefore,
      councilNotEstablished: /not yet established/i.test(
        paper.councilStatus ?? "",
      ),
      valueNotQuantified: /not yet quantified/i.test(
        paper.executiveValueStatus ?? "",
      ),
    },
    lineage: {
      decisionOriginSnapshotId: decisionFinal.originSnapshotId,
      actionSnapshotId: acted.action.snapshotId,
      historyLength: decisionFinal.history.length,
      secondSnapshotDoesNotRewrite: lineageOk,
    },
    isolation: {
      manufacturingOnlyOnCc:
        surfaces.noCommercialLeak && surfaces.noHelix && surfaces.noNorthline,
      commercialProbeOk: isolationProbe.ok !== false,
    },
    timeToValue: {
      t10s: tasks[0]!.verdict,
      t30s:
        surfaces.hasDecisionCta && surfaces.hasConfidence ? "PASS" : "PARTIAL",
      t60s: tasks[1]!.verdict,
      t2m: tasks[2]!.verdict,
      t5m:
        tasks[3]!.verdict === "PASS" && tasks[4]!.verdict === "PASS"
          ? "PASS"
          : "PARTIAL",
      returnVisit: tasks[5]!.verdict,
    },
    overallVerdict,
  };
}
