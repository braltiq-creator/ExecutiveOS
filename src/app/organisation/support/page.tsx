import Link from "next/link";
import { PortalShell } from "@/components/organisation-portal/PortalShell";
import { PortalSection } from "@/components/organisation-portal/PortalSection";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationSupportPage() {
  const { snapshot } = await loadOrganisationPortal();
  const support = snapshot.support;

  return (
    <PortalShell
      title="Support"
      description="Knowledge base, training, release notes, and Design Partner resources."
    >
      <PortalSection
        title="Get help"
        action={
          <Link
            href={support.raiseRequestUrl}
            className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-text)] px-3 text-sm font-medium text-[var(--ex-canvas)]"
          >
            Raise support request
          </Link>
        }
      >
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={support.knowledgeBaseUrl}
            className="font-medium text-[var(--ex-text)] underline-offset-4 hover:underline"
          >
            Knowledge Base
          </Link>
          <Link
            href={support.releaseNotesUrl}
            className="font-medium text-[var(--ex-text)] underline-offset-4 hover:underline"
          >
            Release Notes
          </Link>
        </div>
      </PortalSection>

      <div id="knowledge-base">
        <PortalSection title="Training">
          <ul className="space-y-2">
            {support.training.map((item) => (
              <li key={item} className="ex-body">
                · {item}
              </li>
            ))}
          </ul>
        </PortalSection>
      </div>

      <PortalSection title="Videos">
        <ul className="space-y-2">
          {support.videos.map((item) => (
            <li key={item} className="ex-body">
              · {item}
            </li>
          ))}
        </ul>
      </PortalSection>

      <div id="release-notes">
        <PortalSection title="Design Partner resources">
          <ul className="space-y-2">
            {support.designPartnerResources.map((item) => (
              <li key={item} className="ex-body">
                · {item}
              </li>
            ))}
          </ul>
        </PortalSection>
      </div>

      <div id="request" />
    </PortalShell>
  );
}
