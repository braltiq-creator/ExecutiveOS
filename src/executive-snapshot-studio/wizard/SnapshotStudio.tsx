"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import {
  BusinessImpactCard,
  DigitalTwinStrip,
  ExecutiveHeatMap,
  ExecutiveKpiCard,
  ExecutiveNarrative,
  ExecutiveTimeline,
} from "@/design-system/executive-experience";
import {
  ConfidencePanel,
  MappingPreview as UdgMappingPreview,
  UploadDropzone,
  parseTabularText,
  inferMappingFromHeaders,
  looksLikeBinaryMisdecodedAsText,
  type UploadDropzoneResult,
  type UdgMappingDefinition,
  type UdgSourceKind,
} from "@/data-gateway";
import {
  createSnapshotOnServer,
  finalizeStudioWeeklyIngestionAction,
  parseWorkbookOnServer,
  persistStudioWeeklyMappingAction,
  resolveStudioWeeklySourceAction,
  runIntelligenceOnServer,
} from "../client/api";
import {
  activateExecutiveSnapshotContext,
  persistActivatedExecutiveSnapshot,
  revokeFailedExecutiveSnapshotActivation,
  launchCommandCentreHref,
} from "../launch";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  detectBusinessProfile,
  getStudioProfileLabel,
  listStudioProfiles,
} from "../profile-detection";
import { buildMappingPreview } from "../mapping";
import { saveStudioSession, upsertLibraryEntry } from "../history";
import { STUDIO_WELCOME } from "../welcome";
import type {
  StudioBusinessProfileId,
  StudioSession,
  StudioWizardStepId,
} from "../types";
import { STUDIO_WIZARD_STEPS } from "../types";
import { STUDIO_STEP_META } from "./steps";
import { ReadinessDashboard } from "../preview/ReadinessDashboard";
import { SnapshotSummaryCard } from "../preview/SnapshotSummary";
import { BriefReadyPanel } from "../preview/BriefReady";
import { SnapshotLibrary } from "../preview/SnapshotLibrary";

type SnapshotStudioProps = {
  organisationId: string;
  organisationName: string;
  profileId: string;
  productId?: string;
  actorId?: string;
  className?: string;
};

function newStudioId(): string {
  return `studio_${Date.now().toString(36)}`;
}

/**
 * End-to-end Executive Snapshot Wizard.
 * Orchestrates UDG + EXDS + existing Intelligence platform.
 */
