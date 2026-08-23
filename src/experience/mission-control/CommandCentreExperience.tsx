"use client";

import Link from "next/link";
import {
  ConfidenceBand,
  DistributionBar,
  ExecutiveContextRail,
  ExecutiveDecisionStatement,
  ExecutiveEvidenceSurface,
  ExecutiveForecastActualChart,
  ExecutiveHeatMap,
  ExecutiveHero,
  ExecutiveJudgementPanel,
  ExecutiveOvernightChanges,
  EXDS_TONE_VAR,
} from "@/design-system/executive-experience";
import type { CommandCentreExperienceModel } from "@/experience/mission-control/command-centre-experience";
import type { JudgementItem } from "@/experience/intelligence-engine/types";
import type { IntelligenceStreamEvent } from "@/experience/intelligence-engine/types";
import {
  AccountabilitySurface,
  DesignPartnerExpansionSignals,
  DesignPartnerFeedbackCapture,
  DesignPartnerStatusStrip,
  SinceYouLastLooked,
} from "@/experience/design-partner";
import { EvidenceLab } from "@/experience/mission-control/EvidenceLab";
import {
  EvidenceInstrumentDisclosure,
  evidenceStripToNarrativeRows,
  heatCellsToSummaryRows,
} from "@/experience/mission-control/EvidenceInstrumentDisclosure";
import { CouncilProgressive } from "@/experience/mission-control/CouncilProgressive";

type Props = {
  model: CommandCentreExperienceModel;
};

/**
 * Phase 68 — Signature Experience: Brief → Investigate → Decide → Execute.
 * Experience composition only — intelligence / integrity / engines unchanged.
 */
