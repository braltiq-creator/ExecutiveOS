export const BILLING_CYCLES = ["monthly", "annual"] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "incomplete",
  "incomplete_expired",
  "paused",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PLAN_IDS = [
  "starter",
  "professional",
  "executive",
  "enterprise",
] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export const FEATURE_KEYS = [
  "ai_chief_of_staff",
  "meeting_intelligence",
  "unlimited_memory",
  "enterprise_health_analytics",
  "future_integrations",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type PlanFeatures = Record<FeatureKey, boolean>;

export type PlanRecord = {
  id: PlanId;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  seat_limit: number;
  ai_request_limit: number;
  storage_limit: number;
  features_json: PlanFeatures;
  display_order: number;
  created_at: string;
};

export type SubscriptionRecord = {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanId;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  seat_limit: number;
  seat_count: number;
  trial_ends_at: string | null;
  renews_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentHistoryRecord = {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
};

export type OrganizationUsageRecord = {
  organization_id: string;
  ai_requests: number;
  storage_bytes: number;
  meetings_count: number;
  memory_count: number;
  decisions_count: number;
  initiatives_count: number;
  updated_at: string;
};

export type SeatLicenseSnapshot = {
  seatsUsed: number;
  seatLimit: number;
  seatsAvailable: number;
  pendingInvitations: number;
  isAtLimit: boolean;
  isOverLimit: boolean;
};

export type BillingOverview = {
  subscription: SubscriptionRecord;
  plan: PlanRecord;
  usage: OrganizationUsageRecord;
  payments: PaymentHistoryRecord[];
  seatsUsed: number;
  seatsAvailable: number;
  pendingInvitations: number;
  aiUsagePercent: number;
  storageUsagePercent: number;
  paymentMethodSummary: string | null;
};

export type CheckoutSessionInput = {
  planId: PlanId;
  billingCycle: BillingCycle;
};

export type ChangePlanInput = {
  planId: PlanId;
  billingCycle?: BillingCycle;
};

export class BillingError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

export function formatCurrency(
  amountCents: number,
  currency = "usd",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatStorageLimit(bytes: number): string {
  if (bytes >= 1099511627776) {
    return `${Math.round(bytes / 1099511627776)} TB`;
  }

  if (bytes >= 1073741824) {
    return `${Math.round(bytes / 1073741824)} GB`;
  }

  return `${Math.round(bytes / 1048576)} MB`;
}

export function parsePlanFeatures(value: unknown): PlanFeatures {
  const defaults: PlanFeatures = {
    ai_chief_of_staff: false,
    meeting_intelligence: false,
    unlimited_memory: false,
    enterprise_health_analytics: false,
    future_integrations: false,
  };

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const record = value as Record<string, unknown>;

  return FEATURE_KEYS.reduce<PlanFeatures>((features, key) => {
    features[key] = Boolean(record[key]);
    return features;
  }, { ...defaults });
}

export function isPaidSubscriptionStatus(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
