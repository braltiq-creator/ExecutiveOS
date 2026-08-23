/**
 * Industry ontology consumer.
 * Core never receives industry object types — only opaque vocabulary entries.
 */

import type {
  ExecutiveIntelligencePack,
  PackOntologyTerm,
} from "@/intelligence-packs/contract";
import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";

export type ResolvedOntology = {
  packId: string;
  industry: string;
  terms: PackOntologyTerm[];
  /** Lookup by term / alias — still opaque strings */
  byTerm: Map<string, PackOntologyTerm>;
};

export function resolvePackOntology(
  pack: ExecutiveIntelligencePack,
): ResolvedOntology {
  const terms = pack.ontology();
  const byTerm = new Map<string, PackOntologyTerm>();
  for (const term of terms) {
    byTerm.set(term.term.toLowerCase(), term);
    for (const alias of term.aliases ?? []) {
      byTerm.set(alias.toLowerCase(), term);
    }
  }
  return {
    packId: pack.manifest.id,
    industry: pack.industry(),
    terms,
    byTerm,
  };
}

/**
 * Merge ontologies from multiple packs.
 * Term collisions keep first-active pack's definition (stable, explicit).
 */
export function collectOntology(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): ResolvedOntology[] {
  const packs = packIds
    ? packIds
        .map((id) => registry.get(id))
        .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack))
    : registry.activePacks().length > 0
      ? registry.activePacks()
      : registry.list();

  return packs.map(resolvePackOntology);
}

/** Safe string lookup — never returns an industry class/type. */
export function explainOntologyTerm(
  ontology: ResolvedOntology,
  rawTerm: string,
): string | null {
  const hit = ontology.byTerm.get(rawTerm.trim().toLowerCase());
  if (!hit) return null;
  return hit.executiveMeaning;
}
