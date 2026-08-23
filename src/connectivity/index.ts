/**
 * Enterprise Connectivity Platform
 *
 * Shared architecture for building secure, consistent enterprise connectors.
 * Vendor objects never escape the connector boundary — only BusinessEvents do.
 */

export * from "@/connectivity/authentication";
export * from "@/connectivity/authorisation";
export * from "@/connectivity/connectors";
export * from "@/connectivity/mapping";
export * from "@/connectivity/normalisation";
export * from "@/connectivity/synchronisation";
export * from "@/connectivity/monitoring";
export * from "@/connectivity/health";
export * from "@/connectivity/webhooks";
export * from "@/connectivity/scheduling";
export * from "@/connectivity/cache";
export * from "@/connectivity/retry";
export * from "@/connectivity/security";
export * from "@/connectivity/testing";
export * from "@/connectivity/sdk";

/** Re-export Core pipeline for convenience */
export {
  runEnterpriseSyncPipeline,
  type PipelineOptions,
  type PipelineResult,
} from "@/connectors";
