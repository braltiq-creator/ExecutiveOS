"use client";

import { useMemo, useState } from "react";
import { setWorkerUrl } from "maplibre-gl";
import MapLibreMap, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import { AU_STATES_GEOJSON } from "@/experience/immersion/geo/au-regions";
import type {
  GeoResolution,
  ImmersionMapMarker,
  ManufacturingOperationsMapModel,
} from "@/experience/immersion/types";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

const GRAPHITE_STYLE = {
  version: 8 as const,
  name: "executiveos-graphite",
  // Public glyph set so state labels can render without a full basemap tile stack.
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background" as const,
      paint: { "background-color": "#0a0c10" },
    },
  ],
};

const TONE_FILL: Record<string, string> = {
  attention: "#c4785a",
  watching: "#c4a35a",
  improving: "#3d9e8f",
  intelligence: "#6a9fd8",
  historical: "#5a6578",
};

type Props = {
  model: ManufacturingOperationsMapModel;
  className?: string;
  compact?: boolean;
  /** Optional controlled selection for review screenshots. */
  initialSelectedId?: string | null;
};

export function ManufacturingOperationsMap({
  model,
  className,
  compact = false,
  initialSelectedId = null,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const selected = model.markers.find((m) => m.id === selectedId) ?? null;

  const choropleth = useMemo(() => {
    const byCode = new Map(
      model.regions.map((r) => [r.regionCode.toUpperCase(), r]),
    );
    return {
      type: "FeatureCollection" as const,
      features: AU_STATES_GEOJSON.features.map((feature) => {
        const code = String(feature.properties?.regionCode ?? "").toUpperCase();
        const region = byCode.get(code);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            intensity: region?.intensity ?? 0,
            hasEvidence: Boolean(region),
            label: region?.label ?? code,
          },
        };
      }),
    };
  }, [model.regions]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)]",
        "bg-[var(--eos-color-surface-elevated,#12151c)]",
        className,
      )}
      data-manufacturing-operations-map="true"
      data-demonstration={model.demonstrationData ? "true" : "false"}
      aria-label={model.title}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color-mix(in_srgb,white_8%,transparent)] px-4 py-3">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[var(--eos-color-executive-blue,#6a9fd8)]">
            Industrial intelligence
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
          Demonstration manufacturing fixture — not live customer intelligence.
          Region placements use AU centroids; coordinates are not in evidence.
        </div>
      ) : null}

      <div
        className={cn("relative", compact ? "h-[380px]" : "h-[min(70vh,680px)]")}
        data-map-canvas="true"
      >
        <MapLibreMap
          initialViewState={{
            longitude: 134.2,
            latitude: -26.8,
            zoom: 3.55,
          }}
          mapStyle={GRAPHITE_STYLE}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
          cooperativeGestures
        >
          <NavigationControl position="top-left" showCompass={false} />
          <Source id="au-states" type="geojson" data={choropleth}>
            <Layer
              id="au-states-fill"
              type="fill"
              paint={{
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "intensity"],
                  0,
                  "rgba(26, 31, 42, 0.5)",
                  25,
                  "rgba(61, 158, 143, 0.28)",
                  50,
                  "rgba(106, 159, 216, 0.4)",
                  75,
                  "rgba(196, 163, 90, 0.5)",
                  100,
                  "rgba(196, 120, 90, 0.62)",
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["get", "hasEvidence"], false],
                  0.9,
                  0.2,
                ],
              }}
            />
            <Layer
              id="au-states-outline"
              type="line"
              paint={{
                "line-color": "rgba(232, 234, 239, 0.38)",
                "line-width": 1.25,
              }}
            />
            <Layer
              id="au-states-label"
              type="symbol"
              layout={{
                "text-field": ["get", "regionCode"],
                "text-size": 11,
                "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
                "text-allow-overlap": false,
                "text-ignore-placement": false,
              }}
              paint={{
                "text-color": "rgba(232, 234, 239, 0.55)",
                "text-halo-color": "rgba(10, 12, 16, 0.85)",
                "text-halo-width": 1.2,
              }}
            />
          </Source>

          {model.markers.map((marker) => (
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
              offset={16}
              className="eos-map-popup"
            >
              <MarkerPopup marker={selected} />
            </Popup>
          ) : null}
        </MapLibreMap>

        <aside
          className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 md:right-auto md:max-w-md"
          aria-label="Map legend"
        >
          <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_82%,transparent)] px-3 py-2 backdrop-blur-md">
            <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
              Demand heatmap intensity
            </p>
            <div
              className="mt-1.5 h-1.5 w-40 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(26,31,42,0.8), #3d9e8f, #6a9fd8, #c4a35a, #c4785a)",
              }}
            />
            <p className="mt-1 text-[0.65rem] text-[var(--eos-color-text-muted)]">
              {model.sourceLabel}
              {model.demonstrationData ? " · demonstration disclosure" : ""}
            </p>
          </div>
          <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_82%,transparent)] px-3 py-2 backdrop-blur-md">
            <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
              Location resolution
            </p>
            <ul className="mt-1.5 space-y-1 text-[0.7rem] text-[#e8eaef]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rotate-45 border border-dashed border-[#c4a35a] bg-[color-mix(in_srgb,#c4a35a_35%,transparent)]" />
                Region-resolved (dashed gold ring)
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full border-2 border-solid border-[#3d9e8f] bg-[#6a9fd8]" />
                Coordinates in evidence (solid teal ring)
              </li>
              <li className="text-[0.65rem] text-[#8b93a7]">
                This fixture has no lat/lng — all placed markers are region-resolved. Coordinate-backed styling is reserved for when UDG includes coordinates.
              </li>
              <li className="flex items-center gap-2 text-[#8b93a7]">
                <span className="inline-flex h-2.5 w-2.5 rotate-45 bg-[#6a9fd8]" />
                Diamond region · square factory · circle dealer
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {model.unplaced.length > 0 ? (
        <div className="border-t border-[color-mix(in_srgb,white_8%,transparent)] px-4 py-3">
          <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[var(--eos-color-attention,#c4785a)]">
            Unplaced · coordinates / region unresolved
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {model.unplaced.slice(0, 8).map((item) => (
              <li
                key={item.id}
                className="rounded border border-[color-mix(in_srgb,white_8%,transparent)] px-2 py-1 text-[0.72rem] text-[var(--eos-color-text-muted)]"
                title={item.reason}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function MapMarkerButton({
  marker,
  selected,
}: {
  marker: ImmersionMapMarker;
  selected: boolean;
}) {
  const fill = TONE_FILL[marker.tone ?? "intelligence"] ?? TONE_FILL.intelligence;
  const coordBacked = marker.geoResolution === "coordinates_in_evidence";

  return (
    <button
      type="button"
      className="group relative flex items-center justify-center"
      aria-label={`${marker.kind}: ${marker.label} (${marker.geoResolution})`}
      data-map-marker={marker.kind}
      data-map-marker-id={marker.id}
      data-geo-resolution={marker.geoResolution}
    >
      {/* Outer resolution ring */}
      <span
        className={cn(
          "absolute rounded-full",
          coordBacked ? "h-5 w-5 border-2 border-[#3d9e8f]" : "h-5 w-5 border border-dashed border-[#c4a35a]",
          selected && "scale-125",
        )}
        style={{
          boxShadow: selected
            ? `0 0 0 3px color-mix(in srgb, ${fill} 45%, transparent)`
            : undefined,
        }}
      />
      {/* Kind glyph */}
      {marker.kind === "region" ? (
        <span
          className="relative z-[1] block h-2.5 w-2.5 rotate-45 border border-[#0a0c10]"
          style={{ background: fill }}
        />
      ) : marker.kind === "factory" ? (
        <span
          className="relative z-[1] block h-3 w-3 rounded-[2px] border border-[#0a0c10]"
          style={{ background: fill }}
        />
      ) : (
        <span
          className="relative z-[1] block h-2.5 w-2.5 rounded-full border border-[#0a0c10]"
          style={{ background: fill }}
        />
      )}
      <span className="pointer-events-none absolute left-5 top-1/2 z-[2] hidden -translate-y-1/2 whitespace-nowrap rounded border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_90%,transparent)] px-1.5 py-0.5 text-[0.65rem] text-[var(--eos-color-text,#e8eaef)] group-hover:block">
        {marker.label}
        <span className="ml-1 text-[0.58rem] uppercase text-[#c4a35a]">
          {geoShort(marker.geoResolution)}
        </span>
      </span>
    </button>
  );
}

function geoShort(resolution: GeoResolution): string {
  if (resolution === "coordinates_in_evidence") return "coords";
  if (resolution === "region_resolved") return "region-resolved";
  return "unplaced";
}

function MarkerPopup({ marker }: { marker: ImmersionMapMarker }) {
  const coordBacked = marker.geoResolution === "coordinates_in_evidence";
  return (
    <div
      className="min-w-[13rem] max-w-[17rem] space-y-2 p-1 text-[var(--eos-color-text,#e8eaef)]"
      data-map-popup={marker.kind}
    >
      <div className="flex flex-wrap gap-1.5">
        <IntelligenceProvenanceBadge provenance={marker.provenance} />
        <span
          className={cn(
            "text-[0.62rem] uppercase tracking-[0.06em]",
            coordBacked ? "text-[#3d9e8f]" : "text-[var(--eos-color-executive-gold,#c4a35a)]",
          )}
        >
          {coordBacked
            ? "Coordinates in evidence"
            : "Region-resolved · coordinates not in evidence"}
        </span>
      </div>
      <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
        {marker.kind}
        {marker.regionCode ? ` · ${marker.regionCode}` : ""}
      </p>
      <p className="text-[0.95rem] font-semibold leading-snug">{marker.label}</p>
      {marker.detail ? (
        <p className="text-[0.75rem] text-[var(--eos-color-text-muted)]">
          {marker.detail}
        </p>
      ) : null}
      {marker.metrics && marker.metrics.length > 0 ? (
        <dl className="space-y-1 border-t border-[color-mix(in_srgb,white_10%,transparent)] pt-2">
          {marker.metrics.map((m) => (
            <div
              key={m.label}
              className="flex justify-between gap-3 text-[0.75rem]"
            >
              <dt className="text-[var(--eos-color-text-muted)]">{m.label}</dt>
              <dd className="tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
