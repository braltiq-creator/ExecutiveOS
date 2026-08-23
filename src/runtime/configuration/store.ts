/**
 * Tenant configuration — customisation without Core changes.
 */

export type TenantConfiguration = {
  tenantId: string;
  values: Record<string, string | number | boolean>;
};

export function createTenantConfiguration(
  tenantId: string,
  values: Record<string, string | number | boolean> = {},
): TenantConfiguration {
  return {
    tenantId,
    values: {
      timezone: "Australia/Sydney",
      locale: "en-AU",
      briefingEnabled: true,
      councilEnabled: true,
      futuresEnabled: true,
      agendaEnabled: true,
      intelligenceProfileId: "operations_executive",
      ...values,
    },
  };
}

export function getConfigValue<T extends string | number | boolean>(
  config: TenantConfiguration,
  key: string,
  fallback: T,
): T {
  const value = config.values[key];
  return (value as T | undefined) ?? fallback;
}
