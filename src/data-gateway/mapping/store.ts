import type { UdgMappingDefinition } from "../contracts";

const mappings = new Map<string, UdgMappingDefinition>();

export function saveMapping(mapping: UdgMappingDefinition): UdgMappingDefinition {
  const existing = mappings.get(mapping.id);
  const next: UdgMappingDefinition = existing
    ? {
        ...mapping,
        version: existing.version + 1,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      }
    : mapping;
  mappings.set(next.id, next);
  return next;
}

export function getMapping(id: string): UdgMappingDefinition | undefined {
  return mappings.get(id);
}

export function listMappings(organisationId?: string): UdgMappingDefinition[] {
  const all = Array.from(mappings.values());
  if (!organisationId) return all;
  return all.filter((m) => m.organisationId === organisationId);
}

export function clearMappingStore(): void {
  mappings.clear();
}
