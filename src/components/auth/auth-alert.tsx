import { InlineError } from "@/components/ui/error-state";
import { cn } from "@/lib/utils/cn";

type AuthAlertProps = {
  variant?: "error" | "success";
  message: string;
  className?: string;
};

export function AuthAlert({ variant = "error", message, className }: AuthAlertProps) {
  if (variant === "error") {
    return <InlineError message={message} />;
  }

  return (
    <p
      role="status"
      className={cn(
        "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800",
        className,
      )}
    >
      {message}
    </p>
  );
}
