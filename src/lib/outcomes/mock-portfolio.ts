import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";
import { MOCK_DECISIONS } from "@/lib/decisions/mock-decisions";
import {
  MOCK_ACTIVE_INTENT,
  MOCK_INTENT_HISTORY,
} from "@/lib/intent/mock-intent";

const enterpriseArr: Outcome = {
  id: "outcome-enterprise-arr",
  name: "Expand enterprise ARR to $42M",
  description:
    "Close three strategic logos and expand two installed accounts this half.",
  status: "at_risk",
  healthScore: 54,
  yesterdayMovement: -6,
  yesterdayMovementLabel: "Down 6 pts overnight",
  expectedTrajectory: {
    direction: "declining",
    summary:
      "Without a Helix residency decision today, health is expected to fall into the high-40s within five working days.",
    horizonLabel: "Next 10 days",
  },
  confidence: 81,
  owner: "Amelia Chen, CRO",
  targetDate: "2026-12-31",
  businessImpact:
    "Anchors H2 enterprise credibility and roughly $1.8M near-term expansion revenue.",
  decisionIds: ["decision-residency", "decision-board-risk"],
  contributingInsights: [
    {
      id: "insight-pipeline",
      sourceLabel: "Revenue operations",
      whatChanged:
        "Enterprise pipeline coverage for Q3 fell from 3.1× to 2.4× overnight after two slips.",
      why: "Helix and Meridian both moved out of the committed forecast without replacements.",
      whatShouldHappenNext:
        "Re-forecast with CRO by noon and identify one acceleration lever for this week.",
      recommendation: {
        businessImpact:
          "Coverage below 2.5× historically precedes a missed quarter in this segment.",
        expectedOutcomeImpact:
          "Gives Expand enterprise ARR a recoverable plan within the current week.",
        confidence: 84,
        owner: "Amelia Chen, CRO",
        deadline: "Today, 12:00 PM",
      },
    },
  ],
  pendingActions: [
    {
      id: "action-helix-call",
      actionLabel: "Confirm Helix security workshop slot",
      status: "pending",
      whatChanged:
        "Workshop invite is still tentative; Helix CISO calendar opens only this week.",
      why: "Without a locked slot, residency decision cannot convert into commercial motion.",
      whatShouldHappenNext:
        "Send two time options today and attach the compensating-controls draft.",
      recommendation: {
        businessImpact:
          "Keeps the expansion path alive inside Helix’s procurement window.",
        expectedOutcomeImpact:
          "Converts Expand enterprise ARR from reactive to directed this week.",
        confidence: 83,
        owner: "Amelia Chen, CRO",
        deadline: "Today, 2:00 PM",
      },
    },
  ],
  overnightSignals: [
    {
      id: "change-helix",
      occurredAt: "2026-07-20T01:40:00+10:00",
      severity: "critical",
      whatChanged:
        "Helix Industries expansion slipped two weeks after security questionnaire stalled.",
      why: "Legal review on data residency was not scheduled; procurement clock continues.",
      whatShouldHappenNext:
        "Escalate residency decision today and confirm a security workshop before Thursday.",
      recommendation: {
        businessImpact:
          "Delays a $1.8M expansion that anchors H2 enterprise ARR pacing.",
        expectedOutcomeImpact:
          "Protects Expand enterprise ARR — prevents a further health decline this week.",
        confidence: 86,
        owner: "Amelia Chen, CRO",
        deadline: "Today, 3:00 PM",
      },
    },
  ],
  calendarContext: [
    {
      id: "cal-helix-prep",
      title: "Helix expansion — pre-brief",
      startsAt: "2026-07-20T09:00:00+10:00",
      endsAt: "2026-07-20T09:30:00+10:00",
      attendeesSummary: "CEO, CRO, Chief of Staff",
      whatChanged:
        "Moved earlier to clear space for the residency decision before midday.",
      why: "Decision quality depends on a shared fact base before Legal joins at 11:00.",
      whatShouldHappenNext:
        "Arrive with a preferred position: exception vs regional deploy.",
      recommendation: {
        businessImpact:
          "Avoids a second meeting cycle and keeps Helix inside this week’s window.",
        expectedOutcomeImpact:
          "Enables a same-day decision on Expand enterprise ARR.",
        confidence: 85,
        owner: "Priya Nair, Chief of Staff",
        deadline: "Today, 9:00 AM",
      },
    },
    {
      id: "cal-legal",
      title: "Legal — data residency counsel",
      startsAt: "2026-07-20T11:00:00+10:00",
      endsAt: "2026-07-20T11:45:00+10:00",
      attendeesSummary: "CEO, General Counsel, CRO",
      whatChanged:
        "Counsel prepared two option memos overnight; both are decision-ready.",
      why: "The open question is executive risk appetite, not missing analysis.",
      whatShouldHappenNext:
        "Leave with a written position the CRO can send to Helix today.",
      recommendation: {
        businessImpact:
          "Turns legal ambiguity into a commercial signal Helix can accept.",
        expectedOutcomeImpact:
          "Unblocks Expand enterprise ARR motion before coverage slips further.",
        confidence: 87,
        owner: "Alex Rivera, CEO",
        deadline: "Today, 11:45 AM",
      },
    },
  ],
  timeline: [
    {
      id: "tl-arr-1",
      at: "2026-07-20T01:40:00+10:00",
      title: "Helix expansion slipped two weeks",
      detail: "Security questionnaire stalled on data residency.",
      kind: "blocker",
    },
    {
      id: "tl-arr-2",
      at: "2026-07-19T16:00:00+10:00",
      title: "Pipeline coverage revised to 2.4×",
      detail: "Helix and Meridian removed from committed forecast.",
      kind: "insight",
    },
    {
      id: "tl-arr-3",
      at: "2026-07-18T11:30:00+10:00",
      title: "Residency decision opened",
      detail: "Legal and Security requested executive risk posture.",
      kind: "decision",
    },
    {
      id: "tl-arr-4",
      at: "2026-07-15T09:00:00+10:00",
      title: "Helix marked as H2 anchor logo",
      detail: "Outcome health set to 60 after mutual diligence kickoff.",
      kind: "health",
    },
  ],
  contributors: [
    {
      id: "c-arr-1",
      name: "Amelia Chen",
      role: "CRO",
      contribution: "Owns forecast integrity and Helix commercial path.",
    },
    {
      id: "c-arr-2",
      name: "Sam Okonkwo",
      role: "General Counsel",
      contribution: "Frames residency options and compensating controls.",
    },
    {
      id: "c-arr-3",
      name: "Priya Nair",
      role: "Chief of Staff",
      contribution: "Protects decision time and board narrative consistency.",
    },
  ],
  blockers: [
    {
      id: "b-arr-1",
      title: "Unresolved data residency position",
      description:
        "Helix procurement will not advance without a written executive decision.",
      severity: "critical",
      owner: "Alex Rivera, CEO",
      since: "2026-07-18",
    },
    {
      id: "b-arr-2",
      title: "No locked security workshop",
      description: "CISO availability this week is the only viable window.",
      severity: "attention",
      owner: "Amelia Chen, CRO",
      since: "2026-07-19",
    },
  ],
  recommendations: [
    {
      id: "rec-arr-1",
      title: "Decide residency posture before Legal counsel ends",
      whatChanged: "Both option memos are ready; commercial clock is not.",
      why: "Delay converts a judgment call into a slipped quarter narrative.",
      whatShouldHappenNext:
        "Select exception or regional deploy and authorize CRO outreach.",
      recommendation: {
        businessImpact: "Preserves $1.8M expansion path and enterprise signal.",
        expectedOutcomeImpact: "Projected +8 to +10 health points within a week.",
        confidence: 86,
        owner: "Alex Rivera, CEO",
        deadline: "Today, 11:45 AM",
      },
    },
  ],
  forecast: {
    horizonLabel: "30 days",
    expectedScore: 49,
    direction: "declining",
    narrative:
      "If Helix remains undecided through this week, portfolio contribution from enterprise ARR continues to drag overall Outcome Health below 65.",
    assumptions: [
      "No replacement logo enters committed forecast this month",
      "Meridian remains slipped by at least one sprint",
      "Board pack includes a risk note if unresolved by Thursday",
    ],
  },
  history: [
    { id: "h-arr-1", date: "2026-07-13", healthScore: 66, note: "Diligence kickoff" },
    { id: "h-arr-2", date: "2026-07-15", healthScore: 60, note: "Security questionnaire opened" },
    { id: "h-arr-3", date: "2026-07-17", healthScore: 58, note: "Legal review requested" },
    { id: "h-arr-4", date: "2026-07-19", healthScore: 60, note: "Brief recovery on CRO update" },
    { id: "h-arr-5", date: "2026-07-20", healthScore: 54, note: "Helix slip overnight" },
  ],
  relationships: [
    {
      id: "rel-arr-board",
      relatedOutcomeId: "outcome-board",
      relatedOutcomeName: "Board-ready Q3 operating narrative",
      relationship: "informs",
      explanation:
        "Helix status determines whether growth risk appears in the board pack.",
    },
    {
      id: "rel-arr-eff",
      relatedOutcomeId: "outcome-efficiency",
      relatedOutcomeName: "Reduce leadership meeting load by 15%",
      relationship: "depends_on",
      explanation:
        "CEO focus time is required to clear the residency decision today.",
    },
  ],
};

