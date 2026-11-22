"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { UdgCanonicalRecord } from "@/data-gateway";
import {
  ManufacturingOperationsMapLazy,
  KnowledgeNetworkExplorerLazy,
  ExecutiveBriefingImmersion,
  DecisionIntelligenceImmersion,
  projectManufacturingEvidenceNetwork,
  projectManufacturingOperationsMap,
  projectManufacturingExecutiveBriefing,
  projectManufacturingDecisionIntelligence,
  type IntelligenceMapLayerId,
  type MapViewPresetId,
} from "@/experience/immersion";
import {
  PHASE2_PREVIEW_SNAPSHOT_ID,
  findPriorityManufacturingDecision,
  resolvePhase2PreviewPortfolio,
} from "@/experience/immersion/phase2/phase2PreviewPortfolio";
import { usePortfolioStore } from "@/store/portfolio-store";
import { DEMO_MANUFACTURING_RECORDS } from "./demo-records";

const VIEW_IDS = new Set<MapViewPresetId>([
  "world",
  "australia",
  "asia_pacific",
  "europe",
  "north_america",
  "au_nsw",
  "au_qld",
  "au_vic",
  "au_sa",
  "au_wa",
]);

type Tab = "map" | "network" | "briefing" | "decisions";

/**
 * Stage 4 — connected Phase 2 preview.
 * Hydrates the Decision Engine portfolio from manufacturing analysis and the
 * existing portfolio store / UI cache so recorded decisions survive refresh.
 */
export function Phase2PreviewClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const selectParam = searchParams.get("select");
  const viewParam = searchParams.get("view");
  const layersParam = searchParams.get("layers");
  const initialTab: Tab =
    tabParam === "network"
      ? "network"
      : tabParam === "briefing"
        ? "briefing"
        : tabParam === "decisions"
          ? "decisions"
          : "map";
  const [tab, setTab] = useState<Tab>(initialTab);

  const portfolio = usePortfolioStore((s) => s.portfolio);
  const loadExternalPortfolio = usePortfolioStore((s) => s.loadExternalPortfolio);
  const hydrated = usePortfolioStore((s) => s.hydrated);

  const initialView: MapViewPresetId | undefined =
    viewParam && VIEW_IDS.has(viewParam as MapViewPresetId)
      ? (viewParam as MapViewPresetId)
      : undefined;

  const forceLayers = useMemo(() => {
    if (!layersParam) return undefined;
    const force: Partial<Record<IntelligenceMapLayerId, boolean>> = {};
    for (const raw of layersParam.split(",")) {
      const id = raw.trim() as IntelligenceMapLayerId;
      if (id) force[id] = true;
    }
    return Object.keys(force).length > 0 ? force : undefined;
  }, [layersParam]);

  const analysis = useMemo(
    () =>
      analyseManufacturingSnapshot([
        ...(DEMO_MANUFACTURING_RECORDS as unknown as UdgCanonicalRecord[]),
      ]),
    [],
  );

  useEffect(() => {
    const seed = resolvePhase2PreviewPortfolio(analysis);
    loadExternalPortfolio(seed, {
      snapshotId: PHASE2_PREVIEW_SNAPSHOT_ID,
      persist: true,
    });
  }, [analysis, loadExternalPortfolio]);

  const decisionModel = useMemo(
    () => projectManufacturingDecisionIntelligence(analysis),
    [analysis],
  );

  const liveDecision = useMemo(
    () =>
      findPriorityManufacturingDecision(portfolio, decisionModel.decisionId),
    [portfolio, decisionModel.decisionId],
  );

  const mapModel = useMemo(
    () => projectManufacturingOperationsMap(analysis),
    [analysis],
  );
  const networkModel = useMemo(
    () => projectManufacturingEvidenceNetwork(analysis),
    [analysis],
  );
  const briefingModel = useMemo(
    () =>
      projectManufacturingExecutiveBriefing(analysis, {
        liveDecision,
        decisionHref: "/dev/phase2-preview?tab=decisions",
      }),
    [analysis, liveDecision],
  );

  return (
    <div
      className="min-h-screen bg-[#07090e] px-4 py-6 text-[#e8eaef] md:px-8"
      data-phase2-preview="true"
      data-phase2-hydrated={hydrated ? "true" : "false"}
      data-phase2-decision-recorded={
        liveDecision?.executiveRecording ? "true" : "false"
      }
    >
      <header className="mx-auto mb-5 max-w-[1440px]">
        <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[#6a9fd8]">
          Phase 2 preview · Stage 4 integration · development only
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
          Connected ExecutiveOS instruments — manufacturing fixture
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#8b93a7]">
          Briefing · Decision Intelligence · Knowledge · Map share one Decision
          Engine portfolio. Recorded decisions persist through the existing
          store / pilot path (preview UI cache).{" "}
          <strong className="font-medium text-[#e0b4a4]">
            Demonstration fixture — not live customer intelligence.
          </strong>
        </p>
        {liveDecision?.executiveRecording ? (
          <p className="mt-2 text-[0.75rem] text-[#5ec8d8]">
            Durable recording present · {liveDecision.selectedAlternativeLabel}{" "}
            · refresh-safe in this preview session
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["map", "Global intelligence map"],
              ["briefing", "Executive briefing"],
              ["decisions", "Decision intelligence"],
              ["network", "Knowledge network"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`rounded border px-3 py-1.5 text-sm ${
                tab === id
                  ? "border-[#6a9fd8] text-[#e8eaef]"
                  : "border-white/10 text-[#8b93a7]"
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px]">
        {tab === "map" ? (
          <ManufacturingOperationsMapLazy
            model={mapModel}
            initialSelectedId={selectParam}
            initialView={initialView}
            forceLayers={forceLayers}
          />
        ) : null}
        {tab === "briefing" ? (
          <ExecutiveBriefingImmersion
            model={briefingModel}
            onOpenDecision={() => setTab("decisions")}
          />
        ) : null}
        {tab === "decisions" ? (
          <DecisionIntelligenceImmersion
            model={decisionModel}
            liveDecision={liveDecision}
            briefingHref="/dev/phase2-preview?tab=briefing"
          />
        ) : null}
        {tab === "network" ? (
          <KnowledgeNetworkExplorerLazy
            model={networkModel}
            initialSelectedId={selectParam}
          />
        ) : null}
      </main>
    </div>
  );
}
