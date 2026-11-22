"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import { KnowledgeNetworkExplorerLazy } from "@/experience/immersion/KnowledgeNetworkExplorerLazy";
import { ManufacturingOperationsMapLazy } from "@/experience/immersion/ManufacturingOperationsMapLazy";
import type { DecisionIntelligenceImmersionModel } from "@/experience/immersion/decision/projectManufacturingDecisionIntelligence";

type Props = {
  model: DecisionIntelligenceImmersionModel;
  className?: string;
};

/**
 * Stage 3 — Decision Intelligence immersion.
 * Makes attention, evidence, options, consequences and next action explicit.
 * No fabricated financials; scenarios labelled modelled / illustrative.
 */
export function DecisionIntelligenceImmersion({ model, className }: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    model.options[0]?.id ?? null,
  );
  const selected = model.options.find((o) => o.id === selectedOptionId) ?? null;

  return (
    <div
      className={cn("space-y-6 text-[#e8eaef]", className)}
      data-decision-intelligence-immersion="true"
      data-demonstration={model.demonstrationData ? "true" : "false"}
    >
      {/* Hero — what requires attention */}
      <section
        className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,#c4a35a_32%,transparent)] bg-[#0a101c]"
        data-decision-section="hero"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(196,163,90,0.14), transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(94,200,216,0.1), transparent 40%)",
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
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-[#9aa3b8]">
            <span className="text-[#c5cad6]">Why it matters: </span>
            {model.whyItMatters}
          </p>
          <p className="mt-2 max-w-3xl text-[0.85rem] text-[#8b93a7]">
            <span className="text-[#c5cad6]">Why now: </span>
            {model.whyNow}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={model.actionHref}
              className="inline-flex items-center rounded-md border border-[#c4a35a]/70 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a] hover:bg-[#c4a35a]/10"
            >
              Take executive action →
            </Link>
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
          <p className="mt-4 text-[0.75rem] text-[#8b93a7]">{model.selectionMessage}</p>
        </div>
      </section>

      {/* Confidence honesty */}
      <section
        className="grid gap-3 rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-4 sm:grid-cols-3"
        data-decision-section="confidence"
      >
        {[
          model.confidence.datasetLabel,
          model.confidence.judgementLabel,
          model.confidence.decisionConfidenceLabel,
        ].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[0.78rem] text-[#c5cad6]"
          >
            {label}
          </div>
        ))}
      </section>

      {/* Evidence supporting the decision */}
      <section
        id="decision-evidence"
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="evidence"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#6a9fd8]">
              Supporting evidence
            </p>
            <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
              What evidence supports this decision?
            </h3>
          </div>
          <IntelligenceProvenanceBadge provenance="derived" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["primary", "counter", "operational"] as const).map((role) => {
            const cards = model.evidence.filter((e) => e.role === role);
            const title =
              role === "primary"
                ? "Primary support"
                : role === "counter"
                  ? "Counter signals"
                  : "Operational implications";
            return (
              <div
                key={role}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
              >
                <p
                  className={cn(
                    "text-[0.6rem] uppercase tracking-[0.08em]",
                    role === "counter" ? "text-[#c4a35a]" : "text-[#6a9fd8]",
                  )}
                >
                  {title}
                </p>
                <ul className="mt-2 space-y-2">
                  {cards.length === 0 ? (
                    <li className="text-[0.75rem] text-[#6d768a]">
                      None established in this snapshot.
                    </li>
                  ) : (
                    cards.map((c) => (
                      <li key={c.id}>
                        <p className="text-[0.85rem] font-medium">{c.label}</p>
                        <p className="mt-0.5 text-[0.72rem] text-[#8b93a7]">
                          {c.detail}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Options */}
      <section
        id="decision-options"
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="options"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#5ec8d8]">
          Available options
        </p>
        <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
          What can the executive choose?
        </h3>
        <p className="mt-1 text-[0.75rem] text-[#8b93a7]">
          Options are framed for selection — none is marked as a recommendation.
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
                <p className="mt-1 text-[0.95rem] font-semibold">{opt.label}</p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-[#9aa3b8]">
                  {opt.summary}
                </p>
              </button>
            );
          })}
        </div>
        {selected ? (
          <div
            className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2"
            data-decision-section="consequences"
          >
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#5ec8d8]">
                Likely upsides
              </p>
              <ul className="mt-2 space-y-1.5">
                {selected.upsides.length === 0 ? (
                  <li className="text-[0.75rem] text-[#6d768a]">
                    No upside trade-off framed.
                  </li>
                ) : (
                  selected.upsides.map((t) => (
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
                Likely risks / downsides
              </p>
              <ul className="mt-2 space-y-1.5">
                {selected.downsides.length === 0 ? (
                  <li className="text-[0.75rem] text-[#6d768a]">
                    No downside trade-off framed.
                  </li>
                ) : (
                  selected.downsides.map((t) => (
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
          </div>
        ) : null}
      </section>

      {/* Scenario comparison — labelled modelled */}
      <section
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-decision-section="scenarios"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
          Scenario comparison
        </p>
        <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
          Base · protect · defer pathways
        </h3>
        <p className="mt-1 text-[0.72rem] text-[#c4785a]">
          Modelled / illustrative framings over evidence options — not measured
          financial outcomes.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {model.scenarios.map((lane) => (
            <article
              key={lane.id}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
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
              <p className="mt-3 text-[0.65rem] text-[#6d768a]">{lane.honesty}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Next action + missing evidence */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-[12px] border border-[color-mix(in_srgb,#c4a35a_30%,transparent)] bg-[#0c121f] p-5"
          data-decision-section="action"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#c4a35a]">
            What should the executive do next?
          </p>
          <p className="mt-2 text-[1rem] font-semibold leading-snug">
            {model.nextAction}
          </p>
          <p className="mt-2 text-[0.8rem] text-[#8b93a7]">{model.readinessExplanation}</p>
          <dl className="mt-4 space-y-2 text-[0.75rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b93a7]">Cost of delay</dt>
              <dd className="text-right text-[#c5cad6]">{model.costOfDelay}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b93a7]">Executive value</dt>
              <dd className="text-right text-[#c5cad6]">
                {model.executiveValueStatus}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b93a7]">Council</dt>
              <dd className="text-right text-[#c5cad6]">{model.councilStatus}</dd>
            </div>
          </dl>
          <Link
            href={model.actionHref}
            className="mt-5 inline-flex rounded-md border border-[#c4a35a]/70 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a]"
          >
            Open decision workspace →
          </Link>
        </section>

        <section
          className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
          data-decision-section="missing"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
            Evidence still required
          </p>
          <ul className="mt-3 space-y-2">
            {model.missingEvidence.length === 0 ? (
              <li className="text-[0.8rem] text-[#6d768a]">
                No additional missing-evidence items listed for this frame.
              </li>
            ) : (
              model.missingEvidence.map((m) => (
                <li
                  key={m.label}
                  className="rounded-lg border border-white/[0.06] px-3 py-2"
                >
                  <p className="text-[0.85rem] font-medium">{m.label}</p>
                  <p className="mt-1 text-[0.72rem] text-[#8b93a7]">{m.why}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

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
        <KnowledgeNetworkExplorerLazy model={model.network} initialSelectedId="org" />
      </section>
    </div>
  );
}
