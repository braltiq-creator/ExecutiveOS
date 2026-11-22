export type {
  GeoResolution,
  GlobalDemandPoint,
  GlobalIntelligenceMapModel,
  ImmersionMapMarker,
  ImmersionNetworkLink,
  ImmersionNetworkModel,
  ImmersionNetworkNode,
  ImmersionRegionIntensity,
  IntelligenceProvenance,
  ManufacturingOperationsMapModel,
} from "@/experience/immersion/types";

export type { IntelligenceMapLayerId } from "@/experience/immersion/map/layers";
export type { MapViewPresetId } from "@/experience/immersion/map/basemap";

export { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
export { projectManufacturingOperationsMap } from "@/experience/immersion/projectManufacturingMap";
export { ManufacturingOperationsMapLazy } from "@/experience/immersion/ManufacturingOperationsMapLazy";
export { GlobalIntelligenceMapLazy } from "@/experience/immersion/map/GlobalIntelligenceMapLazy";
export { KnowledgeNetworkExplorerLazy } from "@/experience/immersion/KnowledgeNetworkExplorerLazy";
export { projectManufacturingEvidenceNetwork } from "@/experience/immersion/projectManufacturingNetwork";
export {
  INTELLIGENCE_MAP_LAYERS,
  defaultLayerState,
} from "@/experience/immersion/map/layers";
export {
  MAP_VIEW_PRESETS,
  OPENFREEMAP_DARK_STYLE_URL,
  BASEMAP_PROVIDER_NOTE,
} from "@/experience/immersion/map/basemap";
export {
  AU_REGION_CENTROIDS,
  REGION_RESOLVED_HONESTY,
  centroidForRegion,
  resolveAuRegionCode,
} from "@/experience/immersion/geo/au-regions";
