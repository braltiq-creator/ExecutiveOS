/**
 * Enterprise Digital Twin
 *
 * Canonical operational model of the organisation.
 * Continuously built from BusinessEvents. Intelligence reasons over the Twin.
 */

export type * from "@/digital-twin/types";
export { EnterpriseDigitalTwin } from "@/digital-twin/twin";
export {
  updateKnowledgeGraphFromTwin,
} from "@/digital-twin/graph-bridge";
export type { GraphBridgeResult } from "@/digital-twin/graph-bridge";
export {
  createTwinEnterpriseDataProvider,
  deriveSignalsFromTwin,
} from "@/digital-twin/signals-bridge";
export { bootstrapNorthlineDigitalTwin } from "@/digital-twin/bootstrap";
export type { DigitalTwinProvider } from "@/digital-twin/provider";
export {
  createMockDigitalTwinProvider,
  getDigitalTwinProvider,
  getEnterpriseDigitalTwin,
  setDigitalTwinProvider,
} from "@/digital-twin/provider";
