import {
  createPluginRegistry,
  getPluginRegistry,
  setPluginRegistry,
  type PluginRegistry,
} from "@/platform/framework/registry";
import { registerBuiltinExtensions } from "@/platform/extensions/builtins";

/**
 * Platform Framework runtime.
 * Boots the registry and discovers built-in extensions without touching Core engines.
 */
export function bootPlatform(options?: {
  registry?: PluginRegistry;
  registerBuiltins?: boolean;
}): PluginRegistry {
  const registry = options?.registry ?? createPluginRegistry();
  registry.clear();
  if (options?.registerBuiltins !== false) {
    registerBuiltinExtensions(registry);
  }
  setPluginRegistry(registry);
  return registry;
}

export function getActivePlatformRegistry(): PluginRegistry {
  const registry = getPluginRegistry();
  if (registry.list().length === 0) {
    return bootPlatform();
  }
  return registry;
}

export { getPluginRegistry, createPluginRegistry, setPluginRegistry };
export type { PluginRegistry };
