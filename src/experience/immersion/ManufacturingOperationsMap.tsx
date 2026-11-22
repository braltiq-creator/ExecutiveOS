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
  ImmersionMapMarker,
  ManufacturingOperationsMapModel,
} from "@/experience/immersion/types";

// Next.js / Turbopack: serve worker from /public to avoid broken blob worker URLs.
if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

const GRAPHITE_STYLE = {
  version: 8 as const,
  name: "executiveos-graphite",
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
  /** Compact height for Evidence Lab embedding. */
  compact?: boolean;
};

export function ManufacturingOperationsMap({
  model,
  className,
  compact = false,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

      <div
        className={cn("relative", compact ? "h-[360px]" : "h-[min(68vh,640px)]")}
      >
        <MapLibreMap
          initialViewState={{
            longitude: 134.5,
            latitude: -26.5,
            zoom: 3.6,
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
                  "rgba(26, 31, 42, 0.55)",
                  40,
                  "rgba(106, 159, 216, 0.35)",
                  70,
                  "rgba(196, 163, 90, 0.45)",
                  100,
                  "rgba(196, 120, 90, 0.55)",
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["get", "hasEvidence"], false],
                  0.85,
                  0.25,
                ],
              }}
            />
            <Layer
              id="au-states-outline"
              type="line"
              paint={{
                "line-color": "rgba(232, 234, 239, 0.22)",
                "line-width": 1,
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
              <button
                type="button"
                className="group relative flex items-center justify-center"
                aria-label={`${marker.kind}: ${marker.label}`}
                data-map-marker={marker.kind}
                data-map-marker-id={marker.id}
              >
                <span
                  className={cn(
                    "block rounded-full border-2 border-[#0a0c10]",
                    marker.kind === "region" ? "h-3.5 w-3.5" : "h-3 w-3",
                  )}
                  style={{
                    background:
                      TONE_FILL[marker.tone ?? "intelligence"] ??
                      TONE_FILL.intelligence,
                    boxShadow:
                      selectedId === marker.id
                        ? `0 0 0 2px ${TONE_FILL[marker.tone ?? "intelligence"]}`
                        : undefined,
                  }}
                />
                <span className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_88%,transparent)] px-1.5 py-0.5 text-[0.65rem] text-[var(--eos-color-text,#e8eaef)] group-hover:block">
                  {marker.label}
                </span>
              </button>
            </Marker>
          ))}

          {selected ? (
            <Popup
              longitude={selected.longitude}
              latitude={selected.latitude}
              anchor="bottom"
              onClose={() => setSelectedId(null)}
              closeOnClick={false}
              offset={14}
              className="eos-map-popup"
            >
              <MarkerPopup marker={selected} />
            </Popup>
          ) : null}
        </MapLibreMap>

        <aside
          className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 md:right-auto md:max-w-sm"
          aria-label="Map legend"
        >
          <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_78%,transparent)] px-3 py-2 backdrop-blur-md">
            <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
              Demand intensity
            </p>
            <div
              className="mt-1.5 h-1.5 w-36 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(26,31,42,0.8), #6a9fd8, #c4a35a, #c4785a)",
              }}
            />
            <p className="mt-1 text-[0.65rem] text-[var(--eos-color-text-muted)]">
              {model.sourceLabel}
              {model.demonstrationData ? " · demonstration disclosure" : ""}
            </p>
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

function MarkerPopup({ marker }: { marker: ImmersionMapMarker }) {
  return (
    <div className="min-w-[12rem] max-w-[16rem] space-y-2 p-1 text-[var(--eos-color-text,#e8eaef)]">
      <div className="flex flex-wrap gap-1.5">
        <IntelligenceProvenanceBadge provenance={marker.provenance} />
        <span className="text-[0.62rem] uppercase tracking-[0.06em] text-[var(--eos-color-executive-gold,#c4a35a)]">
          {marker.geoResolution === "region_resolved"
            ? "Region-resolved"
            : marker.geoResolution}
        </span>
      </div>
      <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[var(--eos-color-text-muted)]">
        {marker.kind}
      </p>
      <p className="text-[0.9rem] font-semibold leading-snug">{marker.label}</p>
      {marker.detail ? (
        <p className="text-[0.75rem] text-[var(--eos-color-text-muted)]">
          {marker.detail}
        </p>
      ) : null}
      {marker.metrics && marker.metrics.length > 0 ? (
        <dl className="space-y-1 border-t border-[color-mix(in_srgb,white_10%,transparent)] pt-2">
          {marker.metrics.map((m) => (
            <div key={m.label} className="flex justify-between gap-3 text-[0.75rem]">
              <dt className="text-[var(--eos-color-text-muted)]">{m.label}</dt>
              <dd className="tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
