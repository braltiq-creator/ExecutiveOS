"use client";

import { useMemo, useState } from "react";
import { analyseManufacturingSnapshot } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { UdgCanonicalRecord } from "@/data-gateway";
import {
  ManufacturingOperationsMapLazy,
  projectManufacturingOperationsMap,
} from "@/experience/immersion";
import {
  KnowledgeNetworkExplorerLazy,
  projectManufacturingEvidenceNetwork,
} from "@/experience/immersion";

/**
 * Loads demo manufacturing CSV via fetch from /fixtures path is not public —
 * embed a minimal parse of the known fixture through dynamic import of raw text
 * is awkward in client. Instead: call a tiny API route... or parse inline.
 *
 * Client preview fetches the fixture from the repo public copy if present;
 * otherwise uses a server-built snapshot injected as JSON from a sibling module.
 */
import { DEMO_MANUFACTURING_RECORDS } from "./demo-records";

export function Phase2PreviewClient() {
  const [tab, setTab] = useState<"map" | "network">("map");

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
      className="min-h-screen bg-[#0a0c10] px-4 py-6 text-[#e8eaef]"
      data-phase2-preview="true"
    >
      <header className="mx-auto mb-6 max-w-[1200px]">
        <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[#6a9fd8]">
          Phase 2 preview · development only
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Immersion instruments — manufacturing fixture
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#8b93a7]">
          Real `analyseManufacturingSnapshot` on the demo forecast CSV shape.
          Demonstration disclosure active. Not mock Northline. Not production
          deploy surface.
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

      <main className="mx-auto max-w-[1200px]">
        {tab === "map" ? (
          <ManufacturingOperationsMapLazy model={mapModel} />
        ) : (
          <KnowledgeNetworkExplorerLazy model={networkModel} />
        )}
      </main>
    </div>
  );
}
