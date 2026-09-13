/**
 * Progressive discovery from connected systems.
 *
 * Phase 36 — Production Truth Boundary:
 * Reality Lab fixtures only when mock/demo is explicit.
 * Production fails closed: no verified evidence → no discovery claim.
 */

import { isMockMode } from "@/lib/mock/mode";
import type {
  DiscoveryItem,
  DiscoveryKind,
  DiscoverySource,
} from "@/onboarding/types";

export type DiscoveryConnectedSystem = "microsoft365" | "simpro" | "salesforce";

export type DiscoveryAccountOrganisation = {
  id: string;
  name: string;
  industry?: string | null;
  country?: string | null;
};

export type DiscoveryRunInput = {
  tenantId: string;
  asOf?: string;
  connectedSystems?: DiscoveryConnectedSystem[];
  /**
   * Explicit Reality Lab / demo catalogue.
   * Production must never set this unless intentional demo tooling.
   */
  allowRealityLabFixtures?: boolean;
  /** Explicit demo intent (same family as ?demo=1 / intent=demo). */
  demoIntent?: boolean;
  /**
   * ExecutiveOS account context — never labelled as external-system discovery.
   * Used only for Production organisation naming when no live connectors exist.
   */
  accountOrganisation?: DiscoveryAccountOrganisation;
};

const REALITY_LAB_MARKERS = [
  "Northline Operations",
  "Acme Facilities",
  "Sarah Jones",
  "Monday 8:00am",
  "Executive Leadership Team",
  "Harbour Tower",
  "Jordan Lee",
  "CoolParts Co",
  "Campus MEP upgrade",
  "Chiller Plant A",
] as const;

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

/** Reality Lab / mock only — never Production default. */
export function shouldUseRealityLabDiscovery(
  input?: Pick<DiscoveryRunInput, "allowRealityLabFixtures" | "demoIntent">,
): boolean {
  if (input?.allowRealityLabFixtures === true) return true;
  if (input?.demoIntent === true) return true;
  return isMockMode();
}

/**
 * Fail closed: Production must not carry Reality Lab fixture identities.
 */
export function assertNoRealityLabFixtures(
  discoveries: DiscoveryItem[],
  gate?: Pick<DiscoveryRunInput, "allowRealityLabFixtures" | "demoIntent">,
): { ok: true } | { ok: false; violations: string[] } {
  if (shouldUseRealityLabDiscovery(gate)) {
    return { ok: true };
  }
  const blob = discoveries
    .map((d) => `${d.label}\n${d.summary}\n${d.editableValue ?? ""}`)
    .join("\n");
  const violations = REALITY_LAB_MARKERS.filter((marker) =>
    blob.includes(marker),
  );
  if (violations.length > 0) {
    return { ok: false, violations };
  }
  return { ok: true };
}

/**
 * Production-safe discovery: verified external evidence only.
 * No live Graph/Simpro integration yet → empty catalogue (fail closed).
 * Account metadata is NOT emitted as “discovered from connected systems”.
 */
export function discoverOrganisationProduction(
  _input: DiscoveryRunInput,
): DiscoveryItem[] {
  return [];
}

/**
 * Deterministic Reality Lab catalogue (mock / explicit demo only).
 */
export function discoverOrganisationRealityLab(
  input: DiscoveryRunInput,
): DiscoveryItem[] {
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

/**
 * Discover organisation signals.
 * Mock/demo → Reality Lab catalogue.
 * Production → empty until verified connector evidence exists (fail closed).
 */
export function discoverOrganisation(input: DiscoveryRunInput): DiscoveryItem[] {
  if (shouldUseRealityLabDiscovery(input)) {
    return discoverOrganisationRealityLab(input);
  }
  return discoverOrganisationProduction(input);
}

export function averageDiscoveryConfidence(items: DiscoveryItem[]): number {
  if (items.length === 0) return 0;
  return Math.round(
    items.reduce((sum, item) => sum + item.confidence, 0) / items.length,
  );
}
