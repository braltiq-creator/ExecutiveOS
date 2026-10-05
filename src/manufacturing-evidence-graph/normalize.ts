import type { UdgFieldValue } from "@/data-gateway/contracts/record";

/** Trim and collapse whitespace. Preserve case — model codes are case-sensitive. */
export function normalizeLabel(value: UdgFieldValue | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * A quantity is present only when the source field is a finite number
 * or a numeric string. Missing, blank, and non-numeric values stay absent.
 */
export function normalizeQuantity(value: UdgFieldValue | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function quantityLabel(quantity: number): string {
  return String(quantity);
}

export function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
