import type { ReactNode } from "react";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { OnboardingStepId } from "@/types/onboarding";

type OnboardingLayoutProps = {
  currentStep: OnboardingStepId;
  title: string;
  description: string;
  children: ReactNode;
};

export function OnboardingLayout({
  currentStep,
  title,
  description,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-full bg-white font-sans text-zinc-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-100/80 via-white to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-8 lg:px-8 lg:py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-tight">ExecutiveOS</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Build your Executive Digital Twin
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              {description}
            </p>
          </div>
          <SignOutButton />
        </header>

        <div className="mb-8">
          <OnboardingProgress currentStep={currentStep} />
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="mb-8 border-b border-zinc-100 pb-6">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
