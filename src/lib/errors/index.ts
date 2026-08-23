export type AppErrorCode =
  | "UNKNOWN"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTEGRATION"
  | "BILLING"
  | "AI"
  | "KNOWLEDGE_GRAPH"
  | "RATE_LIMIT"
  | "INTERNAL";

export type AppErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode: number;
  readonly details?: AppErrorDetails;
  readonly cause?: unknown;

  constructor(
    message: string,
    code: AppErrorCode = "UNKNOWN",
    statusCode = 500,
    details?: AppErrorDetails,
    cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: AppErrorDetails) {
    super(message, "VALIDATION", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Authentication is required.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "AuthorizationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class IntegrationAppError extends AppError {
  constructor(message: string, code = "INTEGRATION", details?: AppErrorDetails) {
    super(message, code as AppErrorCode, 502, details);
    this.name = "IntegrationAppError";
  }
}

export class BillingAppError extends AppError {
  constructor(message: string, code = "BILLING", details?: AppErrorDetails) {
    super(message, code as AppErrorCode, 402, details);
    this.name = "BillingAppError";
  }
}

export class AIAppError extends AppError {
  constructor(message: string, code = "AI", details?: AppErrorDetails) {
    super(message, code as AppErrorCode, 503, details);
    this.name = "AIAppError";
  }
}

export class KnowledgeGraphAppError extends AppError {
  constructor(message: string, code = "KNOWLEDGE_GRAPH", details?: AppErrorDetails) {
    super(message, code as AppErrorCode, 500, details);
    this.name = "KnowledgeGraphAppError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again shortly.") {
    super(message, "RATE_LIMIT", 429);
    this.name = "RateLimitError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN", 500, undefined, error);
  }

  return new AppError("An unexpected error occurred.", "UNKNOWN", 500);
}

export function toUserMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}

export function toActionError(error: unknown): { error: string } {
  return { error: toUserMessage(error) };
}
