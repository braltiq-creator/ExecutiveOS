/**
 * Presentation-only AU state reference geometry.
 * Not organisational evidence — used solely to place region-resolved markers
 * when lat/lng are absent from the manufacturing UDG contract.
 */

export type AuRegionCode = "NSW" | "QLD" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type AuRegionCentroid = {
  code: AuRegionCode;
  label: string;
  longitude: number;
  latitude: number;
};

/** Centroids for region-resolved placement. */
export const AU_REGION_CENTROIDS: Record<string, AuRegionCentroid> = {
  NSW: { code: "NSW", label: "New South Wales", longitude: 147.0, latitude: -32.15 },
  QLD: { code: "QLD", label: "Queensland", longitude: 144.5, latitude: -22.5 },
  VIC: { code: "VIC", label: "Victoria", longitude: 144.9, latitude: -36.9 },
  SA: { code: "SA", label: "South Australia", longitude: 135.5, latitude: -30.0 },
  WA: { code: "WA", label: "Western Australia", longitude: 122.0, latitude: -25.5 },
  TAS: { code: "TAS", label: "Tasmania", longitude: 146.6, latitude: -42.0 },
  NT: { code: "NT", label: "Northern Territory", longitude: 133.4, latitude: -19.5 },
  ACT: { code: "ACT", label: "Australian Capital Territory", longitude: 149.12, latitude: -35.28 },
};

export const REGION_RESOLVED_HONESTY =
  "REGION-RESOLVED · COORDINATES NOT IN EVIDENCE";

/** Normalise region labels from manufacturing evidence to AU codes when possible. */
export function resolveAuRegionCode(raw: string): string | null {
  const t = raw.trim().toUpperCase();
  if (!t || t === "(UNSPECIFIED)") return null;
  if (AU_REGION_CENTROIDS[t]) return t;
  const aliases: Record<string, string> = {
    "NEW SOUTH WALES": "NSW",
    QUEENSLAND: "QLD",
    VICTORIA: "VIC",
    "SOUTH AUSTRALIA": "SA",
    "WESTERN AUSTRALIA": "WA",
    TASMANIA: "TAS",
    "NORTHERN TERRITORY": "NT",
  };
  return aliases[t] ?? null;
}

export function centroidForRegion(raw: string): AuRegionCentroid | null {
  const code = resolveAuRegionCode(raw);
  if (!code) return null;
  return AU_REGION_CENTROIDS[code] ?? null;
}

/**
 * Simplified AU mainland + TAS outline polygons for choropleth fills.
 * Approximate presentation geometry — not survey-grade boundaries.
 */
export const AU_STATES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    poly("WA", [
      [113.5, -35.5],
      [129.0, -35.5],
      [129.0, -13.5],
      [113.5, -13.5],
      [113.5, -35.5],
    ]),
    poly("NT", [
      [129.0, -26.0],
      [138.0, -26.0],
      [138.0, -10.8],
      [129.0, -10.8],
      [129.0, -26.0],
    ]),
    poly("SA", [
      [129.0, -38.2],
      [141.0, -38.2],
      [141.0, -26.0],
      [129.0, -26.0],
      [129.0, -38.2],
    ]),
    poly("QLD", [
      [138.0, -29.0],
      [153.6, -29.0],
      [153.6, -10.5],
      [138.0, -10.5],
      [138.0, -29.0],
    ]),
    poly("NSW", [
      [141.0, -37.6],
      [153.7, -37.6],
      [153.7, -28.1],
      [141.0, -28.1],
      [141.0, -37.6],
    ]),
    poly("VIC", [
      [140.9, -39.2],
      [150.1, -39.2],
      [150.1, -33.9],
      [140.9, -33.9],
      [140.9, -39.2],
    ]),
    poly("TAS", [
      [144.5, -43.8],
      [148.5, -43.8],
      [148.5, -40.5],
      [144.5, -40.5],
      [144.5, -43.8],
    ]),
    poly("ACT", [
      [148.9, -35.5],
      [149.3, -35.5],
      [149.3, -35.1],
      [148.9, -35.1],
      [148.9, -35.5],
    ]),
  ],
};

function poly(
  code: string,
  coordinates: number[][],
): GeoJSON.Feature<GeoJSON.Polygon> {
  return {
    type: "Feature",
    properties: { regionCode: code },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

/** Slight jitter so multiple markers in one region remain selectable. */
export function offsetAroundCentroid(
  centroid: AuRegionCentroid,
  index: number,
  kind: "factory" | "dealer",
): { longitude: number; latitude: number } {
  const ring = kind === "factory" ? 0.55 : 0.95;
  const angle = (index * 2.4) % (Math.PI * 2);
  return {
    longitude: centroid.longitude + Math.cos(angle) * ring,
    latitude: centroid.latitude + Math.sin(angle) * ring * 0.7,
  };
}
