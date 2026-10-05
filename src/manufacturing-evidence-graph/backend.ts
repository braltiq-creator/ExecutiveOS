import { isMockMode, isProductionRuntime } from "@/lib/mock/mode";

/**
 * Same durability switch as weekly ingestion and pilot persistence.
 * Production writes Supabase. Tests and mock mode stay in process memory.
 */
export function isMemoryManufacturingGraph(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  if (isMockMode()) return true;
  if (isProductionRuntime()) return false;
  if (process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK === "false") return false;
  return true;
}
