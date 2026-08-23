import { buildExecutiveIntelligence } from "@/lib/intelligence/engine";
import { buildIntelligenceCenter } from "@/lib/intelligence-center/engine";
import { getFeatureEntitlementsForUser } from "@/lib/features";
import { getAuthenticatedUser } from "@/lib/auth/actions";
import type { DigestType, IntelligenceCenterData } from "@/lib/intelligence-center/types";
import { IntelligenceCenterError } from "@/lib/intelligence-center/types";
import { validateDigestType } from "@/lib/intelligence-center/validation";

export async function loadIntelligenceCenter(
  digestType?: DigestType,
): Promise<IntelligenceCenterData> {
  const validated = validateDigestType(digestType);
  if (validated.error) {
    throw new IntelligenceCenterError(validated.error, "INVALID_DIGEST");
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    throw new IntelligenceCenterError(
      "Authentication is required.",
      "UNAUTHENTICATED",
    );
  }

  const [intelligence, entitlements] = await Promise.all([
    buildExecutiveIntelligence(),
    getFeatureEntitlementsForUser(user.id),
  ]);

  return buildIntelligenceCenter(
    intelligence,
    entitlements,
    validated.digestType,
  );
}

export async function tryLoadIntelligenceCenter(): Promise<IntelligenceCenterData | null> {
  try {
    return await loadIntelligenceCenter();
  } catch {
    return null;
  }
}
