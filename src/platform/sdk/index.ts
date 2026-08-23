import type {
  CompatibilityRange,
  ExtensionKind,
  ExtensionManifest,
} from "@/platform/contracts/identity";
import { formatSemVer, PLATFORM_VERSION, SDK_VERSION } from "@/platform/versioning";

/** Helper to build a compliant extension manifest with narrowed kind. */
export function createManifest<K extends ExtensionKind>(
  input: Omit<ExtensionManifest, "versionLabel" | "kind"> & {
    kind: K;
    versionLabel?: string;
  },
): ExtensionManifest & { kind: K } {
  return {
    ...input,
    versionLabel: input.versionLabel ?? formatSemVer(input.version),
  };
}

export function defaultCompatibility(): CompatibilityRange {
  return {
    minPlatform: { ...PLATFORM_VERSION },
    sdk: { min: { ...SDK_VERSION } },
  };
}

export {
  PLATFORM_VERSION,
  SDK_VERSION,
  formatSemVer,
  parseSemVer,
  isCompatible,
} from "@/platform/versioning";

export type * from "@/platform/contracts";
export {
  PLATFORM_BUSINESS_EVENT_TYPES,
  assertBusinessEvent,
  toPackKpis,
  toPackRules,
} from "@/platform/contracts";
