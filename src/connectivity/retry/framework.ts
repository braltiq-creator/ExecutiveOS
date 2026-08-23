/**
 * Retry framework — backoff, DLQ, replay, failure classification.
 */

export type FailureKind = "transient" | "permanent" | "partial";

export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 10_000,
  jitter: false,
};

export type RetryAttempt = {
  attempt: number;
  delayMs: number;
  failureKind: FailureKind;
  error: string;
  at: string;
};

export type DeadLetterItem = {
  id: string;
  connectorId: string;
  payloadRef: string;
  error: string;
  failureKind: FailureKind;
  attempts: number;
  enqueuedAt: string;
};

export type RetryState = {
  attempts: RetryAttempt[];
  deadLetters: DeadLetterItem[];
  lastFailureKind: FailureKind | null;
};

export function createRetryState(): RetryState {
  return { attempts: [], deadLetters: [], lastFailureKind: null };
}

export function classifyFailure(error: string): FailureKind {
  if (
    /rate.?limit|timeout|temporar|network|5\d\d|unavailable|expired|ttl|retryable/i.test(
      error,
    )
  ) {
    return "transient";
  }
  if (/partial|some records|batch/i.test(error)) {
    return "partial";
  }
  return "permanent";
}

export function computeBackoff(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): number {
  const exp = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * 2 ** Math.max(0, attempt - 1),
  );
  if (!policy.jitter) return exp;
  return Math.round(exp * (0.5 + Math.random() * 0.5));
}

export function shouldRetry(
  failureKind: FailureKind,
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): boolean {
  if (failureKind === "permanent") return false;
  return attempt < policy.maxAttempts;
}

export function recordFailure(
  state: RetryState,
  input: {
    connectorId: string;
    error: string;
    attempt: number;
    payloadRef?: string;
    at?: string;
    policy?: RetryPolicy;
  },
): RetryState {
  const policy = input.policy ?? DEFAULT_RETRY_POLICY;
  const failureKind = classifyFailure(input.error);
  const at = input.at ?? new Date().toISOString();
  const attempts = [
    ...state.attempts,
    {
      attempt: input.attempt,
      delayMs: computeBackoff(input.attempt, { ...policy, jitter: false }),
      failureKind,
      error: input.error,
      at,
    },
  ];

  const deadLetters = [...state.deadLetters];
  if (!shouldRetry(failureKind, input.attempt, policy)) {
    deadLetters.push({
      id: `dlq-${input.connectorId}-${attempts.length}`,
      connectorId: input.connectorId,
      payloadRef: input.payloadRef ?? "unknown",
      error: input.error,
      failureKind,
      attempts: input.attempt,
      enqueuedAt: at,
    });
  }

  return { attempts, deadLetters, lastFailureKind: failureKind };
}

export function replayDeadLetter(
  state: RetryState,
  deadLetterId: string,
): { state: RetryState; item: DeadLetterItem | undefined } {
  const item = state.deadLetters.find((d) => d.id === deadLetterId);
  if (!item) return { state, item: undefined };
  return {
    state: {
      ...state,
      deadLetters: state.deadLetters.filter((d) => d.id !== deadLetterId),
    },
    item,
  };
}
