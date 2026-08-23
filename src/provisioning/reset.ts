import { resetProvisioningStore } from "@/provisioning/store";
import { resetProvisioningWorkspaces } from "@/provisioning/workspace-builder/build";
import { resetBootstrapArtefacts } from "@/provisioning/bootstrap/resources";
import { resetProvisioningAudit } from "@/provisioning/audit/log";

/** Test helper — clears provisioning-owned state only. */
export function resetCustomerProvisioning(): void {
  resetProvisioningStore();
  resetProvisioningWorkspaces();
  resetBootstrapArtefacts();
  resetProvisioningAudit();
}
