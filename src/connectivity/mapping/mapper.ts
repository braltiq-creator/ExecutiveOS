/**
 * Data mapping — Vendor Object → Canonical Object → Business Event.
 */

import type {
  BusinessEvent,
  BusinessEventType,
  CanonicalEntityType,
  SourceSystem,
} from "@/connectors/types";

export type VendorObject = {
  system: string;
  objectType: string;
  id: string;
  fields: Record<string, unknown>;
  relationships?: Array<{ type: string; targetId: string }>;
};

export type CanonicalObject = {
  entityType: CanonicalEntityType;
  entityId: string;
  label: string;
  status?: string;
  importance: number;
  confidence: number;
  properties: Record<string, unknown>;
  relationships: Array<{
    type: string;
    targetEntityId: string;
    targetEntityType?: CanonicalEntityType;
  }>;
};

export type FieldMapping = {
  from: string;
  to: string;
  transform?: TransformId;
  required?: boolean;
  defaultValue?: unknown;
};

export type TransformId =
  | "identity"
  | "string"
  | "number"
  | "boolean"
  | "iso_date"
  | "upper"
  | "lower"
  | "cents_to_units"
  | "units_to_cents"
  | "percent_normalize";

export type MappingDefinition = {
  id: string;
  vendorObjectType: string;
  entityType: CanonicalEntityType;
  eventType: BusinessEventType | string;
  fields: FieldMapping[];
  relationshipMaps?: Array<{
    from: string;
    type: string;
    targetEntityType?: CanonicalEntityType;
  }>;
};

export type MappingResult = {
  ok: boolean;
  canonical?: CanonicalObject;
  event?: BusinessEvent;
  errors: string[];
  warnings: string[];
};

export function applyTransform(
  value: unknown,
  transform: TransformId = "identity",
): unknown {
  if (value === undefined || value === null) return value;
  switch (transform) {
    case "string":
      return String(value);
    case "number":
      return Number(value);
    case "boolean":
      return Boolean(value);
    case "iso_date":
      return new Date(String(value)).toISOString();
    case "upper":
      return String(value).toUpperCase();
    case "lower":
      return String(value).toLowerCase();
    case "cents_to_units":
      return Number(value) / 100;
    case "units_to_cents":
      return Math.round(Number(value) * 100);
    case "percent_normalize": {
      const n = Number(value);
      return n > 1 ? n / 100 : n;
    }
    case "identity":
    default:
      return value;
  }
}

export function mapVendorToCanonical(
  vendor: VendorObject,
  definition: MappingDefinition,
): { ok: boolean; canonical?: CanonicalObject; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const properties: Record<string, unknown> = {};

  for (const field of definition.fields) {
    const raw = vendor.fields[field.from] ?? field.defaultValue;
    if (raw === undefined || raw === null) {
      if (field.required) errors.push(`Missing required field: ${field.from}`);
      else warnings.push(`Optional field absent: ${field.from}`);
      continue;
    }
    properties[field.to] = applyTransform(raw, field.transform);
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  const label =
    (properties.label as string | undefined) ??
    (properties.name as string | undefined) ??
    vendor.id;

  const relationships = (definition.relationshipMaps ?? []).flatMap((rel) => {
    const targetId = vendor.fields[rel.from];
    if (typeof targetId !== "string" || !targetId) return [];
    return [
      {
        type: rel.type,
        targetEntityId: targetId,
        targetEntityType: rel.targetEntityType,
      },
    ];
  });

  for (const rel of vendor.relationships ?? []) {
    relationships.push({
      type: rel.type,
      targetEntityId: rel.targetId,
      targetEntityType: undefined,
    });
  }

  return {
    ok: true,
    canonical: {
      entityType: definition.entityType,
      entityId: vendor.id,
      label: String(label),
      status: properties.status as string | undefined,
      importance: Number(properties.importance ?? 60),
      confidence: Number(properties.confidence ?? 75),
      properties,
      relationships,
    },
    errors,
    warnings,
  };
}

export function canonicalToBusinessEvent(input: {
  canonical: CanonicalObject;
  sourceSystem: SourceSystem | string;
  connectorId: string;
  eventType: BusinessEventType | string;
  timestamp: string;
  eventId?: string;
}): BusinessEvent {
  const { canonical } = input;
  return {
    id:
      input.eventId ??
      `evt-${input.connectorId}-${canonical.entityId}-${input.eventType}`,
    timestamp: input.timestamp,
    sourceSystem: input.sourceSystem,
    entityType: canonical.entityType,
    entityId: canonical.entityId,
    eventType: input.eventType,
    importance: canonical.importance,
    confidence: canonical.confidence,
    relationships: canonical.relationships.map((r) => ({
      type: r.type,
      targetEntityId: r.targetEntityId,
      targetEntityType: r.targetEntityType,
    })),
    payload: {
      label: canonical.label,
      status: canonical.status,
      ...canonical.properties,
    },
    metadata: {
      connectorId: input.connectorId,
      labels: ["connectivity-platform", "mapped"],
    },
  };
}

export function mapVendorToBusinessEvent(input: {
  vendor: VendorObject;
  definition: MappingDefinition;
  sourceSystem: SourceSystem | string;
  connectorId: string;
  timestamp: string;
}): MappingResult {
  const mapped = mapVendorToCanonical(input.vendor, input.definition);
  if (!mapped.ok || !mapped.canonical) {
    return {
      ok: false,
      errors: mapped.errors,
      warnings: mapped.warnings,
    };
  }
  const event = canonicalToBusinessEvent({
    canonical: mapped.canonical,
    sourceSystem: input.sourceSystem,
    connectorId: input.connectorId,
    eventType: input.definition.eventType,
    timestamp: input.timestamp,
  });
  return {
    ok: true,
    canonical: mapped.canonical,
    event,
    errors: mapped.errors,
    warnings: mapped.warnings,
  };
}
