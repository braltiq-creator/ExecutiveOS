import { cn } from "@/lib/utils/cn";
import type { IntelligenceProvenance } from "@/experience/immersion/types";

const LABEL: Record<IntelligenceProvenance, string> = {
  verified: "Verified",
  derived: "Derived",
  ai_generated: "AI-generated",
  insufficient: "Insufficient evidence",
};

const TONE: Record<IntelligenceProvenance, string> = {
  verified: "border-[color-mix(in_srgb,var(--eos-color-intelligence-teal)_55%,transparent)] text-[var(--eos-color-intelligence-teal,#3d9e8f)]",
  derived:
    "border-[color-mix(in_srgb,var(--eos-color-executive-blue)_55%,transparent)] text-[var(--eos-color-executive-blue,#6a9fd8)]",
  ai_generated:
    "border-[color-mix(in_srgb,var(--eos-color-strategic-purple)_55%,transparent)] text-[var(--eos-color-strategic-purple,#8b7bb8)]",
  insufficient:
    "border-[color-mix(in_srgb,var(--eos-color-attention,#c4785a)_55%,transparent)] text-[var(--eos-color-attention,#c4785a)]",
};

type Props = {
  provenance: IntelligenceProvenance;
  className?: string;
};

/** Explicit intelligence provenance — never decorative. */
export function IntelligenceProvenanceBadge({ provenance, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border px-1.5 py-0.5",
        "text-[0.65rem] font-medium uppercase tracking-[0.06em]",
        TONE[provenance],
        className,
      )}
      data-intelligence-provenance={provenance}
    >
      {LABEL[provenance]}
    </span>
  );
}
