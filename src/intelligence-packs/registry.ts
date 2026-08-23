/**
 * Intelligence Pack Registry — multiple packs, zero Core changes.
 */

import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";
import { validatePackContract } from "@/intelligence-packs/define";

export type PackRegistrationResult = {
  ok: boolean;
  packId: string;
  errors: string[];
  warnings: string[];
};

/**
 * Holds many Intelligence Packs simultaneously.
 * Activation selects which pack(s) inform industry context —
 * Core engines remain pack-agnostic.
 */
export class IntelligencePackRegistry {
  private readonly packs = new Map<string, ExecutiveIntelligencePack>();
  private readonly active = new Set<string>();

  register(pack: ExecutiveIntelligencePack): PackRegistrationResult {
    const validation = validatePackContract(pack);
    if (!validation.ok) {
      return {
        ok: false,
        packId: pack.manifest.id,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }
    if (this.packs.has(pack.manifest.id)) {
      return {
        ok: false,
        packId: pack.manifest.id,
        errors: [`Pack already registered: ${pack.manifest.id}`],
        warnings: validation.warnings,
      };
    }
    this.packs.set(pack.manifest.id, pack);
    return {
      ok: true,
      packId: pack.manifest.id,
      errors: [],
      warnings: validation.warnings,
    };
  }

  unregister(packId: string): boolean {
    this.active.delete(packId);
    return this.packs.delete(packId);
  }

  get(packId: string): ExecutiveIntelligencePack | undefined {
    return this.packs.get(packId);
  }

  list(): ExecutiveIntelligencePack[] {
    return [...this.packs.values()];
  }

  /** Activate one or more packs — multi-pack support. */
  activate(packIds: string | string[]): {
    ok: boolean;
    active: string[];
    errors: string[];
  } {
    const ids = Array.isArray(packIds) ? packIds : [packIds];
    const errors: string[] = [];
    for (const id of ids) {
      if (!this.packs.has(id)) {
        errors.push(`Unknown pack: ${id}`);
      }
    }
    if (errors.length === 0) {
      for (const id of ids) this.active.add(id);
    }
    return { ok: errors.length === 0, active: this.activePackIds(), errors };
  }

  deactivate(packId: string): boolean {
    return this.active.delete(packId);
  }

  /** Replace active set entirely — switching packs never touches Core. */
  setActive(packIds: string[]): {
    ok: boolean;
    active: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    for (const id of packIds) {
      if (!this.packs.has(id)) errors.push(`Unknown pack: ${id}`);
    }
    if (errors.length > 0) {
      return { ok: false, active: this.activePackIds(), errors };
    }
    this.active.clear();
    for (const id of packIds) this.active.add(id);
    return { ok: true, active: this.activePackIds(), errors: [] };
  }

  activePackIds(): string[] {
    return [...this.active];
  }

  activePacks(): ExecutiveIntelligencePack[] {
    return this.activePackIds()
      .map((id) => this.packs.get(id))
      .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack));
  }

  clear(): void {
    this.packs.clear();
    this.active.clear();
  }
}

let defaultRegistry: IntelligencePackRegistry | null = null;

export function getIntelligencePackRegistry(): IntelligencePackRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new IntelligencePackRegistry();
  }
  return defaultRegistry;
}

export function setIntelligencePackRegistry(
  registry: IntelligencePackRegistry,
): void {
  defaultRegistry = registry;
}

export function createIntelligencePackRegistry(): IntelligencePackRegistry {
  return new IntelligencePackRegistry();
}
