import type { Decision } from "@/lib/decisions/engine-types";

/** Canonical Decision Engine store — each decision links to ≥1 outcome. */
export const MOCK_DECISIONS: Decision[] = [
  {
    id: "decision-residency",
    question:
      "Approve EU data residency exception for Helix Industries, or require full regional deployment?",
    outcomeIds: ["outcome-enterprise-arr", "outcome-board"],
    status: "due_today",
    owner: "Alex Rivera, CEO",
    deadline: "Today, 5:00 PM",
    confidence: 81,
    businessImpact:
      "Unlocks or blocks a strategic logo that signals enterprise credibility and ~$1.8M expansion.",
    expectedOutcomeImpact:
      "Moves Expand enterprise ARR health by an estimated 8–10 points; informs board risk disclosure.",
    costOfDelay:
      "Each day of delay risks missing Helix’s procurement window and a further 3–5 point ARR health decline.",
    whatChanged:
      "Security and Legal diverge; Helix will not proceed without a written position.",
    why: "Without a decision today, the expansion workshop cannot be scheduled this week.",
    whatShouldHappenNext:
      "Choose exception with compensating controls, or commit to regional deploy timeline.",
    recommendationSummary:
      "Prefer exception with compensating controls if counsel accepts residual risk — preserves commercial velocity.",
    stakeholders: [
      {
        id: "sh-res-1",
        name: "Alex Rivera",
        role: "CEO",
        stance: "approver",
        note: "Final risk posture owner.",
      },
      {
        id: "sh-res-2",
        name: "Amelia Chen",
        role: "CRO",
        stance: "sponsor",
        note: "Needs a written position for Helix today.",
      },
      {
        id: "sh-res-3",
        name: "Sam Okonkwo",
        role: "General Counsel",
        stance: "advisor",
        note: "Prepared exception and regional-deploy memos.",
      },
      {
        id: "sh-res-4",
        name: "Priya Nair",
        role: "Chief of Staff",
        stance: "informed",
        note: "Tracks board disclosure implications.",
      },
    ],
    evidence: [
      {
        id: "ev-res-1",
        title: "Legal option memo — exception path",
        source: "General Counsel",
        summary: "Compensating controls outlined; residual risk rated medium.",
        asOf: "2026-07-20",
      },
      {
        id: "ev-res-2",
        title: "Legal option memo — regional deploy",
        source: "General Counsel",
        summary: "12–16 week build; preserves strict residency posture.",
        asOf: "2026-07-20",
      },
      {
        id: "ev-res-3",
        title: "Helix procurement timeline",
        source: "CRO",
        summary: "Security workshop window closes Thursday this week.",
        asOf: "2026-07-19",
      },
    ],
    alternatives: [
      {
        id: "alt-res-1",
        label: "Approve exception with controls",
        summary: "Proceed with documented compensating controls.",
        upside: "Keeps Helix inside this week’s commercial window.",
        downside: "Accepts residual residency risk on the exception path.",
      },
      {
        id: "alt-res-2",
        label: "Require full regional deployment",
        summary: "Commit to EU regional deploy before expansion.",
        upside: "Strongest compliance posture.",
        downside: "Likely slips Helix beyond H2 pacing.",
      },
      {
        id: "alt-res-3",
        label: "Defer 48 hours",
        summary: "Wait for additional security review.",
        upside: "More analysis time.",
        downside: "High cost of delay — workshop slot may be lost.",
      },
    ],
    tradeOffs: [
      {
        id: "to-res-1",
        dimension: "Speed vs. compliance purity",
        choice: "Exception path prioritises speed with controls",
        consequence: "Board may require explicit risk language.",
      },
      {
        id: "to-res-2",
        dimension: "Revenue vs. build cost",
        choice: "Regional deploy protects posture but spends cycle time",
        consequence: "ARR outcome likely declines near-term.",
      },
    ],
    relationships: [
      {
        id: "rel-dec-1",
        relatedDecisionId: "decision-board-risk",
        relatedDecisionLabel: "Helix board risk disclosure",
        relationship: "enables",
        explanation:
          "Residency posture determines whether Helix appears as a board risk slide.",
      },
    ],
    timeline: [
      {
        id: "tl-dec-res-1",
        at: "2026-07-18T11:30:00+10:00",
        title: "Decision opened",
        detail: "Legal and Security requested executive risk posture.",
        kind: "opened",
      },
      {
        id: "tl-dec-res-2",
        at: "2026-07-20T06:00:00+10:00",
        title: "Evidence complete",
        detail: "Both option memos marked decision-ready.",
        kind: "evidence",
      },
      {
        id: "tl-dec-res-3",
        at: "2026-07-20T11:00:00+10:00",
        title: "Counsel review scheduled",
        detail: "CEO, GC, CRO meet to select path.",
        kind: "review",
      },
    ],
    history: [
      {
        id: "hi-res-1",
        at: "2026-07-18T11:30:00+10:00",
        status: "pending",
        note: "Opened from Helix security questionnaire stall.",
        actor: "Priya Nair",
      },
      {
        id: "hi-res-2",
        at: "2026-07-19T16:00:00+10:00",
        status: "under_review",
        note: "Moved to counsel review with dual memos.",
        actor: "Sam Okonkwo",
      },
      {
        id: "hi-res-3",
        at: "2026-07-20T06:15:00+10:00",
        status: "due_today",
        note: "Deadline advanced — procurement window constraint.",
        actor: "Amelia Chen",
      },
    ],
    approvalWorkflow: [
      {
        id: "ap-res-1",
        label: "Counsel options prepared",
        owner: "Sam Okonkwo, GC",
        status: "complete",
        completedAt: "2026-07-20T06:00:00+10:00",
      },
      {
        id: "ap-res-2",
        label: "CRO commercial recommendation",
        owner: "Amelia Chen, CRO",
        status: "complete",
        completedAt: "2026-07-20T07:00:00+10:00",
      },
      {
        id: "ap-res-3",
        label: "CEO decision",
        owner: "Alex Rivera, CEO",
        status: "current",
        note: "Required before 5:00 PM today.",
      },
      {
        id: "ap-res-4",
        label: "Written position issued to Helix",
        owner: "Amelia Chen, CRO",
        status: "upcoming",
      },
    ],
  },
  {
    id: "decision-forum",
    question:
      "Keep separate Ops and Product leadership forums, or merge into one operating review?",
    outcomeIds: ["outcome-efficiency"],
    status: "under_review",
    owner: "Marcus Webb, COO",
    deadline: "Tue, 21 Jul",
    confidence: 77,
    businessImpact:
      "Reclaims ~6 executive hours monthly and reduces contradictory priorities.",
    expectedOutcomeImpact:
      "Required to bring Reduce leadership meeting load back toward on-track.",
    costOfDelay:
      "Each retained duplicate week costs ~90 minutes of CEO/COO context-switching and further outcome decline.",
    whatChanged:
      "Duplicate forums reappeared on the calendar after last month’s consolidation.",
    why: "Meeting load outcome is already off track; another split week resets the habit.",
    whatShouldHappenNext:
      "Confirm a single Wednesday operating review with written async for the other track.",
    recommendationSummary:
      "Merge into one Wednesday operating review; Product updates move to async.",
    stakeholders: [
      {
        id: "sh-for-1",
        name: "Marcus Webb",
        role: "COO",
        stance: "sponsor",
        note: "Owns operating rhythm standard.",
      },
      {
        id: "sh-for-2",
        name: "Alex Rivera",
        role: "CEO",
        stance: "approver",
        note: "Must decline or merge Product sync today.",
      },
      {
        id: "sh-for-3",
        name: "Mina Park",
        role: "CPO",
        stance: "impacted",
        note: "Loses a dedicated forum if merged.",
      },
    ],
    evidence: [
      {
        id: "ev-for-1",
        title: "Calendar overlap analysis",
        source: "Chief of Staff",
        summary: "Product sync duplicates 70% of operating review agenda.",
        asOf: "2026-07-20",
      },
      {
        id: "ev-for-2",
        title: "Focus-time projection",
        source: "Operating rhythm",
        summary: "CEO focus time at 9% vs 25% standard this week.",
        asOf: "2026-07-20",
      },
    ],
    alternatives: [
      {
        id: "alt-for-1",
        label: "Merge forums",
        summary: "Single Wednesday operating review.",
        upside: "Immediate load relief; restores standard.",
        downside: "Product needs async discipline.",
      },
      {
        id: "alt-for-2",
        label: "Keep both",
        summary: "Retain separate Ops and Product forums.",
        upside: "Domain depth in each room.",
        downside: "Outcome remains off track.",
      },
    ],
    tradeOffs: [
      {
        id: "to-for-1",
        dimension: "Depth vs. load",
        choice: "Merge prioritises load recovery",
        consequence: "Product topics compete for agenda time.",
      },
    ],
    relationships: [],
    timeline: [
      {
        id: "tl-for-1",
        at: "2026-07-08T12:00:00+10:00",
        title: "Forums previously consolidated",
        detail: "Single operating review established.",
        kind: "note",
      },
      {
        id: "tl-for-2",
        at: "2026-07-20T05:10:00+10:00",
        title: "Duplicate forums reappeared",
        detail: "Decision reopened under review.",
        kind: "opened",
      },
    ],
    history: [
      {
        id: "hi-for-1",
        at: "2026-07-08T12:00:00+10:00",
        status: "decided",
        note: "Merged to single operating review.",
        actor: "Marcus Webb",
      },
      {
        id: "hi-for-2",
        at: "2026-07-20T05:30:00+10:00",
        status: "under_review",
        note: "Reopened after calendar regression.",
        actor: "Priya Nair",
      },
    ],
    approvalWorkflow: [
      {
        id: "ap-for-1",
        label: "COO recommendation",
        owner: "Marcus Webb, COO",
        status: "complete",
        completedAt: "2026-07-20T08:00:00+10:00",
      },
      {
        id: "ap-for-2",
        label: "CEO calendar action",
        owner: "Alex Rivera, CEO",
        status: "current",
        note: "Decline or merge Product sync.",
      },
      {
        id: "ap-for-3",
        label: "Standard republished",
        owner: "Priya Nair, Chief of Staff",
        status: "upcoming",
      },
    ],
  },
  {
    id: "decision-board-risk",
    question:
      "Surface Helix delay as a board risk slide, or hold until the expansion path is clear?",
    outcomeIds: ["outcome-board", "outcome-enterprise-arr"],
    status: "pending",
    owner: "Priya Nair, Chief of Staff",
    deadline: "Thu, 23 Jul",
    confidence: 72,
    businessImpact:
      "Protects board trust while avoiding premature commercial disclosure.",
    expectedOutcomeImpact:
      "Keeps Board-ready Q3 narrative on track without freezing commercial judgment.",
    costOfDelay:
      "Waiting past Thursday forces a last-minute pack change and raises concealment risk.",
    whatChanged:
      "Board pack freeze is nine days out; narrative ownership is still ambiguous.",
    why: "Surfacing too early creates noise; waiting too long looks like concealment.",
    whatShouldHappenNext:
      "Draft a one-paragraph risk note for CoS review; decide inclusion by Thursday.",
    recommendationSummary:
      "Draft the risk note now; decide inclusion Thursday based on residency outcome.",
    stakeholders: [
      {
        id: "sh-br-1",
        name: "Priya Nair",
        role: "Chief of Staff",
        stance: "sponsor",
        note: "Owns pack narrative integrity.",
      },
      {
        id: "sh-br-2",
        name: "Alex Rivera",
        role: "CEO",
        stance: "approver",
        note: "Final disclosure judgment.",
      },
      {
        id: "sh-br-3",
        name: "Daniel Cho",
        role: "CFO",
        stance: "advisor",
        note: "Capital chapter alignment.",
      },
    ],
    evidence: [
      {
        id: "ev-br-1",
        title: "Board freeze calendar",
        source: "Chief of Staff",
        summary: "Pack freeze in nine days.",
        asOf: "2026-07-20",
      },
    ],
    alternatives: [
      {
        id: "alt-br-1",
        label: "Include risk slide",
        summary: "Explicit Helix risk in board pack.",
        upside: "Maximum transparency.",
        downside: "May over-weight unresolved commercial noise.",
      },
      {
        id: "alt-br-2",
        label: "Hold with prepared note",
        summary: "Keep note ready; include only if still unresolved.",
        upside: "Balances trust and discretion.",
        downside: "Requires Thursday checkpoint discipline.",
      },
    ],
    tradeOffs: [
      {
        id: "to-br-1",
        dimension: "Transparency vs. noise",
        choice: "Prepared note with Thursday gate",
        consequence: "Depends on residency decision timing.",
      },
    ],
    relationships: [
      {
        id: "rel-dec-2",
        relatedDecisionId: "decision-residency",
        relatedDecisionLabel: "Helix residency posture",
        relationship: "related_to",
        explanation: "Disclosure content depends on residency path chosen.",
      },
    ],
    timeline: [
      {
        id: "tl-br-1",
        at: "2026-07-19T10:00:00+10:00",
        title: "Disclosure question opened",
        detail: "Helix slip creates board narrative ambiguity.",
        kind: "opened",
      },
    ],
    history: [
      {
        id: "hi-br-1",
        at: "2026-07-19T10:00:00+10:00",
        status: "pending",
        note: "Opened pending residency clarity.",
        actor: "Priya Nair",
      },
    ],
    approvalWorkflow: [
      {
        id: "ap-br-1",
        label: "Draft risk note",
        owner: "Priya Nair, Chief of Staff",
        status: "current",
      },
      {
        id: "ap-br-2",
        label: "CEO inclusion decision",
        owner: "Alex Rivera, CEO",
        status: "upcoming",
      },
      {
        id: "ap-br-3",
        label: "Pack freeze",
        owner: "Priya Nair, Chief of Staff",
        status: "upcoming",
      },
    ],
  },
];
