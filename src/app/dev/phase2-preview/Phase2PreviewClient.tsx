"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { UdgCanonicalRecord } from "@/data-gateway";
import {
  ManufacturingOperationsMapLazy,
  KnowledgeNetworkExplorerLazy,
  projectManufacturingEvidenceNetwork,
  projectManufacturingOperationsMap,
} from "@/experience/immersion";
import { DEMO_MANUFACTURING_RECORDS } from "./demo-records";

export function Phase2PreviewClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const selectParam = searchParams.get("select");
  const [tab, setTab] = useState<"map" | "network">(
    tabParam === "network" ? "network" : "map",
  );

  const analysis = useMemo(
    () =>
      analyseManufacturingSnapshot([
        ...(DEMO_MANUFACTURING_RECORDS as unknown as UdgCanonicalRecord[]),
      ]),
    [],
  );
  const mapModel = useMemo(
    () => projectManufacturingOperationsMap(analysis),
    [analysis],
  );
  const networkModel = useMemo(
    () => projectManufacturingEvidenceNetwork(analysis),
    [analysis],
  );

  return (
    <div
      className="min-h-screen bg-[#0a0c10] px-4 py-6 text-[#e8eaef] md:px-8"
      data-phase2-preview="true"
    >
      <header className="mx-auto mb-6 max-w-[1280px]">
        <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[#6a9fd8]">
          Phase 2 preview · development only
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
          Immersion instruments — manufacturing fixture
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#8b93a7]">
          Real <code>analyseManufacturingSnapshot</code> on the demo forecast CSV
          shape. <strong className="font-medium text-[#e0b4a4]">Demonstration
          fixture — not live customer intelligence.</strong> Not mock Northline.
          Not a production deploy surface.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`rounded border px-3 py-1.5 text-sm ${
              tab === "map"
                ? "border-[#6a9fd8] text-[#e8eaef]"
                : "border-white/10 text-[#8b93a7]"
            }`}
            onClick={() => setTab("map")}
          >
            Manufacturing map
          </button>
          <button
            type="button"
            className={`rounded border px-3 py-1.5 text-sm ${
              tab === "network"
                ? "border-[#6a9fd8] text-[#e8eaef]"
                : "border-white/10 text-[#8b93a7]"
            }`}
            onClick={() => setTab("network")}
          >
            Knowledge network
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px]">
        {tab === "map" ? (
          <ManufacturingOperationsMapLazy
            model={mapModel}
            initialSelectedId={selectParam}
          />
        ) : (
          <KnowledgeNetworkExplorerLazy
            model={networkModel}
            initialSelectedId={selectParam}
          />
        )}
      </main>
    </div>
  );
}
