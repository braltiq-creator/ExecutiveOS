import { DIGEST_TYPE_LABELS } from "@/lib/intelligence-center/types";
import type { DigestType } from "@/lib/intelligence-center/types";

const VALID_DIGEST_TYPES = Object.keys(DIGEST_TYPE_LABELS) as DigestType[];

export function validateDigestType(digestType?: DigestType): {
  error: string | null;
  digestType?: DigestType;
} {
  if (digestType === undefined) {
    return { error: null, digestType: undefined };
  }

  if (!VALID_DIGEST_TYPES.includes(digestType)) {
    return { error: "Unknown digest type." };
  }

  return { error: null, digestType };
}
