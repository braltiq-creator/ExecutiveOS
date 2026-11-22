import type { Map as MapLibreMapInstance } from "maplibre-gl";
import { GRAPHITE_BASEMAP_PAINT } from "@/experience/immersion/map/basemap";

/** Retheme OpenFreeMap dark → ExecutiveOS graphite / midnight intelligence basemap. */
export function applyGraphiteBasemap(map: MapLibreMapInstance): void {
  for (const paint of GRAPHITE_BASEMAP_PAINT) {
    if (!map.getLayer(paint.id)) continue;
    try {
      map.setPaintProperty(
        paint.id,
        paint.property as never,
        paint.value as never,
      );
    } catch {
      // Layer may not support the property in a future style revision — skip safely.
    }
  }

  // Natural Earth shaded relief — keep a whisper of land texture for depth.
  try {
    const style = map.getStyle();
    for (const layer of style?.layers ?? []) {
      if (layer.type === "raster" && layer.source === "ne2_shaded") {
        map.setPaintProperty(layer.id, "raster-opacity", 0.38);
        map.setPaintProperty(layer.id, "raster-saturation", -0.95);
        map.setPaintProperty(layer.id, "raster-contrast", 0.28);
        map.setPaintProperty(layer.id, "raster-brightness-min", 0.12);
        map.setPaintProperty(layer.id, "raster-brightness-max", 0.62);
      }
    }
  } catch {
    // optional
  }
}
