import type { CompatibilityRange, SemVer } from "@/platform/contracts/identity";

export const PLATFORM_VERSION: SemVer = {
  major: 1,
  minor: 0,
  patch: 0,
};

export const SDK_VERSION: SemVer = {
  major: 1,
  minor: 0,
  patch: 0,
};

export function formatSemVer(version: SemVer): string {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${base}-${version.prerelease}` : base;
}

export function parseSemVer(label: string): SemVer {
  const match = label.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid semver: ${label}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4],
  };
}

export function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && b.prerelease) {
    return a.prerelease.localeCompare(b.prerelease);
  }
  return 0;
}

export function isCompatible(
  range: CompatibilityRange,
  platform: SemVer = PLATFORM_VERSION,
  sdk: SemVer = SDK_VERSION,
): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (compareSemVer(platform, range.minPlatform) < 0) {
    errors.push(
      `Platform ${formatSemVer(platform)} below minimum ${formatSemVer(range.minPlatform)}`,
    );
  }
  if (
    range.maxPlatformExclusive &&
    compareSemVer(platform, range.maxPlatformExclusive) >= 0
  ) {
    errors.push(
      `Platform ${formatSemVer(platform)} at/above exclusive max ${formatSemVer(range.maxPlatformExclusive)}`,
    );
  }

  if (range.sdk) {
    if (compareSemVer(sdk, range.sdk.min) < 0) {
      errors.push(
        `SDK ${formatSemVer(sdk)} below minimum ${formatSemVer(range.sdk.min)}`,
      );
    }
    if (
      range.sdk.maxExclusive &&
      compareSemVer(sdk, range.sdk.maxExclusive) >= 0
    ) {
      errors.push(
        `SDK ${formatSemVer(sdk)} at/above exclusive max ${formatSemVer(range.sdk.maxExclusive)}`,
      );
    }
  }

  // Same major required for platform by convention
  if (platform.major !== range.minPlatform.major) {
    warnings.push(
      `Platform major ${platform.major} differs from extension target major ${range.minPlatform.major}`,
    );
  }

  return { ok: errors.length === 0, warnings, errors };
}

export type DeprecationWarning = {
  extensionId: string;
  message: string;
  since: string;
  successorId?: string;
};

export function collectDeprecationWarning(input: {
  id: string;
  deprecated?: {
    since: SemVer;
    message: string;
    successorId?: string;
  };
}): DeprecationWarning | null {
  if (!input.deprecated) return null;
  return {
    extensionId: input.id,
    message: input.deprecated.message,
    since: formatSemVer(input.deprecated.since),
    successorId: input.deprecated.successorId,
  };
}
