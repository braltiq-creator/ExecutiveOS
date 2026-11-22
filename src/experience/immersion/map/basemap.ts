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

/** Graphite / midnight intelligence palette applied after style load. */
export const GRAPHITE_BASEMAP_PAINT: Array<{
  id: string;
  property: string;
  value: unknown;
}> = [
  { id: "background", property: "background-color", value: "#07090e" },
  { id: "water", property: "fill-color", value: "#0b1220" },
  { id: "waterway", property: "line-color", value: "#152033" },
  { id: "water_name", property: "text-color", value: "#3d4f6a" },
  { id: "water_name", property: "text-halo-color", value: "#07090e" },
  { id: "landcover_ice_shelf", property: "fill-color", value: "#121722" },
  { id: "landcover_glacier", property: "fill-color", value: "#141a26" },
  { id: "landuse_residential", property: "fill-color", value: "#121722" },
  { id: "landcover_wood", property: "fill-color", value: "#10161f" },
  { id: "landuse_park", property: "fill-color", value: "#10161f" },
  { id: "building", property: "fill-color", value: "#161d2a" },
  { id: "building", property: "fill-outline-color", value: "#1c2433" },
  { id: "highway_path", property: "line-color", value: "#1a2230" },
  { id: "highway_minor", property: "line-color", value: "#1c2535" },
  { id: "highway_major_casing", property: "line-color", value: "#1e2838" },
  { id: "highway_major_inner", property: "line-color", value: "#243044" },
  { id: "highway_major_subtle", property: "line-color", value: "#1e2838" },
  { id: "highway_motorway_casing", property: "line-color", value: "#243044" },
  { id: "highway_motorway_inner", property: "line-color", value: "#2c3a52" },
  { id: "highway_motorway_subtle", property: "line-color", value: "#243044" },
  { id: "railway", property: "line-color", value: "#1a2230" },
  { id: "railway_minor", property: "line-color", value: "#1a2230" },
  { id: "railway_transit", property: "line-color", value: "#1a2230" },
  {
    id: "boundary_state",
    property: "line-color",
    value: "rgba(106, 159, 216, 0.28)",
  },
  { id: "boundary_state", property: "line-opacity", value: 0.85 },
  {
    id: "boundary_country_z0-4",
    property: "line-color",
    value: "rgba(154, 176, 210, 0.45)",
  },
  {
    id: "boundary_country_z5-",
    property: "line-color",
    value: "rgba(154, 176, 210, 0.55)",
  },
  { id: "place_country_major", property: "text-color", value: "#9ab0d2" },
  { id: "place_country_minor", property: "text-color", value: "#7f93b3" },
  { id: "place_country_other", property: "text-color", value: "#6d809e" },
  { id: "place_state", property: "text-color", value: "#6a9fd8" },
  { id: "place_city", property: "text-color", value: "#8b93a7" },
  { id: "place_city_large", property: "text-color", value: "#9aa3b8" },
  { id: "place_town", property: "text-color", value: "#6d768a" },
  { id: "place_village", property: "text-color", value: "#5a6578" },
  { id: "place_suburb", property: "text-color", value: "#5a6578" },
  { id: "place_other", property: "text-color", value: "#5a6578" },
  { id: "highway_name_other", property: "text-color", value: "#4a5568" },
  { id: "highway_name_motorway", property: "text-color", value: "#5a6a82" },
];

export type MapViewPresetId =
  | "world"
  | "australia"
  | "asia_pacific"
  | "europe"
  | "north_america";

export type MapViewPreset = {
  id: MapViewPresetId;
  label: string;
  longitude: number;
  latitude: number;
  zoom: number;
};

export const MAP_VIEW_PRESETS: Record<MapViewPresetId, MapViewPreset> = {
  world: {
    id: "world",
    label: "World",
    longitude: 20,
    latitude: 12,
    zoom: 1.35,
  },
  australia: {
    id: "australia",
    label: "Australia",
    longitude: 134.2,
    latitude: -26.8,
    zoom: 3.55,
  },
  asia_pacific: {
    id: "asia_pacific",
    label: "Asia-Pacific",
    longitude: 125,
    latitude: -5,
    zoom: 2.4,
  },
  europe: {
    id: "europe",
    label: "Europe",
    longitude: 10,
    latitude: 50,
    zoom: 3.2,
  },
  north_america: {
    id: "north_america",
    label: "North America",
    longitude: -100,
    latitude: 40,
    zoom: 2.8,
  },
};
