"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { ExecutiveNarrative } from "@/design-system/executive-experience";
import type {
  UdgConfidenceScore,
  UdgExecutiveSnapshot,
  UdgMappingDefinition,
  UdgSourceKind,
  UdgValidationResult,
} from "../contracts";
import { ingest } from "../ingestion";
import {
  inferMappingFromHeaders,
  describeMapping,
} from "../mapping";
import {
  parseExcelWorkbook,
  parseTabularText,
  base64ToUint8Array,
  looksLikeBinaryMisdecodedAsText,
} from "../uploads";
import { ConfidencePanel } from "./ConfidencePanel";
import { MappingPreview } from "./MappingPreview";
import { UploadDropzone, type UploadDropzoneResult } from "./UploadDropzone";
import { UploadProgress } from "./UploadProgress";
import { ValidationSummary } from "./ValidationSummary";

type Stage =
  | "idle"
  | "uploading"
  | "validating"
  | "mapping"
  | "scoring"
  | "importing"
  | "complete"
  | "failed";

type DataGatewayUploadProps = {
  organisationId: string;
  profileId: string;
  productId: string;
  actorId?: string;
  /** Default connector — excel | csv | manual. */
  sourceKind?: Extract<UdgSourceKind, "excel" | "csv" | "manual">;
  className?: string;
  onSnapshotCreated?: (snapshot: UdgExecutiveSnapshot) => void;
};

const CONNECTOR_IDS = {
  excel: "udg-excel",
  csv: "udg-csv",
  manual: "udg-manual",
} as const;

/**
 * Executive upload experience.
 * Drag & drop → validate → map → confidence → import → snapshot.
 */
