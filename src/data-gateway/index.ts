/**
 * Universal Data Gateway (UDG) — Phase 55
 *
 * Permanent ingestion layer for ExecutiveOS.
 * Every source produces a canonical Executive Ingestion Snapshot.
 * Downstream systems never know where data originated.
 *
 * Distinct from:
 * - `@/connectivity` (enterprise sync → BusinessEvents)
 * - `@/lib/snapshot` / IntelligentExecutiveSnapshot (presentation / intelligence)
 */

export * from "./contracts";
export * from "./connectors";
export * from "./validation";
export * from "./mapping";
export * from "./snapshots";
export * from "./uploads";
export * from "./ingestion";
export * from "./lineage";
export * from "./audit";
export * from "./confidence";
export * from "./experience";
