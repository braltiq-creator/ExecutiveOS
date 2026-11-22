"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import { KnowledgeNetworkExplorerLazy } from "@/experience/immersion/KnowledgeNetworkExplorerLazy";
import { ManufacturingOperationsMapLazy } from "@/experience/immersion/ManufacturingOperationsMapLazy";
import {
  deriveRecordedDecisionConfidence,
  type DecisionEvidenceCard,
  type DecisionIntelligenceImmersionModel,
  type DecisionOptionCard,
} from "@/experience/immersion/decision/projectManufacturingDecisionIntelligence";

type Props = {
  model: DecisionIntelligenceImmersionModel;
  className?: string;
};

type RecordedDecision = {
  optionId: string;
  optionLabel: string;
  rationale: string;
  acceptedAssumptions: string[];
  acceptedRisks: string[];
  owner: string;
  followUps: string[];
  recordedAt: string;
  evidenceSnapshotIds: string[];
  decisionConfidence: ReturnType<typeof deriveRecordedDecisionConfidence>;
  history: Array<{ at: string; actor: string; note: string }>;
};

/**
 * Stage 3 — Decision Intelligence immersion.
 * Attention → evidence → uncertainty → options → derived next step → executive record.
 * Decision confidence stays unestablished until an executive records a decision.
 */
