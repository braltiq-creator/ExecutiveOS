import { createClient } from "@/lib/supabase/server";
import type {
  BillingCycle,
  OrganizationUsageRecord,
  PaymentHistoryRecord,
  PlanId,
  SubscriptionRecord,
  SubscriptionStatus,
} from "@/lib/billing/types";

export async function insertSubscriptionRecord(input: {
  organizationId: string;
  plan: PlanId;
  seatLimit: number;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  trialEndsAt?: string | null;
}): Promise<SubscriptionRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      organization_id: input.organizationId,
      plan: input.plan,
      seat_limit: input.seatLimit,
      seat_count: 1,
      status: input.status ?? "trialing",
      billing_cycle: input.billingCycle ?? "monthly",
      trial_ends_at: input.trialEndsAt ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertOrganizationUsageRecord(
  organizationId: string,
  usage: Partial<
    Omit<OrganizationUsageRecord, "organization_id" | "updated_at">
  >,
): Promise<OrganizationUsageRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("organization_usage")
    .upsert(
      {
        organization_id: organizationId,
        ...usage,
        updated_at: timestamp,
      },
      { onConflict: "organization_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function incrementUsageCounter(
  organizationId: string,
  field: keyof Pick<
    OrganizationUsageRecord,
    | "ai_requests"
    | "storage_bytes"
    | "meetings_count"
    | "memory_count"
    | "decisions_count"
    | "initiatives_count"
  >,
  amount = 1,
): Promise<void> {
  const supabase = await createClient();
  const existing = await supabase
    .from("organization_usage")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  const currentValue = existing.data?.[field] ?? 0;
  const nextValue =
    field === "storage_bytes"
      ? Number(currentValue) + amount
      : Number(currentValue) + amount;

  const { error } = await supabase.from("organization_usage").upsert(
    {
      organization_id: organizationId,
      ai_requests: existing.data?.ai_requests ?? 0,
      storage_bytes: existing.data?.storage_bytes ?? 0,
      meetings_count: existing.data?.meetings_count ?? 0,
      memory_count: existing.data?.memory_count ?? 0,
      decisions_count: existing.data?.decisions_count ?? 0,
      initiatives_count: existing.data?.initiatives_count ?? 0,
      [field]: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSubscriptionRecord(
  organizationId: string,
  updates: Partial<
    Pick<
      SubscriptionRecord,
      | "stripe_customer_id"
      | "stripe_subscription_id"
      | "plan"
      | "status"
      | "billing_cycle"
      | "seat_limit"
      | "seat_count"
      | "trial_ends_at"
      | "renews_at"
      | "cancelled_at"
    >
  >,
): Promise<SubscriptionRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertPaymentHistoryRecord(input: {
  organizationId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string | null;
  paidAt?: string | null;
}): Promise<PaymentHistoryRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_history")
    .upsert(
      {
        organization_id: input.organizationId,
        stripe_invoice_id: input.stripeInvoiceId,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        invoice_url: input.invoiceUrl ?? null,
        paid_at: input.paidAt ?? null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "stripe_invoice_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrganizationPlanField(
  organizationId: string,
  plan: PlanId,
): Promise<void> {
  const supabase = await createClient();

  const mappedPlan =
    plan === "starter"
      ? "free"
      : plan === "enterprise"
        ? "enterprise"
        : "team";

  const { error } = await supabase
    .from("organizations")
    .update({
      subscription_plan: mappedPlan,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId);

  if (error) {
    throw new Error(error.message);
  }
}
