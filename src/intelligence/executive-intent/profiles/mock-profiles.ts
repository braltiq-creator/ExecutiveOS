import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";

const AS_OF = "2026-07-20T06:15:00+10:00";

/** CEO — Enterprise ARR, Board readiness, selective capacity protection. */
export const CEO_INTENT_PROFILE: ExecutiveIntentProfile = {
  id: "intent-profile-ceo",
  role: "CEO",
  executiveName: "Alex",
  title: "Chief Executive Officer",
  asOf: AS_OF,
  strategicPriorities: [
    {
      id: "prio-enterprise-arr",
      title: "Increase Enterprise ARR",
      weight: 95,
      timeHorizon: "12_months",
      ownerRole: "CEO",
      relatedOutcomeIds: ["outcome-enterprise-arr"],
      relatedThemeIds: ["theme-growth"],
      narrative: "Strategic logos and expansion revenue compound credibility.",
    },
    {
      id: "prio-board-readiness",
      title: "Board Readiness",
      weight: 90,
      timeHorizon: "this_quarter",
      ownerRole: "CEO",
      relatedOutcomeIds: ["outcome-board"],
      relatedThemeIds: ["theme-governance"],
      narrative: "Honest board narrative before Friday pack.",
    },
    {
      id: "prio-meeting-load",
      title: "Reduce Executive Meeting Load",
      weight: 80,
      timeHorizon: "this_quarter",
      ownerRole: "CEO",
      relatedOutcomeIds: ["outcome-efficiency"],
      relatedThemeIds: ["theme-capacity"],
      narrative: "Reclaim judgement time from duplicate forums.",
    },
    {
      id: "prio-retention",
      title: "Protect Net Retention",
      weight: 70,
      timeHorizon: "12_months",
      ownerRole: "CEO",
      relatedOutcomeIds: ["outcome-retention"],
      relatedThemeIds: ["theme-growth"],
    },
  ],
  leadershipThemes: [
    {
      id: "theme-growth",
      title: "Enterprise growth with controlled risk",
      weight: 90,
      description: "Win logos without laundering residual risk.",
    },
    {
      id: "theme-governance",
      title: "Board-grade clarity",
      weight: 85,
      description: "Disclose early enough to preserve trust.",
    },
    {
      id: "theme-capacity",
      title: "Protect executive attention",
      weight: 80,
      description: "Calendar is a strategic asset.",
    },
  ],
  quarterlyObjectives: [
    {
      id: "qo-helix",
      title: "Clear Helix residency posture this week",
      weight: 95,
      quarter: "Q3 2026",
      relatedOutcomeIds: ["outcome-enterprise-arr", "outcome-board"],
      successSignal: "Written position recorded; workshop scheduled.",
    },
    {
      id: "qo-forums",
      title: "Collapse duplicate leadership forums",
      weight: 75,
      quarter: "Q3 2026",
      relatedOutcomeIds: ["outcome-efficiency"],
      successSignal: "Single operating review cadence locked.",
    },
  ],
  preferences: {
    decision: {
      biasTowardAction: 78,
      requiresOptionPaper: true,
      escalateAboveRisk: 75,
      preferredActs: ["approve", "delegate", "investigate", "schedule"],
    },
    attention: {
      focusBlockMinutes: 90,
      maxOpenDecisions: 3,
      preferDeepWorkMorning: true,
      interruptTolerance: "low",
    },
    meeting: {
      maxMeetingsPerDay: 4,
      preferAsyncUpdates: true,
      protectStrategyBlocks: true,
      declineDuplicateForums: true,
    },
  },
  riskAppetite: "balanced",
  timeHorizon: "12_months",
  delegationStyle: "selective",
  leadershipCapacity: "stretched",
  narrative:
    "Alex prioritises enterprise ARR and board honesty while protecting scarce morning judgement time.",
};