export function DecisionIntelligenceImmersion({ model, className }: Props) {
  const formId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    model.options[0]?.id ?? null,
  );
  const [inspectedEvidenceId, setInspectedEvidenceId] = useState<string | null>(
    model.evidence.find((e) => e.role === "primary")?.id ??
      model.evidence[0]?.id ??
      null,
  );
  const [judgementOpen, setJudgementOpen] = useState(true);
  const [rationale, setRationale] = useState("");
  const [owner, setOwner] = useState("Executive");
  const [followUp, setFollowUp] = useState("");
  const [acceptedAssumptionIds, setAcceptedAssumptionIds] = useState<string[]>(
    [],
  );
  const [acceptedRiskIds, setAcceptedRiskIds] = useState<string[]>([]);
  const [recorded, setRecorded] = useState<RecordedDecision | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  const selected =
    model.options.find((o) => o.id === selectedOptionId) ?? null;
  const inspected =
    model.evidence.find((e) => e.id === inspectedEvidenceId) ?? null;

  const decisionConfidence = recorded
    ? {
        ...model.confidence.decision,
        status: "established" as const,
        valueLabel: recorded.decisionConfidence.label,
        score: null,
        explanation: recorded.decisionConfidence.explanation,
        factors: [
          recorded.decisionConfidence.recordingCompletenessLabel,
          `Option: ${recorded.optionLabel}`,
          `Owner: ${recorded.owner}`,
          `Recorded ${new Date(recorded.recordedAt).toLocaleString()}`,
        ],
      }
    : model.confidence.decision;

  function toggleId(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function onRecordDecision() {
    setRecordError(null);
    if (!selected) {
      setRecordError("Select an option before recording the decision.");
      return;
    }
    if (rationale.trim().length < 24) {
      setRecordError(
        "Record a rationale (at least a short paragraph) before committing.",
      );
      return;
    }
    if (!owner.trim()) {
      setRecordError("Record the decision owner.");
      return;
    }
    const at = new Date().toISOString();
    const evidenceIds = [
      ...selected.supportingEvidenceIds,
      ...model.evidence.filter((e) => e.role === "primary").map((e) => e.id),
    ];
    const uniqueEvidence = [...new Set(evidenceIds)];
    const assumptions =
      acceptedAssumptionIds.length > 0
        ? acceptedAssumptionIds
        : selected.unresolvedAssumptions.slice(0, 1);
    const risks =
      acceptedRiskIds.length > 0
        ? acceptedRiskIds
        : selected.downsides.slice(0, 1);

    const decisionConfidence = deriveRecordedDecisionConfidence({
      rationale,
      acceptedAssumptions: assumptions,
      acceptedRisks: risks,
      owner,
      followUps: followUp.trim() ? [followUp.trim()] : [],
      evidenceIds: uniqueEvidence,
    });

    setRecorded({
      optionId: selected.id,
      optionLabel: selected.label,
      rationale: rationale.trim(),
      acceptedAssumptions: assumptions,
      acceptedRisks: risks,
      owner: owner.trim(),
      followUps: followUp.trim() ? [followUp.trim()] : [],
      recordedAt: at,
      evidenceSnapshotIds: uniqueEvidence,
      decisionConfidence,
      history: [
        {
          at,
          actor: owner.trim(),
          note: `Executive recorded selection “${selected.shortLabel}”. Not an automatic AI approval.`,
        },
      ],
    });
  }

  return (
    <div
      className={cn("space-y-6 text-[#e8eaef]", className)}
      data-decision-intelligence-immersion="true"
      data-demonstration={model.demonstrationData ? "true" : "false"}
      data-decision-recorded={recorded ? "true" : "false"}
    >
      {/* 4.1 Decision Hero */}
      <section
        className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,#c4a35a_32%,transparent)] bg-[#0a101c]"
        data-decision-section="hero"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 28%, rgba(196,163,90,0.14), transparent 50%), radial-gradient(ellipse at 88% 78%, rgba(94,200,216,0.1), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative p-5 md:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#c4a35a]">
              {model.kicker} · {model.title}
            </p>
            <IntelligenceProvenanceBadge provenance="derived" />
            {model.demonstrationData ? (
              <span className="text-[0.62rem] uppercase tracking-[0.06em] text-[#c4785a]">
                Demonstration fixture
              </span>
            ) : null}
            <span className="rounded border border-[#c4a35a]/45 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.06em] text-[#c4a35a]">
              {model.readinessLabel}
            </span>
          </div>

          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.1em] text-[#8b93a7]">
            What decision requires executive attention?
          </p>
          <h2 className="mt-2 max-w-4xl text-[clamp(1.35rem,2.3vw,2rem)] font-semibold leading-[1.15] tracking-tight">
            {model.decisionQuestion}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#6a9fd8]">
                Why it matters
              </p>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[#c5cad6]">
                {model.whyItMatters}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#c4a35a]">
                Why now
              </p>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[#c5cad6]">
                {model.whyNow}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Business impact
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#9aa3b8]">
                {model.businessImpact}
              </p>
              <p className="mt-2 text-[0.72rem] text-[#6d768a]">
                Executive value: {model.executiveValueStatus}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-3.5",
                model.urgencyTone === "attention"
                  ? "border-[#c4a35a]/35 bg-[color-mix(in_srgb,#c4a35a_8%,transparent)]"
                  : "border-white/[0.07] bg-white/[0.025]",
              )}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#c4a35a]">
                Urgency
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#c5cad6]">
                {model.urgency}
              </p>
              <p className="mt-2 text-[0.72rem] text-[#6d768a]">
                Cost of delay: {model.costOfDelay}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#decision-record"
              className="inline-flex items-center rounded-md border border-[#c4a35a]/70 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a] hover:bg-[#c4a35a]/10"
            >
              Record executive decision →
            </a>
            <a
              href="#decision-evidence"
              className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c5cad6]"
            >
              Inspect evidence
            </a>
            <a
              href="#decision-options"
              className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c5cad6]"
            >
              Compare options
            </a>
          </div>
          <p className="mt-4 text-[0.75rem] text-[#8b93a7]">
            {model.selectionMessage}
          </p>
        </div>
      </section>

      {/* Confidence instruments — three independent measures */}
      <section
        className="grid gap-3 lg:grid-cols-3"
        data-decision-section="confidence"
        aria-label="Confidence instruments"
      >
        <ConfidenceCard instrument={model.confidence.dataset} accent="#6a9fd8" />
        <ConfidenceCard
          instrument={model.confidence.judgement}
          accent="#5ec8d8"
          expandable
          open={judgementOpen}
          onToggle={() => setJudgementOpen((v) => !v)}
        />
        <ConfidenceCard instrument={decisionConfidence} accent="#c4a35a" />
      </section>

      {judgementOpen ? (
        <section
          className="rounded-[12px] border border-[#5ec8d8]/25 bg-[#0c121f] p-5"
          data-decision-section="judgement-analysis"
          id="decision-judgement"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#5ec8d8]">
                Uncertainty & judgement analysis
              </p>
              <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
                Why judgement confidence is{" "}
                {model.judgementAnalysis.score == null
                  ? "unestablished"
                  : `${model.judgementAnalysis.score}%`}
              </h3>
            </div>
            <IntelligenceProvenanceBadge provenance="derived" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <FactorList
              title="Strongest supporting factors"
              items={model.judgementAnalysis.supportingFactors}
              tone="up"
            />
            <FactorList
              title="Factors limiting confidence"
              items={model.judgementAnalysis.limitingFactors}
              tone="down"
            />
            <FactorList
              title="Assumptions in play"
              items={model.judgementAnalysis.assumptions}
              tone="neutral"
            />
            <FactorList
              title="Information that would resolve uncertainty"
              items={model.judgementAnalysis.informationToResolve}
              tone="neutral"
            />
          </div>
          <p className="mt-4 text-[0.72rem] text-[#c4785a]">
            {model.judgementAnalysis.honestyNote}
          </p>
        </section>
      ) : null}

      {/* 4.2 Evidence Intelligence */}
      <section
        id="decision-evidence"
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="evidence"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#6a9fd8]">
              Evidence intelligence
            </p>
            <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
              What evidence supports this assessment?
            </h3>
            <p className="mt-1 text-[0.72rem] text-[#8b93a7]">
              {model.evidenceWindowLabel} · every assertion is evidence-derived
              or labelled as inference
            </p>
          </div>
          <IntelligenceProvenanceBadge provenance="derived" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(15rem,0.9fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["primary", "Supporting evidence"],
                ["counter", "Contradictory evidence"],
                ["operational", "Operational signals"],
                ["missing", "Missing evidence"],
              ] as const
            ).map(([role, title]) => {
              const cards = model.evidence.filter((e) => e.role === role);
              return (
                <div
                  key={role}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"
                >
                  <p
                    className={cn(
                      "text-[0.6rem] uppercase tracking-[0.08em]",
                      role === "counter" || role === "missing"
                        ? "text-[#c4a35a]"
                        : "text-[#6a9fd8]",
                    )}
                  >
                    {title}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {cards.length === 0 ? (
                      <li className="text-[0.75rem] text-[#6d768a]">
                        None established in this snapshot.
                      </li>
                    ) : (
                      cards.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            data-evidence-id={c.id}
                            onClick={() => setInspectedEvidenceId(c.id)}
                            className={cn(
                              "w-full rounded-md px-2 py-1.5 text-left transition-colors",
                              inspectedEvidenceId === c.id
                                ? "bg-[color-mix(in_srgb,#6a9fd8_14%,transparent)]"
                                : "hover:bg-white/[0.03]",
                            )}
                          >
                            <p className="text-[0.82rem] font-medium">
                              {c.label}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-[#8b93a7]">
                              {c.detail}
                            </p>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <EvidenceInspectPanel card={inspected} />
        </div>
      </section>

      {/* 4.4 Scenarios / options */}
      <section
        id="decision-options"
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="options"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#5ec8d8]">
          Decision scenarios
        </p>
        <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
          Available alternatives for this Model H decision
        </h3>
        <p className="mt-1 text-[0.75rem] text-[#8b93a7]">
          Options are framed for executive selection — none is an AI
          recommendation or approved decision.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {model.options.map((opt) => {
            const active = opt.id === selectedOptionId;
            return (
              <button
                key={opt.id}
                type="button"
                data-decision-option={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-[#5ec8d8]/55 bg-[color-mix(in_srgb,#5ec8d8_10%,transparent)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20",
                )}
              >
                <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Option · not a recommendation
                </p>
                <p className="mt-1 text-[0.95rem] font-semibold">
                  {opt.shortLabel}
                </p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-[#9aa3b8]">
                  {opt.summary}
                </p>
              </button>
            );
          })}
        </div>

        {selected ? <OptionDetailPanel option={selected} /> : null}

        <div
          className="mt-5 border-t border-white/10 pt-5"
          data-decision-section="scenarios"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
            Scenario comparison
          </p>
          <p className="mt-1 text-[0.72rem] text-[#c4785a]">
            Modelled / illustrative framings over evidence options — not
            measured financial outcomes.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {model.scenarios.map((lane) => (
              <article
                key={lane.id}
                className={cn(
                  "rounded-xl border p-3.5",
                  lane.optionId === selectedOptionId
                    ? "border-[#5ec8d8]/40 bg-[color-mix(in_srgb,#5ec8d8_6%,transparent)]"
                    : "border-white/[0.07] bg-white/[0.02]",
                )}
                data-decision-scenario={lane.id}
              >
                <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#6a9fd8]">
                  {lane.label}
                </p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-[#c5cad6]">
                  {lane.framing}
                </p>
                <ul className="mt-3 space-y-2">
                  {lane.points.map((p) => (
                    <li
                      key={p.label}
                      className="flex items-start justify-between gap-2 text-[0.75rem]"
                    >
                      <span className="text-[#8b93a7]">{p.label}</span>
                      <span
                        className={cn(
                          "max-w-[58%] text-right font-medium",
                          p.polarity === "up"
                            ? "text-[#5ec8d8]"
                            : p.polarity === "down"
                              ? "text-[#c4a35a]"
                              : "text-[#e8eaef]",
                        )}
                      >
                        {p.value}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[0.65rem] text-[#6d768a]">
                  {lane.honesty}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 Recommended next step — explicitly not AI bind */}
      <section
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="recommended-next"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#6a9fd8]">
          Recommended executive next step
        </p>
        <p className="mt-1 text-[0.62rem] uppercase tracking-[0.08em] text-[#c4785a]">
          Derived framing · not AI recommendation · not executive decision
        </p>
        <p className="mt-3 text-[1rem] font-semibold leading-snug">
          {model.recommendedNextStep.label}
        </p>
        <p className="mt-2 text-[0.85rem] text-[#9aa3b8]">
          {model.recommendedNextStep.why}
        </p>
        <p className="mt-3 text-[0.72rem] text-[#8b93a7]">
          {model.recommendedNextStep.distinction}
        </p>
        <p className="mt-2 text-[0.72rem] text-[#6d768a]">
          Council: {model.councilStatus}
        </p>
      </section>

      {/* 4.6 Record the decision */}
      <section
        id="decision-record"
        className="rounded-[12px] border border-[color-mix(in_srgb,#c4a35a_30%,transparent)] bg-[#0c121f] p-5"
        data-decision-section="record"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#c4a35a]">
          Record the executive decision
        </p>
        <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
          Commit selection, rationale and ownership
        </h3>
        <p className="mt-1 text-[0.75rem] text-[#8b93a7]">
          Session recording in this preview preserves lineage locally. Durable
          production persistence continues through the existing Decision
          Workspace / pilot path — no new database structures introduced here.
        </p>

        {recorded ? (
          <RecordedDecisionState recorded={recorded} actionHref={model.actionHref} />
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Selected option
              </p>
              <p className="mt-1 text-[0.95rem] font-medium">
                {selected?.label ?? "No option selected"}
              </p>
            </div>

            <label className="block" htmlFor={`${formId}-rationale`}>
              <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Decision rationale
              </span>
              <textarea
                id={`${formId}-rationale`}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 text-[0.85rem] text-[#e8eaef] outline-none focus:border-[#c4a35a]/50"
                placeholder="Why this option is being selected given the evidence and uncertainties…"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <fieldset>
                <legend className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Assumptions accepted
                </legend>
                <ul className="mt-2 space-y-1.5">
                  {(selected?.unresolvedAssumptions ??
                    model.judgementAnalysis.assumptions
                  ).map((a) => (
                    <li key={a}>
                      <label className="flex cursor-pointer items-start gap-2 text-[0.78rem] text-[#c5cad6]">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[#c4a35a]"
                          checked={acceptedAssumptionIds.includes(a)}
                          onChange={() =>
                            setAcceptedAssumptionIds((prev) =>
                              toggleId(prev, a),
                            )
                          }
                        />
                        <span>{a}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
              <fieldset>
                <legend className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Risks accepted
                </legend>
                <ul className="mt-2 space-y-1.5">
                  {(selected?.downsides ?? []).map((r) => (
                    <li key={r}>
                      <label className="flex cursor-pointer items-start gap-2 text-[0.78rem] text-[#c5cad6]">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[#c4a35a]"
                          checked={acceptedRiskIds.includes(r)}
                          onChange={() =>
                            setAcceptedRiskIds((prev) => toggleId(prev, r))
                          }
                        />
                        <span>{r}</span>
                      </label>
                    </li>
                  ))}
                  {selected && selected.downsides.length === 0 ? (
                    <li className="text-[0.75rem] text-[#6d768a]">
                      No downside trade-off framed for this option.
                    </li>
                  ) : null}
                </ul>
              </fieldset>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block" htmlFor={`${formId}-owner`}>
                <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Decision owner
                </span>
                <input
                  id={`${formId}-owner`}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 text-[0.85rem] text-[#e8eaef] outline-none focus:border-[#c4a35a]/50"
                />
              </label>
              <label className="block" htmlFor={`${formId}-followup`}>
                <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Follow-up action
                </span>
                <input
                  id={`${formId}-followup`}
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 text-[0.85rem] text-[#e8eaef] outline-none focus:border-[#c4a35a]/50"
                  placeholder="e.g. Brief operations on allocation change"
                />
              </label>
            </div>

            {recordError ? (
              <p className="text-[0.8rem] text-[#c4785a]" role="alert">
                {recordError}
              </p>
            ) : null}

            <button
              type="button"
              data-decision-record-commit="true"
              onClick={onRecordDecision}
              className="inline-flex rounded-md border border-[#c4a35a]/80 bg-[color-mix(in_srgb,#c4a35a_12%,transparent)] px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a] transition-colors hover:bg-[color-mix(in_srgb,#c4a35a_20%,transparent)]"
            >
              Record executive decision
            </button>
          </div>
        )}
      </section>

      {/* Connected geography + knowledge */}
      <section id="decision-map" data-decision-section="map">
        <ManufacturingOperationsMapLazy
          model={model.map}
          initialView="australia"
          forceLayers={{
            demand: true,
            facilities: true,
            capacity: true,
            risks: true,
          }}
        />
      </section>

      <section id="decision-knowledge" data-decision-section="knowledge">
        <KnowledgeNetworkExplorerLazy
          model={model.network}
          initialSelectedId="org"
        />
      </section>
    </div>
  );
}

function ConfidenceCard({
  instrument,
  accent,
  expandable,
  open,
  onToggle,
}: {
  instrument: DecisionIntelligenceImmersionModel["confidence"]["dataset"];
  accent: string;
  expandable?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  const body = (
    <>
      <p
        className="text-[0.6rem] uppercase tracking-[0.08em]"
        style={{ color: accent }}
      >
        {instrument.title}
      </p>
      <p className="mt-2 text-[0.95rem] font-semibold leading-snug tracking-tight">
        {instrument.score != null ? (
          <>
            <span className="tabular-nums">{instrument.score}%</span>
            <span className="ml-2 text-[0.72rem] font-medium text-[#8b93a7]">
              {instrument.status === "unestablished"
                ? "unestablished"
                : instrument.status}
            </span>
          </>
        ) : (
          <span className="text-[0.9rem]">{instrument.valueLabel}</span>
        )}
      </p>
      <p className="mt-2 text-[0.72rem] leading-relaxed text-[#8b93a7]">
        {instrument.explanation}
      </p>
      {instrument.score != null ? (
        <p className="mt-1 text-[0.65rem] text-[#6d768a]">
          {instrument.valueLabel}
        </p>
      ) : null}
      {expandable ? (
        <p className="mt-2 text-[0.65rem] uppercase tracking-[0.08em]" style={{ color: accent }}>
          {open ? "Hide analysis ↑" : "Explain judgement ↓"}
        </p>
      ) : null}
    </>
  );

  if (expandable && onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        data-confidence={instrument.id}
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-4 text-left transition-colors hover:border-white/20"
        style={{
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      data-confidence={instrument.id}
      className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-4"
      style={{
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 18%, transparent)`,
      }}
    >
      {body}
    </div>
  );
}

function FactorList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <p
        className={cn(
          "text-[0.6rem] uppercase tracking-[0.08em]",
          tone === "up"
            ? "text-[#5ec8d8]"
            : tone === "down"
              ? "text-[#c4a35a]"
              : "text-[#8b93a7]",
        )}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.length === 0 ? (
          <li className="text-[0.75rem] text-[#6d768a]">None listed.</li>
        ) : (
          items.map((item) => (
            <li
              key={item}
              className="border-l-2 border-white/10 pl-2 text-[0.78rem] text-[#c5cad6]"
            >
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function EvidenceInspectPanel({ card }: { card: DecisionEvidenceCard | null }) {
  if (!card) {
    return (
      <aside className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-[0.8rem] text-[#6d768a]">
        Select an evidence item to inspect provenance and relationships.
      </aside>
    );
  }
  return (
    <aside
      className="rounded-xl border border-[#6a9fd8]/25 bg-[color-mix(in_srgb,#6a9fd8_8%,transparent)] p-4"
      data-evidence-inspect={card.id}
    >
      <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#6a9fd8]">
        Inspect evidence
      </p>
      <p className="mt-2 text-[0.95rem] font-semibold leading-snug">
        {card.label}
      </p>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-[#c5cad6]">
        {card.detail}
      </p>
      <dl className="mt-3 space-y-2 text-[0.72rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-[#8b93a7]">Role</dt>
          <dd className="text-right capitalize text-[#c5cad6]">{card.role}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#8b93a7]">Assertion</dt>
          <dd className="text-right text-[#c5cad6]">{card.assertionKind}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#8b93a7]">Freshness</dt>
          <dd className="text-right text-[#c5cad6]">{card.freshnessLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#8b93a7]">Provenance</dt>
          <dd>
            <IntelligenceProvenanceBadge provenance={card.provenance} />
          </dd>
        </div>
      </dl>
      {card.relatedEntities.length > 0 ? (
        <div className="mt-3">
          <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Related entities
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {card.relatedEntities.map((e) => (
              <span
                key={e}
                className="rounded border border-white/10 px-1.5 py-0.5 text-[0.65rem] text-[#9aa3b8]"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <a
        href="#decision-knowledge"
        className="mt-4 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#6a9fd8]"
      >
        Open evidence network →
      </a>
    </aside>
  );
}

function OptionDetailPanel({ option }: { option: DecisionOptionCard }) {
  return (
    <div
      className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2 lg:grid-cols-3"
      data-decision-section="consequences"
    >
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#6a9fd8]">
          Strategic rationale
        </p>
        <p className="mt-2 text-[0.8rem] text-[#c5cad6]">
          {option.strategicRationale}
        </p>
      </div>
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#5ec8d8]">
          Likely upsides
        </p>
        <ul className="mt-2 space-y-1.5">
          {option.upsides.length === 0 ? (
            <li className="text-[0.75rem] text-[#6d768a]">
              No upside trade-off framed.
            </li>
          ) : (
            option.upsides.map((t) => (
              <li
                key={t}
                className="border-l-2 border-[#5ec8d8]/40 pl-2 text-[0.8rem] text-[#c5cad6]"
              >
                {t}
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#c4a35a]">
          Risks / trade-offs
        </p>
        <ul className="mt-2 space-y-1.5">
          {option.downsides.length === 0 ? (
            <li className="text-[0.75rem] text-[#6d768a]">
              No downside trade-off framed.
            </li>
          ) : (
            option.downsides.map((t) => (
              <li
                key={t}
                className="border-l-2 border-[#c4a35a]/40 pl-2 text-[0.8rem] text-[#c5cad6]"
              >
                {t}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
          Unresolved assumptions
        </p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {option.unresolvedAssumptions.map((a) => (
            <li
              key={a}
              className="rounded-md border border-white/[0.06] px-2.5 py-1.5 text-[0.75rem] text-[#9aa3b8]"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecordedDecisionState({
  recorded,
  actionHref,
}: {
  recorded: RecordedDecision;
  actionHref: string;
}) {
  return (
    <div className="mt-4 space-y-4" data-decision-recorded-state="true">
      <div className="rounded-xl border border-[#c4a35a]/40 bg-[color-mix(in_srgb,#c4a35a_10%,transparent)] p-4">
        <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#c4a35a]">
          Executive decision recorded
        </p>
        <p className="mt-2 text-[1rem] font-semibold leading-snug">
          {recorded.optionLabel}
        </p>
        <p className="mt-2 text-[0.8rem] text-[#c5cad6]">{recorded.rationale}</p>
        <dl className="mt-4 grid gap-2 text-[0.75rem] sm:grid-cols-2">
          <div>
            <dt className="text-[#8b93a7]">Owner</dt>
            <dd className="text-[#e8eaef]">{recorded.owner}</dd>
          </div>
          <div>
            <dt className="text-[#8b93a7]">Recorded</dt>
            <dd className="text-[#e8eaef]">
              {new Date(recorded.recordedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[#8b93a7]">Decision confidence</dt>
            <dd className="text-[#e8eaef]">{recorded.decisionConfidence.label}</dd>
          </div>
          <div>
            <dt className="text-[#8b93a7]">Recording completeness</dt>
            <dd className="text-[#e8eaef]">
              {recorded.decisionConfidence.recordingCompletenessLabel}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[0.7rem] text-[#8b93a7]">
          {recorded.decisionConfidence.explanation}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Assumptions accepted
          </p>
          <ul className="mt-2 space-y-1 text-[0.75rem] text-[#c5cad6]">
            {recorded.acceptedAssumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-white/[0.06] p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Risks accepted
          </p>
          <ul className="mt-2 space-y-1 text-[0.75rem] text-[#c5cad6]">
            {recorded.acceptedRisks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      {recorded.followUps.length > 0 ? (
        <div className="rounded-lg border border-white/[0.06] p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Follow-up actions
          </p>
          <ul className="mt-2 space-y-1 text-[0.75rem] text-[#c5cad6]">
            {recorded.followUps.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-white/[0.06] p-3">
        <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
          Decision history
        </p>
        <ol className="mt-2 space-y-2">
          {recorded.history.map((h) => (
            <li key={h.at} className="text-[0.75rem] text-[#c5cad6]">
              <span className="text-[#8b93a7]">
                {new Date(h.at).toLocaleString()} · {h.actor}
              </span>
              <br />
              {h.note}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[0.65rem] text-[#6d768a]">
          Evidence IDs frozen at record time:{" "}
          {recorded.evidenceSnapshotIds.join(", ") || "none"}
        </p>
      </div>

      <Link
        href={actionHref}
        className="inline-flex text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a]"
      >
        Open Decision Workspace for durable follow-through →
      </Link>
    </div>
  );
}
