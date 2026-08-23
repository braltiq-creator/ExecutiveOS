/**
 * Platform identity & semantic versioning contracts.
 */

export type SemVer = {
  major: number;
  minor: number;
  patch: number;
  /** Optional prerelease label e.g. beta.1 */
  prerelease?: string;
};

export type VersionedIdentity = {
  id: string;
  name: string;
  version: SemVer;
  /** Human label e.g. "1.2.0" */
  versionLabel: string;
};

export type CompatibilityRange = {
  /** Inclusive minimum platform major.minor */
  minPlatform: SemVer;
  /** Exclusive maximum platform major (optional) */
  maxPlatformExclusive?: SemVer;
  sdk?: {
    min: SemVer;
    maxExclusive?: SemVer;
  };
};

export type ExtensionKind =
  | "knowledge_pack"
  | "connector"
  | "business_event_mapper"
  | "benchmark_provider"
  | "scenario_provider"
  | "judgement_rule_provider"
  | "agent_extension"
  | "narrative_provider"
  | "industry_vocabulary"
  | "notification_provider";

export type ExtensionManifest = VersionedIdentity & {
  kind: ExtensionKind;
  description: string;
  compatibility: CompatibilityRange;
  /** Capabilities / domains this extension declares */
  provides: string[];
  /** Optional deprecation notice */
  deprecated?: {
    since: SemVer;
    message: string;
    successorId?: string;
  };
  author?: string;
  license?: string;
};
