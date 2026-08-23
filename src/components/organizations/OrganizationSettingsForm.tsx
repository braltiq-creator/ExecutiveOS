"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrganizationAction } from "@/lib/organizations/actions";
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
  TIMEZONES,
} from "@/lib/onboarding/constants";
import type {
  OrganizationDepartmentRecord,
  OrganizationMembership,
} from "@/lib/organizations/types";
import { canUpdateOrganizationSettings } from "@/lib/organizations/permissions";

type OrganizationSettingsFormProps = {
  membership: OrganizationMembership;
  departments: OrganizationDepartmentRecord[];
};

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 disabled:bg-zinc-50 disabled:text-zinc-500";

export function OrganizationSettingsForm({
  membership,
  departments,
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const { organization } = membership;
  const canEdit = canUpdateOrganizationSettings(membership.member.role);

  const [form, setForm] = useState({
    name: organization.name,
    industry: organization.industry ?? "",
    country: organization.country ?? "",
    timezone: organization.timezone,
    website: organization.website ?? "",
    logoUrl: organization.logo_url ?? "",
    companySize: organization.company_size ?? "",
    legalName: organization.legal_name ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateOrganizationAction(form);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess("Organization settings saved.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-zinc-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Organization Settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Manage your organization profile, branding, and workspace configuration.
        </p>
      </div>

      {!canEdit ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access to organization settings.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Organization name
            </label>
            <input
              required
              disabled={!canEdit || isPending}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={inputClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Legal name
            </label>
            <input
              disabled={!canEdit || isPending}
              value={form.legalName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  legalName: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Industry
            </label>
            <select
              disabled={!canEdit || isPending}
              value={form.industry}
              onChange={(event) =>
                setForm((current) => ({
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
              disabled={!canEdit || isPending}
              value={form.companySize}
              onChange={(event) =>
                setForm((current) => ({
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
              disabled={!canEdit || isPending}
              value={form.country}
              onChange={(event) =>
                setForm((current) => ({
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
              disabled={!canEdit || isPending}
              value={form.timezone}
              onChange={(event) =>
                setForm((current) => ({
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
              disabled={!canEdit || isPending}
              value={form.website}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  website: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="https://example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Company logo URL
            </label>
            <input
              disabled={!canEdit || isPending}
              value={form.logoUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  logoUrl: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        {canEdit ? (
          <button
            type="submit"
            disabled={isPending}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        ) : null}
      </form>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Departments
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Organization structure used in executive intelligence context.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {departments.map((department) => (
            <div
              key={department.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
            >
              <p className="font-medium text-zinc-900">{department.name}</p>
              {department.description ? (
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {department.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
