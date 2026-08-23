import { generateMorningBrief } from "@/lib/briefing/generate";
import type { MorningBrief } from "@/lib/briefing/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

export function buildMorningBriefSnapshot(
  intelligence: ExecutiveIntelligenceResult,
): MorningBrief {
  return generateMorningBrief(intelligence);
}

export function getPreferredName(intelligence: ExecutiveIntelligenceResult): string {
  return (
    intelligence.executive.preferredName?.trim() ||
    intelligence.executive.fullName ||
    "Executive"
  );
}

export function buildGreeting(preferredName: string): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${preferredName}`;
  }

  if (hour < 17) {
    return `Good afternoon, ${preferredName}`;
  }

  return `Good evening, ${preferredName}`;
}

export function resolveActiveDigestType(): import("@/lib/intelligence-center/types").DigestType {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  if (day === 1 && hour < 10) {
    return "weekly_review";
  }

  if (hour < 11) {
    return "morning_brief";
  }

  if (hour < 14) {
    return "lunch_update";
  }

  return "end_of_day";
}