/** COO — operating cadence, capacity, execution. */
export const COO_INTENT_PROFILE: ExecutiveIntentProfile = {
  id: "intent-profile-coo",
  role: "COO",
  executiveName: "Marcus",
  title: "Chief Operating Officer",
  asOf: AS_OF,
  strategicPriorities: [
    {
      id: "prio-ops-cadence",
      title: "Unify operating review cadence",
      weight: 92,
      timeHorizon: "this_quarter",
      ownerRole: "COO",
      relatedOutcomeIds: ["outcome-efficiency"],
      relatedThemeIds: ["theme-ops"],
    },
    {
      id: "prio-execution",
      title: "Convert decisions into motion",
      weight: 88,
      timeHorizon: "this_week",
      ownerRole: "COO",
      relatedOutcomeIds: ["outcome-enterprise-arr", "outcome-efficiency"],
      relatedThemeIds: ["theme-ops"],
    },
    {
      id: "prio-capacity-ops",
      title: "Reduce Executive Meeting Load",
      weight: 85,
      timeHorizon: "this_quarter",
      ownerRole: "COO",
      relatedOutcomeIds: ["outcome-efficiency"],
    },
  ],
  leadershipThemes: [
    {
      id: "theme-ops",
      title: "Operating discipline",
      weight: 90,
      description: "One forum, clear owners, measurable follow-through.",
    },
  ],
  quarterlyObjectives: [
    {
      id: "qo-merge-forums",
      title: "Merge Ops and Product forums",
      weight: 90,
      quarter: "Q3 2026",
      relatedOutcomeIds: ["outcome-efficiency"],
      successSignal: "Duplicate Wednesday forums removed.",
    },
  ],
  preferences: {
    decision: {
      biasTowardAction: 85,
      requiresOptionPaper: false,
      escalateAboveRisk: 80,
      preferredActs: ["approve", "schedule", "delegate"],
    },
    attention: {
      focusBlockMinutes: 60,
      maxOpenDecisions: 5,
      preferDeepWorkMorning: false,
      interruptTolerance: "medium",
    },
    meeting: {
      maxMeetingsPerDay: 6,
      preferAsyncUpdates: false,
      protectStrategyBlocks: false,
      declineDuplicateForums: true,
    },
  },
  riskAppetite: "balanced",
  timeHorizon: "this_quarter",
  delegationStyle: "empowering",
  leadershipCapacity: "standard",
  narrative:
    "Marcus optimises for operating cadence and execution velocity over board theatre.",
};

/** CFO — risk, disclosure, capital discipline. */
export const CFO_INTENT_PROFILE: ExecutiveIntentProfile = {
  id: "intent-profile-cfo",
  role: "CFO",
  executiveName: "Jordan",
  title: "Chief Financial Officer",
  asOf: AS_OF,
  strategicPriorities: [
    {
      id: "prio-board-cfo",
      title: "Board Readiness",
      weight: 94,
      timeHorizon: "this_quarter",
      ownerRole: "CFO",
      relatedOutcomeIds: ["outcome-board"],
      relatedThemeIds: ["theme-control"],
    },
    {
      id: "prio-arr-quality",
      title: "Increase Enterprise ARR",
      weight: 82,
      timeHorizon: "12_months",
      ownerRole: "CFO",
      relatedOutcomeIds: ["outcome-enterprise-arr"],
      relatedThemeIds: ["theme-control"],
      narrative: "ARR quality over logo vanity.",
    },
    {
      id: "prio-retention-cfo",
      title: "Protect Net Retention",
      weight: 86,
      timeHorizon: "12_months",
      ownerRole: "CFO",
      relatedOutcomeIds: ["outcome-retention"],
    },
  ],
  leadershipThemes: [
    {
      id: "theme-control",
      title: "Financial and disclosure control",
      weight: 92,
      description: "No silent residual risk in the pack.",
    },
  ],
  quarterlyObjectives: [
    {
      id: "qo-pack",
      title: "Board pack risk language cleared",
      weight: 93,
      quarter: "Q3 2026",
      relatedOutcomeIds: ["outcome-board"],
      successSignal: "CFO clearance without last-minute redlines.",
    },
  ],
  preferences: {
    decision: {
      biasTowardAction: 55,
      requiresOptionPaper: true,
      escalateAboveRisk: 60,
      preferredActs: ["investigate", "wait", "escalate", "approve"],
    },
    attention: {
      focusBlockMinutes: 75,
      maxOpenDecisions: 2,
      preferDeepWorkMorning: true,
      interruptTolerance: "low",
    },
    meeting: {
      maxMeetingsPerDay: 3,
      preferAsyncUpdates: true,
      protectStrategyBlocks: true,
      declineDuplicateForums: true,
    },
  },
  riskAppetite: "conservative",
  timeHorizon: "12_months",
  delegationStyle: "hands_on",
  leadershipCapacity: "protected",
  narrative:
    "Jordan filters every call through disclosure risk and capital quality.",
};

