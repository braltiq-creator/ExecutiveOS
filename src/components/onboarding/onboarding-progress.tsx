import {
  ESTIMATED_COMPLETION_MINUTES,
  ONBOARDING_STEPS,
  type OnboardingStepId,
} from "@/types/onboarding";

type OnboardingProgressProps = {
  currentStep: OnboardingStepId;
};

function getStepIndex(stepId: OnboardingStepId): number {
  return ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-600">
          Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
        </p>
        <p className="text-sm text-zinc-500">
          ~{ESTIMATED_COMPLETION_MINUTES} min
        </p>
      </div>

      <div className="hidden gap-2 md:grid md:grid-cols-5">
        {ONBOARDING_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="space-y-2">
              <div
                className={`h-1 rounded-full transition-colors ${
                  isComplete || isCurrent ? "bg-zinc-900" : "bg-zinc-200"
                }`}
              />
              <p
                className={`text-xs leading-5 ${
                  isCurrent ? "font-medium text-zinc-900" : "text-zinc-500"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-2 md:hidden">
        <div className="h-1 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm font-medium text-zinc-900">
          {ONBOARDING_STEPS[currentIndex]?.title}
        </p>
      </div>
    </div>
  );
}
