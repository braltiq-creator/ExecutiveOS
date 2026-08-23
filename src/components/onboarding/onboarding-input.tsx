import type { InputHTMLAttributes } from "react";

const inputClassName =
  "block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

export function OnboardingInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`${inputClassName} ${className ?? ""}`}
      {...props}
    />
  );
}

export function OnboardingSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputClassName} ${className ?? ""}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function OnboardingTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClassName} min-h-28 resize-y ${className ?? ""}`}
      {...props}
    />
  );
}
