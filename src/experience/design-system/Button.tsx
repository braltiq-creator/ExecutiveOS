import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExperienceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

const variants = {
  primary:
    "bg-[var(--ex-accent)] text-white hover:opacity-95 disabled:opacity-50",
  secondary:
    "bg-[var(--ex-surface)] text-[var(--ex-text)] border border-[var(--eos-border)] hover:bg-[var(--eos-surface-inset)]",
  ghost:
    "bg-transparent text-[var(--ex-text-secondary)] hover:text-[var(--ex-text)] hover:bg-[var(--eos-surface-inset)]",
} as const;

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-[length:var(--ex-body-size)]",
} as const;

export function ExperienceButton({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ExperienceButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--ex-radius)] font-medium transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)] focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
