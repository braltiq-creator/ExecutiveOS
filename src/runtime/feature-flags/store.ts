/**
 * Feature flags — beta, tenant-specific, gradual rollout, kill switch.
 */

export type FeatureFlag = {
  key: string;
  description: string;
  defaultEnabled: boolean;
  /** 0–100 percentage rollout */
  rolloutPct: number;
  tenantOverrides: Record<string, boolean>;
  emergencyDisabled: boolean;
  experimentId?: string;
};

export type FeatureFlagStore = {
  define(flag: FeatureFlag): void;
  isEnabled(key: string, tenantId: string, userKey?: string): boolean;
  setTenantOverride(key: string, tenantId: string, enabled: boolean): void;
  emergencyDisable(key: string): void;
  list(): FeatureFlag[];
};

function bucket(tenantId: string, userKey: string, flagKey: string): number {
  const raw = `${tenantId}:${userKey}:${flagKey}`;
  let h = 0;
  for (let i = 0; i < raw.length; i += 1) {
    h = (h * 33 + raw.charCodeAt(i)) >>> 0;
  }
  return h % 100;
}

export function createFeatureFlagStore(
  initial: FeatureFlag[] = [],
): FeatureFlagStore {
  const flags = new Map<string, FeatureFlag>();
  for (const flag of initial) flags.set(flag.key, flag);

  return {
    define(flag) {
      flags.set(flag.key, flag);
    },
    isEnabled(key, tenantId, userKey = "default") {
      const flag = flags.get(key);
      if (!flag) return false;
      if (flag.emergencyDisabled) return false;
      if (tenantId in flag.tenantOverrides) {
        return flag.tenantOverrides[tenantId];
      }
      if (flag.rolloutPct >= 100) return flag.defaultEnabled;
      if (flag.rolloutPct <= 0) return false;
      return bucket(tenantId, userKey, key) < flag.rolloutPct;
    },
    setTenantOverride(key, tenantId, enabled) {
      const flag = flags.get(key);
      if (!flag) return;
      flags.set(key, {
        ...flag,
        tenantOverrides: { ...flag.tenantOverrides, [tenantId]: enabled },
      });
    },
    emergencyDisable(key) {
      const flag = flags.get(key);
      if (!flag) return;
      flags.set(key, { ...flag, emergencyDisabled: true });
    },
    list() {
      return [...flags.values()];
    },
  };
}

export function createDefaultFeatureFlags(): FeatureFlag[] {
  return [
    {
      key: "futures",
      description: "Strategic Foresight / Possible Futures",
      defaultEnabled: true,
      rolloutPct: 100,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
    {
      key: "agenda",
      description: "Executive Agenda",
      defaultEnabled: true,
      rolloutPct: 100,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
    {
      key: "microsoft365_context",
      description: "Microsoft 365 Executive Context",
      defaultEnabled: true,
      rolloutPct: 100,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
    {
      key: "simpro_context",
      description: "Simpro Operational Executive Context",
      defaultEnabled: true,
      rolloutPct: 100,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
    {
      key: "salesforce_context",
      description: "Salesforce Commercial Executive Context",
      defaultEnabled: true,
      rolloutPct: 100,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
    {
      key: "reality_lab_beta",
      description: "Reality Lab beta",
      defaultEnabled: false,
      rolloutPct: 25,
      tenantOverrides: {},
      emergencyDisabled: false,
      experimentId: "exp-reality-lab",
    },
    {
      key: "crisis_mode",
      description: "Crisis Response workspace mode",
      defaultEnabled: false,
      rolloutPct: 0,
      tenantOverrides: {},
      emergencyDisabled: false,
    },
  ];
}