export function CommandCentreExperience({ model }: Props) {
  const isManufacturing = model.experienceModule === "manufacturing_forecasting";
  const nextStep = model.metrics.find((m) => m.id === "next-step-evidence");
  const pastClose = model.metrics.find((m) => m.id === "past-close-exposure");
  const heroMetrics = model.evidenceMetrics.slice(0, 4).map((m) => ({
    id: m.id,
    label: m.label,
    value: m.value,
    tone: m.tone,
    caption: m.caption,
    detail: m.detail,
  }));
  const decisionHref =
    model.decisionPaper?.href ?? model.darkPanel.actionHref ?? "/today";
  const executionStatus = model.decisionPaper?.executionStatus ?? null;
  const isDecisionRequired =
    !executionStatus || executionStatus === "decision_required";
  const isExecutionPromoted =
    executionStatus === "execution_underway" ||
    executionStatus === "decision_selected" ||
    executionStatus === "decision_approved";
  const primaryAccount = model.continuity?.accountability[0];
  const decisionCtaLabel = (() => {
    if (!isManufacturing) return "Open judgement →";
    if (executionStatus === "execution_underway") return "View follow-through →";
    if (executionStatus === "decision_selected") return "Create / view follow-through →";
    if (executionStatus === "decision_required" || !executionStatus) {
      return "Open decision →";
    }
    return `${model.decisionPaper?.executionStatusLabel ?? "Open decision"} →`;
  })();

  const demandNarrativeRows =
    model.darkPanel.evidenceStrip.length > 0
      ? evidenceStripToNarrativeRows(model.darkPanel.evidenceStrip)
      : model.heatMap
        ? heatCellsToSummaryRows(model.heatMap.cells)
        : [];

  const heatPreviewCells = model.heatMap
    ? (() => {
        const meaningful = model.heatMap.cells.filter((c) => c.value > 0);
        const preview =
          meaningful.length >= 4
            ? meaningful.slice(0, 8)
            : model.heatMap.cells.slice(0, 8);
        return preview;
      })()
    : [];

  const briefIndex = [
    {
      id: "changed",
      index: "01",
      label: "What changed",
      value: model.leadJudgement.slice(0, 48),
    },
    {
      id: "matters",
      index: "02",
      label: "Why it matters",
      value: (
        model.narrativeChain?.operationalImplication ??
        model.leadSupport ??
        model.darkPanel.support
      ).slice(0, 48),
    },
    {
      id: "decision",
      index: "03",
      label: "Decision",
      value: (
        model.decisionPaper?.executionStatusLabel ??
        (isManufacturing ? "Decision required" : "Judgement")
      ).slice(0, 48),
    },
    {
      id: "evidence",
      index: "04",
      label: "Evidence",
      value: isManufacturing
        ? "Demand · Forecast · Capacity"
        : "Exposure · Ageing · Evidence",
    },
  ];

  const demandInstrument = model.heatMap ? (
    <ExecutiveEvidenceSurface
      index={1}
      label={model.heatMap.title}
      question={
        isManufacturing
          ? "Where is demand diverging?"
          : model.heatMap.question
      }
      className="cc-instrument-heat"
      meta={
        <span className="eos-type-caption tabular-nums">
          {isManufacturing ? "6-period window" : "Evidence"}{" "}
          <span style={{ color: EXDS_TONE_VAR.intelligence }}>
            {isManufacturing ? "instrument" : `${model.heatMap.confidence}%`}
          </span>
        </span>
      }
    >
      <EvidenceInstrumentDisclosure
        summaryTitle={
          isManufacturing ? "Evidence hierarchy" : "Top exposure signals"
        }
        expandLabel={
          isManufacturing
            ? "View full Region × Model →"
            : "View full exposure map →"
        }
        summaryRows={demandNarrativeRows}
        keepSummaryWhenExpanded
        preview={
          <div data-heat-preview="true" className="cc-heat-preview">
            <p
              className="exds-editorial-label mb-2"
              style={{ color: "var(--exds-intelligence)" }}
            >
              Region × Model — technical preview
            </p>
            <ExecutiveHeatMap
              title={model.heatMap.title}
              question={model.heatMap.question}
              cells={heatPreviewCells}
              columns={Math.min(4, model.heatMap.columns) as 2 | 3 | 4}
              confidence={model.heatMap.confidence}
              bare
              showLegend
              className="border-0 bg-transparent p-0"
            />
          </div>
        }
      >
        <ExecutiveHeatMap
          title={model.heatMap.title}
          question={model.heatMap.question}
          cells={model.heatMap.cells}
          columns={model.heatMap.columns}
          confidence={model.heatMap.confidence}
          bare
          showLegend
          className="border-0 bg-transparent p-0"
        />
      </EvidenceInstrumentDisclosure>
    </ExecutiveEvidenceSurface>
  ) : (
    <EmptyEvidence label="Exposure heat map not yet established from this source" />
  );

  const forecastInstrument = isManufacturing && model.forecastVsActual ? (
    <ExecutiveEvidenceSurface
      index={2}
      label="Forecast vs Actual"
      question="Is demand tracking the forecast?"
    >
      <div data-forecast-visual="true">
        <ExecutiveForecastActualChart
          points={model.forecastVsActual.points.slice(-6)}
          question="Is demand tracking the forecast?"
        />
      </div>
    </ExecutiveEvidenceSurface>
  ) : model.ageing ? (
    <ExecutiveEvidenceSurface
      index={2}
      label="Ageing"
      question={model.ageing.question}
    >
      <EvidenceInstrumentDisclosure
        summaryTitle="Ageing signals"
        expandLabel="View detail →"
        summaryRows={[
          {
            id: "avg",
            label: "Average open stage duration",
            value: model.ageing.averageLabel ?? "—",
            tone: "watching",
          },
          {
            id: "beyond",
            label: "Beyond threshold",
            value:
              model.ageing.beyondCount != null
                ? String(model.ageing.beyondCount)
                : "—",
            tone: "attention",
          },
        ]}
      >
        <div
          className="space-y-6"
          data-ageing-distribution="true"
          aria-label={model.ageing.question}
        >
          <DistributionBar
            label={model.ageing.thresholdLabel}
            segments={model.ageing.segments}
            variant="stacked"
          />
          <div className="grid grid-cols-2 gap-4 border-t border-[rgba(47,122,229,0.16)] pt-4">
            {model.ageing.averageLabel ? (
              <div>
                <p
                  className="tabular-nums text-[length:1.5rem] font-semibold tracking-tight"
                  style={{ color: EXDS_TONE_VAR.watching }}
                >
                  {model.ageing.averageLabel}
                </p>
                <p className="eos-type-caption mt-1">Average open stage duration</p>
              </div>
            ) : null}
            {model.ageing.beyondCount != null ? (
              <div>
                <p
                  className="tabular-nums text-[length:1.5rem] font-semibold tracking-tight"
                  style={{ color: EXDS_TONE_VAR.attention }}
                >
                  {model.ageing.beyondCount}
                </p>
                <p className="eos-type-caption mt-1">Beyond threshold</p>
              </div>
            ) : null}
          </div>
          <ConfidenceBand value={model.ageing.confidence} tone="watching" />
        </div>
      </EvidenceInstrumentDisclosure>
    </ExecutiveEvidenceSurface>
  ) : (
    <EmptyEvidence label="Secondary evidence instrument not available from this source" />
  );

  const confidenceInstrument =
    isManufacturing &&
    model.confidenceBoard &&
    model.confidenceBoard.length > 0 ? (
      <ExecutiveEvidenceSurface
        index={3}
        label="Forecast Confidence"
        question="Where is the forecast trustworthy?"
      >
        <EvidenceInstrumentDisclosure
          summaryTitle="Confidence slices"
          expandLabel="View detail →"
          summaryRows={model.confidenceBoard.slice(0, 3).map((slice) => ({
            id: slice.id,
            label: slice.scope,
            value:
              slice.score != null
                ? `${slice.level} · ${slice.score}%`
                : slice.level,
            tone:
              slice.level === "high"
                ? "improving"
                : slice.level === "medium"
                  ? "watching"
                  : "attention",
          }))}
        >
          <ul className="space-y-3" data-forecast-confidence="true">
            {model.confidenceBoard.slice(0, 5).map((slice) => (
              <li
                key={slice.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[rgba(47,122,229,0.14)] pb-3 last:border-0"
              >
                <div>
                  <p className="text-[length:0.9rem] font-semibold tracking-tight">
                    {slice.scope}
                  </p>
                  <p className="eos-type-caption mt-1">
                    {slice.why[0] ?? "Insufficient evidence"}
                  </p>
                </div>
                <p
                  className="tabular-nums text-[length:0.85rem] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    color:
                      slice.level === "high"
                        ? EXDS_TONE_VAR.improving
                        : slice.level === "medium"
                          ? EXDS_TONE_VAR.watching
                          : EXDS_TONE_VAR.attention,
                  }}
                >
                  {slice.level}
                  {slice.score != null ? ` · ${slice.score}%` : ""}
                </p>
              </li>
            ))}
          </ul>
        </EvidenceInstrumentDisclosure>
      </ExecutiveEvidenceSurface>
    ) : nextStep ? (
      <ExecutiveEvidenceSurface
        index={3}
        label={nextStep.title}
        question={nextStep.meaning}
      >
        <p
          className="tabular-nums text-[length:2.25rem] font-semibold tracking-tight"
          style={{ color: EXDS_TONE_VAR[nextStep.tone] }}
        >
          {nextStep.value}
        </p>
        <p className="eos-type-caption mt-2">{nextStep.trendLabel}</p>
        <div className="mt-6">
          <ConfidenceBand value={nextStep.confidence} tone="watching" />
        </div>
      </ExecutiveEvidenceSurface>
    ) : null;

  const capacityInstrument =
    isManufacturing &&
    ((model.capacityBoard && model.capacityBoard.length > 0) ||
      (model.inventoryBoard && model.inventoryBoard.length > 0)) ? (
      <ExecutiveEvidenceSurface
        index={4}
        label="Capacity & Inventory"
        question="Where is capacity or inventory at risk?"
      >
        <EvidenceInstrumentDisclosure
          summaryTitle="Capacity & inventory"
          expandLabel="View detail →"
          summaryRows={[
            ...(model.capacityBoard?.slice(0, 2).map((c) => ({
              id: c.id,
              label: c.factory,
              value: c.loadPct != null ? `${c.loadPct}%` : "—",
              tone: c.tone,
            })) ?? []),
            ...(model.inventoryBoard?.slice(0, 2).map((i) => ({
              id: i.id,
              label: i.variant,
              value: i.inventoryDays != null ? `${i.inventoryDays}d` : "—",
              tone: i.tone,
            })) ?? []),
          ]}
        >
          <div className="space-y-5" data-capacity-inventory="true">
            {model.capacityBoard?.slice(0, 3).map((c) => {
              const multiple =
                c.loadPct != null ? (c.loadPct / 100).toFixed(2) : null;
              return (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="exds-editorial-label">{c.factory}</p>
                    <p
                      className="tabular-nums text-[length:1.25rem] font-semibold"
                      style={{ color: EXDS_TONE_VAR[c.tone] }}
                    >
                      {c.loadPct != null ? `${c.loadPct}%` : "—"}
                    </p>
                  </div>
                  <p className="eos-type-caption mt-1">
                    {c.loadPct != null &&
                    c.capacity != null &&
                    c.demonstratedDemand != null
                      ? `of plant capacity · ${c.demonstratedDemand} units demand vs ${c.capacity} capacity (${multiple}×)`
                      : "Demonstrated load of plant capacity"}
                    {c.availableSlots != null
                      ? ` · ${c.availableSlots} slots available`
                      : ""}
                  </p>
                </div>
              );
            })}
            {model.inventoryBoard?.slice(0, 2).map((i) => (
              <div key={i.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[length:0.9rem] font-semibold">{i.variant}</p>
                  <p
                    className="tabular-nums font-semibold"
                    style={{ color: EXDS_TONE_VAR[i.tone] }}
                  >
                    {i.inventoryDays != null ? `${i.inventoryDays}d` : "—"}
                  </p>
                </div>
                <p className="eos-type-caption mt-1">
                  {i.model}
                  {i.finishedGoods != null ? ` · FG ${i.finishedGoods}` : ""}
                </p>
              </div>
            ))}
          </div>
        </EvidenceInstrumentDisclosure>
      </ExecutiveEvidenceSurface>
    ) : pastClose ? (
      <ExecutiveEvidenceSurface
        index={4}
        label={pastClose.title}
        question={pastClose.meaning}
      >
        <p
          className="tabular-nums text-[length:2.25rem] font-semibold tracking-tight"
          style={{ color: EXDS_TONE_VAR[pastClose.tone] }}
        >
          {pastClose.value}
        </p>
        <p className="eos-type-caption mt-2">{pastClose.trendLabel}</p>
        <div className="mt-6">
          <ConfidenceBand value={pastClose.confidence} tone="attention" />
        </div>
      </ExecutiveEvidenceSurface>
    ) : null;

  const evidenceTabs = isManufacturing
    ? [
        {
          id: "demand",
          index: "01",
          label: "Demand",
          question: "Where is demand diverging?",
          content: demandInstrument,
        },
        {
          id: "forecast",
          index: "02",
          label: "Forecast",
          question: "Is demand tracking the forecast?",
          content: forecastInstrument,
        },
        ...(confidenceInstrument
          ? [
              {
                id: "confidence",
                index: "03",
                label: "Confidence",
                question: "Where is the forecast trustworthy?",
                content: confidenceInstrument,
              },
            ]
          : []),
        ...(capacityInstrument
          ? [
              {
                id: "capacity",
                index: "04",
                label: "Capacity",
                question: "Where is capacity or inventory at risk?",
                content: capacityInstrument,
              },
            ]
          : []),
      ]
    : [
        {
          id: "exposure",
          index: "01",
          label: "Exposure",
          question: "Where is commercial exposure concentrated?",
          content: demandInstrument,
        },
        {
          id: "ageing",
          index: "02",
          label: "Ageing",
          question: "Where is the pipeline ageing?",
          content: forecastInstrument,
        },
        ...(confidenceInstrument
          ? [
              {
                id: "next-step",
                index: "03",
                label: "Next step",
                question: nextStep?.meaning ?? "Next-step evidence",
                content: confidenceInstrument,
              },
            ]
          : []),
        ...(capacityInstrument
          ? [
              {
                id: "past-close",
                index: "04",
                label: "Past close",
                question: pastClose?.meaning ?? "Past-close exposure",
                content: capacityInstrument,
              },
            ]
          : []),
      ];

  return (
    <div
      className="mc-root"
      data-mission-control="true"
      data-exs="1.0"
      data-intelligence="1.0"
      data-exds="1.0"
      data-snapshot-context="executive_snapshot"
      data-snapshot-id={model.snapshotId}
      data-loop="idle"
      data-context-integrity="snapshot"
      data-command-centre-experience="phase-68"
      data-experience-module={model.experienceModule ?? "generic"}
      data-narrative-hierarchy={isManufacturing ? "phase-59b" : undefined}
      data-visual-dna="executive"
      data-visual-refinement="visual-intelligence"
      data-cc-hierarchy="brief-investigate-decide-execute"
      data-cc-compression="phase-67"
      data-cc-signature="phase-68"
      data-design-partner={model.designPartner ? "true" : undefined}
      aria-label="Executive Command Centre"
    >
      <div className="cc-shell">
        <div className="cc-rail">
          <ExecutiveContextRail
            domainLabel={model.profileLabel}
            talkTrack={model.talkTrack.slice(0, 3)}
            walkItems={model.walkItems.slice(0, 4).map((w) => ({
              ...w,
              detail: "",
            }))}
            briefIndex={briefIndex}
          />
        </div>

        <div className="cc-main">
          {/* ========== LAYER 1 — EXECUTIVE BRIEF ========== */}
          <section
            className="cc-section cc-layer-brief cc-first-viewport"
            aria-label="Executive brief"
            data-cc-layer="brief"
            data-cc-level="brief"
          >
            {model.designPartner ? (
              <div className="cc-dp-slim" data-design-partner-slim="true">
                <DesignPartnerStatusStrip status={model.designPartner} />
                <p className="eos-type-caption mt-1">
                  {model.designPartner.isolationDisclosure}
                </p>
              </div>
            ) : (
              <p
                className="exds-editorial-label mb-2"
                style={{ color: "var(--exds-intelligence)" }}
              >
                {model.experienceKicker ?? model.profileLabel}
              </p>
            )}

            <div className="cc-hero-narrative">
              <ExecutiveHero
                compact
                kicker={model.experienceKicker ?? "Command Centre"}
                eyebrow="Executive Brief"
                question="What requires executive judgement today?"
                judgement={model.leadJudgement}
                metrics={heroMetrics}
                confidence={model.darkPanel.confidence}
                confidenceLabel={
                  model.darkPanel.confidenceLabel ?? "Judgement confidence"
                }
                meta={undefined}
              >
                {(model.decisionPaper?.decisionQuestion ||
                  model.darkPanel.requiresJudgement) && (
                  <div className="cc-brief-decision" data-decision-question="true">
                    <p
                      className="exds-editorial-label"
                      style={{ color: "var(--exds-decision)" }}
                    >
                      {model.decisionPaper?.executionStatusLabel?.toUpperCase() ??
                        (isManufacturing ? "DECISION REQUIRED" : "JUDGEMENT")}
                    </p>
                    <p className="mt-2 max-w-3xl text-[length:1.1rem] font-semibold tracking-tight leading-snug">
                      {model.decisionPaper?.decisionQuestion ??
                        model.darkPanel.requiresJudgement}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <Link
                        href={decisionHref}
                        className="exds-focus-ring inline-flex items-center rounded-[var(--eos-radius-sm)] border px-4 py-2.5 text-[length:0.75rem] font-semibold uppercase tracking-[0.08em]"
                        style={{
                          borderColor: "var(--exds-decision)",
                          color: "var(--exds-decision)",
                        }}
                        data-cc-primary-cta="true"
                      >
                        {decisionCtaLabel}
                      </Link>
                      {isDecisionRequired ? (
                        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                          Owner not yet assigned · Due date not yet assigned
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </ExecutiveHero>
            </div>
          </section>

          {/* ========== LAYER 2 — INVESTIGATE ========== */}
          <section
            className="cc-section cc-layer-investigate"
            aria-label="Investigate"
            data-cc-layer="investigate"
          >
            {model.continuity ? (
              <div
                className="cc-continuity-compact mb-5"
                data-continuity-band="true"
                data-cc-level="continuity"
              >
                <SinceYouLastLooked
                  items={model.continuity.sinceYouLastLooked}
                  nothingMaterialChanged={
                    model.continuity.nothingMaterialChanged
                  }
                  initialVisible={3}
                />
              </div>
            ) : null}

            <div data-cc-level="evidence">
              <EvidenceLab tabs={evidenceTabs} />
            </div>

            {/* Judgement basis — progressive; avoids Layer 1 narrative duplication */}
            <details
              className="cc-supporting-details mt-5"
              data-cc-level="judgement"
              data-judgement-basis="true"
            >
              <summary className="exds-editorial-label cursor-pointer">
                Why should I believe this? — judgement basis →
              </summary>
              <div className="mt-4">
                <ExecutiveJudgementPanel
                  label="Executive Judgement"
                  headline={model.darkPanel.headline}
                  judgement={model.darkPanel.judgement}
                  support={model.darkPanel.support}
                  evidenceStrip={model.darkPanel.evidenceStrip}
                  requiresJudgement={model.darkPanel.requiresJudgement}
                  confidence={model.darkPanel.confidence}
                  confidenceLabel={
                    model.darkPanel.confidenceLabel ?? "Judgement confidence"
                  }
                  actionHref={model.darkPanel.actionHref}
                  actionLabel={decisionCtaLabel}
                >
                  {isManufacturing && model.narrativeChain ? (
                    <ol
                      className="mt-6 space-y-2 border-t pt-5"
                      style={{ borderColor: "var(--exds-electric-border)" }}
                      aria-label="Judgement trace"
                      data-narrative-chain="true"
                    >
                      {(
                        [
                          ["Signal", model.narrativeChain.signal],
                          [
                            "Demand implication",
                            model.narrativeChain.demandImplication,
                          ],
                          [
                            "Operational implication",
                            model.narrativeChain.operationalImplication,
                          ],
                          ["Executive judgement", model.narrativeChain.judgement],
                        ] as const
                      ).map(([step, text], i) => (
                        <li key={step} className="min-w-0">
                          <p
                            className="exds-editorial-label"
                            style={{ color: "var(--exds-judgement-muted)" }}
                          >
                            {String(i + 1).padStart(2, "0")} · {step}
                          </p>
                          <p
                            className="mt-1 text-[length:0.9rem] leading-snug"
                            style={{ color: "var(--exds-judgement-fg)" }}
                          >
                            {text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </ExecutiveJudgementPanel>
              </div>
            </details>
          </section>

          {/* ========== LAYER 3 — DECIDE / EXECUTE ========== */}
          <section
            className="cc-section cc-layer-operate"
            aria-label="Decide and execute"
            data-cc-layer="operate"
            data-cc-flow="investigate-decide-execute"
          >
            <nav
              className="cc-flow-index mb-4"
              aria-label="Decision flow"
              data-cc-decision-flow="true"
            >
              <ol className="flex flex-wrap gap-x-4 gap-y-1">
                <li className="eos-type-caption font-semibold uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
                  Investigate
                </li>
                <li
                  className="eos-type-caption font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "var(--exds-decision)" }}
                >
                  → Decide
                </li>
                <li className="eos-type-caption font-semibold uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
                  → Execute
                </li>
              </ol>
            </nav>

            {model.decisionPaper ? (
              <div
                className="cc-operate-decision"
                data-decision-status-band="true"
                data-cc-level="decision"
                data-execution-status={executionStatus ?? "decision_required"}
              >
                <p
                  className="exds-editorial-label"
                  style={{ color: "var(--exds-decision)" }}
                >
                  {model.decisionPaper.executionStatusLabel?.toUpperCase() ??
                    "DECISION REQUIRED"}
                </p>
                {isExecutionPromoted && primaryAccount ? (
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="exds-editorial-label">Owner</dt>
                      <dd className="mt-0.5 text-[length:0.95rem] font-semibold">
                        {primaryAccount.owner ?? "Owner not yet assigned"}
                      </dd>
                    </div>
                    <div>
                      <dt className="exds-editorial-label">Due</dt>
                      <dd className="mt-0.5 text-[length:0.95rem] font-semibold">
                        {primaryAccount.due ?? "Due date not yet assigned"}
                      </dd>
                    </div>
                    <div>
                      <dt className="exds-editorial-label">Action</dt>
                      <dd className="mt-0.5 text-[length:0.95rem] font-semibold">
                        {primaryAccount.actionLabel ?? "Action not yet created"}
                      </dd>
                    </div>
                  </dl>
                ) : isDecisionRequired ? (
                  <div className="mt-2 max-w-2xl space-y-1">
                    <p className="text-[length:0.95rem] font-semibold tracking-tight">
                      Selection has not occurred.
                    </p>
                    <p className="eos-type-supporting">
                      Open the decision paper to choose a path.
                    </p>
                  </div>
                ) : (
                  <p className="eos-type-supporting mt-2 max-w-2xl">
                    {model.decisionPaper.decisionQuestion}
                  </p>
                )}
                <Link
                  href={decisionHref}
                  className="exds-focus-ring mt-3 inline-block eos-type-caption font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "var(--exds-decision)" }}
                >
                  {decisionCtaLabel}
                </Link>
              </div>
            ) : null}

            {model.continuity && isExecutionPromoted ? (
              <div
                className="mt-5 cc-accountability-compact"
                data-cc-level="accountability"
              >
                <AccountabilitySurface
                  rows={model.continuity.accountability.slice(0, 1)}
                />
              </div>
            ) : model.continuity && isDecisionRequired ? (
              <p
                className="eos-type-caption mt-4"
                data-accountability="true"
                data-cc-level="accountability"
              >
                Accountability · Owner not yet assigned · Due date not yet
                assigned · Action not yet created
              </p>
            ) : null}

            <details className="cc-supporting-details mt-5">
              <summary className="exds-editorial-label cursor-pointer">
                Supporting stream & overnight changes
              </summary>
              <div className="mt-4 space-y-6">
                <div className="cc-overnight-band">
                  <ExecutiveOvernightChanges items={model.overnight} />
                </div>
                <div data-cc-intelligence-pair="true">
                  <PriorityDecisionsPanel items={model.queue} />
                </div>
                <div className="cc-stream-compact">
                  <IntelligenceStreamSubordinate events={model.stream} />
                </div>
              </div>
            </details>

            <div className="mt-5" data-cc-level="council">
              <CouncilProgressive
                seats={model.council.seats}
                framing={model.council.framing}
              />
            </div>

            <details
              className="cc-supporting-details mt-4"
              data-cc-honesty="true"
            >
              <summary className="exds-editorial-label cursor-pointer">
                Evidence coverage & executive value
              </summary>
              <div className="mt-4 cc-honesty-compact">
                <EvidenceCoveragePanel coverage={model.evidenceCoverage} />
                <ExecutiveValuePanel value={model.executiveValue} />
              </div>
            </details>

            {model.designPartner ? (
              <details
                className="cc-supporting-details mt-4"
                data-design-partner-admin="true"
              >
                <summary className="exds-editorial-label cursor-pointer">
                  Design Partner status
                </summary>
                <div className="mt-4 space-y-4">
                  <DesignPartnerExpansionSignals
                    signals={model.designPartner.expansion}
                    compact
                  />
                  <DesignPartnerFeedbackCapture
                    organisationId={model.designPartner.organisationId}
                    snapshotId={model.snapshotId}
                    decisionId={model.decisionPaper?.decisionId}
                    screen="command_centre"
                  />
                  <p className="eos-type-caption">
                    {model.designPartner.retentionPolicyLabel}
                  </p>
                </div>
              </details>
            ) : null}

            {/* Closing insight — subordinate metadata, not a second lead narrative */}
            <p
              className="eos-type-caption mt-6 border-t pt-3"
              style={{ borderColor: "var(--exds-electric-border)" }}
              data-exds-insight-bar="true"
              data-cc-level="insight"
              aria-label="Executive insight"
            >
              <span className="exds-editorial-label mr-2">Insight</span>
              {model.executiveInsight}
              {model.darkPanel.confidence != null
                ? ` · Confidence ${model.darkPanel.confidence}%`
                : ""}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyEvidence({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[8rem] flex-col justify-center border border-dashed border-[rgba(47,122,229,0.25)] px-5 py-6"
      data-evidence-empty="true"
    >
      <p className="exds-editorial-label">Evidence not established</p>
      <p className="eos-type-supporting mt-2">{label}</p>
    </div>
  );
}

function PriorityDecisionsPanel({ items }: { items: JudgementItem[] }) {
  return (
    <section
      aria-label="Priority decisions"
      data-judgement-queue="true"
      className="cc-priority-light"
    >
      <p className="exds-editorial-label">Priority decisions</p>
      <div className="mt-2 space-y-0">
        {items.slice(0, 4).map((item, i) => {
          const raw = item.organisationalImpact?.trim() ?? "";
          const impact =
            !raw || /not yet|unquantif/i.test(raw)
              ? "Not yet quantified"
              : raw.slice(0, 96);
          return (
            <ExecutiveDecisionStatement
              key={item.id}
              index={i + 1}
              title={item.title}
              statement={impact}
              why={undefined}
              confidence={item.confidence}
              action={
                <Link
                  href={item.href}
                  className="exds-focus-ring eos-type-caption font-semibold uppercase tracking-[0.08em]"
                  style={{ color: EXDS_TONE_VAR.decision }}
                >
                  Open →
                </Link>
              }
            />
          );
        })}
      </div>
    </section>
  );
}

function IntelligenceStreamSubordinate({
  events,
}: {
  events: IntelligenceStreamEvent[];
}) {
  return (
    <section
      aria-label="Executive Intelligence Stream"
      data-intelligence-stream="true"
      className="cc-stream-surface"
    >
      <p
        className="exds-editorial-label"
        style={{ color: EXDS_TONE_VAR.intelligence }}
      >
        Supporting stream
      </p>
      <ol className="mt-2 list-none p-0">
        {events.slice(0, 3).map((event) => (
          <li key={event.id} className="cc-stream-item">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[length:0.9rem] font-semibold tracking-tight text-[var(--eos-color-text)]">
                {event.title}
              </p>
              <Link
                href={event.href}
                className="exds-focus-ring eos-type-caption"
                style={{ color: EXDS_TONE_VAR.intelligence }}
              >
                Open →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EvidenceCoveragePanel({
  coverage,
}: {
  coverage: CommandCentreExperienceModel["evidenceCoverage"];
}) {
  return (
    <section aria-label="Evidence coverage" data-evidence-coverage="true">
      <p className="exds-editorial-label">Evidence coverage</p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {coverage.supported.slice(0, 6).map((item) => (
          <li
            key={item}
            className="eos-type-caption"
            style={{ color: EXDS_TONE_VAR.improving }}
          >
            ✓ {item}
          </li>
        ))}
      </ul>
      <p className="exds-editorial-label mt-4">Not currently established</p>
      <p className="eos-type-supporting mt-1 text-[var(--eos-color-text-muted)]">
        {coverage.notEstablished.slice(0, 4).join(" · ")}
      </p>
    </section>
  );
}

function ExecutiveValuePanel({
  value,
}: {
  value: CommandCentreExperienceModel["executiveValue"];
}) {
  return (
    <section aria-label="Executive Value" data-executive-value="true">
      <p className="exds-editorial-label">Executive Value</p>
      <p
        className="mt-2 text-[length:1.05rem] font-semibold tracking-tight"
        style={{ color: EXDS_TONE_VAR.decision }}
      >
        {value.status}
      </p>
    </section>
  );
}
