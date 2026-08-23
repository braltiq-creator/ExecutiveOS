import Link from "next/link";
import type { ReactNode } from "react";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ConfidenceBar } from "@/experience/motion/ConfidenceBar";
import { TrustPanel } from "@/experience/components/TrustPanel";
import type { SnapshotAction } from "@/lib/snapshot/types";
import { cn } from "@/lib/utils/cn";

export type ExperienceCardModel = {
  id: string;
  title: string;
  href?: string;
  /** Why does this matter? */
  why: string;
  /** What supports it? */
  support?: string;
  /** What should I do? */
  action: string;
  /** What happens if I ignore it? */
  ignoreRisk?: string;
  /** Which strategic outcome is affected? */
  strategicOutcome?: string;
  /** Expected business impact */
  expectedImpact?: string;
  confidence?: number;
  badge?: string;
  badgeTone?: "neutral" | "accent" | "success" | "attention" | "critical";
  meta?: ReactNode;
  /** Source action for Trust panel */
  trustAction?: SnapshotAction;
  tenantId?: string;
};

type ExperienceCardProps = {
  card: ExperienceCardModel;
  className?: string;
};

/**
 * Standard executive card — decision questions + trust explainability.
 */
export function ExperienceCard({ card, className }: ExperienceCardProps) {
  const title = card.href ? (
    <Link
      href={card.href}
      className="ex-heading mt-3 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
    >
      {card.title}
    </Link>
  ) : (
    <h3 className="ex-heading mt-3">{card.title}</h3>
  );

  return (
    <ExperienceCardShell
      className={cn(
        "ex-motion transition-shadow hover:shadow-[var(--eos-shadow-2)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        {card.badge ? (
          <ExperienceBadge tone={card.badgeTone ?? "accent"}>
            {card.badge}
          </ExperienceBadge>
        ) : (
          <span />
        )}
        {typeof card.confidence === "number" ? (
          <ConfidenceBar
            value={card.confidence}
            className="w-28"
            label="Confidence"
          />
        ) : null}
      </div>

      {title}

      <dl className="mt-4 space-y-3">
        <Field label="Why this matters">{card.why}</Field>
        {card.support ? (
          <Field label="What supports it">{card.support}</Field>
        ) : null}
        <Field label="What to do">{card.action}</Field>
        {card.expectedImpact ? (
          <Field label="Expected business impact">{card.expectedImpact}</Field>
        ) : null}
        {card.ignoreRisk ? (
          <Field label="If ignored">{card.ignoreRisk}</Field>
        ) : null}
        {card.strategicOutcome ? (
          <Field label="Strategic outcome">{card.strategicOutcome}</Field>
        ) : null}
      </dl>

      {card.trustAction && card.tenantId ? (
        <TrustPanel action={card.trustAction} tenantId={card.tenantId} />
      ) : null}

      {card.meta ? <div className="mt-4">{card.meta}</div> : null}
    </ExperienceCardShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="ex-caption">{label}</dt>
      <dd className="ex-body mt-1 text-[var(--ex-text)]">{children}</dd>
    </div>
  );
}
