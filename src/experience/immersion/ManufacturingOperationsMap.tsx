"use client";

/**
 * Manufacturing domain surface over the reusable Global Intelligence Map.
 * Domain projection stays in projectManufacturingMap; cartography is shared.
 */

import { GlobalIntelligenceMap } from "@/experience/immersion/map/GlobalIntelligenceMap";
import type { MapViewPresetId } from "@/experience/immersion/map/basemap";
import type { IntelligenceMapLayerId } from "@/experience/immersion/map/layers";
import type { ManufacturingOperationsMapModel } from "@/experience/immersion/types";

type Props = {
  model: ManufacturingOperationsMapModel;
  className?: string;
  compact?: boolean;
  initialSelectedId?: string | null;
  initialView?: MapViewPresetId;
  forceLayers?: Partial<Record<IntelligenceMapLayerId, boolean>>;
};

export function ManufacturingOperationsMap(props: Props) {
  return <GlobalIntelligenceMap {...props} />;
}
