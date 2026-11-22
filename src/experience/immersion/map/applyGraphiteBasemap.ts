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

  // Soften Natural Earth shaded relief if present (low-zoom land texture).
  if (map.getLayer("ne2_shaded") || map.getSource("ne2_shaded")) {
    try {
      // Some styles expose the raster as a layer with id matching source usage.
      const style = map.getStyle();
      for (const layer of style?.layers ?? []) {
        if (layer.type === "raster" && layer.source === "ne2_shaded") {
          map.setPaintProperty(layer.id, "raster-opacity", 0.18);
          map.setPaintProperty(layer.id, "raster-saturation", -0.85);
          map.setPaintProperty(layer.id, "raster-brightness-min", 0.05);
          map.setPaintProperty(layer.id, "raster-brightness-max", 0.45);
        }
      }
    } catch {
      // optional
    }
  }
}
