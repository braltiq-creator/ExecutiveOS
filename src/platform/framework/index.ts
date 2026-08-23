export {
  PluginRegistry,
  createPluginRegistry,
  getPluginRegistry,
  setPluginRegistry,
} from "@/platform/framework/registry";
export type {
  RegisteredExtension,
  RegistrationResult,
} from "@/platform/framework/registry";

export {
  bootPlatform,
  getActivePlatformRegistry,
} from "@/platform/framework/runtime";
