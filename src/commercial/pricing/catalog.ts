import type { PricingBand } from "@/commercial/framework/types";

const bands: PricingBand[] = [
  {
    tier: "trial",
    editionId: "all",
    currency: "AUD",
    listPriceMonthly: 0,
    listPriceAnnual: 0,
    seatPriceMonthly: 0,
    notes: "Time-boxed evaluation — no commercial commitment",
  },
  {
    tier: "design_partner",
    editionId: "all",
    currency: "AUD",
    listPriceMonthly: 0,
    listPriceAnnual: 0,
    seatPriceMonthly: 0,
    notes: "Structured learning partnership — preferential conversion terms",
  },
  {
    tier: "pilot",
    editionId: "operations_executive",
    currency: "AUD",
    listPriceMonthly: 4500,
    listPriceAnnual: 45000,
    seatPriceMonthly: 250,
    notes: "Operations Executive pilot package",
  },
  {
    tier: "pilot",
    editionId: "commercial_executive",
    currency: "AUD",
    listPriceMonthly: 4500,
    listPriceAnnual: 45000,
    seatPriceMonthly: 250,
    notes: "Commercial Executive pilot package",
  },
  {
    tier: "production",
    editionId: "operations_executive",
    currency: "AUD",
    listPriceMonthly: 7500,
    listPriceAnnual: 78000,
    seatPriceMonthly: 320,
    notes: "Production Operations Executive",
  },
  {
    tier: "production",
    editionId: "commercial_executive",
    currency: "AUD",
    listPriceMonthly: 7500,
    listPriceAnnual: 78000,
    seatPriceMonthly: 320,
    notes: "Production Commercial Executive",
  },
  {
    tier: "enterprise",
    editionId: "all",
    currency: "AUD",
    listPriceMonthly: 15000,
    listPriceAnnual: 156000,
    seatPriceMonthly: 280,
    notes: "Multi-edition enterprise with SSO, audit export, dedicated CS",
  },
];

export function listPricingBands(): PricingBand[] {
  return [...bands];
}

export function quoteEdition(input: {
  editionId: "operations_executive" | "commercial_executive";
  tier: PricingBand["tier"];
  seats: number;
}): { monthly: number; annual: number; currency: "AUD"; notes: string } {
  const band =
    bands.find(
      (b) =>
        b.tier === input.tier &&
        (b.editionId === input.editionId || b.editionId === "all"),
    ) ?? bands.find((b) => b.tier === input.tier);

  if (!band) {
    return {
      monthly: 0,
      annual: 0,
      currency: "AUD",
      notes: "No pricing band configured",
    };
  }

  const seatComponent = Math.max(0, input.seats - 5) * band.seatPriceMonthly;
  const monthly = band.listPriceMonthly + seatComponent;
  return {
    monthly,
    annual: band.listPriceAnnual || monthly * 10,
    currency: "AUD",
    notes: band.notes,
  };
}
