"use client";

import { useState, useTransition } from "react";
import { saveOrganisationStep } from "@/lib/onboarding/actions";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import {
  OnboardingInput,
  OnboardingSelect,
  OnboardingTextarea,
} from "@/components/onboarding/onboarding-input";
import { OnboardingStepNav } from "@/components/onboarding/onboarding-step-nav";
import { COMPANY_SIZES, REVENUE_BANDS } from "@/lib/onboarding/constants";
import type { OrganisationData } from "@/types/onboarding";

type OrganisationStepProps = {
  initialData: OrganisationData;
  onComplete: () => void;
  onBack: () => void;
};

export function OrganisationStep({
  initialData,
  onComplete,
  onBack,
}: OrganisationStepProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof OrganisationData>(
    key: K,
    value: OrganisationData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveOrganisationStep(data);
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
        <OnboardingField label="Company Size" htmlFor="companySize">
          <OnboardingSelect
            id="companySize"
            name="companySize"
            value={data.companySize}
            onChange={(event) => updateField("companySize", event.target.value)}
            required
            disabled={isPending}
          >
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </OnboardingSelect>
        </OnboardingField>

        <OnboardingField label="Annual Revenue Band" htmlFor="annualRevenueBand">
          <OnboardingSelect
            id="annualRevenueBand"
            name="annualRevenueBand"
            value={data.annualRevenueBand}
            onChange={(event) =>
              updateField("annualRevenueBand", event.target.value)
            }
            required
            disabled={isPending}
          >
            <option value="">Select revenue band</option>
            {REVENUE_BANDS.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </OnboardingSelect>
        </OnboardingField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <OnboardingField label="Team Size" htmlFor="teamSize">
          <OnboardingInput
            id="teamSize"
            name="teamSize"
            type="number"
            min={0}
            value={data.teamSize}
            onChange={(event) =>
              updateField("teamSize", Number(event.target.value))
            }
            required
            disabled={isPending}
          />
        </OnboardingField>

        <OnboardingField label="Number of Direct Reports" htmlFor="directReports">
          <OnboardingInput
            id="directReports"
            name="directReports"
            type="number"
            min={0}
            value={data.directReports}
            onChange={(event) =>
              updateField("directReports", Number(event.target.value))
            }
            required
            disabled={isPending}
          />
        </OnboardingField>
      </div>

      <OnboardingField
        label="Departments Responsible For"
        htmlFor="departmentsResponsibleFor"
      >
        <OnboardingTextarea
          id="departmentsResponsibleFor"
          name="departmentsResponsibleFor"
          value={data.departmentsResponsibleFor}
          onChange={(event) =>
            updateField("departmentsResponsibleFor", event.target.value)
          }
          placeholder="Engineering, Product, Customer Success"
          required
          disabled={isPending}
        />
      </OnboardingField>

      <OnboardingField
        label="Geographic Responsibility"
        htmlFor="geographicResponsibility"
      >
        <OnboardingTextarea
          id="geographicResponsibility"
          name="geographicResponsibility"
          value={data.geographicResponsibility}
          onChange={(event) =>
            updateField("geographicResponsibility", event.target.value)
          }
          placeholder="North America, EMEA, APAC"
          required
          disabled={isPending}
        />
      </OnboardingField>

      <OnboardingStepNav onBack={onBack} loading={isPending} />
    </form>
  );
}