/** Chief of Staff — orchestration, CEO leverage, board prep. */
export const CHIEF_OF_STAFF_INTENT_PROFILE: ExecutiveIntentProfile = {
  id: "intent-profile-cos",
  role: "ChiefOfStaff",
  executiveName: "Priya",
  title: "Chief of Staff",
  asOf: AS_OF,
  strategicPriorities: [
    {
      id: "prio-ceo-leverage",
      title: "Protect CEO judgement time",
      weight: 93,
      timeHorizon: "this_week",
      ownerRole: "ChiefOfStaff",
      relatedOutcomeIds: ["outcome-efficiency"],
      relatedThemeIds: ["theme-leverage"],
    },
    {
      id: "prio-board-cos",
      title: "Board Readiness",
      weight: 91,
      timeHorizon: "this_quarter",
      ownerRole: "ChiefOfStaff",
      relatedOutcomeIds: ["outcome-board"],
      relatedThemeIds: ["theme-leverage"],
    },
    {
      id: "prio-arr-cos",
      title: "Increase Enterprise ARR",
      weight: 84,
      timeHorizon: "12_months",
      ownerRole: "ChiefOfStaff",
      relatedOutcomeIds: ["outcome-enterprise-arr"],
    },
  ],
  leadershipThemes: [
    {
      id: "theme-leverage",
      title: "Executive leverage",
      weight: 90,
      description: "Surface only what deserves the CEO.",
    },
  ],
  quarterlyObjectives: [
    {
      id: "qo-briefing",
      title: "Keep Today under one attention budget",
      weight: 88,
      quarter: "Q3 2026",
      relatedOutcomeIds: ["outcome-efficiency", "outcome-board"],
      successSignal: "CEO clears Helix without calendar thrash.",
    },
  ],
  preferences: {
    decision: {
      biasTowardAction: 70,
      requiresOptionPaper: true,
      escalateAboveRisk: 70,
      preferredActs: ["delegate", "schedule", "investigate", "approve"],
    },
    attention: {
      focusBlockMinutes: 45,
      maxOpenDecisions: 4,
      preferDeepWorkMorning: true,
      interruptTolerance: "medium",
    },
    meeting: {
      maxMeetingsPerDay: 5,
      preferAsyncUpdates: true,
      protectStrategyBlocks: true,
      declineDuplicateForums: true,
    },
  },
  riskAppetite: "balanced",
  timeHorizon: "this_quarter",
  delegationStyle: "selective",
  leadershipCapacity: "stretched",
  narrative:
    "Priya sequences the CEO's day so only high-alignment judgements consume attention.",
};

export const INTENT_PROFILES: Record<
  ExecutiveIntentProfile["role"],
  ExecutiveIntentProfile
> = {
  CEO: CEO_INTENT_PROFILE,
  COO: COO_INTENT_PROFILE,
  CFO: CFO_INTENT_PROFILE,
  ChiefOfStaff: CHIEF_OF_STAFF_INTENT_PROFILE,
};
