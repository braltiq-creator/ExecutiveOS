"use client";

import { useState, useTransition } from "react";
import { saveObjectivesStep } from "@/lib/onboarding/actions";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import {
  OnboardingInput,
  OnboardingSelect,
  OnboardingTextarea,
} from "@/components/onboarding/onboarding-input";
import { OnboardingStepNav } from "@/components/onboarding/onboarding-step-nav";
import { OBJECTIVE_PRIORITIES } from "@/lib/onboarding/constants";
import type { ObjectiveInput, ObjectivePriority } from "@/types/onboarding";

type ObjectivesStepProps = {
  initialData: [ObjectiveInput, ObjectiveInput, ObjectiveInput];
  onComplete: () => void;
  onBack: () => void;
};

export function ObjectivesStep({
  initialData,
  onComplete,
  onBack,
}: ObjectivesStepProps) {
  const [objectives, setObjectives] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateObjective(
    index: number,
    field: keyof ObjectiveInput,
    value: string,
  ) {
    setObjectives((current) => {
      const next = [...current] as [
        ObjectiveInput,
        ObjectiveInput,
        ObjectiveInput,
      ];
      const objective = next[index];
      next[index] = {
        ...objective,
        [field]: field === "priority" ? (value as ObjectivePriority) : value,
      };
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveObjectivesStep(objectives);
      if (result.error) {
        setError(result.error);
        return;
      }
      onComplete();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <OnboardingAlert message={error} /> : null}

      <p className="text-sm leading-6 text-zinc-600">
        What are the three most important business outcomes you want to achieve
        over the next 12 months?
      </p>

      {objectives.map((objective, index) => (
        <div
          key={`objective-${index + 1}`}
          className="space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5"
        >
          <p className="text-sm font-medium text-zinc-900">
            Objective {index + 1}
          </p>

          <OnboardingField label="Title" htmlFor={`objective-title-${index}`}>
            <OnboardingInput
              id={`objective-title-${index}`}
              value={objective.title}
              onChange={(event) =>
                updateObjective(index, "title", event.target.value)
              }
              placeholder="Expand enterprise revenue by 25%"
              required
              disabled={isPending}
            />
          </OnboardingField>

          <OnboardingField
            label="Description"
            htmlFor={`objective-description-${index}`}
          >
            <OnboardingTextarea
              id={`objective-description-${index}`}
              value={objective.description}
              onChange={(event) =>
                updateObjective(index, "description", event.target.value)
              }
              placeholder="Describe the outcome, scope, and success criteria."
              required
              disabled={isPending}
            />
          </OnboardingField>

          <OnboardingField label="Priority" htmlFor={`objective-priority-${index}`}>
            <OnboardingSelect
              id={`objective-priority-${index}`}
              value={objective.priority}
              onChange={(event) =>
                updateObjective(index, "priority", event.target.value)
              }
              required
              disabled={isPending}
            >
              {OBJECTIVE_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </OnboardingSelect>
          </OnboardingField>
        </div>
      ))}

      <OnboardingStepNav onBack={onBack} loading={isPending} />
    </form>
  );
}
