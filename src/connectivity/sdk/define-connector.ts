/**
 * Connector SDK — minimal custom code to define a managed connector.
 */

import type {
  BusinessEvent,
  SyncOptions,
  ValidationResult,
} from "@/connectors/types";
import { BaseEnterpriseConnector } from "@/connectors";
import type { AuthStrategyId } from "@/connectivity/authentication";
import type { MappingDefinition } from "@/connectivity/mapping";
import {
  mapVendorToBusinessEvent,
  type VendorObject,
} from "@/connectivity/mapping";
import { manageConnector, type ManagedConnector } from "@/connectivity/connectors";

export type DefineConnectorInput = {
  id: string;
  system: string;
  label: string;
  preferredAuth: AuthStrategyId;
  mappings: MappingDefinition[];
  /** Deterministic mock/vendor fetch */
  fetchVendorObjects: (options?: SyncOptions) => VendorObject[];
  validateVendorObject?: (vendor: VendorObject) => ValidationResult;
};

/**
 * Define a connector with mapping definitions — lifecycle is provided.
 */
export function defineConnector(input: DefineConnectorInput): ManagedConnector {
  const connector = new SdkDefinedConnector(input);
  return manageConnector(connector);
}

class SdkDefinedConnector extends BaseEnterpriseConnector {
  readonly id: string;
  readonly system: string;
  readonly label: string;
  private readonly mappings: MappingDefinition[];
  private readonly fetchVendorObjects: DefineConnectorInput["fetchVendorObjects"];
  private readonly validateVendorObject?: DefineConnectorInput["validateVendorObject"];

  constructor(input: DefineConnectorInput) {
    super();
    this.id = input.id;
    this.system = input.system;
    this.label = input.label;
    this.mappings = input.mappings;
    this.fetchVendorObjects = input.fetchVendorObjects;
    this.validateVendorObject = input.validateVendorObject;
  }

  validate(raw: unknown): ValidationResult {
    const vendor = raw as VendorObject;
    if (!vendor?.id || !vendor?.objectType) {
      return {
        ok: false,
        issues: [
          {
            level: "error",
            code: "invalid_vendor_object",
            message: "Vendor object requires id and objectType",
          },
        ],
      };
    }
    if (this.validateVendorObject) {
      return this.validateVendorObject(vendor);
    }
    const mapping = this.mappings.find((m) => m.vendorObjectType === vendor.objectType);
    if (!mapping) {
      return {
        ok: false,
        issues: [
          {
            level: "error",
            code: "unmapped_object_type",
            message: `No mapping for ${vendor.objectType}`,
          },
        ],
      };
    }
    return { ok: true, issues: [] };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const vendor = raw as VendorObject;
    const mapping = this.mappings.find((m) => m.vendorObjectType === vendor.objectType);
    if (!mapping) return [];
    const result = mapVendorToBusinessEvent({
      vendor,
      definition: mapping,
      sourceSystem: this.system,
      connectorId: this.id,
      timestamp: new Date().toISOString(),
    });
    return result.event ? [result.event] : [];
  }

  protected fetchRaw(options?: SyncOptions): unknown[] {
    return this.fetchVendorObjects(options);
  }
}
