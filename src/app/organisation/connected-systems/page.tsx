import { ConnectionTruthPanel } from "@/components/organisation/ConnectionTruthPanel";
import { PortalShell } from "@/components/organisation-portal/PortalShell";
import { requireAppSession } from "@/services/session";
import {
  getDiscoveryEvidenceContext,
  listMemoryConnections,
} from "@/verified-evidence";
import { buildConnectionTruthViews } from "@/verified-evidence/ui-labels";

/**
 * Connected Systems — Phase 37 truthful connection / verification / evidence state.
 * Does not fabricate Microsoft 365 or Simpro business data.
 */
export default async function ConnectedSystemsPage() {
  const session = await requireAppSession();
  const organizationId = session.company.id;
  const connections = listMemoryConnections(organizationId);
  const discovery = getDiscoveryEvidenceContext(organizationId);
  const evidenceCountByProvider: Partial<Record<string, number>> = {};
  for (const item of discovery.evidence) {
    evidenceCountByProvider[item.provider] =
      (evidenceCountByProvider[item.provider] ?? 0) + 1;
  }
  const views = buildConnectionTruthViews({
    connections,
    evidenceCountByProvider,
  });

  return (
    <PortalShell
      title="Connected Systems"
      description="Connection, verification, and evidence status for Microsoft 365 and Simpro."
    >
      <ConnectionTruthPanel views={views} />
    </PortalShell>
  );
}
