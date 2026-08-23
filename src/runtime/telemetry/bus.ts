/**
 * Telemetry events — structured, tenant-scoped.
 */

export type TelemetryEvent = {
  name: string;
  tenantId: string;
  at: string;
  durationMs?: number;
  attributes: Record<string, string | number | boolean>;
};

export type TelemetryBus = {
  emit(event: TelemetryEvent): void;
  flush(): TelemetryEvent[];
};

export function createTelemetryBus(): TelemetryBus {
  const buffer: TelemetryEvent[] = [];
  return {
    emit(event) {
      buffer.push(event);
    },
    flush() {
      return buffer.splice(0, buffer.length);
    },
  };
}
