import { buildExecutiveIntelligence } from "@/lib/intelligence/engine";
import { generateMorningBrief } from "@/lib/briefing/generate";
import type { MorningBrief, MorningBriefGenerator } from "@/lib/briefing/types";

let briefingGenerator: MorningBriefGenerator = generateMorningBrief;

export function setMorningBriefGenerator(generator: MorningBriefGenerator): void {
  briefingGenerator = generator;
}

export function getMorningBriefGenerator(): MorningBriefGenerator {
  return briefingGenerator;
}

export async function getMorningBrief(): Promise<MorningBrief> {
  const intelligence = await buildExecutiveIntelligence();
  return briefingGenerator(intelligence);
}

export async function tryGetMorningBrief(): Promise<MorningBrief | null> {
  try {
    return await getMorningBrief();
  } catch {
    return null;
  }
}
