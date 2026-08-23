/**
 * Simpro / Field Services Industry Intelligence Pack 1.0
 *
 * Executive intelligence layer ABOVE Simpro — never a Simpro dashboard.
 */

export type * from "@/industry/field-services/simpro/domain";
export { SIMPRO_ENTITY_KINDS } from "@/industry/field-services/simpro/domain";

export {
  SIMPRO_EVENT_MAPPINGS,
  mapSimproEventToBusinessEvents,
  mappingFor,
  canonicalTypeForKind,
} from "@/industry/field-services/simpro/events";
export type { BusinessEventMapping } from "@/industry/field-services/simpro/events";

export {
  FIELD_SERVICE_KPI_IDS,
  FIELD_SERVICE_KPI_LIBRARY,
  MOCK_FIELD_SERVICE_KPIS,
} from "@/industry/field-services/simpro/kpis";
export type {
  FieldServiceKpiId,
  FieldServiceKpiDefinition,
  FieldServiceKpiSnapshot,
} from "@/industry/field-services/simpro/kpis";

export {
  HEALTH_DIMENSION_IDS,
  HEALTH_DIMENSION_LABELS,
  deriveFieldServicesHealth,
} from "@/industry/field-services/simpro/health";
export type {
  HealthDimensionId,
  HealthDimensionScore,
  FieldServicesHealthReport,
} from "@/industry/field-services/simpro/health";

export {
  FIELD_SERVICE_JUDGEMENT_RULES,
  applyFieldServiceJudgementRules,
} from "@/industry/field-services/simpro/rules";
export type {
  JudgementRule,
  JudgementRuleHit,
  JudgementRuleId,
} from "@/industry/field-services/simpro/rules";

export {
  FIELD_SERVICE_BENCHMARKS,
  compareToBenchmark,
  getBenchmark,
} from "@/industry/field-services/simpro/benchmarks";
export type {
  BenchmarkProfile,
  BenchmarkComparison,
  ContractorScale,
  TradeDiscipline,
} from "@/industry/field-services/simpro/benchmarks";

export {
  SimproDomainAdapter,
  createSimproDomainAdapter,
  createMockSimproDomainEvents,
} from "@/industry/field-services/simpro/adapter";

export {
  FIELD_SERVICES_SCENARIOS,
  getFieldServicesScenario,
} from "@/industry/field-services/simpro/scenarios";

export {
  applyFieldServicesIndustry,
} from "@/industry/field-services/simpro/apply-industry";
export type { FieldServicesIndustryContext } from "@/industry/field-services/simpro/apply-industry";

export { ORG_APEX_FIELD_SERVICES } from "@/industry/field-services/simpro/organisation";

export { buildFieldServicesExecutiveSnapshot } from "@/industry/field-services/simpro/snapshot";