/**
 * Progressive discovery from connected systems.
 * Never asks what Microsoft 365 or Simpro can answer.
 */

import type {
  DiscoveryItem,
  DiscoveryKind,
  DiscoverySource,
} from "@/onboarding/types";

export type DiscoveryRunInput = {
  tenantId: string;
  asOf?: string;
  connectedSystems?: Array<"microsoft365" | "simpro" | "salesforce">;
};

function item(input: {
  tenantId: string;
  kind: DiscoveryKind;
  label: string;
  summary: string;
  confidence: number;
  source: DiscoverySource;
  evidence: string[];
  relatedEntityIds?: string[];
  editableValue?: string;
}): DiscoveryItem {
  return {
    id: `disc-${input.kind}-${input.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    tenantId: input.tenantId,
    kind: input.kind,
    label: input.label,
    summary: input.summary,
    confidence: input.confidence,
    source: input.source,
    evidence: input.evidence,
    status: "proposed",
    relatedEntityIds: input.relatedEntityIds ?? [],
    editableValue: input.editableValue ?? input.label,
  };
}

/**
 * Deterministic discovery catalogue for Reality Lab / first login.
 * Production path swaps evidence for live Graph / Simpro sync output.
 */
export function discoverOrganisation(input: DiscoveryRunInput): DiscoveryItem[] {
  const tenantId = input.tenantId;
  const systems = input.connectedSystems ?? ["microsoft365", "simpro"];
  const items: DiscoveryItem[] = [];

  items.push(
    item({
      tenantId,
      kind: "organisation_name",
      label: "Northline Operations",
      summary: "We've identified Northline Operations as your organisation.",
      confidence: 94,
      source: "microsoft365",
      evidence: ["Directory tenant display name", "Primary email domain"],
    }),
  );

  if (systems.includes("microsoft365")) {
    items.push(
      item({
        tenantId,
        kind: "executive_team_member",
        label: "Sarah Jones",
        summary: "We've identified Sarah Jones as your Operations Manager.",
        confidence: 88,
        source: "microsoft365",
        evidence: [
          "Calendar attendees on ELT meetings",
          "Email frequency with CEO mailbox",
        ],
        relatedEntityIds: ["person-sarah-jones"],
        editableValue: "Sarah Jones — Operations Manager",
      }),
      item({
        tenantId,
        kind: "leadership_meeting",
        label: "Executive Leadership Team",
        summary:
          "We've identified Monday 8:00am as your Executive Leadership Team meeting.",
        confidence: 91,
        source: "microsoft365",
        evidence: ["Recurring calendar series", "Attendee overlap with exec team"],
        relatedEntityIds: ["meeting-elt-monday"],
      }),
      item({
        tenantId,
        kind: "board_meeting",
        label: "Board Strategy Review",
        summary: "We've identified a recurring Board Strategy Review cadence.",
        confidence: 86,
        source: "microsoft365",
        evidence: ["Calendar category Board", "High-importance attendees"],
      }),
      item({
        tenantId,
        kind: "committee",
        label: "Risk & Audit Committee",
        summary: "We've identified a Risk & Audit Committee rhythm.",
        confidence: 72,
        source: "microsoft365",
        evidence: ["Meeting subject patterns", "Distribution list membership"],
      }),
      item({
        tenantId,
        kind: "department",
        label: "Operations",
        summary: "We've identified Operations as a primary business unit.",
        confidence: 80,
        source: "microsoft365",
        evidence: ["Org chart hints", "Team mailbox naming"],
      }),
      item({
        tenantId,
        kind: "office_location",
        label: "Sydney HQ",
        summary: "We've identified Sydney as a primary office location.",
        confidence: 76,
        source: "microsoft365",
        evidence: ["User location attributes", "Meeting time zone clustering"],
      }),
      item({
        tenantId,
        kind: "connector",
        label: "Microsoft 365",
        summary: "We've identified Microsoft 365 as your collaboration platform.",
        confidence: 99,
        source: "microsoft365",
        evidence: ["Active OAuth connection"],
      }),
      item({
        tenantId,
        kind: "user_directory",
        label: "Executive directory",
        summary: "We've mapped your executive user directory.",
        confidence: 85,
        source: "microsoft365",
        evidence: ["People API", "Org contacts"],
      }),
    );
  }

  if (systems.includes("simpro")) {
    items.push(
      item({
        tenantId,
        kind: "connector",
        label: "Simpro",
        summary: "We've identified Simpro as your primary operational platform.",
        confidence: 97,
        source: "simpro",
        evidence: ["Active field-service connection", "Job volume"],
      }),
      item({
        tenantId,
        kind: "customer",
        label: "Acme Facilities",
        summary: "We've identified Acme Facilities as a key customer.",
        confidence: 90,
        source: "simpro",
        evidence: ["Open jobs", "Accepted quote value"],
      }),
      item({
        tenantId,
        kind: "site",
        label: "Harbour Tower",
        summary: "We've identified Harbour Tower as an active operating site.",
        confidence: 87,
        source: "simpro",
        evidence: ["Scheduled jobs", "Asset register"],
      }),
      item({
        tenantId,
        kind: "technician",
        label: "Jordan Lee",
        summary: "We've identified Jordan Lee as a key field technician.",
        confidence: 84,
        source: "simpro",
        evidence: ["Assignment frequency", "Trade: HVAC"],
      }),
      item({
        tenantId,
        kind: "project",
        label: "Campus MEP upgrade",
        summary: "We've identified Campus MEP upgrade as a strategic project.",
        confidence: 82,
        source: "simpro",
        evidence: ["Project margin watch", "Customer linkage"],
      }),
      item({
        tenantId,
        kind: "supplier",
        label: "CoolParts Co",
        summary: "We've identified CoolParts Co as a supply dependency.",
        confidence: 78,
        source: "simpro",
        evidence: ["Delayed purchase orders"],
      }),
      item({
        tenantId,
        kind: "recurring_workflow",
        label: "Planned maintenance cycle",
        summary: "We've identified a recurring planned maintenance workflow.",
        confidence: 74,
        source: "simpro",
        evidence: ["Job stage patterns", "Schedule cadence"],
      }),
      item({
        tenantId,
        kind: "asset",
        label: "Chiller Plant A",
        summary: "We've identified critical plant assets under service.",
        confidence: 81,
        source: "simpro",
        evidence: ["Asset register", "Service history"],
      }),
      item({
        tenantId,
        kind: "job",
        label: "Open field commitments",
        summary: "We've mapped open service commitments requiring attention.",
        confidence: 88,
        source: "simpro",
        evidence: ["Open jobs", "Critical priorities"],
      }),
    );
  }

  if (systems.includes("salesforce")) {
    items.push(
      item({
        tenantId,
        kind: "customer",
        label: "Strategic accounts",
        summary:
          "We've identified strategic commercial accounts requiring executive attention.",
        confidence: 86,
        source: "salesforce",
        evidence: ["Account ownership", "Open pursuits"],
      }),
      item({
        tenantId,
        kind: "project",
        label: "Revenue forecast window",
        summary:
          "We've mapped the live revenue forecast window from commercial activity.",
        confidence: 84,
        source: "salesforce",
        evidence: ["Weighted forecast", "Stage movement"],
      }),
    );
  }

  items.push(
    item({
      tenantId,
      kind: "business_terminology",
      label: "ELT / Board / Field capacity",
      summary: "We've learned your leadership and operations vocabulary.",
      confidence: 70,
      source: "inferred",
      evidence: ["Meeting titles", "Operational labels"],
    }),
    item({
      tenantId,
      kind: "operating_rhythm",
      label: "Weekly ELT + monthly Board",
      summary: "We've inferred your primary operating rhythm.",
      confidence: 83,
      source: "inferred",
      evidence: ["Recurring governance meetings"],
    }),
  );

  return items;
}

export function averageDiscoveryConfidence(items: DiscoveryItem[]): number {
  if (items.length === 0) return 0;
  return Math.round(
    items.reduce((sum, item) => sum + item.confidence, 0) / items.length,
  );
}
