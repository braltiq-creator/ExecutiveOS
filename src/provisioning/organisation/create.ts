/**
 * Organisation record for self-service provisioning.
 * Pack-local org identity — composes with tenant, not Core org DB.
 */

import { saveOrganisation } from "@/provisioning/store";
import type { ProvisionedOrganisation } from "@/provisioning/types";

export function slugifyCompany(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "organisation"
  );
}

export function createProvisionedOrganisation(input: {
  accountId: string;
  company: string;
  asOf?: string;
}): ProvisionedOrganisation {
  const base = slugifyCompany(input.company);
  const suffix = input.accountId.replace("acct-", "");
  const slug = `${base}-${suffix}`.slice(0, 40);
  const org: ProvisionedOrganisation = {
    id: `org-${slug}`,
    name: input.company.trim(),
    slug,
    accountId: input.accountId,
    createdAt: input.asOf ?? new Date().toISOString(),
  };
  return saveOrganisation(org);
}
