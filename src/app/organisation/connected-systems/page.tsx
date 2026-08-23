import Link from "next/link";
import { PortalShell } from "@/components/organisation-portal/PortalShell";
import { PortalSection } from "@/components/organisation-portal/PortalSection";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function ConnectedSystemsPage() {
  const { snapshot } = await loadOrganisationPortal();

  return (
    <PortalShell
      title="Connected Systems"
      description="Microsoft 365, Simpro, Salesforce, and Dynamics — connection health, sync, and diagnostics."
    >
      <div className="grid gap-3">
        {snapshot.connectedSystems.map((system) => (
          <PortalSection
            key={system.id}
            title={system.name}
            description={system.diagnostics[0]}
            action={
              <ExperienceBadge
                tone={
                  system.status === "connected"
                    ? "accent"
                    : system.status === "degraded"
                      ? "attention"
                      : "neutral"
                }
              >
                {system.status}
              </ExperienceBadge>
            }
          >
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="ex-caption">Health</dt>
                <dd className="ex-body mt-1">
                  {system.status === "connected"
                    ? `${system.healthScore}/100`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="ex-caption">Last sync</dt>
                <dd className="ex-body mt-1">
                  {system.lastSyncAt
                    ? new Date(system.lastSyncAt).toLocaleString()
                    : "Not synced"}
                </dd>
              </div>
              <div>
                <dt className="ex-caption">Actions</dt>
                <dd className="mt-1">
                  <Link
                    href={system.reconnectPath}
                    className="text-sm font-medium text-[var(--ex-text)] underline-offset-4 hover:underline"
                  >
                    {system.status === "connected" ? "Manage" : "Connect"}
                  </Link>
                </dd>
              </div>
            </dl>
            <ul className="mt-3 space-y-1">
              {system.diagnostics.map((line) => (
                <li key={line} className="ex-caption">
                  · {line}
                </li>
              ))}
            </ul>
          </PortalSection>
        ))}
      </div>
    </PortalShell>
  );
}
