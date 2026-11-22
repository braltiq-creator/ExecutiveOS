"use client";

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

      {/* Priority decision + signals */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section
          className="rounded-[12px] border border-[color-mix(in_srgb,#c4a35a_28%,transparent)] bg-[#0c121f] p-5"
          data-briefing-section="priority-decision"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#c4a35a]">
            Priority decision
          </p>
          {model.priorityDecision ? (
            <>
              <h3 className="mt-2 text-[1.15rem] font-semibold leading-snug tracking-tight">
                {model.priorityDecision.question}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.06em]">
                <span className="rounded border border-[#c4a35a]/40 px-1.5 py-0.5 text-[#c4a35a]">
                  {model.priorityDecision.statusLabel}
                </span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[#8b93a7]">
                  {model.priorityDecision.confidenceLabel}
                </span>
                <IntelligenceProvenanceBadge provenance="derived" />
              </div>
              {model.recommendations.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {model.recommendations.map((r) => (
                    <li
                      key={r}
                      className="border-l-2 border-[#6a9fd8]/35 pl-3 text-[0.8rem] text-[#c5cad6]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={model.priorityDecision.href}
                className="mt-5 inline-flex text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#c4a35a]"
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
          className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
          data-briefing-section="signals"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
            Emerging risks & opportunities
          </p>
          <ul className="mt-3 space-y-2.5">
            {model.signals.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
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
                <p className="mt-1 text-[0.88rem] font-medium leading-snug">
                  {s.title}
                </p>
                <p className="mt-1 text-[0.72rem] text-[#8b93a7]">{s.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Forecast strip */}
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
          <IntelligenceProvenanceBadge provenance="derived" />
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {model.forecast.map((p) => {
            const max = Math.max(
              1,
              ...model.forecast.flatMap((x) => [x.forecast, x.actual]),
            );
            return (
              <div
                key={p.period}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                title={`${p.period}: forecast ${Math.round(p.forecast)}, actual ${Math.round(p.actual)}`}
              >
                <div className="flex w-full items-end justify-center gap-0.5">
                  <span
                    className="w-[42%] rounded-t bg-[#6a9fd8]/45"
                    style={{ height: `${(p.forecast / max) * 100}%`, minHeight: 4 }}
                  />
                  <span
                    className="w-[42%] rounded-t bg-[#5ec8d8]/7"
                    style={{ height: `${(p.actual / max) * 100}%`, minHeight: 4 }}
                  />
                </div>
                <span className="text-[0.55rem] text-[#6d768a]">{p.period.slice(2)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[0.65rem] text-[#6d768a]">
          Blue = forecast · Cyan = actual · {model.sourceLabel}
        </p>
      </section>

      {/* Global map — connected geography */}
      <section id="briefing-map" data-briefing-section="map">
        <ManufacturingOperationsMapLazy
          model={model.map}
          initialView="australia"
        />
      </section>

      {/* Timeline */}
      <section
        className="rounded-[12px] border border-white/[0.08] bg-[#0c121f] p-5"
        data-briefing-section="timeline"
      >
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
          Executive intelligence timeline
        </p>
        <ol className="mt-4 space-y-0">
          {model.timeline.map((ev, idx) => (
            <li
              key={ev.id}
              className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-4"
            >
              <span className="relative flex justify-center">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#6a9fd8] shadow-[0_0_8px_rgba(106,159,216,0.55)]" />
                {idx < model.timeline.length - 1 ? (
                  <span className="absolute top-4 bottom-0 w-px bg-white/10" />
                ) : null}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.88rem] font-medium">{ev.label}</p>
                  <IntelligenceProvenanceBadge provenance={ev.provenance} />
                </div>
                <p className="mt-1 text-[0.75rem] text-[#8b93a7]">{ev.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Knowledge network — connected evidence */}
      <section id="briefing-knowledge" data-briefing-section="knowledge">
        <KnowledgeNetworkExplorerLazy model={model.network} />
      </section>
    </div>
  );
}
