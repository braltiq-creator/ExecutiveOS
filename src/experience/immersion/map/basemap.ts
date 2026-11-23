/**
 * Global Intelligence Map basemap configuration.
 *
 * Provider: OpenFreeMap public vector tiles (OpenMapTiles schema).
 * - Commercial use allowed (MIT project; OSM data attribution required)
 * - No API key / no client secrets
 * - MapLibre attribution control displays required OSM/OpenMapTiles credit
 *
 * MapLibre is the renderer; OpenFreeMap supplies geographic tiles + base style.
 * We retheme paint properties at runtime to the ExecutiveOS graphite palette.
 *
 * Future option (documented, not required for Stage 1):
 * self-host weekly OpenFreeMap planet PMTiles / MBTiles if SLA is needed.
 */

export const OPENFREEMAP_DARK_STYLE_URL =
  "https://tiles.openfreemap.org/styles/dark";

export const BASEMAP_ATTRIBUTION =
  "© OpenFreeMap © OpenMapTiles Data from OpenStreetMap";

export const BASEMAP_PROVIDER_NOTE =
  "OpenFreeMap vector basemap · commercial-allowed · no API key · OSM attribution required";

/**
 * Graphite / midnight intelligence palette.
 * Higher land–ocean contrast and luminous border accents — no rainbow choropleth.
 */
export const GRAPHITE_BASEMAP_PAINT: Array<{
  id: string;
  property: string;
  value: unknown;
}> = [
  // Land shows through as background — lighter graphite for clear continents.
  { id: "background", property: "background-color", value: "#1c263a" },
  // Near-black midnight ocean for strong continental silhouette.
  { id: "water", property: "fill-color", value: "#04070f" },
  { id: "waterway", property: "line-color", value: "#1e2f4a" },
  { id: "water_name", property: "text-color", value: "#557299" },
  { id: "water_name", property: "text-halo-color", value: "#04070f" },
  { id: "landcover_ice_shelf", property: "fill-color", value: "#222c42" },
  { id: "landcover_glacier", property: "fill-color", value: "#243048" },
  { id: "landuse_residential", property: "fill-color", value: "#1e2a40" },
  { id: "landuse_residential", property: "fill-opacity", value: 0.65 },
  { id: "landcover_wood", property: "fill-color", value: "#1a2740" },
  { id: "landcover_wood", property: "fill-opacity", value: 0.4 },
  { id: "landuse_park", property: "fill-color", value: "#1a2740" },
  { id: "building", property: "fill-color", value: "#1e283c" },
  { id: "building", property: "fill-outline-color", value: "#2a3650" },
  { id: "highway_path", property: "line-color", value: "#243048" },
  { id: "highway_minor", property: "line-color", value: "#2a3650" },
  { id: "highway_major_casing", property: "line-color", value: "#31405c" },
  { id: "highway_major_inner", property: "line-color", value: "#3a4c6a" },
  { id: "highway_major_subtle", property: "line-color", value: "#31405c" },
  { id: "highway_motorway_casing", property: "line-color", value: "#3a4c6a" },
  { id: "highway_motorway_inner", property: "line-color", value: "#4a6088" },
  { id: "highway_motorway_subtle", property: "line-color", value: "#3a4c6a" },
  { id: "railway", property: "line-color", value: "#243048" },
  { id: "railway_minor", property: "line-color", value: "#243048" },
  { id: "railway_transit", property: "line-color", value: "#243048" },
  // State / country borders — luminous cyan-silver, not decorative neon.
  {
    id: "boundary_state",
    property: "line-color",
    value: "rgba(130, 180, 230, 0.55)",
  },
  { id: "boundary_state", property: "line-opacity", value: 1 },
  { id: "boundary_state", property: "line-width", value: 1.15 },
  {
    id: "boundary_country_z0-4",
    property: "line-color",
    value: "rgba(170, 200, 235, 0.72)",
  },
  { id: "boundary_country_z0-4", property: "line-width", value: 1.35 },
  { id: "boundary_country_z0-4", property: "line-opacity", value: 1 },
  {
    id: "boundary_country_z5-",
    property: "line-color",
    value: "rgba(180, 210, 240, 0.8)",
  },
  { id: "boundary_country_z5-", property: "line-width", value: 1.5 },
  { id: "boundary_country_z5-", property: "line-opacity", value: 1 },
  { id: "place_country_major", property: "text-color", value: "#c5d6ef" },
  { id: "place_country_major", property: "text-halo-color", value: "#0a101c" },
  { id: "place_country_major", property: "text-halo-width", value: 1.4 },
  { id: "place_country_minor", property: "text-color", value: "#9eb4d4" },
  { id: "place_country_other", property: "text-color", value: "#8799b8" },
  { id: "place_state", property: "text-color", value: "#8eb8e8" },
  { id: "place_state", property: "text-halo-color", value: "#0a101c" },
  { id: "place_state", property: "text-halo-width", value: 1.2 },
  { id: "place_city", property: "text-color", value: "#a8b4c8" },
  { id: "place_city_large", property: "text-color", value: "#b8c4d8" },
  { id: "place_town", property: "text-color", value: "#7a869c" },
  { id: "place_village", property: "text-color", value: "#667288" },
  { id: "place_suburb", property: "text-color", value: "#667288" },
  { id: "place_other", property: "text-color", value: "#667288" },
  { id: "highway_name_other", property: "text-color", value: "#556278" },
  { id: "highway_name_motorway", property: "text-color", value: "#6a7a94" },
];

