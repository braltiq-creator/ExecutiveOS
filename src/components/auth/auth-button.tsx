import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Pick<ButtonProps, "loading" | "variant"> & {
    children: ReactNode;
  };

export function AuthButton({
  loading = false,
  children,
  variant = "primary",
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant === "secondary" ? "secondary" : "primary"}
      loading={loading}
      fullWidth
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
