import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { CommercialReadinessDashboard } from "@/components/admin/CommercialReadinessDashboard";
import {
  buildCommercialDashboard,
  createContract,
  createImplementationPlan,
  createSuccessPlan,
  ensureDefaultEditions,
  generateCustomerRoiReport,
  issueLicense,
  listLicenses,
  completeImplementationStage,
  updateLicenseUsage,
  updateSuccessPlan,
} from "@/commercial";
import { listPilots, provisionDesignPartner } from "@/pilot";
import { syncPartnersFromPilots } from "@/operations";

function ensurePartners() {
  if (listPilots().length === 0) {
    provisionDesignPartner({
      partnerName: "Northline Ops Pilot",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@northline-ops.test",
      region: "au",
      environment: "pilot",
    });
    provisionDesignPartner({
      partnerName: "Harbor Commercial Pilot",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@harbor-commercial.test",
      region: "au",
      environment: "pilot",
    });
  }
  syncPartnersFromPilots();
}

function seedCommercialIfEmpty() {
  ensureDefaultEditions();
  ensurePartners();
  if (listLicenses().length > 0) return;

  const pilots = listPilots();
  for (const pilot of pilots) {
    const editionId =
      pilot.intelligenceProfileId === "commercial_executive"
        ? ("commercial_executive" as const)
        : ("operations_executive" as const);

    const license = issueLicense({
      tenantId: pilot.tenantId,
      editionId,
      tier: "design_partner",
      notes: "Seeded Design Partner license",
    });
    updateLicenseUsage({
      licenseId: license.id,
      seatsUsed: 3,
      executivesActive: 1,
      providersConnected: 1,
    });

    const impl = createImplementationPlan({
      tenantId: pilot.tenantId,
      editionId,
    });
    completeImplementationStage({
      planId: impl.id,
      stageId: "discovery",
      evidence: ["Edition confirmed with sponsor"],
    });
    completeImplementationStage({
      planId: impl.id,
      stageId: "provisioning",
      evidence: ["Tenant provisioned"],
    });

    const success = createSuccessPlan({
      tenantId: pilot.tenantId,
      editionId,
      executiveSponsors: ["CEO"],
    });
    updateSuccessPlan(success.id, {
      health: "amber",
      nextReviewAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      actions: ["Complete provider connection", "Schedule first brief review"],
    });

    generateCustomerRoiReport({
      tenantId: pilot.tenantId,
      editionId,
    });

    createContract({
      tenantId: pilot.tenantId,
      licenseId: license.id,
      kind: "pilot_msa",
      status: "signed",
      effectiveAt: license.startsAt,
    });
  }
}

export default async function AdminCommercialPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);
  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  seedCommercialIfEmpty();
  const dashboard = buildCommercialDashboard();

  return (
    <AppShell breadcrumb="Commercial" maxWidth="6xl">
      <CommercialReadinessDashboard dashboard={dashboard} />
    </AppShell>
  );
}
