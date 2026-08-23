/**
 * Mock / real auth mode.
 *
 * Production (NODE_ENV=production or VERCEL_ENV=production) NEVER enables mock.
 * Missing or incorrect MOCK config in production → fail-safe: real auth required.
 *
 * Non-production: mock remains available for local DX unless
 * NEXT_PUBLIC_EXECUTIVEOS_MOCK=false.
 */

export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

/**
 * True only when mock identity is intentionally allowed (non-production).
 * Production always returns false — never Alex Rivera / Northline by default.
 */
export function isMockMode(): boolean {
  if (isProductionRuntime()) {
    return false;
  }
  return process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK !== "false";
}

/**
 * Operator check — production must explicitly set MOCK=false (documentation).
 * Runtime already forces mock off in production even if unset.
 */
export function isProductionMockConfigSafe(): boolean {
  if (!isProductionRuntime()) return true;
  const raw = process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK;
  // Prefer explicit false; unset is still fail-safe (mock off) but flagged for ops.
  return raw === "false";
}