export type MapViewPresetId =
  | "world"
  | "australia"
  | "asia_pacific"
  | "europe"
  | "north_america"
  | "au_nsw"
  | "au_qld"
  | "au_vic"
  | "au_sa"
  | "au_wa";

export type MapViewPreset = {
  id: MapViewPresetId;
  label: string;
  longitude: number;
  latitude: number;
  zoom: number;
  /** Optional pitch for subtle command depth (degrees). */
  pitch?: number;
  /** When true, shown in the AU regional drill strip rather than the primary nav. */
  regional?: boolean;
};

/** Primary theatre frames — continents readable, premium transitions. */
export const MAP_VIEW_PRESETS: Record<MapViewPresetId, MapViewPreset> = {
  world: {
    id: "world",
    label: "World",
    longitude: 15,
    latitude: 10,
    zoom: 1.55,
    pitch: 0,
  },
  australia: {
    id: "australia",
    label: "Australia",
    longitude: 134.5,
    latitude: -26.2,
    zoom: 3.75,
    pitch: 12,
  },
  asia_pacific: {
    id: "asia_pacific",
    label: "Asia-Pacific",
    longitude: 130,
    latitude: 2,
    zoom: 2.55,
    pitch: 8,
  },
  europe: {
    id: "europe",
    label: "Europe",
    longitude: 12,
    latitude: 50,
    zoom: 3.35,
    pitch: 10,
  },
  north_america: {
    id: "north_america",
    label: "North America",
    longitude: -98,
    latitude: 42,
    zoom: 2.95,
    pitch: 8,
  },
  // AU state / region drills — World → Australia → state → facility marker.
  au_nsw: {
    id: "au_nsw",
    label: "NSW",
    longitude: 147.0,
    latitude: -32.15,
    zoom: 5.35,
    pitch: 16,
    regional: true,
  },
  au_qld: {
    id: "au_qld",
    label: "QLD",
    longitude: 144.5,
    latitude: -22.5,
    zoom: 5.0,
    pitch: 16,
    regional: true,
  },
  au_vic: {
    id: "au_vic",
    label: "VIC",
    longitude: 144.9,
    latitude: -36.9,
    zoom: 5.6,
    pitch: 16,
    regional: true,
  },
  au_sa: {
    id: "au_sa",
    label: "SA",
    longitude: 135.5,
    latitude: -30.0,
    zoom: 5.1,
    pitch: 16,
    regional: true,
  },
  au_wa: {
    id: "au_wa",
    label: "WA",
    longitude: 122.0,
    latitude: -25.5,
    zoom: 4.85,
    pitch: 16,
    regional: true,
  },
};

export const PRIMARY_MAP_VIEW_IDS = (
  Object.keys(MAP_VIEW_PRESETS) as MapViewPresetId[]
).filter((id) => !MAP_VIEW_PRESETS[id].regional);

export const AU_REGIONAL_VIEW_IDS = (
  Object.keys(MAP_VIEW_PRESETS) as MapViewPresetId[]
).filter((id) => MAP_VIEW_PRESETS[id].regional);

/** Zoom level when drilling into a selected facility / dealer marker. */
export const MARKER_FOCUS_ZOOM = 6.2;
