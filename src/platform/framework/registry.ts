import type { ExtensionKind, ExtensionManifest } from "@/platform/contracts/identity";
import type { ExecutiveKnowledgePack } from "@/platform/contracts/knowledge-pack";
import type { PlatformConnector } from "@/platform/contracts/connector";
import type { BusinessEventMapper } from "@/platform/contracts/business-event";
import type {
  AgentExtension,
  BenchmarkProvider,
  IndustryVocabularyProvider,
  JudgementRuleProvider,
  NarrativeProvider,
  NotificationProvider,
  ScenarioProvider,
} from "@/platform/contracts/providers";
import {
  collectDeprecationWarning,
  isCompatible,
  type DeprecationWarning,
} from "@/platform/versioning";

export type RegisteredExtension =
  | { kind: "knowledge_pack"; extension: ExecutiveKnowledgePack }
  | { kind: "connector"; extension: PlatformConnector }
  | { kind: "business_event_mapper"; extension: BusinessEventMapper & { manifest: ExtensionManifest } }
  | { kind: "benchmark_provider"; extension: BenchmarkProvider }
  | { kind: "scenario_provider"; extension: ScenarioProvider }
  | { kind: "judgement_rule_provider"; extension: JudgementRuleProvider }
  | { kind: "agent_extension"; extension: AgentExtension }
  | { kind: "narrative_provider"; extension: NarrativeProvider }
  | { kind: "industry_vocabulary"; extension: IndustryVocabularyProvider }
  | { kind: "notification_provider"; extension: NotificationProvider };

export type RegistrationResult = {
  ok: boolean;
  extensionId: string;
  errors: string[];
  warnings: string[];
  deprecation?: DeprecationWarning | null;
};

/**
 * Plugin Registry — discover extensions without modifying Core.
 * Multiple connectors / packs may coexist.
 */
export class PluginRegistry {
  private readonly entries = new Map<string, RegisteredExtension>();
  private readonly warnings: string[] = [];

  register(entry: RegisteredExtension): RegistrationResult {
    const manifest = getManifest(entry);
    const compatibility = isCompatible(manifest.compatibility);
    const deprecation = collectDeprecationWarning(manifest);
    const errors = [...compatibility.errors];
    const warnings = [...compatibility.warnings];

    if (deprecation) {
      warnings.push(
        `Deprecated since ${deprecation.since}: ${deprecation.message}`,
      );
    }

    if (this.entries.has(manifest.id)) {
      errors.push(`Extension already registered: ${manifest.id}`);
    }

    if (errors.length === 0) {
      this.entries.set(manifest.id, entry);
      this.warnings.push(...warnings);
    }

    return {
      ok: errors.length === 0,
      extensionId: manifest.id,
      errors,
      warnings,
      deprecation,
    };
  }

  unregister(id: string): boolean {
    return this.entries.delete(id);
  }

  get(id: string): RegisteredExtension | undefined {
    return this.entries.get(id);
  }

  list(kind?: ExtensionKind): RegisteredExtension[] {
    const all = [...this.entries.values()];
    return kind ? all.filter((entry) => entry.kind === kind) : all;
  }

  knowledgePacks(): ExecutiveKnowledgePack[] {
    return this.list("knowledge_pack").map(
      (entry) => (entry as { extension: ExecutiveKnowledgePack }).extension,
    );
  }

  connectors(): PlatformConnector[] {
    return this.list("connector").map(
      (entry) => (entry as { extension: PlatformConnector }).extension,
    );
  }

  scenarioProviders(): ScenarioProvider[] {
    return this.list("scenario_provider").map(
      (entry) => (entry as { extension: ScenarioProvider }).extension,
    );
  }

  benchmarkProviders(): BenchmarkProvider[] {
    return this.list("benchmark_provider").map(
      (entry) => (entry as { extension: BenchmarkProvider }).extension,
    );
  }

  notificationProviders(): NotificationProvider[] {
    return this.list("notification_provider").map(
      (entry) => (entry as { extension: NotificationProvider }).extension,
    );
  }

  agentExtensions(): AgentExtension[] {
    return this.list("agent_extension").map(
      (entry) => (entry as { extension: AgentExtension }).extension,
    );
  }

  /** All Reality Lab scenarios from registered scenario providers + packs */
  discoverScenarios() {
    const fromProviders = this.scenarioProviders().flatMap((provider) =>
      provider.list(),
    );
    const fromPacks = this.knowledgePacks().flatMap((pack) =>
      pack.realityLabScenarios(),
    );
    return [...fromProviders, ...fromPacks];
  }

  /** Validate a Mining/Healthcare pack can work with multiple connectors */
  validatePackConnectorMatrix(packId: string): {
    ok: boolean;
    packConnectors: string[];
    registeredConnectors: string[];
    message: string;
  } {
    const pack = this.knowledgePacks().find((item) => item.manifest.id === packId);
    if (!pack) {
      return {
        ok: false,
        packConnectors: [],
        registeredConnectors: [],
        message: `Pack not found: ${packId}`,
      };
    }
    const packConnectors = pack.supportedConnectors();
    const registeredConnectors = this.connectors().map((connector) => connector.manifest.id);
    // Packs declare affinity, not exclusivity — any BusinessEvent-producing connector works
    return {
      ok: true,
      packConnectors,
      registeredConnectors,
      message:
        "Knowledge Pack consumes BusinessEvents; any registered connector may feed the Twin. Affinity list is advisory.",
    };
  }

  collectedWarnings(): string[] {
    return [...this.warnings];
  }

  clear(): void {
    this.entries.clear();
    this.warnings.length = 0;
  }
}

function getManifest(entry: RegisteredExtension): ExtensionManifest {
  if (entry.kind === "business_event_mapper") {
    return entry.extension.manifest;
  }
  return entry.extension.manifest;
}

let defaultRegistry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new PluginRegistry();
  }
  return defaultRegistry;
}

export function setPluginRegistry(registry: PluginRegistry): void {
  defaultRegistry = registry;
}

export function createPluginRegistry(): PluginRegistry {
  return new PluginRegistry();
}
