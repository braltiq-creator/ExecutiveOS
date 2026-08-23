import type { BusinessDriver, BusinessDriverId } from "@/futures/models/types";

export const BUSINESS_DRIVERS: Record<BusinessDriverId, BusinessDriver> = {
  revenue: {
    id: "revenue",
    label: "Revenue",
    description: "Top-line trajectory, win rate, and expansion capacity.",
    typicalSignals: ["ARR movement", "pipeline coverage", "churn pressure"],
  },
  cash_flow: {
    id: "cash_flow",
    label: "Cash Flow",
    description: "Liquidity, collections, and burn relative to runway.",
    typicalSignals: ["DSO", "invoice delays", "working capital stress"],
  },
  capacity: {
    id: "capacity",
    label: "Capacity",
    description: "Leadership and operating bandwidth to absorb decisions.",
    typicalSignals: ["attention budget", "meeting load", "approval backlog"],
  },
  customer_demand: {
    id: "customer_demand",
    label: "Customer Demand",
    description: "Demand strength, escalation volume, and retention risk.",
    typicalSignals: ["escalations", "NPS movement", "renewal risk"],
  },
  asset_reliability: {
    id: "asset_reliability",
    label: "Asset Reliability",
    description: "Uptime, failure rates, and maintenance discipline.",
    typicalSignals: ["asset failures", "MTTR", "preventative backlog"],
  },
  labour_availability: {
    id: "labour_availability",
    label: "Labour Availability",
    description: "Skilled labour coverage and utilisation headroom.",
    typicalSignals: ["technician shortage", "overtime", "attrition"],
  },
  safety: {
    id: "safety",
    label: "Safety",
    description: "Incident exposure and compliance with safety standards.",
    typicalSignals: ["near misses", "incident severity", "audit findings"],
  },
  supply_chain: {
    id: "supply_chain",
    label: "Supply Chain",
    description: "Parts, vendors, and fulfilment continuity.",
    typicalSignals: ["lead-time slips", "stockouts", "vendor risk"],
  },
  regulatory: {
    id: "regulatory",
    label: "Regulatory",
    description: "Compliance obligations and policy change exposure.",
    typicalSignals: ["audit findings", "policy deadlines", "licence risk"],
  },
  technology: {
    id: "technology",
    label: "Technology",
    description: "Platform reliability, delivery pace, and tech debt.",
    typicalSignals: ["incident volume", "release slip", "security posture"],
  },
  market_conditions: {
    id: "market_conditions",
    label: "Market Conditions",
    description: "Competitive pressure and macro demand shifts.",
    typicalSignals: ["win/loss mix", "pricing pressure", "competitor moves"],
  },
  strategic_initiatives: {
    id: "strategic_initiatives",
    label: "Strategic Initiatives",
    description: "Progress and risk on material strategic bets.",
    typicalSignals: ["initiative drift", "milestone slip", "outcome linkage"],
  },
};

export function listBusinessDrivers(): BusinessDriver[] {
  return Object.values(BUSINESS_DRIVERS);
}

export function getBusinessDriver(id: BusinessDriverId): BusinessDriver {
  return BUSINESS_DRIVERS[id];
}
