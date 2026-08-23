"use client";

import { useState, useTransition } from "react";
import { saveOperatingSystemStep } from "@/lib/onboarding/actions";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingStepNav } from "@/components/onboarding/onboarding-step-nav";
import { BUSINESS_SYSTEMS } from "@/lib/onboarding/constants";
import type { OperatingSystemData } from "@/types/onboarding";

type OperatingSystemStepProps = {
  initialData: OperatingSystemData;
  onComplete: () => void;
  onBack: () => void;
};

export function OperatingSystemStep({
  initialData,
  onComplete,
  onBack,
}: OperatingSystemStepProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleSystem(system: string) {
    setData((current) => {
      const selected = current.businessSystems.includes(system)
        ? current.businessSystems.filter((item) => item !== system)
        : [...current.businessSystems, system];

      return { businessSystems: selected };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveOperatingSystemStep(data);
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

      <p className="text-sm leading-6 text-zinc-600">
        Select the business systems you use today. ExecutiveOS will use these
        selections to prepare future integrations.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {BUSINESS_SYSTEMS.map((system) => {
          const selected = data.businessSystems.includes(system);

          return (
            <label
              key={system}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                selected
                  ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleSystem(system)}
                disabled={isPending}
                className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
              />
              <span>{system}</span>
            </label>
          );
        })}
      </div>

      <OnboardingStepNav
        onBack={onBack}
        loading={isPending}
        continueLabel="Complete Onboarding"
      />
    </form>
  );
}
