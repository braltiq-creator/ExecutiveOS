export const MANUFACTURING_GRAPH_REBIND_ERROR =
  "Manufacturing evidence graph is already bound to a different evidence record.";

/**
 * A snapshot may be bound to one evidence id.
 * Nulls are unbound. Any other id, or two different ids, is a hard stop.
 */
export function resolveBoundEvidenceId(
  requestedEvidenceId: string,
  existingEvidenceIds: readonly (string | null | undefined)[],
): string {
  const requested = requestedEvidenceId.trim();
  const bound = new Set<string>();
  for (const id of existingEvidenceIds) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (trimmed) bound.add(trimmed);
  }
  if (bound.size > 1 || (bound.size === 1 && !bound.has(requested))) {
    throw new Error(MANUFACTURING_GRAPH_REBIND_ERROR);
  }
  return requested;
}
