"use client";

import { useState, useTransition } from "react";
import { saveIdentityStep } from "@/lib/onboarding/actions";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import {
  OnboardingInput,
  OnboardingSelect,
} from "@/components/onboarding/onboarding-input";
import { OnboardingStepNav } from "@/components/onboarding/onboarding-step-nav";
import { COUNTRIES, INDUSTRIES, TIMEZONES } from "@/lib/onboarding/constants";
import type { ExecutiveIdentityData } from "@/types/onboarding";

type IdentityStepProps = {
  initialData: ExecutiveIdentityData;
  onComplete: () => void;
};

export function IdentityStep({ initialData, onComplete }: IdentityStepProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof ExecutiveIdentityData>(
    key: K,
    value: ExecutiveIdentityData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveIdentityStep(data);
      if (result.error) {
        setError(result.error);
        return;
      }
      onComplete();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <OnboardingAlert message={error} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <OnboardingField label="Full Name" htmlFor="fullName">
          <OnboardingInput
            id="fullName"
            name="fullName"
            value={data.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Alexandra Chen"
            required
            disabled={isPending}
          />
        </OnboardingField>

        <OnboardingField
          label="Preferred Name"
          htmlFor="preferredName"
          hint="Optional. Used in your ExecutiveOS experience."
        >
          <OnboardingInput
            id="preferredName"
            name="preferredName"
            value={data.preferredName}
            onChange={(event) => updateField("preferredName", event.target.value)}
            placeholder="Alex"
            disabled={isPending}
          />
        </OnboardingField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <OnboardingField label="Job Title" htmlFor="jobTitle">
          <OnboardingInput
            id="jobTitle"
            name="jobTitle"
            value={data.jobTitle}
            onChange={(event) => updateField("jobTitle", event.target.value)}
            placeholder="Chief Executive Officer"
            required
            disabled={isPending}
          />
        </OnboardingField>

        <OnboardingField label="Company" htmlFor="company">
          <OnboardingInput
            id="company"
            name="company"
            value={data.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Acme Corporation"
            required
            disabled={isPending}
          />
        </OnboardingField>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <OnboardingField label="Industry" htmlFor="industry">
          <OnboardingSelect
            id="industry"
            name="industry"
            value={data.industry}
            onChange={(event) => updateField("industry", event.target.value)}
            required
            disabled={isPending}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </OnboardingSelect>
        </OnboardingField>

        <OnboardingField label="Country" htmlFor="country">
          <OnboardingSelect
            id="country"
            name="country"
            value={data.country}
            onChange={(event) => updateField("country", event.target.value)}
            required
            disabled={isPending}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </OnboardingSelect>
        </OnboardingField>

        <OnboardingField label="Time Zone" htmlFor="timezone">
          <OnboardingSelect
            id="timezone"
            name="timezone"
            value={data.timezone}
            onChange={(event) => updateField("timezone", event.target.value)}
            required
            disabled={isPending}
          >
            <option value="">Select time zone</option>
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replace(/_/g, " ")}
              </option>
            ))}
          </OnboardingSelect>
        </OnboardingField>
      </div>

      <OnboardingStepNav loading={isPending} showBack={false} />
    </form>
  );
}
