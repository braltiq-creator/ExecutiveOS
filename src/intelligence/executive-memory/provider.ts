import { createSeededExecutiveMemoryStore } from "@/intelligence/executive-memory/store/seed-memory";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";

/**
 * Provider contract — mock today, Supabase tomorrow.
 */
export type ExecutiveMemoryProvider = {
  readonly id: string;
  readonly label: string;
  getStore(): ExecutiveMemoryStore;
};

export function createMockExecutiveMemoryProvider(): ExecutiveMemoryProvider {
  const store = createSeededExecutiveMemoryStore();
  return {
    id: "memory-mock-northline",
    label: "Northline mock Executive Memory",
    getStore: () => store,
  };
}

let defaultProvider: ExecutiveMemoryProvider | null = null;

export function setExecutiveMemoryProvider(
  provider: ExecutiveMemoryProvider,
): void {
  defaultProvider = provider;
}

export function getExecutiveMemoryProvider(): ExecutiveMemoryProvider {
  if (!defaultProvider) {
    defaultProvider = createMockExecutiveMemoryProvider();
  }
  return defaultProvider;
}

export function getExecutiveMemoryStore(): ExecutiveMemoryStore {
  return getExecutiveMemoryProvider().getStore();
}
