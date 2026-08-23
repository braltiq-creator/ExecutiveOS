import { createClient } from "@/lib/supabase/server";
import {
  incrementUsageCounter,
  upsertOrganizationUsageRecord,
} from "@/lib/billing/mutations";
import { fetchOrganizationUsage } from "@/lib/billing/queries";
import type { OrganizationUsageRecord } from "@/lib/billing/types";

export type UsageCounterField = keyof Pick<
  OrganizationUsageRecord,
  | "ai_requests"
  | "storage_bytes"
  | "meetings_count"
  | "memory_count"
  | "decisions_count"
  | "initiatives_count"
>;

export async function ensureOrganizationUsage(
  organizationId: string,
): Promise<OrganizationUsageRecord> {
  const existing = await fetchOrganizationUsage(organizationId);

  if (existing) {
    return existing;
  }

  return upsertOrganizationUsageRecord(organizationId, {});
}

export async function syncOrganizationUsageCounts(
  organizationId: string,
  ownerUserId: string,
): Promise<OrganizationUsageRecord> {
  const supabase = await createClient();

  const [memory, meetings, decisions, initiatives] = await Promise.all([
    supabase
      .from("executive_memory")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerUserId)
      .is("archived_at", null),
    supabase
      .from("executive_meetings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerUserId)
      .is("archived_at", null),
    supabase
      .from("executive_decisions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerUserId)
      .is("archived_at", null),
    supabase
      .from("strategic_initiatives")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerUserId)
      .is("archived_at", null),
  ]);

  const memoryCount = memory.count ?? 0;
  const meetingsCount = meetings.count ?? 0;
  const decisionsCount = decisions.count ?? 0;
  const initiativesCount = initiatives.count ?? 0;

  const estimatedStorageBytes =
    memoryCount * 4096 +
    meetingsCount * 8192 +
    decisionsCount * 2048 +
    initiativesCount * 2048;

  return upsertOrganizationUsageRecord(organizationId, {
    memory_count: memoryCount,
    meetings_count: meetingsCount,
    decisions_count: decisionsCount,
    initiatives_count: initiativesCount,
    storage_bytes: estimatedStorageBytes,
  });
}

export async function incrementUsage(
  organizationId: string,
  field: UsageCounterField,
  amount = 1,
): Promise<void> {
  await ensureOrganizationUsage(organizationId);
  await incrementUsageCounter(organizationId, field, amount);
}

export async function getOrganizationUsageSnapshot(
  organizationId: string,
  ownerUserId: string,
): Promise<OrganizationUsageRecord> {
  await ensureOrganizationUsage(organizationId);
  return syncOrganizationUsageCounts(organizationId, ownerUserId);
}
