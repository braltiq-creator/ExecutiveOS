/**
 * Platform contracts barrel.
 */

export type * from "@/platform/contracts/identity";
export type * from "@/platform/contracts/business-event";
export type * from "@/platform/contracts/connector";
export type * from "@/platform/contracts/knowledge-pack";
export type * from "@/platform/contracts/providers";

export {
  PLATFORM_BUSINESS_EVENT_TYPES,
  assertBusinessEvent,
} from "@/platform/contracts/business-event";

export {
  toPackKpis,
  toPackRules,
} from "@/platform/contracts/knowledge-pack";
