import { createClient } from "@/lib/supabase/server";
import type {
  OrganizationUsageRecord,
  PaymentHistoryRecord,
  PlanRecord,
  SubscriptionRecord,
} from "@/lib/billing/types";
import { parsePlanFeatures } from "@/lib/billing/types";

function mapPlan(record: PlanRecord): PlanRecord {
  return {
    ...record,
    features_json: parsePlanFeatures(record.features_json),
  };
}

export async function fetchPlans(): Promise<PlanRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPlan);
}

export async function fetchPlanById(planId: string): Promise<PlanRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPlan(data) : null;
}

export async function fetchSubscriptionByOrganizationId(
  organizationId: string,
): Promise<SubscriptionRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
): Promise<SubscriptionRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<SubscriptionRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPaymentHistory(
  organizationId: string,
  limit = 12,
): Promise<PaymentHistoryRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_history")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchOrganizationUsage(
  organizationId: string,
): Promise<OrganizationUsageRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_usage")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchPaymentByStripeInvoiceId(
  stripeInvoiceId: string,
): Promise<PaymentHistoryRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_history")
    .select("*")
    .eq("stripe_invoice_id", stripeInvoiceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
