import type { ConnectedSystem } from "@/organisation-portal/types";

export function buildConnectedSystems(input: {
  connectedProviderIds?: string[];
  asOf?: string;
}): ConnectedSystem[] {
  const connected = new Set(input.connectedProviderIds ?? []);
  const asOf = input.asOf ?? new Date().toISOString();

  const defs: Array<Omit<ConnectedSystem, "status" | "healthScore" | "lastSyncAt" | "diagnostics">> = [
    {
      id: "sys-m365",
      name: "Microsoft 365",
      provider: "microsoft_365",
      reconnectPath: "/settings/integrations",
    },
    {
      id: "sys-simpro",
      name: "Simpro",
      provider: "simpro",
      reconnectPath: "/settings/integrations",
    },
    {
      id: "sys-salesforce",
      name: "Salesforce",
      provider: "salesforce",
      reconnectPath: "/settings/integrations",
    },
    {
      id: "sys-dynamics",
      name: "Microsoft Dynamics",
      provider: "microsoft_dynamics",
      reconnectPath: "/settings/integrations",
    },
  ];

  return defs.map((def) => {
    const isConnected =
      connected.has(def.provider) ||
      connected.has(def.id) ||
      (def.provider === "microsoft_365" && connected.has("microsoft365"));
    return {
      ...def,
      status: isConnected ? "connected" : "available",
      healthScore: isConnected ? 92 : 0,
      lastSyncAt: isConnected ? asOf : null,
      diagnostics: isConnected
        ? ["Last sync succeeded", "Credentials healthy"]
        : ["Not connected — connect to unlock Discovery"],
    };
  });
}