export function SnapshotStudio({
  organisationId,
  organisationName,
  profileId,
  productId = "executiveos",
  actorId,
  className,
}: SnapshotStudioProps) {
  const [session, setSession] = useState<StudioSession>(() => ({
    studioId: newStudioId(),
    organisationId,
    profileId,
    productId,
    actorId,
    step: "welcome",
    sourceKind: "csv",
    mappingConfirmed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const stepMeta = STUDIO_STEP_META[session.step];
  const stepIndex = STUDIO_WIZARD_STEPS.indexOf(session.step);
  const profiles = useMemo(() => listStudioProfiles(), []);

  function persist(next: StudioSession) {
    const saved = saveStudioSession(next);
    upsertLibraryEntry(saved);
    setSession(saved);
  }

  function go(step: StudioWizardStepId) {
    persist({ ...session, step });
  }

  async function applyWeeklySource(
    base: StudioSession,
    headers: string[],
    selectedProfileId: StudioBusinessProfileId,
  ): Promise<StudioSession | null> {
    const weekly = await resolveStudioWeeklySourceAction({
      organisationId,
      profileId: selectedProfileId,
      headers,
    });
    if (!weekly.ok) {
      setError(weekly.error);
      return null;
    }

    let mapping = weekly.mapping;
    if (!mapping || weekly.requiresSchemaConfirmation) {
      mapping = inferMappingFromHeaders(headers, {
        organisationId,
        profileId,
        productId,
        name: weekly.logicalName,
      });
    }

    return {
      ...base,
      uploadHeaders: headers,
      selectedProfileId,
      dataSourceId: weekly.source.id,
      logicalSourceName: weekly.logicalName,
      mapping,
      mappingPreview: buildMappingPreview(mapping, weekly.mappingReused),
      mappingConfirmed: false,
      mappingReused: weekly.mappingReused,
      schemaReport: weekly.schema,
      requiresSchemaConfirmation: weekly.requiresSchemaConfirmation,
      schemaChangeConfirmed: false,
      freshnessCopy: weekly.freshnessCopy,
      weeklyCompare: undefined,
      weeklyLineageAttached: false,
      udgSnapshot: undefined,
      readiness: undefined,
      validation: undefined,
      intelligence: undefined,
      brief: undefined,
    };
  }

  async function handleUpload(payload: UploadDropzoneResult) {
    setError(null);
    setBusy(true);
    try {
      if (payload.kind === "csv") {
        if (!payload.text?.trim()) {
          setError("No business rows detected. Upload a CSV with a header row.");
          return;
        }
        if (looksLikeBinaryMisdecodedAsText(payload.text)) {
          setError(
            "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
          );
          return;
        }
        const parsed = parseTabularText(payload.text);
        if (parsed.records.length === 0) {
          setError("No business rows detected. Upload a CSV with a header row.");
          return;
        }
        const detection = detectBusinessProfile({
          headers: parsed.headers,
          records: parsed.records,
        });
        const next = await applyWeeklySource(
          {
            ...session,
            filename: payload.filename,
            tabularText: payload.text,
            binaryBase64: undefined,
            sourceKind: "csv",
            detection,
            step: "profile",
          },
          parsed.headers,
          detection.profileId,
        );
        if (!next) return;
        persist(next);
        return;
      }

      if (!payload.binaryBase64?.trim()) {
        setError("ExecutiveOS could not identify this file format.");
        return;
      }

      const workbook = await parseWorkbookOnServer({
        filename: payload.filename,
        mimeType: payload.mimeType,
        binaryBase64: payload.binaryBase64,
      });

      if (!workbook.ok) {
        setError(workbook.error);
        return;
      }

      if (workbook.recordCount === 0) {
        setError(
          "ExecutiveOS could not read this Excel workbook. No data rows were found.",
        );
        return;
      }

      const detection = detectBusinessProfile({
        headers: workbook.headers,
      });
      const sourceKind: UdgSourceKind = "excel";
      const next = await applyWeeklySource(
        {
          ...session,
          filename: payload.filename,
          tabularText: undefined,
          binaryBase64: payload.binaryBase64,
          sourceKind,
          detection,
          step: "profile",
        },
        workbook.headers,
        detection.profileId,
      );
      if (!next) return;
      persist(next);
    } catch {
      setError(
        "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runSnapshotAndValidate() {
    if (
      (!session.tabularText && !session.binaryBase64) ||
      !session.mapping ||
      !session.selectedProfileId
    ) {
      setError("Upload and confirm profile before creating the snapshot.");
      return;
    }
    if (!session.dataSourceId || !session.uploadHeaders) {
      setError("Weekly data source could not be resolved. Re-upload the file.");
      return;
    }
    if (
      session.requiresSchemaConfirmation &&
      !session.schemaChangeConfirmed
    ) {
      setError(
        session.schemaReport?.message ??
          "Confirm the schema change before continuing.",
      );
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const mapped = await persistStudioWeeklyMappingAction({
        organisationId,
        dataSourceId: session.dataSourceId,
        mapping: session.mapping,
        headers: session.uploadHeaders,
        confirmSchemaChange: session.schemaChangeConfirmed,
      });
      if (!mapped.ok) {
        setError(mapped.error);
        return;
      }

      const result = await createSnapshotOnServer({
        organisationId,
        organisationName,
        profileId,
        productId,
        actorId,
        sourceKind: session.sourceKind,
        tabularText: session.tabularText,
        binaryBase64: session.binaryBase64,
        filename: session.filename,
        selectedProfileId: session.selectedProfileId,
        mapping: session.mapping,
      });

      if (!result.success || !result.snapshot) {
        setError(
          result.errors[0] ??
            "Validation prevented the Executive Snapshot. Improve readiness and retry.",
        );
        persist({
          ...session,
          validation: result.validation,
          udgConfidence: result.confidence,
          readiness: result.readiness,
          mappingPreview: result.mappingPreview,
          mappingConfirmed: true,
          step: "validation",
        });
        return;
      }

      persist({
        ...session,
        validation: result.validation,
        udgConfidence: result.confidence,
        udgSnapshot: result.snapshot,
        readiness: result.readiness,
        mappingPreview:
          result.mappingPreview ?? buildMappingPreview(session.mapping, true),
        mappingConfirmed: true,
        dataSourceId: mapped.source.id,
        step: "validation",
      });
    } catch {
      setError("Snapshot processing failed. Please retry the upload.");
    } finally {
      setBusy(false);
    }
  }

  async function runIntelligence() {
    if (
      !session.udgSnapshot ||
      !session.readiness ||
      !session.selectedProfileId
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await runIntelligenceOnServer({
        organisationName,
        selectedProfileId: session.selectedProfileId,
        snapshot: session.udgSnapshot,
        readiness: session.readiness,
        studioId: session.studioId,
        filename: session.filename,
      });

      if (!result.success || !result.intelligence || !result.brief) {
        setError(
          result.errors[0] ??
            "Intelligence could not be activated for this snapshot.",
        );
        return;
      }

      let weeklyCompare = session.weeklyCompare;
      let weeklyLineageAttached = session.weeklyLineageAttached;

      if (result.handoff) {
        const activated = activateExecutiveSnapshotContext({
          kind: "executive_snapshot",
          studioId: session.studioId,
          snapshotId: result.handoff.snapshotId,
          organisationId: result.handoff.organisationId,
          organisationName: result.handoff.organisationName,
          profileId: result.handoff.profileId,
          profileLabel: result.handoff.profileLabel,
          sourceKind: result.handoff.sourceKind,
          filename: result.handoff.filename,
          recordCount: result.handoff.recordCount,
          confidenceOverall: result.handoff.confidenceOverall,
          readiness: result.handoff.readiness,
          portfolio: result.handoff.portfolio,
          analysis: result.handoff.analysis,
          commercialBrief: result.handoff.commercialBrief,
          manufacturingAnalysis: result.handoff.manufacturingAnalysis,
          manufacturingBrief: result.handoff.manufacturingBrief,
          briefPreview: result.brief,
          intelligence: result.intelligence,
          councilSeats: result.handoff.councilSeats,
          advisorNames: result.handoff.advisorNames,
          activatedAt: new Date().toISOString(),
          demoIsolation: true,
        });

        const durable = await persistActivatedExecutiveSnapshot(activated);
        if (!durable.ok) {
          revokeFailedExecutiveSnapshotActivation(activated.studioId);
          setError(
            durable.error ||
              "Unable to persist Executive Snapshot to Production. Activation was not saved.",
          );
          return;
        }

        if (
          session.dataSourceId &&
          session.uploadHeaders &&
          session.mapping
        ) {
          const finalized = await finalizeStudioWeeklyIngestionAction({
            organisationId,
            dataSourceId: session.dataSourceId,
            snapshotId: result.handoff.snapshotId,
            recordCount: result.handoff.recordCount,
            headers: session.uploadHeaders,
            mapping: session.mapping,
            fileName: session.filename,
            confirmSchemaChange: session.schemaChangeConfirmed,
          });
          if (!finalized.ok) {
            revokeFailedExecutiveSnapshotActivation(activated.studioId);
            setError(
              finalized.error ||
                "Snapshot was saved but weekly data source lineage failed. Re-run Intelligence after resolving the data source.",
            );
            return;
          }
          weeklyCompare = finalized.compare;
          weeklyLineageAttached = true;
        }

        usePortfolioStore.getState().loadExternalPortfolio(result.handoff.portfolio, {
          snapshotId: result.handoff.snapshotId,
          persist: true,
        });
      }

      persist({
        ...session,
        readiness: result.readiness ?? session.readiness,
        intelligence: result.intelligence,
        brief: result.brief,
        weeklyCompare,
        weeklyLineageAttached,
        step: "intelligence",
      });
    } catch {
      setError("Intelligence activation failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("exds-fade-in space-y-[var(--eos-space-xl)]", className)}>
      <nav aria-label="Snapshot wizard" className="flex flex-wrap gap-2">
        {STUDIO_WIZARD_STEPS.map((id, i) => {
          const active = id === session.step;
          const done = i < stepIndex;
          return (
            <span
              key={id}
              className={cn(
                "eos-type-caption rounded-full px-2.5 py-1",
                active
                  ? "bg-[var(--exds-intelligence-soft)] text-[var(--exds-intelligence)]"
                  : done
                    ? "text-[var(--exds-improving)]"
                    : "text-[var(--eos-color-text-muted)]",
              )}
            >
              {STUDIO_STEP_META[id].index}. {STUDIO_STEP_META[id].label}
            </span>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={ds.type.label}>{stepMeta.label}</p>
          <p className="eos-type-caption mt-1">{stepMeta.question}</p>
        </div>
        <button
          type="button"
          className="eos-type-caption text-[var(--exds-intelligence)]"
          onClick={() => setShowLibrary((v) => !v)}
        >
          {showLibrary ? "Hide library" : "Snapshot library"}
        </button>
      </div>

      {showLibrary ? <SnapshotLibrary organisationId={organisationId} /> : null}

      {session.step === "welcome" ? (
        <WelcomeStep
          onStart={() => go("upload")}
          organisationName={organisationName}
        />
      ) : null}

      {session.step === "upload" ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <ExecutiveNarrative
            judgement="Bring the business into ExecutiveOS — not a file into a spreadsheet tool."
            supporting="Excel and CSV today. Dynamics, SAP, and streaming arrive through the same gateway without changing this experience."
          />
          <UploadDropzone
            onFile={handleUpload}
            onError={(message) => setError(message)}
            disabled={busy}
          />
        </div>
      ) : null}

      {session.step === "profile" && session.detection ? (
        <ProfileStep
          detection={session.detection}
          selected={session.selectedProfileId ?? session.detection.profileId}
          profiles={profiles}
          onSelect={async (id) => {
            if (!session.uploadHeaders) {
              persist({ ...session, selectedProfileId: id });
              return;
            }
            setBusy(true);
            setError(null);
            try {
              const next = await applyWeeklySource(
                { ...session, selectedProfileId: id },
                session.uploadHeaders,
                id,
              );
              if (next) persist(next);
            } finally {
              setBusy(false);
            }
          }}
          onContinue={() => go("mapping")}
        />
      ) : null}

      {session.step === "mapping" && session.mapping ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <ExecutiveNarrative
            judgement="Confirm the organisational model before judgement begins."
            supporting="Entities, relationships, measures, and hierarchy — mapped through the Universal Data Gateway."
          />
          {session.logicalSourceName ? (
            <p className="eos-type-supporting">
              Source · {session.logicalSourceName}
              {session.mappingReused
                ? " · previous mapping reused"
                : " · mapping established for this weekly source"}
              {session.freshnessCopy ? ` · ${session.freshnessCopy}` : null}
            </p>
          ) : null}
          {session.requiresSchemaConfirmation && session.schemaReport ? (
            <div className="space-y-3 rounded-[var(--eos-radius-md)] border border-[var(--eos-color-border)] p-4">
              <p className="eos-type-body text-[var(--eos-color-text)]">
                {session.schemaReport.message}
              </p>
              {session.schemaReport.addedColumns.length ? (
                <p className="eos-type-caption">
                  Added: {session.schemaReport.addedColumns.join(", ")}
                </p>
              ) : null}
              {session.schemaReport.removedColumns.length ? (
                <p className="eos-type-caption">
                  Removed: {session.schemaReport.removedColumns.join(", ")}
                </p>
              ) : null}
              <label className="flex items-center gap-2 eos-type-supporting">
                <input
                  type="checkbox"
                  checked={Boolean(session.schemaChangeConfirmed)}
                  onChange={(e) =>
                    persist({
                      ...session,
                      schemaChangeConfirmed: e.target.checked,
                    })
                  }
                />
                Confirm schema change and continue with the updated mapping
              </label>
            </div>
          ) : null}
          <div className="grid gap-[var(--eos-space-lg)] lg:grid-cols-2">
            <UdgMappingPreview mapping={session.mapping} />
            <MappingStructure mapping={session.mapping} />
          </div>
          <StepActions
            back={() => go("profile")}
            nextLabel="Confirm mapping & validate"
            next={runSnapshotAndValidate}
            busy={busy}
          />
        </div>
      ) : null}

      {session.step === "validation" ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <ExecutiveNarrative
            judgement="Readiness is the question — not row counts."
            supporting="Universal Data Gateway validation and confidence, presented for executives."
          />
          {session.readiness && session.udgConfidence ? (
            <>
              <ReadinessDashboard readiness={session.readiness} />
              <ConfidencePanel confidence={session.udgConfidence} />
            </>
          ) : (
            <p className="eos-type-body text-[var(--eos-color-text)]">
              Confirm mapping to score Executive Readiness.
            </p>
          )}
          {session.validation ? (
            <p className="eos-type-supporting">
              Validation · {session.validation.status.replaceAll("_", " ")} ·{" "}
              {session.validation.errorCount} items requiring attention ·{" "}
              {session.validation.warningCount} watch items
            </p>
          ) : null}
          <StepActions
            back={() => go("mapping")}
            nextLabel={
              session.udgSnapshot
                ? "View Executive Snapshot"
                : "Retry snapshot"
            }
            next={
              session.udgSnapshot ? () => go("snapshot") : runSnapshotAndValidate
            }
            busy={busy}
          />
        </div>
      ) : null}

      {session.step === "snapshot" &&
      session.udgSnapshot &&
      session.readiness ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <ExecutiveNarrative
            judgement="An immutable Executive Snapshot is now the business context for this organisation."
            supporting="Replayable. Lineaged. Ready for Intelligence."
          />
          <SnapshotSummaryCard
            snapshot={session.udgSnapshot}
            readiness={session.readiness}
            profileLabel={getStudioProfileLabel(
              session.selectedProfileId ?? "commercial",
            )}
          />
          <DigitalTwinStrip
            nodes={[
              {
                domain: "organisation",
                label: "Organisation",
                health:
                  session.readiness.executiveReadiness >= 75
                    ? "healthy"
                    : session.readiness.executiveReadiness >= 55
                      ? "watch"
                      : "attention",
              },
              {
                domain: "operations",
                label: "Operations",
                health: "watch",
                href: "/today",
              },
              {
                domain: "commercial",
                label: "Commercial",
                health: "neutral",
                href: "/today",
              },
              { domain: "capital", label: "Capital", health: "neutral" },
              { domain: "customers", label: "Customers", health: "watch" },
              {
                domain: "risk",
                label: "Risk",
                health:
                  session.readiness.relationshipIntegrity < 70
                    ? "attention"
                    : "healthy",
              },
              { domain: "people", label: "People", health: "unknown" },
              {
                domain: "technology",
                label: "Technology",
                health: "neutral",
              },
            ]}
          />
          <StepActions
            back={() => go("validation")}
            nextLabel="Run Executive Intelligence"
            next={runIntelligence}
            busy={busy}
          />
        </div>
      ) : null}

      {session.step === "intelligence" ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <ExecutiveNarrative
            judgement="Outcome Engine, Council, and Domain Advisors are preparing judgement — Snapshot Studio invents no new reasoning."
            supporting="Existing platform capabilities only."
          />
          {session.weeklyCompare ? (
            <div className="space-y-2 rounded-[var(--eos-radius-md)] border border-[var(--eos-color-border)] p-4">
              <p className="eos-type-label">What changed since last snapshot</p>
              {session.weeklyCompare.volumeDelta != null ? (
                <p className="eos-type-supporting">
                  Volume · {session.weeklyCompare.previousRecordCount ?? "—"} →{" "}
                  {session.weeklyCompare.currentRecordCount} (
                  {session.weeklyCompare.volumeDelta >= 0 ? "+" : ""}
                  {session.weeklyCompare.volumeDelta})
                </p>
              ) : (
                <p className="eos-type-supporting">
                  First durable snapshot for this source (
                  {session.weeklyCompare.currentRecordCount} records).
                </p>
              )}
              {session.weeklyCompare.whatAppeared.length ? (
                <p className="eos-type-caption">
                  Appeared: {session.weeklyCompare.whatAppeared.slice(0, 8).join(", ")}
                </p>
              ) : null}
              {session.weeklyCompare.whatDisappeared.length ? (
                <p className="eos-type-caption">
                  Disappeared:{" "}
                  {session.weeklyCompare.whatDisappeared.slice(0, 8).join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
          {session.intelligence ? (
            <>
              <div className="grid gap-[var(--eos-space-md)] sm:grid-cols-2 lg:grid-cols-4">
                <ExecutiveKpiCard
                  title="Council"
                  value="Ready"
                  href="/today"
                  trend="up"
                  confidence={session.readiness?.executiveReadiness}
                  timestamp="Now"
                />
                <ExecutiveKpiCard
                  title="Advisors"
                  value={String(session.intelligence.advisorNames.length)}
                  href="/today"
                  trend="flat"
                  confidence={88}
                />
                <ExecutiveKpiCard
                  title="Outcomes"
                  value="Active"
                  href="/today"
                  trend="up"
                  confidence={session.udgSnapshot?.meta.confidence.overall}
                />
                <ExecutiveKpiCard
                  title="Judgement"
                  value="Prepared"
                  href="/today"
                  trend="up"
                  confidence={90}
                />
              </div>
              <BusinessImpactCard
                title="Platform activation"
                impact={{
                  dimensions: {
                    operations: "Domain Advisors engaged",
                    risk: "Lineage attached to snapshot",
                    people: "Council ready to convene",
                    customer: "Brief prepared for leadership",
                  },
                  confidence:
                    session.udgSnapshot?.meta.confidence.overall ?? 80,
                  expectedOutcome: session.intelligence.narrative,
                }}
              />
              <p className="eos-type-supporting">
                Advisors · {session.intelligence.advisorNames.join(" · ")}
              </p>
              <StepActions
                back={() => go("snapshot")}
                nextLabel="Open Executive Brief"
                next={() => go("brief")}
                busy={busy}
              />
            </>
          ) : (
            <StepActions
              back={() => go("snapshot")}
              nextLabel="Activate Intelligence"
              next={runIntelligence}
              busy={busy}
            />
          )}
        </div>
      ) : null}

      {session.step === "brief" && session.brief ? (
        <div className="space-y-[var(--eos-space-lg)]">
          <BriefReadyPanel
            brief={session.brief}
            href={launchCommandCentreHref(session.studioId)}
          />
          <ExecutiveTimeline
            title="Snapshot journey"
            events={[
              {
                id: "1",
                stage: "observation",
                title: "Business context uploaded",
                timestamp: session.createdAt.slice(0, 16).replace("T", " "),
              },
              {
                id: "2",
                stage: "analysis",
                title: "Profile detected and validated",
              },
              {
                id: "3",
                stage: "recommendation",
                title: "Executive Snapshot created",
                href: "/today",
              },
              {
                id: "4",
                stage: "council",
                title: "Council and Advisors activated",
              },
              {
                id: "5",
                stage: "decision",
                title: "Executive Brief ready",
              },
              {
                id: "6",
                stage: "outcome",
                title: "Command Centre available",
                href: launchCommandCentreHref(session.studioId),
              },
            ]}
          />
          {session.readiness ? (
            <ExecutiveHeatMap
              title="Readiness heat"
              columns={5}
              cells={[
                {
                  id: "q",
                  label: "Quality",
                  value: session.readiness.dataQuality,
                  href: "/today",
                },
                {
                  id: "c",
                  label: "Coverage",
                  value: session.readiness.coverage,
                },
                {
                  id: "f",
                  label: "Freshness",
                  value: session.readiness.freshness,
                },
                {
                  id: "r",
                  label: "Relationships",
                  value: session.readiness.relationshipIntegrity,
                },
                {
                  id: "e",
                  label: "Readiness",
                  value: session.readiness.executiveReadiness,
                  href: "/today",
                },
              ]}
            />
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          className="eos-type-supporting"
          style={{ color: "var(--exds-attention)" }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function WelcomeStep({
  onStart,
  organisationName,
}: {
  onStart: () => void;
  organisationName: string;
}) {
  return (
    <div className="space-y-[var(--eos-space-xl)]">
      <ExecutiveNarrative
        judgement={STUDIO_WELCOME.title}
        supporting={`${STUDIO_WELCOME.narrative} Preparing ${organisationName}.`}
      />
      <p className="eos-type-body max-w-2xl text-[var(--eos-color-text)]">
        {STUDIO_WELCOME.supporting}
      </p>
      <p className="eos-type-caption">{STUDIO_WELCOME.secondaryNote}</p>
      <button
        type="button"
        onClick={onStart}
        className={cn(
          "exds-focus-ring rounded-[var(--eos-radius-md)] px-5 py-3",
          "bg-[var(--exds-intelligence)] text-[var(--eos-primary-fg)]",
          "eos-type-subheading",
        )}
      >
        {STUDIO_WELCOME.primaryCta}
      </button>
    </div>
  );
}

function ProfileStep({
  detection,
  selected,
  profiles,
  onSelect,
  onContinue,
}: {
  detection: NonNullable<StudioSession["detection"]>;
  selected: StudioBusinessProfileId;
  profiles: ReturnType<typeof listStudioProfiles>;
  onSelect: (id: StudioBusinessProfileId) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-[var(--eos-space-lg)]">
      <ExecutiveNarrative
        judgement={`${detection.label} detected.`}
        supporting={`Confidence ${detection.confidence}%. You may override before continuing.`}
      />
      <ul className="space-y-2">
        {detection.rationale.map((line) => (
          <li key={line} className="eos-type-supporting">
            {line}
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => {
          const active = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "exds-focus-ring rounded-[var(--eos-radius-md)] border px-3 py-3 text-left",
                active
                  ? "border-[var(--exds-intelligence)] bg-[var(--exds-intelligence-soft)]"
                  : "border-[var(--exds-card-border)] bg-[var(--exds-card-bg)]",
              )}
            >
              <p className="eos-type-caption">
                {active ? "Selected" : "Available"}
              </p>
              <p className="eos-type-subheading mt-1 text-[var(--eos-color-text)]">
                {p.label}
              </p>
            </button>
          );
        })}
      </div>
      <StepActions nextLabel="Continue to mapping" next={onContinue} />
    </div>
  );
}

function MappingStructure({ mapping }: { mapping: UdgMappingDefinition }) {
  const preview = buildMappingPreview(mapping, false);
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
      )}
    >
      <p className={ds.type.label}>Organisational model</p>
      <dl className="mt-[var(--eos-space-md)] space-y-3">
        <div>
          <dt className="eos-type-caption">Entities</dt>
          <dd className="eos-type-supporting text-[var(--eos-color-text)]">
            {preview.entities.join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="eos-type-caption">Measures</dt>
          <dd className="eos-type-supporting text-[var(--eos-color-text)]">
            {preview.measures.join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="eos-type-caption">Hierarchy</dt>
          <dd className="eos-type-supporting text-[var(--eos-color-text)]">
            {preview.hierarchy.join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="eos-type-caption">Relationships</dt>
          <dd className="eos-type-supporting text-[var(--eos-color-text)]">
            {preview.relationships.join(" · ")}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function StepActions({
  back,
  next,
  nextLabel,
  busy,
}: {
  back?: () => void;
  next: () => void;
  nextLabel: string;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {back ? (
        <button
          type="button"
          onClick={back}
          className="exds-focus-ring rounded-[var(--eos-radius-md)] border border-[var(--exds-card-border)] px-4 py-2.5 eos-type-subheading"
        >
          Back
        </button>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={next}
        className={cn(
          "exds-focus-ring rounded-[var(--eos-radius-md)] px-4 py-2.5",
          "bg-[var(--exds-intelligence)] text-[var(--eos-primary-fg)]",
          "eos-type-subheading disabled:opacity-40",
        )}
      >
        {nextLabel}
      </button>
    </div>
  );
}
