"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createOrganizationAction,
  joinByInvitationCodeAction,
  joinByInvitationIdAction,
} from "@/lib/organizations/actions";
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
  TIMEZONES,
} from "@/lib/onboarding/constants";
import type {
  PendingInvitationView,
} from "@/lib/organizations/types";

type OrganizationSetupProps = {
  pendingInvitations: PendingInvitationView[];
};

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

export function OrganizationSetup({
  pendingInvitations,
}: OrganizationSetupProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">(
    pendingInvitations.length > 0 ? "join" : "create",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [createForm, setCreateForm] = useState({
    name: "",
    industry: "",
    companySize: "",
    country: "",
    timezone: "UTC",
    website: "",
  });
  const [invitationCode, setInvitationCode] = useState("");

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createOrganizationAction(createForm);

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to create organization.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    });
  }

  function handleJoinByCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await joinByInvitationCodeAction({ invitationCode });

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to join organization.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    });
  }

  function handleJoinByInvitation(invitationId: string) {
    setError(null);

    startTransition(async () => {
      const result = await joinByInvitationIdAction(invitationId);

      if (result.error || !result.data) {
        setError(result.error ?? "Unable to accept invitation.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-zinc-500">Organization Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Set up your organization
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Create a new organization workspace or join an existing one to unlock
          ExecutiveOS for your executive team.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("create");
            setError(null);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Create Organization
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("join");
            setError(null);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "join"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Join Existing Organization
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {mode === "create" ? (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Create Organization
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Organization name
              </label>
              <input
                required
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="Acme Holdings"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Industry
              </label>
              <select
                value={createForm.industry}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    industry: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Company size
              </label>
              <select
                value={createForm.companySize}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    companySize: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Country
              </label>
              <select
                value={createForm.country}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    country: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Timezone
              </label>
              <select
                required
                value={createForm.timezone}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Website
              </label>
              <input
                value={createForm.website}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    website: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create Organization"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {pendingInvitations.length > 0 ? (
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Email Invitations
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Accept an invitation sent to your email address.
              </p>
              <div className="mt-6 space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">
                        {invitation.organizationName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Role: {invitation.role} · Code: {invitation.invitation_code}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleJoinByInvitation(invitation.id)}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
                    >
                      Accept Invitation
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <form
            onSubmit={handleJoinByCode}
            className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Join with Invitation Code
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Enter the code shared by your organization administrator.
            </p>
            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Invitation code
              </label>
              <input
                required
                value={invitationCode}
                onChange={(event) => setInvitationCode(event.target.value.toUpperCase())}
                className={`${inputClassName} font-mono uppercase tracking-widest`}
                placeholder="AB12CD34"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
            >
              {isPending ? "Joining..." : "Join Organization"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
