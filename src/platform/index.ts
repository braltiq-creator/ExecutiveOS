/**
 * ExecutiveOS Platform
 *
 * Stable extension architecture around a protected Core.
 * Knowledge Packs, Connectors, and future Extensions never modify Core.
 *
 * Full industry pack contract: `@/intelligence-packs` (EIPF).
 */

export type * from "@/platform/contracts";
export {
  PLATFORM_BUSINESS_EVENT_TYPES,
  assertBusinessEvent,
  toPackKpis,
  toPackRules,
} from "@/platform/contracts";

export * from "@/platform/versioning";
export * from "@/platform/sdk";
export * from "@/platform/framework";
export * from "@/platform/extensions";
