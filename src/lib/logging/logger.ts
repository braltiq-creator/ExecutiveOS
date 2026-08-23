import { normalizeError, type AppError } from "@/lib/errors";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  durationMs?: number;
  [key: string]: unknown;
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
};

const recentLogs: LogEntry[] = [];
const MAX_RECENT_LOGS = 200;
const startTime = Date.now();

function writeLog(entry: LogEntry): void {
  recentLogs.unshift(entry);
  if (recentLogs.length > MAX_RECENT_LOGS) {
    recentLogs.length = MAX_RECENT_LOGS;
  }

  const payload = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(payload);
  } else if (entry.level === "warn") {
    console.warn(payload);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(payload);
  }
}

function baseLog(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    const normalized = normalizeError(error);
    entry.error = {
      name: normalized.name,
      message: normalized.message,
      code: normalized.code,
      stack: normalized.stack,
    };
  }

  writeLog(entry);
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function getUptimeMs(): number {
  return Date.now() - startTime;
}

export function getRecentLogs(limit = 50): LogEntry[] {
  return recentLogs.slice(0, limit);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    baseLog("debug", message, context);
  },
  info(message: string, context?: LogContext) {
    baseLog("info", message, context);
  },
  warn(message: string, context?: LogContext, error?: unknown) {
    baseLog("warn", message, context, error);
  },
  error(message: string, context?: LogContext, error?: unknown) {
    baseLog("error", message, context, error);
  },
};

export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
  context: LogContext = {},
): Promise<T> {
  const started = performance.now();
  try {
    const result = await fn();
    logger.info(`${label} completed`, {
      ...context,
      durationMs: Math.round(performance.now() - started),
    });
    return result;
  } catch (error) {
    logger.error(`${label} failed`, {
      ...context,
      durationMs: Math.round(performance.now() - started),
    }, error);
    throw error;
  }
}

export function logAppError(error: AppError, context?: LogContext): void {
  logger.error(error.message, { ...context, code: error.code }, error);
}

export type { LogEntry };
