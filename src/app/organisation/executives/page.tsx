import Link from "next/link";
import { PortalShell } from "@/components/organisation-portal/PortalShell";
import { PortalSection } from "@/components/organisation-portal/PortalSection";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationExecutivesPage() {
  const { snapshot } = await loadOrganisationPortal();

  return (
    <PortalShell
      title="Executives"
      description="Invite leaders, assign roles and Executive Profiles, and review activity — without waiting on Braltiq."
    >
      <PortalSection
        title="Team"
        description="Owners, executives, and invited members for this organisation."
        action={
          <Link
            href="/team"
            className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
          >
            Invite executive
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="ex-caption">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium">Profile</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Last login</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.executives.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-[var(--eos-border)]"
                >
                  <td className="py-3 pr-3">
                    <p className="ex-heading text-sm">{member.name}</p>
                    <p className="ex-caption">{member.email}</p>
                  </td>
                  <td className="py-3 pr-3 capitalize ex-body">{member.role}</td>
                  <td className="py-3 pr-3 ex-body">
                    {member.executiveProfileId ?? "—"}
                  </td>
                  <td className="py-3 pr-3">
                    <ExperienceBadge
                      tone={
                        member.status === "active"
                          ? "accent"
                          : member.status === "invited"
                            ? "neutral"
                            : "attention"
                      }
                    >
                      {member.status}
                    </ExperienceBadge>
                  </td>
                  <td className="py-3 ex-body">
                    {member.lastLoginAt
                      ? member.lastLoginAt.slice(0, 10)
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PortalSection>

      <PortalSection title="Permissions & activity">
        <ul className="space-y-3">
          {snapshot.executives.map((member) => (
            <li key={`${member.id}-perms`} className="ex-body">
              <span className="ex-heading text-sm">{member.name}</span>
              <span className="ex-caption"> · {member.activitySummary}</span>
              <p className="ex-caption mt-1">
                {member.permissions.slice(0, 4).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </PortalSection>
    </PortalShell>
  );
}
