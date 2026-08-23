export {
  createMicrosoftGraphClient,
} from "@/providers/microsoft365/graph/client";
export type {
  GraphClient,
  GraphClientOptions,
  GraphPage,
  GraphRequest,
  GraphTransport,
} from "@/providers/microsoft365/graph/client";

export {
  createProductionGraphClient,
  createMockGraphHttpTransport,
} from "@/providers/microsoft365/graph/production-client";
export type {
  ProductionGraphClient,
  ProductionGraphOptions,
  GraphHttpTransport,
  GraphTelemetryEvent,
  GraphBatchRequest,
  GraphBatchResponse,
} from "@/providers/microsoft365/graph/production-client";