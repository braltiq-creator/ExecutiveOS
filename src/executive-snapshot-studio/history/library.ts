import type { StudioLibraryEntry, StudioSession } from "../types";
import { getStudioProfileLabel } from "../profile-detection";

const sessions = new Map<string, StudioSession>();
const library = new Map<string, StudioLibraryEntry>();

export function saveStudioSession(session: StudioSession): StudioSession {
  const next = { ...session, updatedAt: new Date().toISOString() };
  sessions.set(next.studioId, next);
  return next;
}

export function getStudioSession(id: string): StudioSession | undefined {
  return sessions.get(id);
}

export function listStudioSessions(organisationId?: string): StudioSession[] {
  const all = Array.from(sessions.values());
  return organisationId
    ? all.filter((s) => s.organisationId === organisationId)
    : all;
}

export function upsertLibraryEntry(session: StudioSession): StudioLibraryEntry | null {
  if (!session.udgSnapshot || !session.selectedProfileId || !session.readiness) {
    return null;
  }
  // Never promote a corrupt / obsolete snapshot into the library SoT.
  if (
    session.udgSnapshot.meta.validationStatus === "failed" ||
    (session.udgSnapshot.meta.recordCount > 5000 &&
      /Aptos|Root Entry/i.test(
        JSON.stringify(session.udgSnapshot.records.slice(0, 5)),
      ))
  ) {
    return null;
  }
  const entry: StudioLibraryEntry = {
    studioId: session.studioId,
    snapshotId: session.udgSnapshot.meta.snapshotId,
    organisationId: session.organisationId,
    profileId: session.selectedProfileId,
    profileLabel: getStudioProfileLabel(session.selectedProfileId),
    createdAt: session.udgSnapshot.meta.createdAt,
    confidence: session.udgSnapshot.meta.confidence.overall,
    executiveReadiness: session.readiness.executiveReadiness,
    briefGenerated: Boolean(session.brief),
    commandCentreReady: Boolean(session.intelligence),
    sourceKind: session.udgSnapshot.meta.sourceKind,
    recordCount: session.udgSnapshot.meta.recordCount,
  };
  library.set(entry.studioId, entry);
  return entry;
}

export function listLibrary(organisationId?: string): StudioLibraryEntry[] {
  const all = Array.from(library.values());
  const filtered = organisationId
    ? all.filter((e) => e.organisationId === organisationId)
    : all;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLibraryEntry(studioId: string): StudioLibraryEntry | undefined {
  return library.get(studioId);
}

export function compareLibraryEntries(
  aId: string,
  bId: string,
): {
  a?: StudioLibraryEntry;
  b?: StudioLibraryEntry;
  readinessDelta?: number;
  confidenceDelta?: number;
  volumeDelta?: number;
} {
  const a = library.get(aId);
  const b = library.get(bId);
  if (!a || !b) return { a, b };
  return {
    a,
    b,
    readinessDelta: a.executiveReadiness - b.executiveReadiness,
    confidenceDelta: a.confidence - b.confidence,
    volumeDelta: a.recordCount - b.recordCount,
  };
}

export function clearStudioStores(): void {
  sessions.clear();
  library.clear();
}
