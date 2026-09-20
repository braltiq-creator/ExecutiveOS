/**
 * Choose memory vs Supabase for weekly Data Source operations.
 * Production / real-auth: Supabase. Tests / mock: memory Map.
 */

import { isMockMode, isProductionRuntime } from "@/lib/mock/mode";

export function useMemoryWeeklyIngestion(): boolean {
  if (process.env.NODE_ENV === "test") return true;
  if (isMockMode()) return true;
  if (isProductionRuntime()) return false;
  if (process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK === "false") return false;
  return true;
}
