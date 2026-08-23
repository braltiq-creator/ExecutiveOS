import type {
  UdgCanonicalRecord,
  UdgFieldMapping,
  UdgFieldTransform,
  UdgFieldValue,
  UdgMappingDefinition,
  UdgRawRecord,
} from "../contracts";
import { UDG_CANONICAL_FIELD_LABELS } from "../contracts";

/** Accept ISO and common regional date forms without inventing values. */
export function parseFlexibleDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = Date.parse(trimmed);
  if (!Number.isNaN(iso)) {
    return new Date(iso).toISOString().slice(0, 10);
  }
  const mdy = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (mdy) {
    const month = Number(mdy[1]);
    const day = Number(mdy[2]);
    let year = Number(mdy[3]);
    if (year < 100) year += 2000;
    const dt = new Date(Date.UTC(year, month - 1, day));
    if (
      dt.getUTCFullYear() === year &&
      dt.getUTCMonth() === month - 1 &&
      dt.getUTCDate() === day
    ) {
      return dt.toISOString().slice(0, 10);
    }
  }
  return null;
}

function applyTransform(
  value: UdgFieldValue,
  transform: UdgFieldTransform = "identity",
): UdgFieldValue {
  if (value === null) return null;
  switch (transform) {
    case "string":
    case "trim":
      return String(value).trim();
    case "upper":
      return String(value).trim().toUpperCase();
    case "lower":
      return String(value).trim().toLowerCase();
    case "number": {
      if (typeof value === "number") return value;
      const cleaned = String(value).replace(/[$,\s]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : value;
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      const s = String(value).toLowerCase();
      if (s === "true" || s === "1" || s === "yes") return true;
      if (s === "false" || s === "0" || s === "no") return false;
      return value;
    }
    case "iso_date": {
      const parsed = parseFlexibleDate(String(value));
      return parsed ?? value;
    }
    default:
      return value;
  }
}

/**
 * Map source columns → canonical ExecutiveOS fields.
 */
export function applyMapping(
  records: UdgRawRecord[],
  mapping: UdgMappingDefinition,
  snapshotPrefix = "rec",
): UdgCanonicalRecord[] {
  return records.map((record, index) => {
    const fields: Record<string, UdgFieldValue> = {};
    for (const fieldMap of mapping.fields) {
      const raw =
        record.fields[fieldMap.sourceColumn] ??
        fieldMap.defaultValue ??
        null;
      fields[fieldMap.canonicalField] = applyTransform(
        raw as UdgFieldValue,
        fieldMap.transform,
      );
    }
    return {
      recordId: `${snapshotPrefix}-${index + 1}`,
      rowIndex: record.rowIndex,
      fields,
    };
  });
}

function normaliseHeaderKey(header: string): string {
  return header.replace(/[^a-z0-9]+/gi, "").toLowerCase();
}

/** Infer a starter mapping from headers using common aliases. */
export function inferMappingFromHeaders(
  headers: string[],
  context: {
    organisationId: string;
    profileId?: string;
    productId?: string;
    name?: string;
    asOf?: string;
  },
): UdgMappingDefinition {
  const aliases: Record<string, string> = {
    dealername: "dealer",
    dealer: "dealer",
    forecast_qty: "forecastQuantity",
    forecastqty: "forecastQuantity",
    forecastquantity: "forecastQuantity",
    forecastunits: "forecastQuantity",
    actual_qty: "actualQuantity",
    actualqty: "actualQuantity",
    actualquantity: "actualQuantity",
    actualunits: "actualQuantity",
    actualdemand: "actualQuantity",
    orderbank: "orderBankQuantity",
    orderbankunits: "orderBankQuantity",
    orderbankquantity: "orderBankQuantity",
    productioncapacity: "productionCapacity",
    productioncapacityunits: "productionCapacity",
    capacity: "productionCapacity",
    availableslots: "availableSlots",
    finishedgoods: "finishedGoods",
    finishedgoodsunits: "finishedGoods",
    inventorydays: "inventoryDays",
    forecasversion: "forecastVersion",
    forecastversion: "forecastVersion",
    factory: "factory",
    plant: "factory",
    period: "period",
    month: "period",
    branchcode: "branch",
    branch: "branch",
    modelcode: "model",
    model: "model",
    variant: "variant",
    region: "region",
    customer: "customer",
    product: "product",
    productfamily: "product",
    quantity: "quantity",
    qty: "quantity",
    amount: "amount",
    currency: "currency",
    asofdate: "asOfDate",
    date: "asOfDate",
    status: "status",
    notes: "notes",
    // Commercial ontology (CRM-export agnostic aliases)
    opportunityname: "opportunity",
    opportunity: "opportunity",
    opportunityowner: "owner",
    owner: "owner",
    transactiontype: "transactionType",
    transaction: "transactionType",
    stage: "stage",
    netsaasconverted: "saasValue",
    saasvalue: "saasValue",
    saas: "saasValue",
    netmaintenanceconverted: "maintenanceValue",
    maintenancevalue: "maintenanceValue",
    maintenance: "maintenanceValue",
    netsoftwarelicenseconverted: "licenseValue",
    softwarelicensevalue: "licenseValue",
    licensevalue: "licenseValue",
    netonetimeservicesconverted: "oneTimeServicesValue",
    onetimeservices: "oneTimeServicesValue",
    netrecurringservicesconverted: "recurringValue",
    recurringvalue: "recurringValue",
    recurringservices: "recurringValue",
    pipelinevalue: "pipelineValue",
    laststagechangedate: "lastStageChangeDate",
    stagemovement: "stageMovement",
    stageduration: "stageDuration",
    nextstep: "nextStep",
    industry: "industry",
    closedate: "closeDate",
    organisation: "organisation",
    organization: "organisation",
    activityevidence: "activityEvidence",
  };

  const numericFields = new Set([
    "forecastQuantity",
    "actualQuantity",
    "orderBankQuantity",
    "productionCapacity",
    "availableSlots",
    "finishedGoods",
    "inventoryDays",
    "quantity",
    "amount",
    "saasValue",
    "maintenanceValue",
    "licenseValue",
    "oneTimeServicesValue",
    "recurringValue",
    "pipelineValue",
    "stageDuration",
  ]);
  const dateFields = new Set([
    "asOfDate",
    "closeDate",
    "lastStageChangeDate",
    "stageMovement",
  ]);

  const normalisedHeaders = headers.map(normaliseHeaderKey);
  const now = context.asOf ?? new Date().toISOString();

  const fields: UdgFieldMapping[] = [];
  let currencyMapped = false;

  for (const header of headers) {
    const key = normaliseHeaderKey(header);

    // Skip companion currency columns when a value column exists.
    if (key.endsWith("currency")) {
      const without = key.replace(/currency$/, "");
      if (normalisedHeaders.includes(without)) {
        if (!currencyMapped) {
          fields.push({
            sourceColumn: header,
            canonicalField: "currency",
            transform: "trim",
            required: false,
          });
          currencyMapped = true;
        }
        continue;
      }
    }

    const canonical = aliases[key] ?? header;
    const transform = numericFields.has(canonical)
      ? "number"
      : dateFields.has(canonical)
        ? "iso_date"
        : "trim";
    fields.push({
      sourceColumn: header,
      canonicalField: canonical,
      transform,
      required: false,
    });
  }

  const canonicalSet = new Set(fields.map((f) => f.canonicalField));
  const manufacturingShape =
    canonicalSet.has("dealer") ||
    canonicalSet.has("forecastQuantity") ||
    canonicalSet.has("factory") ||
    canonicalSet.has("actualQuantity") ||
    (canonicalSet.has("model") && canonicalSet.has("variant"));
  const commercialShape =
    canonicalSet.has("opportunity") || canonicalSet.has("stage");

  const required = commercialShape
    ? ["opportunity", "stage"]
    : manufacturingShape
      ? ["model", "forecastQuantity"]
      : [];

  for (const field of fields) {
    field.required = required.includes(field.canonicalField);
  }

  return {
    id: `map_${Date.now().toString(36)}`,
    name: context.name ?? "Inferred mapping",
    organisationId: context.organisationId,
    profileId: context.profileId,
    productId: context.productId,
    fields,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

export function describeMapping(mapping: UdgMappingDefinition): string[] {
  return mapping.fields.map((f) => {
    const label =
      UDG_CANONICAL_FIELD_LABELS[f.canonicalField] ?? f.canonicalField;
    return `${f.sourceColumn} → ${label}`;
  });
}
