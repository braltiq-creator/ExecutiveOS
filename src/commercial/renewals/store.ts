import type { RenewalRecord } from "@/commercial/framework/types";
import { listLicenses } from "@/commercial/licensing";

const renewals = new Map<string, RenewalRecord>();
let seq = 0;

export function resetRenewals(): void {
  renewals.clear();
  seq = 0;
}

export function syncRenewalsFromLicenses(): RenewalRecord[] {
  const created: RenewalRecord[] = [];
  for (const license of listLicenses()) {
    const existing = [...renewals.values()].find(
      (r) => r.licenseId === license.id,
    );
    if (existing) continue;
    seq += 1;
    const days =
      (new Date(license.renewalAt).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    const record: RenewalRecord = {
      id: `ren-${seq}`,
      tenantId: license.tenantId,
      licenseId: license.id,
      renewalAt: license.renewalAt,
      status: days < 45 ? "upcoming" : "upcoming",
      notes: null,
    };
    renewals.set(record.id, record);
    created.push(record);
  }
  return created;
}

export function updateRenewalStatus(input: {
  id: string;
  status: RenewalRecord["status"];
  notes?: string | null;
}): RenewalRecord | null {
  const current = renewals.get(input.id);
  if (!current) return null;
  const next = {
    ...current,
    status: input.status,
    notes: input.notes !== undefined ? input.notes : current.notes,
  };
  renewals.set(next.id, next);
  return next;
}

export function listRenewals(tenantId?: string): RenewalRecord[] {
  return [...renewals.values()]
    .filter((r) => (tenantId ? r.tenantId === tenantId : true))
    .sort((a, b) => a.renewalAt.localeCompare(b.renewalAt));
}
