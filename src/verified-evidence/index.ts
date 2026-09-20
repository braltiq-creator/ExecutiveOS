export type * from "@/verified-evidence/types";
export {
  PHASE37_PROVIDERS,
  integrationProviderIdFor,
  verifiedProviderFromIntegrationId,
} from "@/verified-evidence/types";
export {
  assertProvenanceAllowed,
  assertNoSyntheticEvidence,
  isEvidenceEligibleForDiscovery,
  SyntheticEvidenceError,
} from "@/verified-evidence/safety";
export {
  assertClaimHasEvidenceRefs,
  classifyClaimFromEvidence,
  buildClaim,
  ClaimEvidenceError,
} from "@/verified-evidence/claims";
export {
  resetVerifiedEvidenceMemory,
  listMemoryConnections,
  upsertMemoryConnection,
  registerAuthenticatedConnection,
  markConnectionVerified,
  listMemoryEvidence,
  recordMemoryEvidence,
  listMemoryClaims,
  recordMemoryClaim,
  getDiscoveryEvidenceContext,
} from "@/verified-evidence/memory-store";
export { discoverFromVerifiedEvidence } from "@/verified-evidence/discovery";
export { buildSnapshotEvidenceBundle } from "@/verified-evidence/snapshot-bundle";
export {
  entityFromEvidence,
  relationshipFromEvidence,
} from "@/verified-evidence/graph-prep";
export { buildConnectionTruthViews } from "@/verified-evidence/ui-labels";
export type { ConnectionTruthView } from "@/verified-evidence/ui-labels";
export {
  resetDataSourceMemory,
  createDataSource,
  getDataSource,
  findDataSourceByName,
  listDataSources,
  setDataSourceCadence,
  persistDataSourceMapping,
  inspectUploadSchema,
  resolveMappingForUpload,
  receiveWeeklyUpload,
  attachImmutableSnapshot,
  getDataSourceFreshness,
  getSnapshotSummary,
  fingerprintHeaders,
  detectSchemaChange,
  computeFreshness,
  freshnessInfluencesConfidence,
  freshnessExecutiveCopy,
  compareSnapshotEvidence,
  resolveMappingForSource,
  inspectSourceSchema,
  logicalDataSourceNameForProfile,
  defaultCadenceForLogicalSource,
  resolveStudioWeeklySourceAction,
  persistStudioWeeklyMappingAction,
  finalizeStudioWeeklyIngestionAction,
} from "@/verified-evidence/data-sources";
export type {
  OrganizationDataSource,
  DataSourceCadence,
  DataSourceFreshness,
  DataSourceIngestionMethod,
  SchemaChangeReport,
  EvidenceCompareResult,
  SnapshotLineage,
  SnapshotEvidenceSummary,
  WeeklyResolveResult,
  WeeklyPersistMappingResult,
  WeeklyFinalizeResult,
} from "@/verified-evidence/data-sources";