const retention: Outcome = {
  id: "outcome-retention",
  name: "Hold net revenue retention ≥112%",
  description:
    "Protect top-20 accounts and clear expansion blockers before renewal cluster.",
  status: "watching",
  healthScore: 71,
  yesterdayMovement: 0,
  yesterdayMovementLabel: "Stable overnight",
  expectedTrajectory: {
    direction: "stable",
    summary:
      "Stable if Apex recovery begins this week; declines if enablement remains paused.",
    horizonLabel: "Next 21 days",
  },
  confidence: 76,
  owner: "Jordan Blake, CS",
  targetDate: "2026-09-30",
  businessImpact:
    "Protects NRR target and roughly 11% of ARR concentrated in at-risk top accounts.",
  decisionIds: [],
  contributingInsights: [
    {
      id: "insight-adoption",
      sourceLabel: "Customer outcomes",
      whatChanged:
        "Top-20 account adoption variance widened; three accounts are below success criteria.",
      why: "Enablement paused during the platform migration and was not restarted.",
      whatShouldHappenNext:
        "Restart enablement for the three accounts and schedule executive check-ins.",
      recommendation: {
        businessImpact:
          "Reduces renewal risk concentrated in accounts representing 11% of ARR.",
        expectedOutcomeImpact:
          "Supports Hold NRR ≥112% ahead of the September committee cycle.",
        confidence: 79,
        owner: "Jordan Blake, CS",
        deadline: "Fri, 24 Jul",
      },
    },
  ],
  pendingActions: [
    {
      id: "action-apex",
      actionLabel: "Schedule Apex Health executive sponsor call",
      status: "pending",
      whatChanged:
        "Apex requested a leadership conversation after the adoption flag.",
      why: "Silence increases downgrade probability before the renewal committee.",
      whatShouldHappenNext:
        "Offer two times this week with CS and Product leads on the invite.",
      recommendation: {
        businessImpact:
          "Signals commitment and creates room for a recovery plan before September.",
        expectedOutcomeImpact: "Stabilises Hold NRR ≥112% for a material account.",
        confidence: 76,
        owner: "Jordan Blake, CS",
        deadline: "Tue, 21 Jul",
      },
    },
  ],
  overnightSignals: [
    {
      id: "change-renewal",
      occurredAt: "2026-07-19T22:05:00+10:00",
      severity: "info",
      whatChanged:
        "Apex Health flagged a success gap ahead of the September renewal committee.",
      why: "Adoption in two business units remains below the contracted threshold.",
      whatShouldHappenNext:
        "Assign an executive sponsor call and a 14-day adoption recovery plan.",
      recommendation: {
        businessImpact:
          "Apex represents 4.2% of ARR; a downgrade would pressure NRR below target.",
        expectedOutcomeImpact:
          "Defends Hold NRR ≥112% before the renewal cluster begins.",
        confidence: 74,
        owner: "Jordan Blake, CS",
        deadline: "Wed, 22 Jul",
      },
    },
  ],
  calendarContext: [],
  timeline: [
    {
      id: "tl-ret-1",
      at: "2026-07-19T22:05:00+10:00",
      title: "Apex success gap flagged",
      detail: "Two business units below contracted adoption.",
      kind: "insight",
    },
    {
      id: "tl-ret-2",
      at: "2026-07-12T10:00:00+10:00",
      title: "Enablement paused for migration",
      detail: "Restart not scheduled — now the primary recovery lever.",
      kind: "blocker",
    },
  ],
  contributors: [
    {
      id: "c-ret-1",
      name: "Jordan Blake",
      role: "CS",
      contribution: "Owns top-20 health and renewal committee prep.",
    },
    {
      id: "c-ret-2",
      name: "Mina Park",
      role: "VP Product",
      contribution: "Restarts enablement and adoption instrumentation.",
    },
  ],
  blockers: [
    {
      id: "b-ret-1",
      title: "Enablement still paused",
      description: "Migration complete; enablement cadence not restored.",
      severity: "attention",
      owner: "Mina Park, VP Product",
      since: "2026-07-12",
    },
  ],
  recommendations: [
    {
      id: "rec-ret-1",
      title: "Open Apex sponsor call this week",
      whatChanged: "Apex asked for leadership attention after the adoption flag.",
      why: "Early executive presence reduces downgrade probability.",
      whatShouldHappenNext: "Book the call and attach a 14-day recovery outline.",
      recommendation: {
        businessImpact: "Protects 4.2% ARR and NRR trajectory.",
        expectedOutcomeImpact: "Holds outcome in watching rather than at-risk.",
        confidence: 76,
        owner: "Jordan Blake, CS",
        deadline: "Tue, 21 Jul",
      },
    },
  ],
  forecast: {
    horizonLabel: "45 days",
    expectedScore: 73,
    direction: "stable",
    narrative:
      "With enablement restarted and an Apex sponsor call, health can hold or improve slightly into the renewal cluster.",
    assumptions: [
      "Enablement resumes within five days",
      "No additional top-20 account enters red",
    ],
  },
  history: [
    { id: "h-ret-1", date: "2026-07-06", healthScore: 74, note: "Stable portfolio" },
    { id: "h-ret-2", date: "2026-07-12", healthScore: 72, note: "Enablement pause" },
    { id: "h-ret-3", date: "2026-07-19", healthScore: 71, note: "Apex flag" },
    { id: "h-ret-4", date: "2026-07-20", healthScore: 71, note: "No overnight change" },
  ],
  relationships: [
    {
      id: "rel-ret-arr",
      relatedOutcomeId: "outcome-enterprise-arr",
      relatedOutcomeName: "Expand enterprise ARR to $42M",
      relationship: "supports",
      explanation: "Retention credibility supports enterprise expansion narratives.",
    },
  ],
};

