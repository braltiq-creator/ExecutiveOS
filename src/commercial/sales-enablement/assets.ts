import type { SalesEnablementAsset } from "@/commercial/framework/types";
import { listEditions } from "@/commercial/editions";
import { IMPLEMENTATION_STAGES } from "@/commercial/implementation";
import { buildSecurityPack } from "@/commercial/security-pack";
import { listPricingBands } from "@/commercial/pricing";

export function buildSalesEnablementAssets(
  asOf?: string,
): SalesEnablementAsset[] {
  const when = asOf ?? new Date().toISOString();
  const editions = listEditions();
  const security = buildSecurityPack(when);

  return [
    {
      id: "edition_comparison",
      title: "Edition comparison",
      audience: "Sales & solutions",
      updatedAt: when,
      body: editions.map(
        (e) =>
          `${e.name}: providers ${e.includedProviders.join(", ")}; expands via ${e.expansionOpportunities[0]}`,
      ),
    },
    {
      id: "executive_profile_comparison",
      title: "Executive profile comparison",
      audience: "Sales & CS",
      updatedAt: when,
      body: editions.map(
        (e) =>
          `${e.name} → ${e.targetExecutive}. Customer: ${e.targetCustomer}.`,
      ),
    },
    {
      id: "implementation_overview",
      title: "Implementation overview",
      audience: "Implementation",
      updatedAt: when,
      body: IMPLEMENTATION_STAGES.map(
        (s) => `${s.order}. ${s.label}: ${s.objective}`,
      ),
    },
    {
      id: "pilot_methodology",
      title: "Pilot methodology",
      audience: "CS & Sales",
      updatedAt: when,
      body: [
        "Design Partner / Pilot licenses transition through implementation stages with explicit exit criteria.",
        "Success review + ROI draft precede production conversion.",
        "Scenario validation proves edition-specific executive questions.",
      ],
    },
    {
      id: "roi_summary",
      title: "ROI summary",
      audience: "Sales & executives",
      updatedAt: when,
      body: [
        "ROI reports estimate hours saved, recommendations adopted, outcome confirmation, and strategic progress.",
        "Always present low/mid/high ranges with confidence and evidence.",
        "Never promise contractual financial outcomes from model ranges.",
      ],
    },
    {
      id: "security_summary",
      title: "Security summary",
      audience: "Procurement & IT",
      updatedAt: when,
      body: security.sections.map((s) => `${s.title}: ${s.summary}`),
    },
    {
      id: "faq",
      title: "Frequently asked questions",
      audience: "Sales",
      updatedAt: when,
      body: [
        "Q: Can we start with one edition? A: Yes — Operations or Commercial Executive, then expand.",
        "Q: Are Design Partner tools visible to customers? A: No — commercial/ops/experiments are Braltiq-internal.",
        `Q: What does pilot pricing look like? A: From ~$${listPricingBands().find((b) => b.tier === "pilot")?.listPriceMonthly ?? 4500}/mo AUD depending on edition and seats.`,
        "Q: Does packaging change Core? A: No — editions register above Core and Intelligence Profiles.",
      ],
    },
  ];
}
