/**
 * Pilot persistence resolver.
 *
 * Production / real-auth: Supabase is authoritative.
 * Mock / test: memory backend (same contract; cleared between tests).
 *
 * data-gateway process Maps remain ingestion caches only.
 */

import { isMockMode, isProductionRuntime } from "@/lib/mock/mode";
import { createMemoryPilotPersistence } from "./memory-store";
import { createSupabasePilotPersistence } from "./supabase-store";
import type { PilotPersistenceBackend } from "./types";

let override: PilotPersistenceBackend | null = null;
let memorySingleton: PilotPersistenceBackend | null = null;

export function setPilotPersistenceOverride(
  backend: PilotPersistenceBackend | null,
): void {
  override = backend;
}

export function getPilotPersistence(): PilotPersistenceBackend {
  if (override) return override;

  // Tests and mock mode use durable-in-process memory implementing the contract.
  if (isMockMode() || process.env.NODE_ENV === "test") {
    if (!memorySingleton) memorySingleton = createMemoryPilotPersistence();
    return memorySingleton;
  }

  // Production and real-auth non-prod: Supabase.
  if (isProductionRuntime() || process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK === "false") {
    return createSupabasePilotPersistence();
  }

  if (!memorySingleton) memorySingleton = createMemoryPilotPersistence();
  return memorySingleton;
}

export {
  clearPilotPersistenceMemory,
  createMemoryPilotPersistence,
} from "./memory-store";
export { createSupabasePilotPersistence } from "./supabase-store";
export type {
  DurableSnapshotRecord,
  PilotPersistenceBackend,
} from "./types";
export { syncDecisionActionRows } from "./types";
