"use client";

import { useState, useTransition } from "react";
import { saveChallengesStep } from "@/lib/onboarding/actions";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-input";
import { OnboardingStepNav } from "@/components/onboarding/onboarding-step-nav";
import type { ExecutiveChallengesData } from "@/types/onboarding";

type ChallengesStepProps = {
  initialData: ExecutiveChallengesData;
  onComplete: () => void;
  onBack: () => void;
};

export function ChallengesStep({
  initialData,
  onComplete,
  onBack,
}: ChallengesStepProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof ExecutiveChallengesData>(
    key: K,
    value: ExecutiveChallengesData[K],
  ) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveChallengesStep(data);
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

      <OnboardingField
        label="Biggest business challenge"
        htmlFor="biggestBusinessChallenge"
      >
        <OnboardingTextarea
          id="biggestBusinessChallenge"
          value={data.biggestBusinessChallenge}
          onChange={(event) =>
            updateField("biggestBusinessChallenge", event.target.value)
          }
          placeholder="What is the most critical business challenge you are facing right now?"
          required
          disabled={isPending}
        />
      </OnboardingField>

      <OnboardingField
        label="Biggest leadership challenge"
        htmlFor="biggestLeadershipChallenge"
      >
        <OnboardingTextarea
          id="biggestLeadershipChallenge"
          value={data.biggestLeadershipChallenge}
          onChange={(event) =>
            updateField("biggestLeadershipChallenge", event.target.value)
          }
          placeholder="What leadership challenge is most limiting your impact?"
          required
          disabled={isPending}
        />
      </OnboardingField>

      <OnboardingField
        label="Biggest personal productivity challenge"
        htmlFor="biggestProductivityChallenge"
      >
        <OnboardingTextarea
          id="biggestProductivityChallenge"
          value={data.biggestProductivityChallenge}
          onChange={(event) =>
            updateField("biggestProductivityChallenge", event.target.value)
          }
          placeholder="What consistently gets in the way of your focus and execution?"
          required
          disabled={isPending}
        />
      </OnboardingField>

      <OnboardingStepNav onBack={onBack} loading={isPending} />
    </form>
  );
}
