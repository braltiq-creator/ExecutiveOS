"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import { ManufacturingOperationsMapLazy } from "@/experience/immersion/ManufacturingOperationsMapLazy";
import { KnowledgeNetworkExplorerLazy } from "@/experience/immersion/KnowledgeNetworkExplorerLazy";
import type { ExecutiveBriefingImmersionModel } from "@/experience/immersion/briefing/projectManufacturingBriefing";

const TONE: Record<string, string> = {
  attention: "text-[#c4a35a]",
  watching: "text-[#6a9fd8]",
  improving: "text-[#5ec8d8]",
  intelligence: "text-[#9ab0d2]",
};

type Props = {
  model: ExecutiveBriefingImmersionModel;
  className?: string;
};

/**
 * Stage 2 — immersive Executive Briefing attention environment.
 * Presentation composition over existing evidence projectors — no fabricated KPIs.
 */
export function ExecutiveBriefingImmersion({ model, className }: Props) {
  const [timelineFocus, setTimelineFocus] = useState<string | null>(
    model.timeline[0]?.id ?? null,
  );
  const focusedEvent =
    model.timeline.find((e) => e.id === timelineFocus) ?? model.timeline[0];

  return (
    <div
      className={cn("space-y-6 text-[#e8eaef]", className)}
      data-executive-briefing-immersion="true"
      data-demonstration={model.demonstrationData ? "true" : "false"}
    >
      {/* Attention field — first viewport */}
      <section
        className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,white_10%,transparent)] bg-[#0a101c]"
        data-briefing-section="attention"
        aria-label="Organisation intelligence"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at 18% 20%, rgba(106,159,216,0.16), transparent 42%), radial-gradient(ellipse at 82% 70%, rgba(94,200,216,0.08), transparent 40%), linear-gradient(180deg, #0d1422 0%, #0a101c 55%)",
          }}
          aria-hidden
        />
        <div className="relative grid gap-8 p-5 md:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)] md:p-7 lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#6a9fd8]">
                {model.kicker}
              </p>
              <IntelligenceProvenanceBadge provenance="derived" />
              {model.demonstrationData ? (
                <span className="text-[0.62rem] uppercase tracking-[0.06em] text-[#c4785a]">
                  Demonstration fixture
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-[0.75rem] uppercase tracking-[0.1em] text-[#8b93a7]">
              {model.question}
            </p>
            <h2 className="mt-3 max-w-3xl text-[clamp(1.45rem,2.4vw,2.15rem)] font-semibold leading-[1.15] tracking-tight text-[#e8eaef]">
              {model.leadJudgement}
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[#9aa3b8]">
              {model.whyItMatters}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {model.priorityDecision ? (
                <Link
                  href={model.priorityDecision.href}
                  className="inline-flex items-center rounded-md border border-[#c4a35a]/70 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a] transition-colors hover:bg-[#c4a35a]/10"
                >
                  Open decision →
                </Link>
              ) : null}
              <a
                href="#briefing-map"
                className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c5cad6] hover:border-white/30"
              >
                Inspect geography
              </a>
              <a
                href="#briefing-knowledge"
                className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c5cad6] hover:border-white/30"
              >
                Explore knowledge
              </a>
            </div>
          </div>

          <div className="relative">
            <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
              Strategic signals
            </p>
            <ul className="mt-3 space-y-2">
              {model.metrics.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 backdrop-blur-sm"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[1.05rem] font-semibold tracking-tight",
                      TONE[m.tone],
                    )}
                  >
                    {m.value}
                  </p>
                  {m.caption ? (
                    <p className="mt-1 text-[0.72rem] text-[#7a869c]">{m.caption}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Priority decision + signals — denser decision panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-[12px] border border-[color-mix(in_srgb,#c4a35a_28%,transparent)] bg-[#0c121f] p-4"
          data-briefing-section="priority-decision"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#c4a35a]">
              Priority decision
            </p>
            {model.priorityDecision ? (
              <div className="flex flex-wrap gap-1.5 text-[0.62rem] uppercase tracking-[0.06em]">
                <span className="rounded border border-[#c4a35a]/40 px-1.5 py-0.5 text-[#c4a35a]">
                  {model.priorityDecision.statusLabel}
                </span>
                <IntelligenceProvenanceBadge provenance="derived" />
              </div>
            ) : null}
          </div>
          {model.priorityDecision ? (
            <>
              <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-tight">
                {model.priorityDecision.question}
              </h3>
              <p className="mt-1 text-[0.72rem] text-[#8b93a7]">
                {model.priorityDecision.confidenceLabel}
              </p>
              {model.recommendations.length > 0 ? (
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-1">
                  {model.recommendations.slice(0, 4).map((r) => (
                    <li
                      key={r}
                      className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[0.78rem] text-[#c5cad6]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={model.priorityDecision.href}
                className="mt-3 inline-flex text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a]"
              >
                Continue to Decision Intelligence →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#8b93a7]">
              No decision frame established from current evidence.
            </p>
          )}
        </section>

        <section
          className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-4"
          data-briefing-section="signals"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
            Emerging risks & opportunities
          </p>
          <ul className="mt-2.5 max-h-[16rem] space-y-2 overflow-y-auto pr-1">
            {model.signals.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "text-[0.58rem] uppercase tracking-[0.08em]",
                      s.kind === "risk"
                        ? "text-[#c4a35a]"
                        : s.kind === "opportunity"
                          ? "text-[#5ec8d8]"
                          : "text-[#6a9fd8]",
                    )}
                  >
                    {s.kind}
                  </span>
                  <IntelligenceProvenanceBadge provenance={s.provenance} />
                </div>
                <p className="mt-1 text-[0.85rem] font-medium leading-snug">
                  {s.title}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-[#8b93a7]">{s.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Forecast — taller, labelled values */}
      <section
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-briefing-section="forecast"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#6a9fd8]">
              Forecast intelligence
            </p>
            <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
              National forecast vs actual
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[0.68rem]">
            <span className="inline-flex items-center gap-1.5 text-[#9ab0d2]">
              <span className="h-2 w-3 rounded-sm bg-[#6a9fd8]" /> Forecast
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#5ec8d8]">
              <span className="h-2 w-3 rounded-sm bg-[#5ec8d8]" /> Actual
            </span>
            <IntelligenceProvenanceBadge provenance="derived" />
          </div>
        </div>
        <div className="mt-5 flex h-44 items-end gap-2 md:gap-3">
          {model.forecast.map((p) => {
            const max = Math.max(
              1,
              ...model.forecast.flatMap((x) => [x.forecast, x.actual]),
            );
            const fH = Math.max(8, (p.forecast / max) * 100);
            const aH = Math.max(8, (p.actual / max) * 100);
            return (
              <div
                key={p.period}
                className="group flex flex-1 flex-col items-center justify-end gap-1.5"
              >
                <div className="flex min-h-[1.1rem] w-full justify-center gap-1 text-[0.58rem] tabular-nums text-[#8b93a7] opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">
                  <span>{Math.round(p.forecast)}</span>
                  <span className="text-[#5ec8d8]">{Math.round(p.actual)}</span>
                </div>
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <span
                    className="w-[40%] max-w-[1.35rem] rounded-t bg-[#6a9fd8]/75 shadow-[0_0_12px_rgba(106,159,216,0.25)]"
                    style={{ height: `${fH}%` }}
                  />
                  <span
                    className="w-[40%] max-w-[1.35rem] rounded-t bg-[#5ec8d8] shadow-[0_0_12px_rgba(94,200,216,0.3)]"
                    style={{ height: `${aH}%` }}
                  />
                </div>
                <span className="text-[0.62rem] font-medium text-[#9aa3b8]">
                  {p.period.slice(2)}
                </span>
                {p.variancePct != null ? (
                  <span
                    className={cn(
                      "text-[0.58rem] tabular-nums",
                      Math.abs(p.variancePct) >= 15
                        ? "text-[#c4a35a]"
                        : "text-[#6d768a]",
                    )}
                  >
                    {p.variancePct > 0 ? "+" : ""}
                    {p.variancePct}%
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[0.65rem] text-[#6d768a]">{model.sourceLabel}</p>
      </section>

      {/* Global map — integrated intelligence surface */}
      <section id="briefing-map" data-briefing-section="map">
        <ManufacturingOperationsMapLazy
          model={model.map}
          initialView="australia"
        />
      </section>

      {/* Timeline — inspectable */}
      <section
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-briefing-section="timeline"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
          Executive intelligence timeline
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.85fr)]">
          <ol className="space-y-0">
            {model.timeline.map((ev, idx) => {
              const active = ev.id === (timelineFocus ?? focusedEvent?.id);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    className={cn(
                      "relative grid w-full grid-cols-[1.5rem_minmax(0,1fr)] gap-3 rounded-lg px-1 py-2 text-left transition-colors",
                      active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]",
                    )}
                    onClick={() => setTimelineFocus(ev.id)}
                  >
                    <span className="relative flex justify-center">
                      <span
                        className={cn(
                          "mt-1.5 h-2.5 w-2.5 rounded-full",
                          active
                            ? "bg-[#6a9fd8] shadow-[0_0_10px_rgba(106,159,216,0.65)]"
                            : "bg-[#3a4c6a]",
                        )}
                      />
                      {idx < model.timeline.length - 1 ? (
                        <span className="absolute top-5 bottom-0 w-px bg-white/10" />
                      ) : null}
                    </span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.88rem] font-medium">
                          {ev.label}
                        </span>
                        <IntelligenceProvenanceBadge provenance={ev.provenance} />
                      </span>
                      <span className="mt-1 block text-[0.75rem] text-[#8b93a7]">
                        {ev.detail}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {focusedEvent ? (
            <aside className="rounded-xl border border-[#6a9fd8]/25 bg-[color-mix(in_srgb,#6a9fd8_8%,transparent)] p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#6a9fd8]">
                Inspect signal
              </p>
              <p className="mt-2 text-[0.95rem] font-semibold leading-snug">
                {focusedEvent.label}
              </p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-[#c5cad6]">
                {focusedEvent.detail}
              </p>
              <p className="mt-3 text-[0.68rem] text-[#8b93a7]">
                Derived from manufacturing evidence — not live AI generation.
              </p>
              <a
                href="#briefing-knowledge"
                className="mt-3 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#6a9fd8]"
              >
                Open related knowledge →
              </a>
            </aside>
          ) : null}
        </div>
      </section>

      {/* Knowledge — preselect org for inspectability */}
      <section id="briefing-knowledge" data-briefing-section="knowledge">
        <KnowledgeNetworkExplorerLazy
          model={model.network}
          initialSelectedId="org"
        />
      </section>
    </div>
  );
}
