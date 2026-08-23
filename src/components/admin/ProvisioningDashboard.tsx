"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  retryProvisioningAction,
  startFreeTrialAction,
} from "@/provisioning/actions";
import type {
  ProvisioningAdminSnapshot,
  ProvisioningExecutiveProfileId,
} from "@/provisioning/types";

export function ProvisioningDashboard({
  snapshot,
}: {
  snapshot: ProvisioningAdminSnapshot;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("trialpass1");
  const [company, setCompany] = useState("");
  const [profileId, setProfileId] =
    useState<ProvisioningExecutiveProfileId>("operations_executive");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-[var(--eos-text)]">
          Customer Provisioning
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--eos-text-secondary)]">
          Self-service tenant creation for Design Partners and commercial
          customers. No Braltiq involvement required.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Completed", snapshot.jobsByStatus.completed],
            ["Failed", snapshot.jobsByStatus.failed],
            ["Trials", snapshot.trials.length],
            ["Pending verify", snapshot.pendingVerification.length],
          ] as const
        ).map(([label, value]) => (
          <Card key={label} padding="md">
            <p className="text-xs uppercase tracking-wide text-[var(--eos-text-secondary)]">
              {label}
            </p>
            <p className="mt-2 font-serif text-3xl text-[var(--eos-text)]">
              {value}
            </p>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <SectionHeader
          title="Simulate Start Free Trial"
          description="Creates account, tenant, trial licence, pack assignment, and redirects to onboarding."
        />
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const result = await startFreeTrialAction({
                name,
                email,
                password,
                company,
                executiveProfileId: profileId,
              });
              setMessage(result.message);
              if (result.ok) {
                setName("");
                setEmail("");
                setCompany("");
                router.refresh();
              }
            });
          }}
        >
          <label className="block text-sm">
            <span className="text-[var(--eos-text-secondary)]">Name</span>
            <input
              className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--eos-text-secondary)]">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--eos-text-secondary)]">Company</span>
            <input
              className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--eos-text-secondary)]">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[var(--eos-text-secondary)]">
              Executive profile
            </span>
            <select
              className="mt-1 w-full rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
              value={profileId}
              onChange={(e) =>
                setProfileId(e.target.value as ProvisioningExecutiveProfileId)
              }
            >
              <option value="operations_executive">Operations Executive</option>
              <option value="commercial_executive">Commercial Executive</option>
              <option value="manufacturing_executive">
                Manufacturing Executive
              </option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-[var(--eos-text)] px-4 py-2 text-sm text-[var(--eos-surface)] disabled:opacity-50"
            >
              {pending ? "Provisioning…" : "Start Free Trial"}
            </button>
            {message ? (
              <p className="mt-2 text-sm text-[var(--eos-text-secondary)]">
                {message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <Card padding="md">
        <SectionHeader
          title="New organisations"
          description="Recently provisioned customer organisations."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--eos-text-secondary)]">
              <tr>
                <th className="py-2 pr-4 font-medium">Organisation</th>
                <th className="py-2 pr-4 font-medium">Tenant</th>
                <th className="py-2 pr-4 font-medium">Profile</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.organisations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-[var(--eos-text-secondary)]"
                  >
                    No organisations yet.
                  </td>
                </tr>
              ) : (
                snapshot.organisations.map((org) => (
                  <tr
                    key={org.organisationId}
                    className="border-t border-[var(--eos-border)]"
                  >
                    <td className="py-2 pr-4 text-[var(--eos-text)]">
                      {org.name}
                    </td>
                    <td className="py-2 pr-4 text-[var(--eos-text-secondary)]">
                      {org.tenantId ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-[var(--eos-text-secondary)]">
                      {org.executiveProfileId}
                    </td>
                    <td className="py-2 pr-4 text-[var(--eos-text)]">
                      {org.status}
                    </td>
                    <td className="py-2 text-[var(--eos-text-secondary)]">
                      {org.createdAt.slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="md">
        <SectionHeader
          title="Failed provisioning"
          description="Failed jobs can be retried safely — completed steps are skipped."
        />
        <ul className="mt-4 space-y-3">
          {snapshot.failedJobs.length === 0 ? (
            <li className="text-sm text-[var(--eos-text-secondary)]">
              No failed jobs.
            </li>
          ) : (
            snapshot.failedJobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--eos-border)] pt-3"
              >
                <div>
                  <p className="text-sm text-[var(--eos-text)]">{job.id}</p>
                  <p className="text-xs text-[var(--eos-text-secondary)]">
                    {job.error}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded border border-[var(--eos-border)] px-3 py-1.5 text-sm text-[var(--eos-text)]"
                  onClick={() => {
                    startTransition(async () => {
                      const result = await retryProvisioningAction(job.id);
                      setMessage(result.message);
                      router.refresh();
                    });
                  }}
                >
                  Retry
                </button>
              </li>
            ))
          )}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader title="Trials" description="30-day trial tracking." />
          <ul className="mt-4 space-y-2 text-sm">
            {snapshot.trials.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">No trials.</li>
            ) : (
              snapshot.trials.map((trial) => (
                <li
                  key={trial.id}
                  className="flex justify-between border-t border-[var(--eos-border)] pt-2"
                >
                  <span className="text-[var(--eos-text)]">{trial.tenantId}</span>
                  <span className="text-[var(--eos-text-secondary)]">
                    {trial.status} · ends {trial.endsAt.slice(0, 10)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card padding="md">
          <SectionHeader
            title="Pending verification"
            description="Accounts awaiting email verification."
          />
          <ul className="mt-4 space-y-2 text-sm">
            {snapshot.pendingVerification.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                None pending.
              </li>
            ) : (
              snapshot.pendingVerification.map((account) => (
                <li
                  key={account.id}
                  className="border-t border-[var(--eos-border)] pt-2 text-[var(--eos-text)]"
                >
                  {account.name} · {account.email}
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
