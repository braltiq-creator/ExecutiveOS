"use client";

import { useMemo, useState, useTransition } from "react";
import { completeExecutiveOnboarding } from "@/lib/onboarding/actions";
import { CompletionSequence } from "@/components/onboarding/completion-sequence";
import { OnboardingAlert } from "@/components/onboarding/onboarding-alert";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ChallengesStep } from "@/components/onboarding/steps/challenges-step";
import { IdentityStep } from "@/components/onboarding/steps/identity-step";
import { ObjectivesStep } from "@/components/onboarding/steps/objectives-step";
import { OperatingSystemStep } from "@/components/onboarding/steps/operating-system-step";
import { OrganisationStep } from "@/components/onboarding/steps/organisation-step";
import {
  ONBOARDING_STEPS,
  type OnboardingInitialState,
  type OnboardingStepId,
  type OnboardingWizardData,
} from "@/types/onboarding";

type OnboardingWizardProps = {
  initialState: OnboardingInitialState;
  wizardData: OnboardingWizardData;
};

function getStepMeta(stepId: OnboardingStepId) {
  return ONBOARDING_STEPS.find((step) => step.id === stepId) ?? ONBOARDING_STEPS[0];
}

function getNextStep(stepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
  return ONBOARDING_STEPS[currentIndex + 1]?.id ?? null;
}

function getPreviousStep(stepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
  return ONBOARDING_STEPS[currentIndex - 1]?.id ?? null;
}

export function OnboardingWizard({
  initialState,
  wizardData,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>(
    initialState.initialStep,
  );
  const [phase, setPhase] = useState<"wizard" | "completion">("wizard");
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, startCompletion] = useTransition();

  const stepMeta = useMemo(() => getStepMeta(currentStep), [currentStep]);

  function goToNextStep() {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
      setError(null);
    }
  }

  function goToPreviousStep() {
    const previousStep = getPreviousStep(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
      setError(null);
    }
  }

  function handleFinalStepComplete() {
    setError(null);

    startCompletion(async () => {
      const result = await completeExecutiveOnboarding();
      if (result.error) {
        setError(result.error);
        return;
      }
      setPhase("completion");
    });
  }

  if (phase === "completion") {
    return <CompletionSequence />;
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      title={stepMeta.title}
      description={stepMeta.description}
    >
      {error ? (
        <div className="mb-5">
          <OnboardingAlert message={error} />
        </div>
      ) : null}

      {currentStep === "identity" ? (
        <IdentityStep initialData={wizardData.identity} onComplete={goToNextStep} />
      ) : null}

      {currentStep === "organisation" ? (
        <OrganisationStep
          initialData={wizardData.organisation}
          onComplete={goToNextStep}
          onBack={goToPreviousStep}
        />
      ) : null}

      {currentStep === "objectives" ? (
        <ObjectivesStep
          initialData={wizardData.objectives}
          onComplete={goToNextStep}
          onBack={goToPreviousStep}
        />
      ) : null}

      {currentStep === "challenges" ? (
        <ChallengesStep
          initialData={wizardData.challenges}
          onComplete={goToNextStep}
          onBack={goToPreviousStep}
        />
      ) : null}

      {currentStep === "operating-system" ? (
        <OperatingSystemStep
          initialData={wizardData.operatingSystem}
          onComplete={handleFinalStepComplete}
          onBack={goToPreviousStep}
        />
      ) : null}

      {isCompleting ? (
        <p className="mt-4 text-sm text-zinc-500">Finalising your profile...</p>
      ) : null}
    </OnboardingLayout>
  );
}
