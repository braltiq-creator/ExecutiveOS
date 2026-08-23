/**
 * Connector testing harness — mock APIs, replay, failure simulation.
 */

import type { ManagedConnector } from "@/connectivity/connectors";
import type { SyncResult } from "@/connectors/types";
import {
  classifyFailure,
  recordFailure,
  createRetryState,
  type RetryState,
} from "@/connectivity/retry";

export type SimulatedFailure =
  | "none"
  | "auth_expiry"
  | "rate_limit"
  | "network_failure"
  | "permanent_error"
  | "partial_failure";

export type ConnectorSimulationResult = {
  ok: boolean;
  failure: SimulatedFailure;
  sync?: SyncResult;
  retry: RetryState;
  message: string;
};

export function simulateConnectorSync(input: {
  connector: ManagedConnector;
  failure?: SimulatedFailure;
  asOf?: string;
}): ConnectorSimulationResult {
  const failure = input.failure ?? "none";
  let retry = createRetryState();

  if (failure === "auth_expiry") {
    retry = recordFailure(retry, {
      connectorId: input.connector.id,
      error: "Authentication expired — token TTL elapsed",
      attempt: 1,
      at: input.asOf,
    });
    input.connector.recover("Authentication expired — token TTL elapsed");
    return {
      ok: false,
      failure,
      retry,
      message: "Simulated authentication expiry",
    };
  }

  if (failure === "rate_limit") {
    retry = recordFailure(retry, {
      connectorId: input.connector.id,
      error: "429 rate limit — temporary",
      attempt: 1,
      at: input.asOf,
    });
    return {
      ok: false,
      failure,
      retry,
      message: "Simulated rate limiting",
    };
  }

  if (failure === "network_failure") {
    retry = recordFailure(retry, {
      connectorId: input.connector.id,
      error: "Network timeout — unavailable",
      attempt: 1,
      at: input.asOf,
    });
    return {
      ok: false,
      failure,
      retry,
      message: "Simulated network failure",
    };
  }

  if (failure === "permanent_error") {
    retry = recordFailure(retry, {
      connectorId: input.connector.id,
      error: "Invalid credentials — permanent",
      attempt: 1,
      at: input.asOf,
    });
    return {
      ok: false,
      failure,
      retry,
      message: "Simulated permanent failure",
    };
  }

  input.connector.connect();
  const sync = input.connector.synchronise({ dryRun: failure === "partial_failure" });

  if (failure === "partial_failure") {
    retry = recordFailure(retry, {
      connectorId: input.connector.id,
      error: "Partial failure — some records skipped",
      attempt: 1,
      at: input.asOf,
    });
  }

  return {
    ok: failure === "none" || failure === "partial_failure",
    failure,
    sync,
    retry,
    message:
      failure === "none"
        ? "Sync simulation succeeded"
        : `Simulated ${failure}`,
  };
}

export function describeFailureClassification(error: string): string {
  return classifyFailure(error);
}
