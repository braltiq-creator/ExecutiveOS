import type { McSeverity, McTrend } from "@/experience/mission-control/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  trend: McTrend;
  severity?: McSeverity;
  className?: string;
};

/** Semantic movement mark — never paints the parent card. */
export function ExsTrend({ trend, severity, className }: Props) {
  const tone =
    severity ??
    (trend === "up" ? "positive" : trend === "down" ? "negative" : "neutral");

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium tabular-nums",
        tone === "positive" && "exs-trend-positive",
        tone === "negative" && "exs-trend-negative",
        tone === "warning" && "exs-trend-attention",
        tone === "critical" && "exs-trend-critical",
        tone === "neutral" && "exs-trend-neutral",
        className,
      )}
      aria-hidden="true"
    >
      {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"}
    </span>
  );
}