export function DataGatewayUpload({
  organisationId,
  profileId,
  productId,
  actorId,
  sourceKind = "csv",
  className,
  onSnapshotCreated,
}: DataGatewayUploadProps) {
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState<string | null>(null);
  const [tabularText, setTabularText] = useState<string | null>(null);
  const [binaryBase64, setBinaryBase64] = useState<string | null>(null);
  const [mapping, setMapping] = useState<UdgMappingDefinition | null>(null);
  const [validation, setValidation] = useState<UdgValidationResult | null>(
    null,
  );
  const [confidence, setConfidence] = useState<UdgConfidenceScore | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState<UdgExecutiveSnapshot | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const mappingLines = useMemo(
    () => (mapping ? describeMapping(mapping) : []),
    [mapping],
  );

  function resetResult() {
    setValidation(null);
    setConfidence(null);
    setSnapshot(null);
    setErrors([]);
  }

  function handleFile(payload: UploadDropzoneResult) {
    resetResult();
    setFilename(payload.filename);
    setStage("uploading");
    setProgress(20);

    if (payload.kind === "csv") {
      if (!payload.text?.trim()) {
        setErrors(["No business rows detected."]);
        setStage("failed");
        return;
      }
      if (looksLikeBinaryMisdecodedAsText(payload.text)) {
        setErrors([
          "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
        ]);
        setStage("failed");
        return;
      }
      setTabularText(payload.text);
      setBinaryBase64(null);
      const parsed = parseTabularText(payload.text);
      const inferred = inferMappingFromHeaders(parsed.headers, {
        organisationId,
        profileId,
        productId,
        name: `Mapping · ${payload.filename}`,
      });
      setMapping(inferred);
      setStage("mapping");
      setProgress(45);
      return;
    }

    if (!payload.binaryBase64?.trim()) {
      setErrors(["ExecutiveOS could not identify this file format."]);
      setStage("failed");
      return;
    }

    setBinaryBase64(payload.binaryBase64);
    setTabularText(null);
    const bytes = base64ToUint8Array(payload.binaryBase64);
    const parsed = parseExcelWorkbook({
      bytes,
      filename: payload.filename,
    });
    if (!parsed.ok) {
      setErrors(
        parsed.errors.length
          ? parsed.errors
          : [
              "ExecutiveOS could not read this Excel workbook. Please verify the workbook or upload an XLSX/CSV version.",
            ],
      );
      setStage("failed");
      return;
    }
    const inferred = inferMappingFromHeaders(parsed.headers, {
      organisationId,
      profileId,
      productId,
      name: `Mapping · ${payload.filename}`,
    });
    setMapping(inferred);
    setStage("mapping");
    setProgress(45);
  }

  function runImport() {
    if ((!tabularText && !binaryBase64) || !mapping) return;
    setErrors([]);
    startTransition(() => {
      setStage("validating");
      setProgress(60);

      const kind: UdgSourceKind = binaryBase64
        ? "excel"
        : filename?.toLowerCase().endsWith(".xlsx") ||
            filename?.toLowerCase().endsWith(".xls")
          ? "excel"
          : sourceKind;

      setStage("scoring");
      setProgress(75);

      setStage("importing");
      setProgress(90);

      const connectorKey =
        kind === "excel" ? "excel" : kind === "manual" ? "manual" : "csv";

      const result = ingest({
        organisationId,
        profileId,
        productId,
        actorId,
        sourceKind: kind,
        connectorId: CONNECTOR_IDS[connectorKey],
        mode: "upload",
        tabularText: tabularText ?? undefined,
        binaryBase64: binaryBase64 ?? undefined,
        mapping,
        filename: filename ?? undefined,
      });

      setValidation(result.validation);
      setConfidence(result.confidence ?? null);
      setErrors(result.errors);

      if (result.ok && result.snapshot) {
        setSnapshot(result.snapshot);
        setMapping(result.snapshot.meta.mappingId ? mapping : mapping);
        setStage("complete");
        setProgress(100);
        onSnapshotCreated?.(result.snapshot);
      } else {
        setStage("failed");
        setProgress(100);
      }
    });
  }

  return (
    <div className={cn("exds-fade-in space-y-[var(--eos-space-xl)]", className)}>
      <ExecutiveNarrative
        judgement="Bring business information into ExecutiveOS through one gateway — never as a spreadsheet ritual."
        supporting="Every upload becomes an immutable Executive Snapshot with validation, mapping, confidence, and lineage."
      />

      <UploadDropzone
        onFile={handleFile}
        onError={(message) => {
          setErrors([message]);
          setStage("failed");
        }}
        disabled={pending}
      />

      {filename ? (
        <p className="eos-type-supporting">
          Source file ·{" "}
          <span className="text-[var(--eos-color-text)]">{filename}</span>
        </p>
      ) : null}

      <UploadProgress stage={stage} progress={progress} />

      {mapping ? (
        <div className="grid gap-[var(--eos-space-lg)] lg:grid-cols-2">
          <MappingPreview mapping={mapping} />
          {validation ? <ValidationSummary validation={validation} /> : (
            <section
              className={cn(
                "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
                "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
              )}
            >
              <p className={ds.type.label}>Ready to validate</p>
              <p className="eos-type-body mt-2 text-[var(--eos-color-text)]">
                {mappingLines.length} field mappings prepared. Import to score
                confidence and create the snapshot.
              </p>
            </section>
          )}
        </div>
      ) : null}

      {confidence ? <ConfidencePanel confidence={confidence} /> : null}

      {errors.length > 0 ? (
        <ul className="space-y-1">
          {errors.map((err) => (
            <li
              key={err}
              className="eos-type-supporting"
              style={{ color: "var(--exds-attention)" }}
            >
              {err}
            </li>
          ))}
        </ul>
      ) : null}

      {snapshot ? (
        <section
          className={cn(
            "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
            "bg-[var(--exds-intelligence-soft)] p-[var(--eos-space-lg)]",
          )}
        >
          <p className={ds.type.label}>Executive Snapshot created</p>
          <p className="eos-type-subheading mt-2 text-[var(--eos-color-text)]">
            {snapshot.meta.snapshotId}
          </p>
          <dl className="mt-[var(--eos-space-md)] grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="eos-type-caption">Records</dt>
              <dd className="eos-type-supporting tabular-nums text-[var(--eos-color-text)]">
                {snapshot.meta.recordCount}
              </dd>
            </div>
            <div>
              <dt className="eos-type-caption">Confidence</dt>
              <dd className="eos-type-supporting tabular-nums text-[var(--eos-color-text)]">
                {snapshot.meta.confidence.overall}%
              </dd>
            </div>
            <div>
              <dt className="eos-type-caption">Validation</dt>
              <dd className="eos-type-supporting text-[var(--eos-color-text)]">
                {snapshot.meta.validationStatus.replaceAll("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="eos-type-caption">Version</dt>
              <dd className="eos-type-supporting tabular-nums text-[var(--eos-color-text)]">
                {snapshot.meta.version}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!mapping || pending || stage === "complete"}
          onClick={runImport}
          className={cn(
            "exds-focus-ring rounded-[var(--eos-radius-md)] px-4 py-2.5",
            "bg-[var(--exds-intelligence)] text-[var(--eos-primary-fg)]",
            "eos-type-subheading disabled:opacity-40",
          )}
        >
          Import
        </button>
      </div>
    </div>
  );
}
