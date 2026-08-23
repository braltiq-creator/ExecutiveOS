import { createClient } from "@/lib/supabase/server";
import { getConfiguredProviderName } from "@/lib/ai/models";
import { getRecentLogs, getUptimeMs, logger } from "@/lib/logging/logger";
import { listConnectedIntegrations } from "@/lib/integrations/service";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import { getAuthenticatedUser } from "@/lib/auth/actions";

export type HealthStatus = "healthy" | "degraded" | "down";

export type ServiceHealth = {
  name: string;
  status: HealthStatus;
  latencyMs: number | null;
  message: string;
};

export type SystemHealthSnapshot = {
  generatedAt: string;
  uptimeMs: number;
  api: ServiceHealth;
  database: ServiceHealth;
  ai: ServiceHealth;
  integrations: ServiceHealth;
  backgroundJobs: ServiceHealth;
  queue: ServiceHealth;
  recentErrors: Array<{
    timestamp: string;
    message: string;
    code?: string;
  }>;
};

async function measureDatabaseLatency(): Promise<ServiceHealth> {
  const started = performance.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("organizations").select("id").limit(1);
    const latencyMs = Math.round(performance.now() - started);

    if (error) {
      return {
        name: "Database",
        status: "down",
        latencyMs,
        message: error.message,
      };
    }

    return {
      name: "Database",
      status: latencyMs > 500 ? "degraded" : "healthy",
      latencyMs,
      message: "Supabase connection OK",
    };
  } catch (error) {
    return {
      name: "Database",
      status: "down",
      latencyMs: null,
      message: error instanceof Error ? error.message : "Database unavailable",
    };
  }
}

async function measureAiHealth(): Promise<ServiceHealth> {
  const provider = getConfiguredProviderName();
  const hasKey = Boolean(process.env.OPENAI_API_KEY);

  if (!hasKey) {
    return {
      name: "AI Provider",
      status: "degraded",
      latencyMs: null,
      message: `${provider} configured but OPENAI_API_KEY missing`,
    };
  }

  return {
    name: "AI Provider",
    status: "healthy",
    latencyMs: null,
    message: `${provider} configured`,
  };
}

async function measureIntegrationHealth(userId: string): Promise<ServiceHealth> {
  try {
    const membership = await fetchActiveMembership(userId);
    if (!membership) {
      return {
        name: "Integrations",
        status: "degraded",
        latencyMs: null,
        message: "No active organization",
      };
    }

    const started = performance.now();
    const connected = await listConnectedIntegrations(membership.organization.id);
    const latencyMs = Math.round(performance.now() - started);

    return {
      name: "Integrations",
      status: "healthy",
      latencyMs,
      message: `${connected.length} connected integration(s)`,
    };
  } catch (error) {
    return {
      name: "Integrations",
      status: "degraded",
      latencyMs: null,
      message: error instanceof Error ? error.message : "Integration check failed",
    };
  }
}

export async function collectSystemHealthSnapshot(): Promise<SystemHealthSnapshot> {
  const user = await getAuthenticatedUser();
  const requestId = crypto.randomUUID();

  logger.info("Collecting system health snapshot", { requestId, userId: user?.id });

  const [database, ai, integrations] = await Promise.all([
    measureDatabaseLatency(),
    measureAiHealth(),
    user ? measureIntegrationHealth(user.id) : Promise.resolve({
      name: "Integrations",
      status: "degraded" as const,
      latencyMs: null,
      message: "Unauthenticated",
    }),
  ]);

  const recentErrors = getRecentLogs(100)
    .filter((entry) => entry.level === "error")
    .slice(0, 10)
    .map((entry) => ({
      timestamp: entry.timestamp,
      message: entry.message,
      code: entry.error?.code,
    }));

  const apiStatus: HealthStatus =
    database.status === "down" ? "down" : database.status === "degraded" ? "degraded" : "healthy";

  return {
    generatedAt: new Date().toISOString(),
    uptimeMs: getUptimeMs(),
    api: {
      name: "API",
      status: apiStatus,
      latencyMs: database.latencyMs,
      message: "Next.js application server",
    },
    database,
    ai,
    integrations,
    backgroundJobs: {
      name: "Background Jobs",
      status: "healthy",
      latencyMs: null,
      message: "Sync engine ready (scheduled jobs via integrations)",
    },
    queue: {
      name: "Queue",
      status: "healthy",
      latencyMs: null,
      message: "In-process queue (future: external worker)",
    },
    recentErrors,
  };
}

export async function requireSystemAdmin(userId: string, email: string | null): Promise<boolean> {
  const allowed = (process.env.SYSTEM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (email && allowed.includes(email.toLowerCase())) {
    return true;
  }

  const membership = await fetchActiveMembership(userId);
  return membership?.member.role === "owner";
}
