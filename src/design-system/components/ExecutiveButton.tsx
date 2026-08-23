import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ExecutiveButtonSize = "sm" | "md" | "lg";

type ExecutiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ExecutiveButtonVariant;
  size?: ExecutiveButtonSize;
  children: ReactNode;
};

const VARIANT = {
  primary:
    "bg-[var(--eos-color-primary)] text-[var(--eos-color-primary-fg)] hover:brightness-110",
  secondary:
    "border border-[var(--eos-color-divider)] text-[var(--eos-color-text)] hover:bg-[var(--eos-elevation-focus-bg)]",
  ghost:
    "text-[var(--eos-color-text-secondary)] hover:bg-[var(--eos-elevation-focus-bg)] hover:text-[var(--eos-color-text)]",
  danger:
    "bg-[var(--eos-color-attention-critical)] text-[var(--eos-color-primary-fg)] hover:brightness-110",
} as const;

const SIZE = {
  sm: "min-h-9 px-[var(--eos-space-md)] text-[length:var(--eos-type-caption-size)]",
  md: "min-h-11 px-[var(--eos-space-lg)] text-[length:var(--eos-type-body-size)]",
  lg: "min-h-12 px-[var(--eos-space-xl)] text-[length:var(--eos-type-subheading-size)]",
} as const;

/** Token-backed action control. */
export function ExecutiveButton({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ExecutiveButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-[var(--eos-space-sm)]",
        "rounded-[var(--eos-radius-md)] font-medium",
        ds.motion.hover,
        ds.focusRing,
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
