import { cn } from "@/lib/utils/cn";

type Tone = "success" | "attention" | "critical" | "neutral" | "accent";

type ExperienceIndicatorProps = {
  tone?: Tone;
  label: string;
  className?: string;
};

const tones: Record<Tone, string> = {
  success: "bg-[var(--ex-success)]",
  attention: "bg-[var(--ex-attention)]",
  critical: "bg-[var(--ex-critical)]",
  neutral: "bg-[var(--ex-text-muted)]",
  accent: "bg-[var(--ex-accent)]",
};

export function ExperienceIndicator({
  tone = "neutral",
  label,
  className,
}: ExperienceIndicatorProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="img"
      aria-label={label}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", tones[tone])}
        aria-hidden
      />
      <span className="ex-caption normal-case tracking-normal">{label}</span>
    </span>
  );
}
