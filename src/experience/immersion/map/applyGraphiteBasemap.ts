import type { Map as MapLibreMapInstance, StyleImageInterface } from "maplibre-gl";
import { GRAPHITE_BASEMAP_PAINT } from "@/experience/immersion/map/basemap";

/** Tiny empty sprite — prevents OpenFreeMap place layers from console-erroring when a named icon is briefly unavailable. */
function emptyStyleImage(size = 11): StyleImageInterface {
  const data = new Uint8Array(size * size * 4);
  return {
    width: size,
    height: size,
    data,
  };
}

const STYLE_IMAGE_FALLBACK_FLAG = "__eosBasemapImageFallback";

/**
 * OpenFreeMap dark style references `circle-11` on place layers.
 * Register a missing-image fallback so MapLibre does not emit console errors
 * that Next.js DevTools counts as "Issues".
 */
export function ensureBasemapStyleImages(map: MapLibreMapInstance): void {
  const ensure = (id: string) => {
    if (map.hasImage(id)) return;
    try {
      map.addImage(id, emptyStyleImage(11), { pixelRatio: 1 });
    } catch {
      // already added or style not ready
    }
  };

  ensure("circle-11");

  const flagged = map as MapLibreMapInstance & {
    [STYLE_IMAGE_FALLBACK_FLAG]?: boolean;
  };
  if (flagged[STYLE_IMAGE_FALLBACK_FLAG]) return;
  flagged[STYLE_IMAGE_FALLBACK_FLAG] = true;

  map.on("styleimagemissing", (e) => {
    if (typeof e?.id === "string" && e.id.length > 0) {
      ensure(e.id);
    }
  });
}

/** Retheme OpenFreeMap dark → ExecutiveOS graphite / midnight intelligence basemap. */
export function applyGraphiteBasemap(map: MapLibreMapInstance): void {
  ensureBasemapStyleImages(map);

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
