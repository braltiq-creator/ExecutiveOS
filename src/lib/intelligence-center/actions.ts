"use server";

import { loadIntelligenceCenter } from "@/lib/intelligence-center/service";
import type { DigestType, IntelligenceCenterData } from "@/lib/intelligence-center/types";

export async function loadIntelligenceCenterAction(
  digestType?: DigestType,
): Promise<{ error: string | null; data: IntelligenceCenterData | null }> {
  try {
    const data = await loadIntelligenceCenter(digestType);
    return { error: null, data };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load intelligence center.",
      data: null,
    };
  }
}
