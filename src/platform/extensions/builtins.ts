import type { PluginRegistry } from "@/platform/framework/registry";
import { createFieldServicesKnowledgePack } from "@/platform/extensions/packs/field-services-pack";
import { createMockMaximoConnector } from "@/platform/extensions/connectors/maximo-mock";
import { createMockSapConnector } from "@/platform/extensions/connectors/sap-mock";
import { createSimproPlatformConnector } from "@/platform/extensions/connectors/simpro-platform";
import { createManifest, defaultCompatibility } from "@/platform/sdk";
import type { ScenarioProvider } from "@/platform/contracts/providers";
import type { BenchmarkProvider } from "@/platform/contracts/providers";
import type { NotificationProvider } from "@/platform/contracts/providers";
import { FIELD_SERVICES_SCENARIOS } from "@/industry/field-services/simpro";
import { FIELD_SERVICE_BENCHMARKS } from "@/industry/field-services/simpro";

/**
 * Register built-in extensions into the Plugin Registry.
 * Core engines are not modified.
 */
export function registerBuiltinExtensions(registry: PluginRegistry): void {
  registry.register({
    kind: "knowledge_pack",
    extension: createFieldServicesKnowledgePack(),
  });

  registry.register({
    kind: "connector",
    extension: createSimproPlatformConnector(),
  });
  registry.register({
    kind: "connector",
    extension: createMockSapConnector(),
  });
  registry.register({
    kind: "connector",
    extension: createMockMaximoConnector(),
  });

  const scenarioProvider: ScenarioProvider = {
    manifest: createManifest({
      id: "scenarios-field-services",
      name: "Field Services Scenario Pack",
      kind: "scenario_provider",
      version: { major: 1, minor: 0, patch: 0 },
      description: "Reality Lab scenarios for field services.",
      compatibility: defaultCompatibility(),
      provides: ["scenarios", "field-services"],
    }),
    list: () => FIELD_SERVICES_SCENARIOS,
    get: (id) => FIELD_SERVICES_SCENARIOS.find((scenario) => scenario.id === id),
  };
  registry.register({ kind: "scenario_provider", extension: scenarioProvider });

  const benchmarkProvider: BenchmarkProvider = {
    manifest: createManifest({
      id: "benchmarks-field-services",
      name: "Field Services Benchmark Pack",
      kind: "benchmark_provider",
      version: { major: 1, minor: 0, patch: 0 },
      description: "Peer benchmark profiles for field service contractors.",
      compatibility: defaultCompatibility(),
      provides: ["benchmarks", "field-services"],
    }),
    list: () => FIELD_SERVICE_BENCHMARKS,
    get: (id) => FIELD_SERVICE_BENCHMARKS.find((item) => item.id === id),
  };
  registry.register({
    kind: "benchmark_provider",
    extension: benchmarkProvider,
  });

  const notifications: NotificationProvider = {
    manifest: createManifest({
      id: "notifications-mock",
      name: "Mock Notification Provider",
      kind: "notification_provider",
      version: { major: 1, minor: 0, patch: 0 },
      description: "Records notifications for tests — swap for Slack/email later.",
      compatibility: defaultCompatibility(),
      provides: ["notifications"],
    }),
    channels: () => ["in_app", "email", "slack"],
    notify(payload) {
      return {
        ok: true,
        message: `Recorded ${payload.channel} notification: ${payload.title}`,
      };
    },
  };
  registry.register({
    kind: "notification_provider",
    extension: notifications,
  });
}
