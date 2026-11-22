"use client";

import { useEffect, useMemo, useState } from "react";
import { setWorkerUrl } from "maplibre-gl";
import MapLibreMap, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import { applyGraphiteBasemap } from "@/experience/immersion/map/applyGraphiteBasemap";
import {
  BASEMAP_PROVIDER_NOTE,
  MAP_VIEW_PRESETS,
  OPENFREEMAP_DARK_STYLE_URL,
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
  const [layers, setLayers] = useState(() => {
    if (!forceLayers || Object.keys(forceLayers).length === 0) {
      return defaultLayerState();
    }
    // Explicit forceLayers = exclusive enable set (for review / deep-links).
    const next = defaultLayerState();
    for (const key of Object.keys(next) as IntelligenceMapLayerId[]) {
      next[key] = Boolean(forceLayers[key]);
    }
    return next;
  });
  const [mapRef, setMapRef] = useState<MapRef | null>(null);

  const selected = model.markers.find((m) => m.id === selectedId) ?? null;
  const view = MAP_VIEW_PRESETS[viewId];

  useEffect(() => {
    if (!mapRef) return;
    mapRef.flyTo({
      center: [view.longitude, view.latitude],
      zoom: view.zoom,
      duration: 900,
    });
  }, [mapRef, view.latitude, view.longitude, view.zoom]);

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
        "relative overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)]",
        "bg-[var(--eos-color-surface-elevated,#12151c)]",
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
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color-mix(in_srgb,white_8%,transparent)] px-4 py-3">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[var(--eos-color-executive-blue,#6a9fd8)]">
            Global intelligence map
            {model.domain ? ` · ${model.domain}` : ""}
          </p>
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
            {model.title}
          </h3>
          <p className="eos-type-caption mt-1 text-[var(--eos-color-text-muted)]">
            {model.question}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IntelligenceProvenanceBadge provenance="derived" />
          <span
            className="inline-flex items-center rounded-[4px] border border-[color-mix(in_srgb,var(--eos-color-executive-gold,#c4a35a)_50%,transparent)] px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-[var(--eos-color-executive-gold,#c4a35a)]"
            data-geo-honesty="true"
          >
            {model.honestyLabel}
          </span>
        </div>
      </div>

      {model.demonstrationData ? (
        <div
          className="border-b border-[color-mix(in_srgb,#c4785a_35%,transparent)] bg-[color-mix(in_srgb,#c4785a_10%,transparent)] px-4 py-2 text-[0.75rem] text-[#e0b4a4]"
          data-demo-disclosure="true"
        >
          Demonstration fixture — not live customer intelligence. Approximate
          placements use regional reference centroids; verified facility
          coordinates are not in evidence for this dataset.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 border-b border-[color-mix(in_srgb,white_6%,transparent)] px-3 py-2">
        {(Object.keys(MAP_VIEW_PRESETS) as MapViewPresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            data-map-view={id}
            className={cn(
              "rounded border px-2 py-1 text-[0.7rem] uppercase tracking-[0.06em]",
              viewId === id
                ? "border-[#6a9fd8] text-[#e8eaef]"
                : "border-white/10 text-[#8b93a7] hover:border-white/20",
            )}
            onClick={() => setViewId(id)}
          >
            {MAP_VIEW_PRESETS[id].label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "relative grid",
          compact
            ? "min-h-[380px] lg:grid-cols-[minmax(0,1fr)_14rem]"
            : "min-h-[min(70vh,680px)] lg:grid-cols-[minmax(0,1fr)_16rem]",
        )}
      >
        <div
          className={cn("relative", compact ? "h-[380px]" : "h-[min(70vh,680px)]")}
          data-map-canvas="true"
        >
          <MapLibreMap
            ref={setMapRef}
            initialViewState={{
              longitude: view.longitude,
              latitude: view.latitude,
              zoom: view.zoom,
            }}
            mapStyle={OPENFREEMAP_DARK_STYLE_URL}
            attributionControl={{ compact: true }}
            style={{ width: "100%", height: "100%" }}
            cooperativeGestures
            onLoad={(e) => {
              applyGraphiteBasemap(e.target);
            }}
            onClick={() => setSelectedId(null)}
          >
            <NavigationControl position="top-left" showCompass={false} />

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
                      2,
                      0.85,
                      4,
                      1.4,
                      6,
                      1.85,
                    ],
                    "heatmap-color": [
                      "interpolate",
                      ["linear"],
                      ["heatmap-density"],
                      0,
                      "rgba(11,18,32,0)",
                      0.15,
                      "rgba(30,64,110,0.45)",
                      0.35,
                      "rgba(106,159,216,0.65)",
                      0.55,
                      "rgba(94,200,216,0.78)",
                      0.8,
                      "rgba(154,220,235,0.88)",
                      1,
                      "rgba(196,163,90,0.7)",
                    ],
                    "heatmap-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      2,
                      36,
                      3.5,
                      55,
                      5,
                      70,
                      8,
                      90,
                    ],
                    "heatmap-opacity": 0.88,
                  }}
                />
                <Layer
                  id="eos-demand-points"
                  type="circle"
                  minzoom={4}
                  paint={{
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["get", "weight"],
                      0,
                      3,
                      1,
                      9,
                    ],
                    "circle-color": "rgba(94,200,216,0.55)",
                    "circle-stroke-color": "rgba(106,159,216,0.9)",
                    "circle-stroke-width": 1,
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

            {selected ? (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="bottom"
                onClose={() => setSelectedId(null)}
                closeOnClick={false}
                offset={18}
                className="eos-map-popup"
              >
                <MarkerDetailPanel marker={selected} demonstration={model.demonstrationData} />
              </Popup>
            ) : null}
          </MapLibreMap>

          <aside
            className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-sm"
            aria-label="Location confidence legend"
          >
            <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#07090e_88%,transparent)] px-3 py-2 backdrop-blur-md">
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Location confidence
              </p>
              <ul className="mt-1.5 space-y-1 text-[0.7rem] text-[#e8eaef]">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full border-2 border-solid border-[#5ec8d8] bg-[#6a9fd8]" />
                  Verified location — coordinates in evidence
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rotate-45 border border-dashed border-[#c4a35a] bg-[color-mix(in_srgb,#c4a35a_30%,transparent)]" />
                  Region-resolved — approximate regional indicator only
                </li>
                <li className="text-[0.65rem] text-[#8b93a7]">
                  {model.sourceLabel}. {BASEMAP_PROVIDER_NOTE}.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <aside
          className="border-t border-[color-mix(in_srgb,white_8%,transparent)] p-3 lg:border-l lg:border-t-0"
          aria-label="Intelligence layers"
        >
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Intelligence layers
          </p>
          <ul className="mt-2 space-y-1.5">
            {INTELLIGENCE_MAP_LAYERS.map((layer) => (
              <li key={layer.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded border border-transparent px-1.5 py-1 hover:border-white/10">
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
                    <span className="block text-[0.78rem] text-[#e8eaef]">
                      {layer.label}
                    </span>
                    <span className="block text-[0.65rem] text-[#8b93a7]">
                      {layer.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {model.unplaced.length > 0 ? (
            <div className="mt-4 border-t border-[color-mix(in_srgb,white_8%,transparent)] pt-3">
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#c4785a]">
                Unplaced · no coordinates / region
              </p>
              <ul className="mt-2 space-y-1">
                {model.unplaced.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="text-[0.7rem] text-[#8b93a7]"
                    title={item.reason}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function inferLayers(marker: ImmersionMapMarker): IntelligenceMapLayerId[] {
  if (marker.kind === "region") return ["demand", "forecast"];
  if (marker.kind === "factory" || marker.kind === "facility" || marker.kind === "site") {
    const layers: IntelligenceMapLayerId[] = ["facilities", "capacity"];
    if (marker.tone === "attention") layers.push("risks", "inventory");
    return layers;
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

  return (
    <button
      type="button"
      className="group relative flex items-center justify-center"
      aria-label={`${marker.kind}: ${marker.label} (${marker.geoResolution})`}
      data-map-marker={marker.kind}
      data-map-marker-id={marker.id}
      data-geo-resolution={marker.geoResolution}
    >
      <span
        className={cn(
          "absolute rounded-full transition-transform",
          verified
            ? "h-6 w-6 border-2 border-[#5ec8d8] shadow-[0_0_12px_rgba(94,200,216,0.35)]"
            : "h-6 w-6 border border-dashed border-[#c4a35a]",
          selected && "scale-125",
          isAlert && !verified && "border-[#c4a35a]",
        )}
        style={{
          boxShadow: selected
            ? `0 0 0 3px color-mix(in srgb, ${fill} 40%, transparent)`
            : undefined,
        }}
      />
      {isRegion ? (
        <span
          className="relative z-[1] block h-2.5 w-2.5 rotate-45 border border-[#07090e]"
          style={{ background: fill }}
        />
      ) : isFacility ? (
        <span
          className="relative z-[1] block h-3 w-3 rounded-[2px] border border-[#07090e]"
          style={{ background: fill }}
        />
      ) : (
        <span
          className="relative z-[1] block h-2.5 w-2.5 rounded-full border border-[#07090e]"
          style={{ background: fill }}
        />
      )}
      <span className="pointer-events-none absolute left-5 top-1/2 z-[2] hidden -translate-y-1/2 whitespace-nowrap rounded border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#07090e_92%,transparent)] px-1.5 py-0.5 text-[0.65rem] text-[#e8eaef] group-hover:block">
        {marker.label}
        <span
          className={cn(
            "ml-1 text-[0.58rem] uppercase",
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

function MarkerDetailPanel({
  marker,
  demonstration,
}: {
  marker: ImmersionMapMarker;
  demonstration: boolean;
}) {
  const verified = marker.geoResolution === "coordinates_in_evidence";
  return (
    <div
      className="min-w-[14rem] max-w-[18rem] space-y-2 p-1 text-[#e8eaef]"
      data-map-popup={marker.kind}
    >
      <div className="flex flex-wrap gap-1.5">
        <IntelligenceProvenanceBadge provenance={marker.provenance} />
        {demonstration ? (
          <span className="text-[0.62rem] uppercase tracking-[0.06em] text-[#c4785a]">
            Demonstration
          </span>
        ) : null}
        <span
          className={cn(
            "text-[0.62rem] uppercase tracking-[0.06em]",
            verified ? "text-[#5ec8d8]" : "text-[#c4a35a]",
          )}
        >
          {verified
            ? "Verified location"
            : "Region-resolved · approximate indicator"}
        </span>
      </div>
      <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
        {marker.kind}
        {marker.regionCode ? ` · ${marker.regionCode}` : ""}
      </p>
      <p className="text-[0.95rem] font-semibold leading-snug">{marker.label}</p>
      <p className="text-[0.72rem] text-[#8b93a7]">
        {marker.locationConfidenceLabel ??
          (verified
            ? "Coordinates present in organisational evidence."
            : "Approximate regional placement only — not a precise facility coordinate. State centroids are never shown as actual factory or dealer locations.")}
      </p>
      {marker.detail ? (
        <p className="text-[0.75rem] text-[#8b93a7]">{marker.detail}</p>
      ) : null}
      {marker.metrics && marker.metrics.length > 0 ? (
        <dl className="space-y-1 border-t border-[color-mix(in_srgb,white_10%,transparent)] pt-2">
          {marker.metrics.map((m) => (
            <div
              key={m.label}
              className="flex justify-between gap-3 text-[0.75rem]"
            >
              <dt className="text-[#8b93a7]">{m.label}</dt>
              <dd className="tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {marker.evidenceSources && marker.evidenceSources.length > 0 ? (
        <div className="border-t border-[color-mix(in_srgb,white_10%,transparent)] pt-2">
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
            Evidence sources
          </p>
          <ul className="mt-1 space-y-0.5">
            {marker.evidenceSources.map((src) => (
              <li key={src} className="text-[0.7rem] text-[#c5cad6]">
                {src}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {marker.dataPeriod ? (
        <p className="text-[0.65rem] text-[#8b93a7]">
          Data period: {marker.dataPeriod}
        </p>
      ) : null}
    </div>
  );
}