const board: Outcome = {
  id: "outcome-board",
  name: "Board-ready Q3 operating narrative",
  description:
    "Single coherent story across growth, risk, and capital allocation.",
  status: "on_track",
  healthScore: 82,
  yesterdayMovement: 3,
  yesterdayMovementLabel: "Up 3 pts",
  expectedTrajectory: {
    direction: "improving",
    summary: "On track if Helix risk note is drafted by Thursday.",
    horizonLabel: "Next 9 days",
  },
  confidence: 78,
  owner: "Priya Nair, Chief of Staff",
  targetDate: "2026-08-14",
  businessImpact:
    "Board trust and capital allocation clarity for the next operating cycle.",
  decisionIds: ["decision-board-risk"],
  contributingInsights: [],
  pendingActions: [],
  overnightSignals: [],
  calendarContext: [],
  timeline: [
    {
      id: "tl-board-1",
      at: "2026-07-20T06:00:00+10:00",
      title: "Narrative health +3",
      detail: "Operating story draft cleared CFO review.",
      kind: "health",
    },
    {
      id: "tl-board-2",
      at: "2026-07-17T15:00:00+10:00",
      title: "Pack outline locked",
      detail: "Section owners assigned for growth, risk, capital.",
      kind: "note",
    },
  ],
  contributors: [
    {
      id: "c-board-1",
      name: "Priya Nair",
      role: "Chief of Staff",
      contribution: "Owns narrative integrity and pack freeze.",
    },
    {
      id: "c-board-2",
      name: "Daniel Cho",
      role: "CFO",
      contribution: "Capital allocation section and metric integrity.",
    },
  ],
  blockers: [],
  recommendations: [
    {
      id: "rec-board-1",
      title: "Prepare Helix risk note for Thursday decision",
      whatChanged: "Helix slip creates a disclosure question.",
      why: "Board outcome stays healthy only if the narrative anticipates the risk.",
      whatShouldHappenNext: "Draft one paragraph; review with CEO.",
      recommendation: {
        businessImpact: "Preserves board trust under commercial uncertainty.",
        expectedOutcomeImpact: "Maintains on-track status through pack freeze.",
        confidence: 78,
        owner: "Priya Nair, Chief of Staff",
        deadline: "Thu, 23 Jul",
      },
    },
  ],
  forecast: {
    horizonLabel: "14 days",
    expectedScore: 84,
    direction: "improving",
    narrative: "Slight improvement expected once risk note ownership is explicit.",
    assumptions: ["Helix decision path is documented even if unresolved"],
  },
  history: [
    { id: "h-board-1", date: "2026-07-10", healthScore: 76, note: "Outline started" },
    { id: "h-board-2", date: "2026-07-17", healthScore: 79, note: "Owners assigned" },
    { id: "h-board-3", date: "2026-07-20", healthScore: 82, note: "CFO clearance" },
  ],
  relationships: [
    {
      id: "rel-board-arr",
      relatedOutcomeId: "outcome-enterprise-arr",
      relatedOutcomeName: "Expand enterprise ARR to $42M",
      relationship: "depends_on",
      explanation: "Growth chapter accuracy depends on Helix status.",
    },
  ],
};

