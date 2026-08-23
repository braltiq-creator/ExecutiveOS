import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing } from "@/components/ui/styles";
import { Spinner } from "@/components/ui/spinner";

const variants = {
  primary:
    "bg-primary text-primary-fg hover:brightness-110 border border-transparent shadow-[0_0_0_1px_rgba(91,143,206,0.25)]",
  secondary:
    "border border-border bg-transparent text-foreground hover:bg-[var(--eos-blue-soft)] hover:border-[var(--eos-glass-border)]",
  ghost:
    "text-secondary hover:bg-[var(--eos-blue-soft)] hover:text-foreground border border-transparent",
  danger:
    "bg-critical text-primary-fg hover:brightness-110 border border-transparent",
} as const;

const sizes = {
  sm: "h-9 min-h-9 px-3 text-xs",
  md: "h-11 min-h-11 px-4 text-sm",
  lg: "h-12 min-h-12 px-5 text-sm",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--eos-radius-md)] font-medium shadow-[var(--eos-shadow-1)] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        focusRing,
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" label="Loading" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
