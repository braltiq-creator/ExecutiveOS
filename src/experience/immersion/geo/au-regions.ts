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
 * Shapes are intentionally recognizable as Australian states (not bounding boxes).
 */
export const AU_STATES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // Western Australia — west coast + inland border at 129°E
    poly("WA", [
      [113.2, -21.9],
      [114.1, -22.6],
      [113.9, -24.0],
      [113.5, -26.0],
      [114.0, -28.2],
      [114.6, -30.0],
      [115.0, -31.8],
      [115.7, -33.6],
      [116.5, -34.8],
      [118.0, -35.1],
      [119.5, -34.4],
      [121.5, -33.9],
      [123.5, -33.8],
      [125.5, -32.5],
      [128.0, -31.8],
      [129.0, -31.7],
      [129.0, -14.9],
      [128.0, -14.0],
      [126.5, -13.8],
      [124.5, -15.0],
      [123.0, -16.5],
      [122.0, -17.5],
      [121.0, -18.8],
      [119.5, -19.8],
      [117.5, -20.5],
      [116.0, -20.8],
      [114.5, -21.5],
      [113.2, -21.9],
    ]),
    // Northern Territory
    poly("NT", [
      [129.0, -25.9],
      [138.0, -25.9],
      [138.0, -16.0],
      [137.2, -15.0],
      [136.5, -12.5],
      [135.5, -12.0],
      [134.0, -11.8],
      [132.8, -11.5],
      [131.5, -11.3],
      [130.5, -12.0],
      [129.8, -13.5],
      [129.0, -14.9],
      [129.0, -25.9],
    ]),
    // South Australia
    poly("SA", [
      [129.0, -31.7],
      [129.0, -26.0],
      [141.0, -26.0],
      [141.0, -34.0],
      [140.5, -35.5],
      [139.8, -36.5],
      [138.5, -37.0],
      [137.5, -36.0],
      [136.5, -35.2],
      [135.5, -34.8],
      [134.5, -34.5],
      [133.0, -32.5],
      [132.0, -32.0],
      [130.5, -31.8],
      [129.0, -31.7],
    ]),
    // Queensland — Cape York + east coast
    poly("QLD", [
      [138.0, -26.0],
      [141.0, -26.0],
      [141.0, -29.0],
      [149.0, -29.0],
      [150.5, -28.0],
      [152.0, -27.0],
      [153.2, -26.0],
      [153.5, -25.0],
      [153.2, -23.5],
      [151.5, -22.0],
      [150.0, -20.5],
      [148.5, -19.5],
      [147.0, -18.5],
      [146.0, -17.0],
      [145.5, -15.5],
      [145.2, -14.0],
      [144.0, -14.2],
      [143.0, -12.5],
      [142.5, -11.0],
      [142.2, -10.7],
      [141.5, -11.5],
      [141.0, -12.5],
      [141.5, -15.0],
      [141.0, -16.5],
      [139.5, -17.5],
      [138.5, -17.8],
      [138.0, -16.0],
      [138.0, -26.0],
    ]),
    // New South Wales
    poly("NSW", [
      [141.0, -29.0],
      [149.0, -29.0],
      [150.5, -30.0],
      [152.0, -31.0],
      [153.0, -31.5],
      [153.5, -32.5],
      [152.8, -33.5],
      [151.5, -34.0],
      [150.5, -35.5],
      [150.0, -36.5],
      [149.5, -37.5],
      [148.0, -37.5],
      [146.5, -36.5],
      [144.5, -35.5],
      [143.0, -34.5],
      [141.0, -34.0],
      [141.0, -29.0],
    ]),
    // Victoria
    poly("VIC", [
      [141.0, -34.0],
      [143.0, -34.5],
      [144.5, -35.5],
      [146.5, -36.5],
      [148.0, -37.5],
      [149.5, -37.5],
      [149.9, -37.7],
      [149.5, -38.5],
      [147.5, -38.8],
      [146.0, -39.0],
      [144.5, -38.5],
      [143.5, -38.8],
      [142.0, -38.4],
      [141.0, -38.0],
      [141.0, -34.0],
    ]),
    // Tasmania
    poly("TAS", [
      [144.6, -40.7],
      [146.0, -40.6],
      [147.5, -40.8],
      [148.3, -41.2],
      [148.2, -42.0],
      [147.8, -43.0],
      [147.0, -43.5],
      [146.0, -43.6],
      [145.2, -43.2],
      [144.7, -42.5],
      [144.6, -41.5],
      [144.6, -40.7],
    ]),
    // ACT (small inset — approximate)
    poly("ACT", [
      [148.95, -35.15],
      [149.25, -35.15],
      [149.25, -35.45],
      [148.95, -35.45],
      [148.95, -35.15],
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

/**
 * Spread markers around a regional centroid so they remain selectable
 * without implying precise facility coordinates.
 */
export function offsetAroundCentroid(
  centroid: AuRegionCentroid,
  index: number,
  kind: "factory" | "dealer",
): { longitude: number; latitude: number } {
  const ring = kind === "factory" ? 1.15 : 1.85;
  const angle = (index * 2.15 + (kind === "dealer" ? 0.55 : 0)) % (Math.PI * 2);
  return {
    longitude: centroid.longitude + Math.cos(angle) * ring,
    latitude: centroid.latitude + Math.sin(angle) * ring * 0.72,
  };
}
