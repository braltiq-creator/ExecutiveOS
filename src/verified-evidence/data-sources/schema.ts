/**
 * Schema fingerprint + change detection for weekly uploads.
 * Reuse mappings unless the schema materially changes.
 */

import type { SchemaChangeReport, SchemaColumnSet } from "./types";

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Stable fingerprint of column set (order-independent). */
export function fingerprintHeaders(headers: string[]): SchemaColumnSet {
  const normalized = Array.from(
    new Set(headers.map(normalizeHeader).filter(Boolean)),
  ).sort();
  return {
    headers: normalized,
    fingerprint: `schema:${normalized.join("|")}`,
  };
}

export function detectSchemaChange(input: {
  headers: string[];
  previousFingerprint: string | null;
  previousHeaders?: string[] | null;
}): SchemaChangeReport {
  const current = fingerprintHeaders(input.headers);
  const previousFingerprint = input.previousFingerprint;

  if (!previousFingerprint) {
    return {
      changed: false,
      fingerprint: current.fingerprint,
      previousFingerprint: null,
      addedColumns: [],
      removedColumns: [],
      requiresConfirmation: false,
      message: "First upload for this source — establish mapping once.",
    };
  }

  if (previousFingerprint === current.fingerprint) {
    return {
      changed: false,
      fingerprint: current.fingerprint,
      previousFingerprint,
      addedColumns: [],
      removedColumns: [],
      requiresConfirmation: false,
      message: "Schema matches previous upload — reusing saved mapping.",
    };
  }

  const previousHeaders = input.previousHeaders
    ? fingerprintHeaders(input.previousHeaders).headers
    : previousFingerprint.startsWith("schema:")
      ? previousFingerprint.slice("schema:".length).split("|").filter(Boolean)
      : [];

  const prevSet = new Set(previousHeaders);
  const currSet = new Set(current.headers);
  const addedColumns = current.headers.filter((h) => !prevSet.has(h));
  const removedColumns = previousHeaders.filter((h) => !currSet.has(h));

  return {
    changed: true,
    fingerprint: current.fingerprint,
    previousFingerprint,
    addedColumns,
    removedColumns,
    requiresConfirmation: true,
    message: buildChangeMessage(addedColumns, removedColumns),
  };
}

function buildChangeMessage(added: string[], removed: string[]): string {
  const parts: string[] = ["Schema changed since last upload."];
  if (added.length) parts.push(`New columns: ${added.join(", ")}.`);
  if (removed.length) parts.push(`Missing columns: ${removed.join(", ")}.`);
  parts.push("Confirm mapping updates for changed fields only.");
  return parts.join(" ");
}
