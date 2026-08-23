/**
 * Connector lifecycle stages — every managed connector follows this path.
 */

export const CONNECTOR_LIFECYCLE_STAGES = [
  "connect",
  "authenticate",
  "validate",
  "synchronise",
  "normalise",
  "map",
  "publish",
  "monitor",
  "recover",
  "disconnect",
] as const;

export type ConnectorLifecycleStage =
  (typeof CONNECTOR_LIFECYCLE_STAGES)[number];

export type LifecycleTransition = {
  from: ConnectorLifecycleStage | "idle";
  to: ConnectorLifecycleStage;
  at: string;
  ok: boolean;
  message: string;
};

export type LifecycleState = {
  stage: ConnectorLifecycleStage | "idle";
  history: LifecycleTransition[];
  connected: boolean;
  authenticated: boolean;
};

export function createLifecycleState(): LifecycleState {
  return {
    stage: "idle",
    history: [],
    connected: false,
    authenticated: false,
  };
}

export function transitionLifecycle(
  state: LifecycleState,
  to: ConnectorLifecycleStage,
  input: { ok: boolean; message: string; at?: string },
): LifecycleState {
  const at = input.at ?? new Date().toISOString();
  const history = [
    ...state.history,
    { from: state.stage, to, at, ok: input.ok, message: input.message },
  ].slice(-40);

  return {
    stage: to,
    history,
    connected:
      to === "disconnect"
        ? false
        : to === "connect" || to === "authenticate" || state.connected
          ? input.ok || (to !== "connect" && state.connected)
          : state.connected,
    authenticated:
      to === "disconnect"
        ? false
        : to === "authenticate"
          ? input.ok
          : state.authenticated,
  };
}
