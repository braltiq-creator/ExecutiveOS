/**
 * ExecutiveOS Enterprise Runtime
 *
 * Multi-tenant SaaS foundation. Core engines stay unchanged.
 * Every request resolves TenantContext before execution.
 */

export * from "@/runtime/tenant";
export * from "@/runtime/identity";
export * from "@/runtime/rbac";
export * from "@/runtime/organisation";
export * from "@/runtime/workspace";
export * from "@/runtime/policy";
export * from "@/runtime/audit";
export * from "@/runtime/observability";
export * from "@/runtime/telemetry";
export * from "@/runtime/configuration";
export * from "@/runtime/feature-flags";
export * from "@/runtime/licensing";
export * from "@/runtime/usage";
export * from "@/runtime/billing-ready";
export * from "@/runtime/compliance";

export {
  resolveTenantContext,
  authorize,
  authorizeFeature,
  authorizeConnector,
} from "@/runtime/context";
export type {
  TenantContext,
  ResolveTenantContextInput,
} from "@/runtime/context";

export { projectExperienceForTenant } from "@/runtime/experience";
export type { RuntimeExperienceView } from "@/runtime/experience";

export { bootstrapNorthlineRuntime, bootstrapExecutiveSnapshotRuntime } from "@/runtime/bootstrap";
export type { BootstrappedRuntime } from "@/runtime/bootstrap";
