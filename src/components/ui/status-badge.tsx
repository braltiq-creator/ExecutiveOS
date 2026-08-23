import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const STATUS_VARIANTS = {
  neutral: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
} as const;

export type StatusVariant = keyof typeof STATUS_VARIANTS;

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  className?: string;
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[variant] as "default" | "success" | "warning" | "danger" | "info"}
      className={cn(className)}
    >
      {label}
    </Badge>
  );
}

export function mapHealthStatusToVariant(status: string): StatusVariant {
  if (["off_track", "critical", "declining", "overloaded", "past_due"].includes(status)) {
    return "danger";
  }
  if (["at_risk", "under_review", "constrained", "warning"].includes(status)) {
    return "warning";
  }
  if (["on_track", "active", "implemented", "balanced", "success"].includes(status)) {
    return "success";
  }
  if (["draft", "info", "connected"].includes(status)) {
    return "info";
  }
  return "neutral";
}