const efficiency: Outcome = {
  id: "outcome-efficiency",
  name: "Reduce leadership meeting load by 15%",
  description:
    "Reclaim executive time through calendar discipline and decision hygiene.",
  status: "off_track",
  healthScore: 47,
  yesterdayMovement: -4,
  yesterdayMovementLabel: "Down 4 pts",
  expectedTrajectory: {
    direction: "declining",
    summary:
      "Further decline if Wednesday duplicate forums remain; recovery if merged today.",
    horizonLabel: "Next 7 days",
  },
  confidence: 88,
  owner: "Marcus Webb, COO",
  targetDate: "2026-10-31",
  businessImpact:
    "Reclaims executive judgment time required for Helix and board-quality decisions.",
  decisionIds: ["decision-forum"],
  contributingInsights: [
    {
      id: "insight-time",
      sourceLabel: "Operating rhythm",
      whatChanged:
        "CEO focus time this week is projected at 9%, versus a 25% operating standard.",
      why: "External asks filled the grid after two forums were accepted automatically.",
      whatShouldHappenNext:
        "Protect Tuesday and Thursday mornings before any new acceptances.",
      recommendation: {
        businessImpact:
          "Preserves time for Helix judgment and board narrative quality.",
        expectedOutcomeImpact:
          "Necessary condition for recovering Reduce leadership meeting load.",
        confidence: 88,
        owner: "Priya Nair, Chief of Staff",
        deadline: "Today, 10:00 AM",
      },
    },
  ],
  pendingActions: [
    {
      id: "action-calendar",
      actionLabel: "Decline or merge Wednesday Product sync",
      status: "pending",
      whatChanged:
        "Product sync duplicates the operating review agenda already scheduled.",
      why: "Accepting both guarantees the meeting-load outcome remains off track.",
      whatShouldHappenNext:
        "Decline with a note directing updates into the Wednesday operating review.",
      recommendation: {
        businessImpact:
          "Prevents another fragmented leadership week and conflicting asks.",
        expectedOutcomeImpact:
          "Immediate relief on Reduce leadership meeting load health.",
        confidence: 90,
        owner: "Alex Rivera, CEO",
        deadline: "Today, 11:00 AM",
      },
    },
  ],
  overnightSignals: [
    {
      id: "change-calendar",
      occurredAt: "2026-07-20T05:10:00+10:00",
      severity: "attention",
      whatChanged:
        "Two leadership forums were added to Wednesday, overlapping deep-work blocks.",
      why: "Ops and Product both booked ‘priority syncs’ without checking the executive grid.",
      whatShouldHappenNext:
        "Collapse to one forum or move Product sync to Friday async update.",
      recommendation: {
        businessImpact:
          "Adds 90 minutes of context-switching in the highest-leverage part of the week.",
        expectedOutcomeImpact:
          "Stabilises Reduce leadership meeting load — stops further erosion of the outcome.",
        confidence: 78,
        owner: "Marcus Webb, COO",
        deadline: "Today, 11:00 AM",
      },
    },
  ],
  calendarContext: [
    {
      id: "cal-ops",
      title: "Weekly operating review",
      startsAt: "2026-07-20T14:00:00+10:00",
      endsAt: "2026-07-20T15:00:00+10:00",
      attendeesSummary: "CEO, COO, CFO, CRO, CPO",
      whatChanged:
        "Agenda now includes meeting-load recovery and Helix status as lead items.",
      why: "Both items affect outcomes that moved overnight and need visible ownership.",
      whatShouldHappenNext:
        "Close the forum-merge decision or assign a 24-hour owner.",
      recommendation: {
        businessImpact:
          "Prevents the operating review from becoming status theatre.",
        expectedOutcomeImpact:
          "Creates accountability for Reduce leadership meeting load this week.",
        confidence: 80,
        owner: "Marcus Webb, COO",
        deadline: "Today, 3:00 PM",
      },
    },
  ],
  timeline: [
    {
      id: "tl-eff-1",
      at: "2026-07-20T05:10:00+10:00",
      title: "Duplicate forums added",
      detail: "Ops and Product booked overlapping Wednesday sessions.",
      kind: "blocker",
    },
    {
      id: "tl-eff-2",
      at: "2026-07-08T12:00:00+10:00",
      title: "Forums previously consolidated",
      detail: "Single operating review established — now regressing.",
      kind: "note",
    },
  ],
  contributors: [
    {
      id: "c-eff-1",
      name: "Marcus Webb",
      role: "COO",
      contribution: "Owns operating rhythm and forum structure.",
    },
    {
      id: "c-eff-2",
      name: "Priya Nair",
      role: "Chief of Staff",
      contribution: "Guards CEO focus blocks and acceptance policy.",
    },
  ],
  blockers: [
    {
      id: "b-eff-1",
      title: "Duplicate Wednesday forums",
      description: "Product sync overlaps the operating review.",
      severity: "critical",
      owner: "Marcus Webb, COO",
      since: "2026-07-20",
    },
  ],
  recommendations: [
    {
      id: "rec-eff-1",
      title: "Merge or decline Product sync today",
      whatChanged: "Duplicate forums reappeared overnight.",
      why: "Outcome cannot recover while the calendar contradicts the standard.",
      whatShouldHappenNext: "One forum only; async for the other track.",
      recommendation: {
        businessImpact: "Protects scarce CEO/COO judgment time.",
        expectedOutcomeImpact: "Stops further decline; path back above 55.",
        confidence: 90,
        owner: "Alex Rivera, CEO",
        deadline: "Today, 11:00 AM",
      },
    },
  ],
  forecast: {
    horizonLabel: "14 days",
    expectedScore: 42,
    direction: "declining",
    narrative:
      "Without an immediate merge, meeting-load health continues downward and constrains Helix judgment time.",
    assumptions: [
      "No new external forums accepted this week",
      "Focus blocks on Tue/Thu mornings are protected",
    ],
  },
  history: [
    { id: "h-eff-1", date: "2026-07-01", healthScore: 61, note: "Post-consolidation" },
    { id: "h-eff-2", date: "2026-07-08", healthScore: 58, note: "Drift begins" },
    { id: "h-eff-3", date: "2026-07-15", healthScore: 51, note: "External asks rise" },
    { id: "h-eff-4", date: "2026-07-20", healthScore: 47, note: "Duplicate forums" },
  ],
  relationships: [
    {
      id: "rel-eff-arr",
      relatedOutcomeId: "outcome-enterprise-arr",
      relatedOutcomeName: "Expand enterprise ARR to $42M",
      relationship: "supports",
      explanation: "Focus time is a prerequisite for the Helix residency decision.",
    },
  ],
};

export const MOCK_OUTCOME_PORTFOLIO: OutcomePortfolio = {
  overallScore: 68,
  statusLabel: "Attention required on two strategic outcomes",
  refreshedAt: "2026-07-20T06:15:00+10:00",
  executiveName: "Alex",
  outcomes: [enterpriseArr, retention, board, efficiency],
  decisions: MOCK_DECISIONS,
  intent: MOCK_ACTIVE_INTENT,
  intentHistory: MOCK_INTENT_HISTORY,
};
