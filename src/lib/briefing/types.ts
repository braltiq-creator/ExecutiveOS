import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

export type BriefItem = {
  id: string;
  title: string;
  summary: string;
  badge?: string;
};

export type BriefSection = {
  id: string;
  title: string;
  items: BriefItem[];
  emptyMessage?: string;
};

export type TodaysFocus = {
  headline: string;
  priorities: string[];
};

export type MorningBrief = {
  generatedAt: string;
  greeting: string;
  preferredName: string;
  jobTitle: string;
  company: string;
  brief: BriefSection;
  executiveHealth: BriefSection;
  strategicPriorities: BriefSection;
  initiativeHealth: BriefSection;
  executiveMemory: BriefSection;
  risks: BriefSection;
  opportunities: BriefSection;
  todaysCalendar: BriefSection;
  meetingPreparation: BriefSection;
  calendarHealth: BriefSection;
  todaysFocus: TodaysFocus;
};

export type MorningBriefGenerator = (
  intelligence: ExecutiveIntelligenceResult,
) => MorningBrief;

export class MorningBriefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MorningBriefError";
  }
}
