/**
 * Mapping contracts — source column → canonical field.
 */

import type { UdgCanonicalFieldKey } from "./record";

export type UdgFieldTransform =
  | "identity"
  | "string"
  | "number"
  | "boolean"
  | "iso_date"
  | "trim"
  | "upper"
  | "lower";

export type UdgFieldMapping = {
  sourceColumn: string;
  canonicalField: UdgCanonicalFieldKey;
  transform?: UdgFieldTransform;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
};

export type UdgMappingDefinition = {
  id: string;
  name: string;
  organisationId: string;
  profileId?: string;
  productId?: string;
  sourceKind?: string;
  fields: UdgFieldMapping[];
  createdAt: string;
  updatedAt: string;
  version: number;
};
