import { GraphBuilder } from "@/knowledge-graph/graph-builder";
import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";

/**
 * Northline Systems — realistic enterprise knowledge graph.
 * Helix · Board Pack · Revenue Growth · Security · Renewal · Transformation.
 */
export function buildNorthlineKnowledgeGraph(): KnowledgeGraph {
  return new GraphBuilder()
    .withMeta({
      asOf: "2026-07-20T06:15:00+10:00",
      source: "mock-northline",
    })
    .entities([
      // People
      { id: "person-alex", type: "Person", label: "Alex Rivera", properties: { role: "CEO" } },
      { id: "person-amelia", type: "Person", label: "Amelia Chen", properties: { role: "CRO" } },
      { id: "person-sam", type: "Person", label: "Sam Okonkwo", properties: { role: "General Counsel" } },
      { id: "person-priya", type: "Person", label: "Priya Nair", properties: { role: "Chief of Staff" } },
      { id: "person-marcus", type: "Person", label: "Marcus Webb", properties: { role: "COO" } },

      // Org
      { id: "team-executive", type: "Team", label: "Executive Leadership Team" },
      { id: "dept-revenue", type: "Department", label: "Revenue" },
      { id: "dept-legal", type: "Department", label: "Legal" },
      { id: "dept-security", type: "Department", label: "Security" },

      // Customers / programs
      { id: "customer-helix", type: "Customer", label: "Helix Industries" },
      { id: "customer-apex", type: "Customer", label: "Apex Renewals Cohort" },
      {
        id: "initiative-transformation",
        type: "StrategicInitiative",
        label: "Transformation Program",
      },
      {
        id: "initiative-planning",
        type: "StrategicInitiative",
        label: "Strategic Planning Cycle",
      },
      { id: "objective-revenue-growth", type: "Objective", label: "Revenue Growth" },
      { id: "project-eu-residency", type: "Project", label: "EU Residency Program" },

      // Outcomes (aligned with portfolio SoT ids)
      { id: "outcome-enterprise-arr", type: "Outcome", label: "Enterprise ARR" },
      { id: "outcome-retention", type: "Outcome", label: "Net Retention" },
      { id: "outcome-board", type: "Outcome", label: "Board Pack" },
      { id: "outcome-efficiency", type: "Outcome", label: "Meeting Load / Executive Capacity" },

      // Decisions
      {
        id: "decision-residency",
        type: "Decision",
        label: "Helix EU data residency exception",
      },
      {
        id: "decision-forum",
        type: "Decision",
        label: "Merge Ops and Product leadership forums",
      },
      {
        id: "decision-board-risk",
        type: "Decision",
        label: "Surface Helix delay as board risk",
      },

      // Risks / opportunities
      { id: "risk-helix-window", type: "Risk", label: "Helix procurement window slip" },
      { id: "risk-board-trust", type: "Risk", label: "Board disclosure trust risk" },
      { id: "risk-capacity", type: "Risk", label: "Executive capacity overdraw" },
      {
        id: "opportunity-helix-logo",
        type: "Opportunity",
        label: "Helix strategic logo + $1.8M expansion",
      },
      {
        id: "opportunity-forum-hours",
        type: "Opportunity",
        label: "Reclaim ~6 executive hours monthly",
      },

      // Meetings / actions / documents
      {
        id: "meeting-helix-security",
        type: "Meeting",
        label: "Helix security workshop",
      },
      {
        id: "meeting-board-prep",
        type: "Meeting",
        label: "Board pack working session",
      },
      {
        id: "action-helix-position",
        type: "Action",
        label: "Take written Helix residency position",
      },
      {
        id: "action-workshop-slot",
        type: "Action",
        label: "Lock Helix security workshop slot",
      },
      {
        id: "action-counsel-memo",
        type: "Action",
        label: "Circulate exception memo",
      },
      {
        id: "doc-legal-exception",
        type: "Document",
        label: "Legal option memo — exception path",
        properties: { system: "SharePoint" },
      },
      {
        id: "doc-legal-regional",
        type: "Document",
        label: "Legal option memo — regional deploy",
        properties: { system: "SharePoint" },
      },
      {
        id: "doc-helix-timeline",
        type: "Document",
        label: "Helix procurement timeline",
        properties: { system: "Salesforce" },
      },
      {
        id: "policy-data-residency",
        type: "Policy",
        label: "EU Data Residency Policy",
      },

      // Systems / signals / insights / metrics / recommendations
      { id: "system-salesforce", type: "System", label: "Salesforce" },
      { id: "system-m365", type: "System", label: "Microsoft 365" },
      { id: "system-jira", type: "System", label: "Jira" },
      {
        id: "signal-helix-slip",
        type: "Signal",
        label: "Helix expansion slipped two weeks",
      },
      {
        id: "signal-meeting-load",
        type: "Signal",
        label: "Two leadership forums added Wednesday",
      },
      {
        id: "insight-security-legal-diverge",
        type: "Insight",
        label: "Security and Legal diverge on Helix path",
      },
      {
        id: "metric-arr-health",
        type: "Metric",
        label: "Enterprise ARR health",
        properties: { value: 54 },
      },
      {
        id: "metric-capacity",
        type: "Metric",
        label: "Executive capacity index",
        properties: { value: 29 },
      },
      {
        id: "rec-approve-helix",
        type: "Recommendation",
        label: "Approve Helix exception with controls",
      },
      {
        id: "rec-schedule-workshop",
        type: "Recommendation",
        label: "Schedule Helix security workshop",
      },
      {
        id: "rec-delegate-memo",
        type: "Recommendation",
        label: "Delegate exception memo circulation",
      },
    ])
    .relateMany([
      // Ownership
      { type: "owned_by", from: "decision-residency", to: "person-alex" },
      { type: "owned_by", from: "decision-forum", to: "person-marcus" },
      { type: "owned_by", from: "decision-board-risk", to: "person-priya" },
      { type: "owned_by", from: "outcome-enterprise-arr", to: "person-amelia" },
      { type: "owned_by", from: "outcome-board", to: "person-priya" },
      { type: "owned_by", from: "outcome-efficiency", to: "person-marcus" },
      { type: "owned_by", from: "outcome-retention", to: "person-amelia" },
      { type: "approved_by", from: "decision-residency", to: "person-alex" },
      { type: "delegated_to", from: "action-counsel-memo", to: "person-sam" },

      // Org structure
      { type: "relates_to", from: "person-alex", to: "team-executive" },
      { type: "relates_to", from: "person-amelia", to: "dept-revenue" },
      { type: "relates_to", from: "person-sam", to: "dept-legal" },
      { type: "contributes_to", from: "dept-security", to: "project-eu-residency" },

      // Helix commercial cluster
      { type: "affects", from: "customer-helix", to: "outcome-enterprise-arr", weight: 0.9 },
      { type: "requires", from: "customer-helix", to: "decision-residency" },
      { type: "depends_on", from: "opportunity-helix-logo", to: "decision-residency" },
      { type: "supports", from: "decision-residency", to: "outcome-enterprise-arr", weight: 0.95 },
      { type: "affects", from: "decision-residency", to: "outcome-board", weight: 0.7 },
      { type: "increases", from: "decision-residency", to: "risk-helix-window" },
      { type: "increases", from: "decision-residency", to: "risk-board-trust" },
      { type: "blocks", from: "risk-helix-window", to: "opportunity-helix-logo" },
      { type: "requires", from: "decision-residency", to: "policy-data-residency" },
      { type: "depends_on", from: "project-eu-residency", to: "decision-residency" },
      { type: "contributes_to", from: "project-eu-residency", to: "objective-revenue-growth" },
      { type: "supports", from: "outcome-enterprise-arr", to: "objective-revenue-growth" },

      // Evidence / documents
      { type: "generated_from", from: "decision-residency", to: "doc-legal-exception" },
      { type: "generated_from", from: "decision-residency", to: "doc-legal-regional" },
      { type: "generated_from", from: "decision-residency", to: "doc-helix-timeline" },
      { type: "derived_from", from: "insight-security-legal-diverge", to: "doc-legal-exception" },
      { type: "mentions", from: "doc-helix-timeline", to: "customer-helix" },
      { type: "derived_from", from: "signal-helix-slip", to: "system-salesforce" },
      { type: "affects", from: "signal-helix-slip", to: "outcome-enterprise-arr" },
      { type: "affects", from: "signal-meeting-load", to: "outcome-efficiency" },
      { type: "derived_from", from: "signal-meeting-load", to: "system-m365" },

      // Meetings
      { type: "mentions", from: "meeting-helix-security", to: "decision-residency" },
      { type: "mentions", from: "meeting-helix-security", to: "customer-helix" },
      { type: "scheduled_in", from: "action-workshop-slot", to: "meeting-helix-security" },
      { type: "mentions", from: "meeting-board-prep", to: "outcome-board" },
      { type: "mentions", from: "meeting-board-prep", to: "decision-board-risk" },

      // Actions / recommendations
      { type: "creates", from: "decision-residency", to: "action-helix-position" },
      { type: "supports", from: "action-helix-position", to: "decision-residency" },
      { type: "supports", from: "action-workshop-slot", to: "decision-residency" },
      { type: "supports", from: "action-counsel-memo", to: "decision-residency" },
      { type: "derived_from", from: "rec-approve-helix", to: "decision-residency" },
      { type: "affects", from: "rec-approve-helix", to: "outcome-enterprise-arr" },
      { type: "mitigates", from: "rec-approve-helix", to: "risk-helix-window" },
      { type: "derived_from", from: "rec-schedule-workshop", to: "decision-residency" },
      { type: "supports", from: "rec-schedule-workshop", to: "action-workshop-slot" },
      { type: "derived_from", from: "rec-delegate-memo", to: "decision-residency" },
      { type: "delegated_to", from: "rec-delegate-memo", to: "person-sam" },

      // Board / forums / capacity
      { type: "affects", from: "decision-board-risk", to: "outcome-board" },
      { type: "depends_on", from: "decision-board-risk", to: "decision-residency" },
      { type: "increases", from: "decision-board-risk", to: "risk-board-trust" },
      { type: "reduces", from: "decision-forum", to: "risk-capacity" },
      { type: "supports", from: "decision-forum", to: "outcome-efficiency" },
      { type: "supports", from: "decision-forum", to: "opportunity-forum-hours" },
      { type: "increases", from: "signal-meeting-load", to: "risk-capacity" },
      { type: "affects", from: "risk-capacity", to: "outcome-efficiency" },

      // Retention / transformation / planning
      { type: "affects", from: "customer-apex", to: "outcome-retention" },
      { type: "supports", from: "initiative-transformation", to: "objective-revenue-growth" },
      { type: "relates_to", from: "initiative-planning", to: "outcome-board" },
      { type: "relates_to", from: "initiative-planning", to: "team-executive" },
      { type: "contributes_to", from: "initiative-transformation", to: "outcome-efficiency" },

      // Metrics
      { type: "derived_from", from: "metric-arr-health", to: "outcome-enterprise-arr" },
      { type: "derived_from", from: "metric-capacity", to: "outcome-efficiency" },
      { type: "generated_from", from: "metric-arr-health", to: "system-salesforce" },
      { type: "generated_from", from: "metric-capacity", to: "system-m365" },

      // Systems touchpoints
      { type: "relates_to", from: "doc-helix-timeline", to: "system-salesforce" },
      { type: "relates_to", from: "meeting-helix-security", to: "system-m365" },
      { type: "relates_to", from: "project-eu-residency", to: "system-jira" },
    ])
    .build();
}
