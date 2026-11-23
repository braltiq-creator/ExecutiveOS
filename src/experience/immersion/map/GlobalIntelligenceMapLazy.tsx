"use client";

import dynamic from "next/dynamic";
import type { MapViewPresetId } from "@/experience/immersion/map/basemap";
import type { IntelligenceMapLayerId } from "@/experience/immersion/map/layers";
import type { GlobalIntelligenceMapModel } from "@/experience/immersion/types";

const GlobalIntelligenceMap = dynamic(
  () =>
    import("@/experience/immersion/map/GlobalIntelligenceMap").then(
      (m) => m.GlobalIntelligenceMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[360px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)] bg-[#12151c]"
        data-global-intelligence-map="loading"
      >
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          Loading global intelligence map…
        </p>
      </div>
    ),
  },
);

type Props = {
  model: GlobalIntelligenceMapModel;
  className?: string;
  compact?: boolean;
  initialSelectedId?: string | null;
  initialView?: MapViewPresetId;
  forceLayers?: Partial<Record<IntelligenceMapLayerId, boolean>>;
};

export function GlobalIntelligenceMapLazy(props: Props) {
  return <GlobalIntelligenceMap {...props} />;
}
