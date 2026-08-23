import type { CouncilRoleId } from "@/experience/executive-council/members";
import type { RhythmCadence, RhythmId } from "@/experience/executive-rhythm/definitions";

export type RhythmFocus = {
  roleId: CouncilRoleId;
  shortTitle: string;
  focus: string;
};

export type RhythmAwareness = {
  asOf: string;
  currentRhythmId: RhythmId;
  currentRhythmName: string;
  cadence: RhythmCadence;
  upcomingLabel: string;
  preparationWindow: string;
  decisionDeadline: string;
  prepMinutes: number;
  meetingMinutes: number;
  headline: string;
  detail: string;
  decisionCount: number;
  riskCount: number;
  packHref: string;
};

export type MeetingPack = {
  rhythmId: RhythmId;
  rhythmName: string;
  purpose: string;
  executiveSummary: string;
  councilObservations: string[];
  keyDecisions: Array<{ title: string; href: string }>;
  strategicOutcomes: string[];
  risks: string[];
  opportunities: string[];
  supportingEvidence: string[];
  discussionSequence: string[];
  estimatedDurationMinutes: number;
  prepMinutes: number;
  councilFocus: RhythmFocus[];
};

export type RhythmLearning = {
  rhythmName: string;
  preparationQuality: string;
  decisionQuality: string;
  meetingOutcomes: string;
  actionCompletion: string;
  outcomeImprovement: string;
  learning: string;
};

export type ExecutiveRhythmView = {
  awareness: RhythmAwareness;
  pack: MeetingPack;
  learning: RhythmLearning;
  catalog: Array<{ id: RhythmId; name: string; cadence: RhythmCadence }>;
};
