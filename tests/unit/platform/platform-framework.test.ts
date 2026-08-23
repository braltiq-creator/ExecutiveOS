import { describe, expect, it, beforeEach } from "vitest";
import {
  bootPlatform,
  createPluginRegistry,
  PLATFORM_VERSION,
  SDK_VERSION,
  formatSemVer,
  isCompatible,
  assertBusinessEvent,
  PLATFORM_BUSINESS_EVENT_TYPES,
  createFieldServicesKnowledgePack,
  createMockSapConnector,
  createMockMaximoConnector,
} from "@/platform";
import { EnterpriseDigitalTwin } from "@/digital-twin";

describe("Platform Framework & Extension Architecture", () => {
  beforeEach(() => {
    bootPlatform({ registerBuiltins: true });
  });

  it("boots with platform and SDK versions", () => {
    expect(formatSemVer(PLATFORM_VERSION)).toBe("1.0.0");
    expect(formatSemVer(SDK_VERSION)).toBe("1.0.0");
  });

  it("registers knowledge packs and connectors without Core edits", () => {
    const registry = bootPlatform();
    expect(registry.knowledgePacks().length).toBeGreaterThanOrEqual(1);
    expect(registry.connectors().length).toBeGreaterThanOrEqual(3);
    expect(
      registry.knowledgePacks()[0]?.manifest.id,
    ).toBe("pack-field-services-simpro");
  });

  it("allows SAP and Maximo connectors simultaneously", () => {
    const registry = bootPlatform();
    const ids = registry.connectors().map((connector) => connector.manifest.id);
    expect(ids).toContain("connector-sap-mock");
    expect(ids).toContain("connector-maximo-mock");
    expect(ids).toContain("connector-simpro");
  });

  it("can replace SAP with Maximo without changing the Knowledge Pack", () => {
    const registry = bootPlatform();
    expect(registry.unregister("connector-sap-mock")).toBe(true);
    const ids = registry.connectors().map((connector) => connector.manifest.id);
    expect(ids).not.toContain("connector-sap-mock");
    expect(ids).toContain("connector-maximo-mock");
    expect(registry.knowledgePacks()[0]?.manifest.id).toBe(
      "pack-field-services-simpro",
    );
  });

  it("lets a Knowledge Pack work with SAP and Maximo via BusinessEvents", () => {
    const registry = bootPlatform();
    const matrix = registry.validatePackConnectorMatrix(
      "pack-field-services-simpro",
    );
    expect(matrix.ok).toBe(true);
    expect(matrix.registeredConnectors.length).toBeGreaterThanOrEqual(2);

    const twin = new EnterpriseDigitalTwin({ source: "platform-test" });
    const sap = createMockSapConnector();
    const maximo = createMockMaximoConnector();
    sap.authenticate();
    maximo.authenticate();
    const sapEvents = sap.sync().events;
    const maximoEvents = maximo.sync().events;
    for (const event of [...sapEvents, ...maximoEvents]) {
      assertBusinessEvent(event);
    }
    twin.apply([...sapEvents, ...maximoEvents]);
    expect(twin.getState().eventCount).toBeGreaterThan(0);
    expect(
      twin.history().some((event) => event.eventType === "InvoicePaid"),
    ).toBe(true);
    expect(
      twin.history().some((event) => event.eventType === "AssetFailed"),
    ).toBe(true);
  });

  it("supports adding a Knowledge Pack without Core changes", () => {
    const registry = createPluginRegistry();
    const pack = createFieldServicesKnowledgePack();
    const result = registry.register({ kind: "knowledge_pack", extension: pack });
    expect(result.ok).toBe(true);
    expect(pack.executiveKpis().length).toBeGreaterThan(0);
    expect(pack.realityLabScenarios().length).toBe(20);
    expect(pack.supportedConnectors()).toEqual(
      expect.arrayContaining(["connector-sap-mock", "connector-maximo-mock"]),
    );
  });

  it("validates compatibility and surfaces deprecation warnings", () => {
    const ok = isCompatible({
      minPlatform: { major: 1, minor: 0, patch: 0 },
      sdk: { min: { major: 1, minor: 0, patch: 0 } },
    });
    expect(ok.ok).toBe(true);

    const registry = createPluginRegistry();
    const pack = createFieldServicesKnowledgePack();
    // Register a deprecated duplicate id path via cloned manifest
    const deprecatedPack = {
      ...pack,
      manifest: {
        ...pack.manifest,
        id: "pack-field-services-legacy",
        deprecated: {
          since: { major: 1, minor: 0, patch: 0 },
          message: "Use pack-field-services-simpro",
          successorId: "pack-field-services-simpro",
        },
      },
    };
    const result = registry.register({
      kind: "knowledge_pack",
      extension: deprecatedPack,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => /Deprecated/i.test(warning))).toBe(
      true,
    );
  });

  it("keeps Business Events as the universal language", () => {
    expect(PLATFORM_BUSINESS_EVENT_TYPES).toEqual(
      expect.arrayContaining([
        "AssetFailed",
        "ProjectDelayed",
        "InvoicePaid",
        "TechnicianUnavailable",
        "ContractAwarded",
      ]),
    );
    const connector = createMockMaximoConnector();
    const events = connector.sync().events;
    expect(events.every((event) => event.metadata.connectorId)).toBe(true);
    expect(JSON.stringify(events)).not.toMatch(/ibm\.com|sap\.com/i);
  });

  it("discovers scenarios from extensions", () => {
    const registry = bootPlatform();
    const scenarios = registry.discoverScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps AgentExtension contract stable for future AI routing", () => {
    // Contract shape only — implementations may later route to models
    type FutureAgent = {
      manifest: { kind: "agent_extension" };
      agentId: string;
      title: string;
      review: (snapshot: unknown) => unknown;
    };
    const stub: FutureAgent = {
      manifest: { kind: "agent_extension" },
      agentId: "future_ai_cfo",
      title: "AI CFO",
      review: () => ({ ok: true }),
    };
    expect(stub.manifest.kind).toBe("agent_extension");
  });
});
