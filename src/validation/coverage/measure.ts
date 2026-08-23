/**
 * Discovery coverage — discovered vs estimated.
 */

import type { CoverageDimension, DiscoveryCoverage } from "@/validation/types";
import type { DiscoveryItem } from "@/onboarding/types";
import { getM365ConnectionRegistry } from "@/providers/microsoft365";
import { getSimproConnectionRegistry } from "@/providers/simpro";

function dimension(
  id: string,
  label: string,
  discovered: number,
  estimated: number,
  explanation: string,
): CoverageDimension {
  const coveragePct =
    estimated <= 0
      ? 0
      : Math.min(100, Math.round((discovered / estimated) * 100));
  return { id, label, discovered, estimated, coveragePct, explanation };
}

function countKinds(items: DiscoveryItem[], kinds: string[]): number {
  return items.filter((i) => kinds.includes(i.kind) && i.status !== "ignored")
    .length;
}

export function measureDiscoveryCoverage(input: {
  tenantId: string;
  asOf: string;
  discoveries?: DiscoveryItem[];
  estimates?: Partial<Record<string, number>>;
}): DiscoveryCoverage {
  const discoveries = input.discoveries ?? [];
  const e = input.estimates ?? {};

  const dimensions: CoverageDimension[] = [
    dimension(
      "people",
      "People",
      countKinds(discoveries, ["executive_team_member", "technician", "user_directory"]),
      e.people ?? 12,
      "People discovered across directory and operations",
    ),
    dimension(
      "leadership",
      "Leadership",
      countKinds(discoveries, ["executive_team_member", "management_structure"]),
      e.leadership ?? 6,
      "Leadership roles identified",
    ),
    dimension(
      "business_units",
      "Business units",
      countKinds(discoveries, ["business_unit", "department"]),
      e.business_units ?? 5,
      "Business units and departments",
    ),
    dimension(
      "departments",
      "Departments",
      countKinds(discoveries, ["department"]),
      e.departments ?? 4,
      "Department coverage",
    ),
    dimension(
      "projects",
      "Projects",
      countKinds(discoveries, ["project"]),
      e.projects ?? 8,
      "Strategic and operational projects",
    ),
    dimension(
      "customers",
      "Customers",
      countKinds(discoveries, ["customer"]),
      e.customers ?? 20,
      "Customer coverage from operations",
    ),
    dimension(
      "assets",
      "Assets",
      countKinds(discoveries, ["asset"]),
      e.assets ?? 30,
      "Asset register coverage",
    ),
    dimension(
      "jobs",
      "Jobs",
      countKinds(discoveries, ["job"]),
      e.jobs ?? 40,
      "Open and recent service commitments",
    ),
    dimension(
      "meetings",
      "Meetings",
      countKinds(discoveries, [
        "board_meeting",
        "leadership_meeting",
        "governance_meeting",
      ]),
      e.meetings ?? 10,
      "Governance and leadership meetings",
    ),
    dimension(
      "committees",
      "Committees",
      countKinds(discoveries, ["committee"]),
      e.committees ?? 3,
      "Committee structures",
    ),
    dimension(
      "strategic_documents",
      "Strategic documents",
      countKinds(discoveries, ["strategic_theme"]),
      e.strategic_documents ?? 6,
      "Board packs and strategy artefacts",
    ),
    dimension(
      "relationships",
      "Relationships",
      countKinds(discoveries, [
        "executive_team_member",
        "reporting_line",
        "customer",
        "supplier",
      ]),
      e.relationships ?? 25,
      "Mapped organisational relationships",
    ),
    dimension(
      "business_events",
      "Business events",
      countKinds(discoveries, ["job", "project", "recurring_workflow"]),
      e.business_events ?? 50,
      "Canonical business events from providers",
    ),
  ];

  const m365 = getM365ConnectionRegistry().adminStatus(input.tenantId);
  const simpro = getSimproConnectionRegistry().adminStatus(input.tenantId);

  const connectorCoverage = [
    {
      id: "microsoft365",
      label: "Microsoft 365",
      connected: m365?.tenantStatus === "connected",
      coveragePct:
        m365?.tenantStatus === "connected"
          ? Math.min(100, 40 + (m365.dataQuality.commitments + m365.dataQuality.signals) * 4)
          : 0,
    },
    {
      id: "simpro",
      label: "Simpro",
      connected: simpro?.tenantStatus === "connected",
      coveragePct:
        simpro?.tenantStatus === "connected"
          ? Math.min(100, 35 + simpro.dataQuality.openJobs * 8 + simpro.dataQuality.signals * 3)
          : 0,
    },
  ];

  const overallCoveragePct = Math.round(
    dimensions.reduce((sum, d) => sum + d.coveragePct, 0) / dimensions.length,
  );

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    dimensions,
    overallCoveragePct,
    connectorCoverage,
  };
}
