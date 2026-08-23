"use client";

import Link from "next/link";
import type {
  OrganizationMembership,
  PendingInvitationView,
} from "@/lib/organizations/types";
import { formatOrganizationRole } from "@/lib/organizations/types";

type OrganizationOverviewProps = {
  membership: OrganizationMembership;
  pendingInvitations: PendingInvitationView[];
};

export function OrganizationOverview({
  membership,
  pendingInvitations,
}: OrganizationOverviewProps) {
  const { organization, member } = membership;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Organization</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {organization.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Your executive intelligence workspace. Manage team access, settings,
            and organization context from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/team"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Manage Team
          </Link>
          <Link
            href="/settings/organization"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Your Role
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {formatOrganizationRole(member.role)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Industry
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {organization.industry || "Not set"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Country
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">
            {organization.country || "Not set"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Plan
          </p>
          <p className="mt-1 text-lg font-semibold capitalize text-zinc-900">
            {organization.subscription_plan}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Organization Profile
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-zinc-500">Timezone</dt>
            <dd className="mt-1 font-medium text-zinc-900">{organization.timezone}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Website</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {organization.website || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Company size</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {organization.company_size || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Legal name</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {organization.legal_name || "Not set"}
            </dd>
          </div>
        </dl>
      </section>

      {pendingInvitations.length > 0 ? (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Pending Invitations
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            You have {pendingInvitations.length} pending invitation
            {pendingInvitations.length === 1 ? "" : "s"} for other organizations.
          </p>
        </section>
      ) : null}
    </div>
  );
}
