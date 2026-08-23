import type { ContractRecord } from "@/commercial/framework/types";

const contracts = new Map<string, ContractRecord>();
let seq = 0;

export function resetContracts(): void {
  contracts.clear();
  seq = 0;
}

export function createContract(input: {
  tenantId: string;
  licenseId: string;
  kind: ContractRecord["kind"];
  status?: ContractRecord["status"];
  effectiveAt?: string | null;
  notes?: string | null;
}): ContractRecord {
  seq += 1;
  const record: ContractRecord = {
    id: `ctr-${seq}`,
    tenantId: input.tenantId,
    licenseId: input.licenseId,
    kind: input.kind,
    status: input.status ?? "draft",
    effectiveAt: input.effectiveAt ?? null,
    notes: input.notes ?? null,
  };
  contracts.set(record.id, record);
  return record;
}

export function listContracts(tenantId?: string): ContractRecord[] {
  return [...contracts.values()].filter((c) =>
    tenantId ? c.tenantId === tenantId : true,
  );
}
