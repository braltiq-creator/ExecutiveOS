import type { ReactNode } from "react";

type OnboardingFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
};

export function OnboardingField({
  label,
  htmlFor,
  hint,
  children,
}: OnboardingFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-zinc-900"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-zinc-500">{hint}</p> : null}
    </div>
  );
}
