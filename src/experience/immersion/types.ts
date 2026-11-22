/**
 * Phase 2 immersion — presentation types only.
 * Provenance badges must reflect actual evidence paths — never decorative.
 */

export type IntelligenceProvenance =
  | "verified"
  | "derived"
  | "ai_generated"
  | "insufficient";

export type GeoResolution =
  | "coordinates_in_evidence"
  | "region_resolved"
  | "unplaced";

export type ImmersionMapMarkerKind = "region" | "factory" | "dealer";

export type ImmersionMapMarker = {
  id: string;
  kind: ImmersionMapMarkerKind;
  label: string;
  longitude: number;
  latitude: number;
  geoResolution: GeoResolution;
  provenance: IntelligenceProvenance;
  /** Region code when region-resolved (e.g. QLD). */
  regionCode?: string;
  tone?: "attention" | "watching" | "improving" | "intelligence" | "historical";
  detail?: string;
  metrics?: Array<{ label: string; value: string }>;
};

export type ImmersionRegionIntensity = {
  regionCode: string;
  /** Absolute variance intensity for choropleth (0–100). */
  intensity: number;
  variancePct: number | null;
  forecast: number;
  actual: number;
  provenance: IntelligenceProvenance;
  label: string;
};

export type ManufacturingOperationsMapModel = {
  title: string;
  question: string;
  regions: ImmersionRegionIntensity[];
  markers: ImmersionMapMarker[];
  unplaced: Array<{
    id: string;
    kind: ImmersionMapMarkerKind;
    label: string;
    reason: string;
  }>;
  honestyLabel: string;
  demonstrationData: boolean;
  sourceLabel: string;
};

export type ImmersionNetworkNode = {
  id: string;
  label: string;
  group: string;
  provenance: IntelligenceProvenance;
  summary?: string | null;
  /** Relative visual weight / hierarchy (Organisation highest). */
  val?: number;
  /** Why this entity matters in the current evidence set. */
  significance?: string | null;
  /** Evidence source rows / fields that justify presence. */
  evidenceSources?: string[];
  /** Demonstration / incomplete disclosure when applicable. */
  disclosure?: string | null;
};

export type ImmersionNetworkLink = {
  source: string;
  target: string;
  label: string;
  provenance: IntelligenceProvenance;
  /** Short explanation of why the edge exists. */
  basis?: string;
};

export type ImmersionNetworkModel = {
  title: string;
  nodes: ImmersionNetworkNode[];
  links: ImmersionNetworkLink[];
  sourceLabel: string;
  emptyReason?: string;
  demonstrationData?: boolean;
};
