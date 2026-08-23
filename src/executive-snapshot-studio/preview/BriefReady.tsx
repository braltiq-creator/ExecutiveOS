import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { ExecutiveNarrative } from "@/design-system/executive-experience";
import type { StudioBriefPreview } from "../types";

type BriefReadyPanelProps = {
  brief: StudioBriefPreview;
  href: string;
  className?: string;
};

export function BriefReadyPanel({
  brief,
  href,
  className,
}: BriefReadyPanelProps) {
  return (
    <div className={cn("space-y-[var(--eos-space-lg)]", className)}>
      <ExecutiveNarrative
        judgement={brief.title}
        supporting={brief.summary}
      />

      <section
        className={cn(
          "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
          "bg-[var(--exds-intelligence-soft)] p-[var(--eos-space-lg)]",
        )}
      >
        <p className={ds.type.label}>{brief.profileLabel}</p>
        <div className="mt-[var(--eos-space-md)] grid gap-3 sm:grid-cols-3">
          <div>
            <p className="eos-type-caption">Readiness</p>
            <p className="eos-type-metric">{brief.readiness}%</p>
          </div>
          <div>
            <p className="eos-type-caption">Confidence</p>
            <p className="eos-type-metric">{brief.confidence}%</p>
          </div>
          <div>
            <p className="eos-type-caption">Judgement items</p>
            <p className="eos-type-metric">{brief.judgementCount}</p>
          </div>
        </div>

        <div className="mt-[var(--eos-space-lg)] grid gap-[var(--eos-space-md)] sm:grid-cols-2">
          <div>
            <p className="eos-type-caption">What changed</p>
            <ul className="mt-2 space-y-1.5">
              {brief.whatChanged.map((line) => (
                <li key={line} className="eos-type-supporting">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eos-type-caption">What requires judgement</p>
            <ul className="mt-2 space-y-1.5">
              {brief.whatRequiresJudgement.map((line) => (
                <li key={line} className="eos-type-supporting">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="eos-type-subheading text-[var(--eos-color-text)]">
        Command Centre ready.
      </p>

      <Link
        href={href}
        className={cn(
          "exds-focus-ring inline-flex rounded-[var(--eos-radius-md)] px-5 py-3",
          "bg-[var(--exds-intelligence)] text-[var(--eos-primary-fg)]",
          "eos-type-subheading",
        )}
      >
        Open Command Centre →
      </Link>
    </div>
  );
}
