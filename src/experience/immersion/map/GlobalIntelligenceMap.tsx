"use client";

import { useEffect, useMemo, useState } from "react";
import { setWorkerUrl } from "maplibre-gl";
import MapLibreMap, {
  Layer,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import {
  applyGraphiteBasemap,
  ensureBasemapStyleImages,
} from "@/experience/immersion/map/applyGraphiteBasemap";
import {
  AU_REGIONAL_VIEW_IDS,
  BASEMAP_PROVIDER_NOTE,
  MAP_VIEW_PRESETS,
  MARKER_FOCUS_ZOOM,
  OPENFREEMAP_DARK_STYLE_URL,
  PRIMARY_MAP_VIEW_IDS,
  type MapViewPresetId,
} from "@/experience/immersion/map/basemap";
import {
  INTELLIGENCE_MAP_LAYERS,
  defaultLayerState,
  type IntelligenceMapLayerId,
} from "@/experience/immersion/map/layers";
import type {
  GeoResolution,
  GlobalIntelligenceMapModel,
  ImmersionMapMarker,
} from "@/experience/immersion/types";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

const MARKER_FILL: Record<string, string> = {
  attention: "#c4a35a",
  watching: "#6a9fd8",
  improving: "#5ec8d8",
  intelligence: "#6a9fd8",
  historical: "#5a6578",
};

type Props = {
  model: GlobalIntelligenceMapModel;
  className?: string;
  compact?: boolean;
  initialSelectedId?: string | null;
  initialView?: MapViewPresetId;
  /** Force-enable a layer (e.g. demand for review screenshots). */
  forceLayers?: Partial<Record<IntelligenceMapLayerId, boolean>>;
};

export function GlobalIntelligenceMap({
  model,
  className,
  compact = false,
  initialSelectedId = null,
  initialView,
  forceLayers,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [viewId, setViewId] = useState<MapViewPresetId>(
    initialView ?? model.defaultView,
  );
  const [layersOpen, setLayersOpen] = useState(false);
  const [layers, setLayers] = useState(() => {
    if (!forceLayers || Object.keys(forceLayers).length === 0) {
      return defaultLayerState();
    }
    const next = defaultLayerState();
    for (const key of Object.keys(next) as IntelligenceMapLayerId[]) {
      next[key] = Boolean(forceLayers[key]);
    }
    return next;
  });
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [styleReady, setStyleReady] = useState(false);

  const selected = model.markers.find((m) => m.id === selectedId) ?? null;
  const view = MAP_VIEW_PRESETS[viewId];
  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  // Register sprite fallbacks as soon as the MapLibre instance exists —
  // styleimagemissing can fire before onLoad while OpenFreeMap place icons resolve.
  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();
    if (!map) return;
    ensureBasemapStyleImages(map);
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef || !styleReady) return;
    mapRef.flyTo({
      center: [view.longitude, view.latitude],
      zoom: view.zoom,
      pitch: view.pitch ?? 0,
      bearing: 0,
      duration: 1400,
      essential: true,
    });
  }, [mapRef, styleReady, view.latitude, view.longitude, view.pitch, view.zoom]);

  useEffect(() => {
    if (!mapRef || !styleReady || !selected) return;
    mapRef.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: Math.max(mapRef.getZoom(), MARKER_FOCUS_ZOOM),
      pitch: 18,
      duration: 1100,
      essential: true,
    });
  }, [mapRef, selected, styleReady]);

  const demandGeoJson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: model.demandPoints.map((p) => ({
        type: "Feature" as const,
        properties: {
          weight: p.weight,
          label: p.label,
          id: p.id,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [p.longitude, p.latitude],
        },
      })),
    };
  }, [model.demandPoints]);

  const visibleMarkers = useMemo(() => {
    return model.markers.filter((m) => {
      const owns = m.layers ?? inferLayers(m);
      return owns.some((layerId) => layers[layerId]);
    });
  }, [model.markers, layers]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[12px] border border-[color-mix(in_srgb,white_10%,transparent)]",
        "bg-[#0a101c]",
        className,
      )}
      data-global-intelligence-map="true"
      data-manufacturing-operations-map={
        model.domain === "manufacturing" ? "true" : undefined
      }
      data-domain={model.domain}
      data-demonstration={model.demonstrationData ? "true" : "false"}
      aria-label={model.title}
    >
      {/* Compact command chrome */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[color-mix(in_srgb,white_8%,transparent)] bg-[color-mix(in_srgb,#0a101c_92%,transparent)] px-4 py-2.5 backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#6a9fd8]">
            Global intelligence map
            {model.domain ? ` · ${model.domain}` : ""}
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[1.05rem] font-semibold tracking-tight text-[#e8eaef]">
              {model.title}
            </h3>
            <p className="text-[0.75rem] text-[#8b93a7]">{model.question}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IntelligenceProvenanceBadge provenance="derived" />
          <span
            className="inline-flex items-center rounded-[4px] border border-[color-mix(in_srgb,#c4a35a_50%,transparent)] px-1.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.06em] text-[#c4a35a]"
            data-geo-honesty="true"
          >
            {model.honestyLabel}
          </span>
        </div>
      </div>

      {model.demonstrationData ? (
        <div
          className="relative z-20 border-b border-[color-mix(in_srgb,#c4785a_30%,transparent)] bg-[color-mix(in_srgb,#c4785a_9%,transparent)] px-4 py-1.5 text-[0.72rem] text-[#e0b4a4]"
          data-demo-disclosure="true"
        >
          Demonstration fixture — not live customer intelligence. Approximate
          placements use regional reference centroids; verified facility
          coordinates are not in evidence for this dataset.
        </div>
      ) : null}

      {/* Immersive map stage — centerpiece */}
      <div
        className={cn(
          "relative",
          compact ? "h-[420px]" : "h-[min(82vh,760px)] min-h-[560px]",
        )}
        data-map-canvas="true"
      >
        <MapLibreMap
          ref={setMapRef}
          initialViewState={{
            longitude: view.longitude,
            latitude: view.latitude,
            zoom: view.zoom,
            pitch: view.pitch ?? 0,
          }}
          mapStyle={OPENFREEMAP_DARK_STYLE_URL}
          attributionControl={{ compact: true }}
          style={{ width: "100%", height: "100%" }}
          cooperativeGestures
          maxPitch={45}
          onLoad={(e) => {
            applyGraphiteBasemap(e.target);
            setStyleReady(true);
          }}
          onClick={() => setSelectedId(null)}
        >
          <NavigationControl position="top-left" showCompass visualizePitch />

          {layers.demand ? (
            <Source id="eos-demand" type="geojson" data={demandGeoJson}>
              <Layer
                id="eos-demand-heat"
                type="heatmap"
                paint={{
                  "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "weight"],
                    0,
                    0,
                    1,
                    1,
                  ],
                  "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    1.5,
                    0.7,
                    3.5,
                    1.35,
                    6,
                    1.9,
                  ],
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(6,10,20,0)",
                    0.12,
                    "rgba(30,64,110,0.35)",
                    0.3,
                    "rgba(70,130,200,0.5)",
                    0.5,
                    "rgba(94,200,216,0.72)",
                    0.75,
                    "rgba(154,220,235,0.85)",
                    1,
                    "rgba(196,163,90,0.55)",
                  ],
                  "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    1.5,
                    42,
                    3.5,
                    62,
                    6,
                    88,
                  ],
                  "heatmap-opacity": 0.9,
                }}
              />
            </Source>
          ) : null}

          {visibleMarkers.map((marker) => (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedId(marker.id);
              }}
            >
              <MapMarkerButton
                marker={marker}
                selected={selectedId === marker.id}
              />
            </Marker>
          ))}
        </MapLibreMap>

        {/* Ambient vignette — depth without clutter */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(6,10,20,0.45) 100%)",
          }}
          aria-hidden
        />

        {/* Theatre + AU regional navigation — World → country → state → facility */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 px-2">
          <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full border border-[color-mix(in_srgb,white_12%,transparent)] bg-[color-mix(in_srgb,#0a101c_82%,transparent)] p-1 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {PRIMARY_MAP_VIEW_IDS.map((id) => (
              <button
                key={id}
                type="button"
                data-map-view={id}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.07em] transition-colors",
                  viewId === id ||
                    (id === "australia" &&
                      AU_REGIONAL_VIEW_IDS.includes(viewId))
                    ? "bg-[color-mix(in_srgb,#6a9fd8_22%,transparent)] text-[#e8eaef]"
                    : "text-[#8b93a7] hover:text-[#e8eaef]",
                )}
                onClick={() => {
                  setSelectedId(null);
                  setViewId(id);
                }}
              >
                {MAP_VIEW_PRESETS[id].label}
              </button>
            ))}
          </div>
          {viewId === "australia" || AU_REGIONAL_VIEW_IDS.includes(viewId) ? (
            <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a101c_78%,transparent)] p-1 backdrop-blur-md">
              <span className="px-1.5 py-1 text-[0.58rem] uppercase tracking-[0.08em] text-[#6d768a]">
                Region
              </span>
              {AU_REGIONAL_VIEW_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-map-view={id}
                  className={cn(
                    "rounded-full px-2 py-1 text-[0.65rem] uppercase tracking-[0.06em] transition-colors",
                    viewId === id
                      ? "bg-[color-mix(in_srgb,#c4a35a_22%,transparent)] text-[#e8eaef]"
                      : "text-[#8b93a7] hover:text-[#e8eaef]",
                  )}
                  onClick={() => {
                    setSelectedId(null);
                    setViewId(id);
                  }}
                >
                  {MAP_VIEW_PRESETS[id].label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Layer dock — compact, expandable */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-[color-mix(in_srgb,white_12%,transparent)] bg-[color-mix(in_srgb,#0a101c_86%,transparent)] px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.08em] text-[#e8eaef] shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md"
            aria-expanded={layersOpen}
            onClick={() => setLayersOpen((v) => !v)}
          >
            Layers · {activeLayerCount}
          </button>
          {layersOpen ? (
            <div
              className="w-[15.5rem] rounded-xl border border-[color-mix(in_srgb,white_12%,transparent)] bg-[color-mix(in_srgb,#0a101c_92%,transparent)] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md"
              aria-label="Intelligence layers"
            >
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Intelligence layers
              </p>
              <ul className="mt-2 space-y-1">
                {INTELLIGENCE_MAP_LAYERS.map((layer) => (
                  <li key={layer.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-white/[0.03]">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-[#6a9fd8]"
                        checked={layers[layer.id]}
                        data-map-layer={layer.id}
                        onChange={() =>
                          setLayers((prev) => ({
                            ...prev,
                            [layer.id]: !prev[layer.id],
                          }))
                        }
                      />
                      <span>
                        <span className="block text-[0.76rem] text-[#e8eaef]">
                          {layer.label}
                        </span>
                        <span className="block text-[0.62rem] leading-snug text-[#8b93a7]">
                          {layer.description}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {model.unplaced.length > 0 ? (
                <div className="mt-3 border-t border-white/10 pt-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#c4785a]">
                    Unplaced
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {model.unplaced.slice(0, 4).map((item) => (
                      <li
                        key={item.id}
                        className="text-[0.68rem] text-[#8b93a7]"
                        title={item.reason}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Location confidence — restrained legend */}
        <aside
          className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[18rem]"
          aria-label="Location confidence legend"
        >
          <div className="pointer-events-auto rounded-xl border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a101c_88%,transparent)] px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
              Location confidence
            </p>
            <ul className="mt-1.5 space-y-1 text-[0.68rem] text-[#e8eaef]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#5ec8d8] bg-[#6a9fd8] shadow-[0_0_8px_rgba(94,200,216,0.45)]" />
                Verified — coordinates in evidence
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rotate-45 border border-dashed border-[#c4a35a] bg-[color-mix(in_srgb,#c4a35a_28%,transparent)]" />
                Region-resolved — approximate indicator only
              </li>
              <li className="text-[0.6rem] leading-snug text-[#6d768a]">
                {model.sourceLabel}. {BASEMAP_PROVIDER_NOTE}.
              </li>
            </ul>
          </div>
        </aside>

        {/* Polished intelligence panel — selection */}
        {selected ? (
          <aside
            className="absolute bottom-3 right-3 top-[3.25rem] z-10 w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-xl border border-[color-mix(in_srgb,#6a9fd8_28%,transparent)] bg-[color-mix(in_srgb,#0a101c_94%,transparent)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            data-map-intelligence-panel="true"
            aria-label={`Intelligence: ${selected.label}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <IntelligenceProvenanceBadge provenance={selected.provenance} />
                {model.demonstrationData ? (
                  <span className="text-[0.6rem] uppercase tracking-[0.06em] text-[#c4785a]">
                    Demonstration
                  </span>
                ) : null}
                <span
                  className={cn(
                    "text-[0.6rem] uppercase tracking-[0.06em]",
                    selected.geoResolution === "coordinates_in_evidence"
                      ? "text-[#5ec8d8]"
                      : "text-[#c4a35a]",
                  )}
                >
                  {selected.geoResolution === "coordinates_in_evidence"
                    ? "Verified location"
                    : "Region-resolved · approximate"}
                </span>
              </div>
              <button
                type="button"
                className="rounded border border-white/10 px-1.5 text-[0.75rem] text-[#8b93a7] hover:text-[#e8eaef]"
                aria-label="Close intelligence panel"
                onClick={() => setSelectedId(null)}
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.1em] text-[#8b93a7]">
              {selected.kind}
              {selected.regionCode ? ` · ${selected.regionCode}` : ""}
            </p>
            <h4 className="mt-1 text-[1.15rem] font-semibold tracking-tight text-[#e8eaef]">
              {selected.label}
            </h4>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-[#9aa3b8]">
              {selected.locationConfidenceLabel ??
                (selected.geoResolution === "coordinates_in_evidence"
                  ? "Coordinates present in organisational evidence."
                  : "Approximate regional placement only — not a precise facility coordinate. State centroids are never shown as actual factory or dealer locations.")}
            </p>
            {selected.detail ? (
              <p className="mt-2 text-[0.75rem] text-[#8b93a7]">{selected.detail}</p>
            ) : null}

            {selected.metrics && selected.metrics.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                {selected.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
                  >
                    <dt className="text-[0.6rem] uppercase tracking-[0.06em] text-[#8b93a7]">
                      {m.label}
                    </dt>
                    <dd className="mt-0.5 text-[0.92rem] font-medium tabular-nums text-[#e8eaef]">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {selected.evidenceSources && selected.evidenceSources.length > 0 ? (
              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="text-[0.6rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Evidence sources
                </p>
                <ul className="mt-1.5 space-y-1">
                  {selected.evidenceSources.map((src) => (
                    <li
                      key={src}
                      className="border-l-2 border-[#6a9fd8]/40 pl-2 text-[0.72rem] text-[#c5cad6]"
                    >
                      {src}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selected.dataPeriod ? (
              <p className="mt-3 text-[0.65rem] text-[#8b93a7]">
                Data period: {selected.dataPeriod}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function inferLayers(marker: ImmersionMapMarker): IntelligenceMapLayerId[] {
  if (marker.kind === "region") return ["demand", "forecast"];
  if (
    marker.kind === "factory" ||
    marker.kind === "facility" ||
    marker.kind === "site"
  ) {
    const next: IntelligenceMapLayerId[] = ["facilities", "capacity"];
    if (marker.tone === "attention") next.push("risks", "inventory");
    return next;
  }
  if (marker.kind === "dealer") return ["distribution"];
  if (marker.kind === "alert") return ["risks"];
  return ["facilities"];
}

function MapMarkerButton({
  marker,
  selected,
}: {
  marker: ImmersionMapMarker;
  selected: boolean;
}) {
  const fill = MARKER_FILL[marker.tone ?? "intelligence"] ?? MARKER_FILL.intelligence;
  const verified = marker.geoResolution === "coordinates_in_evidence";
  const isFacility =
    marker.kind === "factory" ||
    marker.kind === "facility" ||
    marker.kind === "site";
  const isRegion = marker.kind === "region";
  const isAlert = marker.kind === "alert" || marker.tone === "attention";
  const ringColor = verified ? "#5ec8d8" : isAlert ? "#c4a35a" : "#6a9fd8";

  return (
    <button
      type="button"
      className={cn(
        "group relative flex items-center justify-center transition-transform duration-200",
        selected && "scale-125",
      )}
      aria-label={`${marker.kind}: ${marker.label} (${marker.geoResolution})`}
      data-map-marker={marker.kind}
      data-map-marker-id={marker.id}
      data-geo-resolution={marker.geoResolution}
    >
      {/* Soft luminous halo */}
      <span
        className="absolute rounded-full"
        style={{
          width: isRegion ? 28 : isFacility ? 24 : 20,
          height: isRegion ? 28 : isFacility ? 24 : 20,
          boxShadow: selected
            ? `0 0 0 2px ${ringColor}, 0 0 18px ${ringColor}66`
            : `0 0 10px ${ringColor}33`,
          border: verified
            ? `2px solid ${ringColor}`
            : `1px dashed ${ringColor}`,
          opacity: selected ? 1 : 0.85,
        }}
      />
      {isRegion ? (
        <span
          className="relative z-[1] block h-3 w-3 rotate-45 border border-[#0a101c]"
          style={{
            background: fill,
            boxShadow: `0 0 8px ${fill}88`,
          }}
        />
      ) : isFacility ? (
        <span
          className="relative z-[1] block h-3.5 w-3.5 rounded-[3px] border border-[#0a101c]"
          style={{
            background: `linear-gradient(145deg, #dce8f8 0%, ${fill} 38%, ${fill} 100%)`,
            boxShadow: `0 0 10px ${fill}77`,
          }}
        />
      ) : (
        <span
          className="relative z-[1] block h-2.5 w-2.5 rounded-full border border-[#0a101c]"
          style={{
            background: fill,
            boxShadow: `0 0 8px ${fill}66`,
          }}
        />
      )}
      {/* Label only on hover / selected — reduces overlap */}
      <span
        className={cn(
          "pointer-events-none absolute left-5 top-1/2 z-[2] -translate-y-1/2 whitespace-nowrap rounded-md border border-[color-mix(in_srgb,white_12%,transparent)] bg-[color-mix(in_srgb,#0a101c_94%,transparent)] px-1.5 py-0.5 text-[0.65rem] text-[#e8eaef] shadow-lg backdrop-blur-sm",
          selected ? "block" : "hidden group-hover:block",
        )}
      >
        {marker.label}
        <span
          className={cn(
            "ml-1 text-[0.55rem] uppercase",
            verified ? "text-[#5ec8d8]" : "text-[#c4a35a]",
          )}
        >
          {geoShort(marker.geoResolution)}
        </span>
      </span>
    </button>
  );
}

function geoShort(resolution: GeoResolution): string {
  if (resolution === "coordinates_in_evidence") return "verified";
  if (resolution === "region_resolved") return "region-resolved";
  return "unplaced";
}
