import type { ExpansionOpportunity } from "@/commercial/framework/types";
import { listLicenses } from "@/commercial/licensing";
import { getEdition } from "@/commercial/editions";
import { extractTenantTelemetry } from "@/operations";
import { listBehaviourEvents } from "@/experiments/behaviour";

const opportunities = new Map<string, ExpansionOpportunity>();
let seq = 0;

export function resetExpansionOpportunities(): void {
  opportunities.clear();
  seq = 0;
}

export function recommendExpansionOpportunities(input?: {
  tenantId?: string;
  asOf?: string;
}): ExpansionOpportunity[] {
  const asOf = input?.asOf ?? new Date().toISOString();
  const licenses = listLicenses(input?.tenantId);
  const results: ExpansionOpportunity[] = [];

  for (const license of licenses) {
    if (!license.expansionEligible) continue;
    const edition = getEdition(license.editionId);
    if (!edition) continue;

    const t = extractTenantTelemetry({
      tenantId: license.tenantId,
      profileId: edition.intelligenceProfileId,
      asOf,
    });
    const events = listBehaviourEvents(license.tenantId);
    const strategyViews = events.filter((e) => e.kind === "strategy_view").length;
    const briefOpens = events.filter((e) => e.kind === "brief_open").length;

    if (license.editionId === "operations_executive" && t.engagementPct >= 45) {
      seq += 1;
      const opp: ExpansionOpportunity = {
        id: `expn-${seq}`,
        tenantId: license.tenantId,
        fromEditionId: "operations_executive",
        toLabel: "Commercial Executive",
        rationale:
          "Operational adoption is established — commercial edition can extend the same executive rhythm into revenue decisions.",
        confidence: Math.min(88, 55 + Math.round(t.engagementPct / 4)),
        signals: [
          `engagement=${t.engagementPct}%`,
          `recommendationsAccepted=${t.recommendationsAccepted}`,
          `tier=${license.tier}`,
        ],
        recommendedAction:
          "Propose Commercial Executive add-on after next success review",
        createdAt: asOf,
      };
      opportunities.set(opp.id, opp);
      results.push(opp);
    }

    if (license.editionId === "commercial_executive" && t.engagementPct >= 45) {
      seq += 1;
      const opp: ExpansionOpportunity = {
        id: `expn-${seq}`,
        tenantId: license.tenantId,
        fromEditionId: "commercial_executive",
        toLabel: "Operations Executive",
        rationale:
          "Commercial rhythm is active — operations edition closes the loop between pipeline and delivery.",
        confidence: Math.min(86, 54 + Math.round(t.engagementPct / 4)),
        signals: [
          `engagement=${t.engagementPct}%`,
          `strategyViews=${strategyViews}`,
        ],
        recommendedAction: "Offer Operations Executive as second edition",
        createdAt: asOf,
      };
      opportunities.set(opp.id, opp);
      results.push(opp);
    }

    if (
      license.usage.executivesActive >= license.entitlements.executives * 0.7 ||
      briefOpens >= 3
    ) {
      seq += 1;
      const opp: ExpansionOpportunity = {
        id: `expn-${seq}`,
        tenantId: license.tenantId,
        fromEditionId: license.editionId,
        toLabel: "Additional executives",
        rationale:
          "Seat/executive utilisation or brief habit indicates more leaders should be licensed.",
        confidence: 74,
        signals: [
          `executivesActive=${license.usage.executivesActive}/${license.entitlements.executives}`,
          `briefOpens=${briefOpens}`,
        ],
        recommendedAction: "Quote additional executive seats at renewal",
        createdAt: asOf,
      };
      opportunities.set(opp.id, opp);
      results.push(opp);
    }

    if (license.tier === "production" || license.tier === "enterprise") {
      seq += 1;
      const opp: ExpansionOpportunity = {
        id: `expn-${seq}`,
        tenantId: license.tenantId,
        fromEditionId: license.editionId,
        toLabel: "Future Intelligence Profiles",
        rationale:
          "Production customers are candidates for upcoming profiles without Core changes — register new editions as they ship.",
        confidence: 58,
        signals: [`tier=${license.tier}`, `edition=${license.editionId}`],
        recommendedAction:
          "Capture profile interest in success plan for roadmap signalling",
        createdAt: asOf,
      };
      opportunities.set(opp.id, opp);
      results.push(opp);
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function listExpansionOpportunities(
  tenantId?: string,
): ExpansionOpportunity[] {
  return [...opportunities.values()]
    .filter((o) => (tenantId ? o.tenantId === tenantId : true))
    .sort((a, b) => b.confidence - a.confidence);
}
