/**
 * Platform-wide observability metrics.
 */

export type HealthStatus = "healthy" | "degraded" | "unavailable";

export type ComponentHealth = {
  component:
    | "application"
    | "connector"
    | "context_provider"
    | "knowledge_graph"
    | "executive_council"
    | "strategic_foresight";
  status: HealthStatus;
  latencyMs: number | null;
  errorRate: number;
  message: string;
};

export type PlatformObservability = {
  asOf: string;
  tenantId: string;
  components: ComponentHealth[];
  availability: number;
  resourceUsage: {
    cpuPct: number;
    memoryPct: number;
    storageGb: number;
  };
};

export function buildPlatformObservability(input: {
  tenantId: string;
  asOf?: string;
  connectorHealthy?: boolean;
  contextProviderHealthy?: boolean;
  councilLatencyMs?: number;
  foresightLatencyMs?: number;
}): PlatformObservability {
  const asOf = input.asOf ?? new Date().toISOString();
  const components: ComponentHealth[] = [
    {
      component: "application",
      status: "healthy",
      latencyMs: 12,
      errorRate: 0,
      message: "Application healthy",
    },
    {
      component: "connector",
      status: input.connectorHealthy === false ? "degraded" : "healthy",
      latencyMs: 40,
      errorRate: input.connectorHealthy === false ? 0.05 : 0,
      message:
        input.connectorHealthy === false
          ? "One or more connectors degraded"
          : "Connectors healthy",
    },
    {
      component: "context_provider",
      status: input.contextProviderHealthy === false ? "degraded" : "healthy",
      latencyMs: 55,
      errorRate: 0,
      message: "Context providers operational",
    },
    {
      component: "knowledge_graph",
      status: "healthy",
      latencyMs: 8,
      errorRate: 0,
      message: "Knowledge Graph healthy",
    },
    {
      component: "executive_council",
      status: "healthy",
      latencyMs: input.councilLatencyMs ?? 18,
      errorRate: 0,
      message: "Executive Council performance nominal",
    },
    {
      component: "strategic_foresight",
      status: "healthy",
      latencyMs: input.foresightLatencyMs ?? 22,
      errorRate: 0,
      message: "Strategic Foresight performance nominal",
    },
  ];

  const healthy = components.filter((c) => c.status === "healthy").length;
  return {
    asOf,
    tenantId: input.tenantId,
    components,
    availability: Math.round((healthy / components.length) * 100),
    resourceUsage: {
      cpuPct: 22,
      memoryPct: 41,
      storageGb: 12.4,
    },
  };
}
