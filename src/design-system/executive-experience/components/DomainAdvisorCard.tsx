import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { clampConfidence, EXDS_TONE_VAR } from "../colour";
import type { ExdsAdvisorView, ExdsSemanticTone } from "../types";
import { ConfidenceBand } from "./micro/ConfidenceBand";

const STATUS_TONE: Record<ExdsAdvisorView["status"], ExdsSemanticTone> = {
  active: "intelligence",
  watching: "watching",
  escalated: "attention",
  idle: "historical",
};

const STATUS_LABEL: Record<ExdsAdvisorView["status"], string> = {
  active: "Active",
  watching: "Watching",
  escalated: "Escalated",
  idle: "Idle",
};

type DomainAdvisorCardProps = {
  advisor: ExdsAdvisorView;
  className?: string;
};

/**
 * Domain Advisor presentation card — consistent across Industry Packs.
 * Advisors advise; they do not join Council.
 */
export function DomainAdvisorCard({
  advisor,
  className,
}: DomainAdvisorCardProps) {
  const statusTone = STATUS_TONE[advisor.status];

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[var(--exds-card-radius)]",
        "border border-[var(--exds-card-border)] bg-[var(--exds-card-bg)]",
        "p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={ds.type.label}>{advisor.domain}</p>
          <p className="eos-type-subheading mt-1 text-[var(--eos-color-text)]">
            {advisor.name}
          </p>
        </div>
        <span
          className="eos-type-caption shrink-0 rounded-full px-2 py-0.5"
          style={{
            color: EXDS_TONE_VAR[statusTone],
            background: `color-mix(in srgb, ${EXDS_TONE_VAR[statusTone]} 16%, transparent)`,
          }}
        >
          {STATUS_LABEL[advisor.status]}
        </span>
      </div>

      <div className="mt-[var(--eos-space-md)] space-y-[var(--eos-space-md)]">
        <div>
          <p className="eos-type-caption">Observation</p>
          <p className="eos-type-body mt-1 text-[var(--eos-color-text)]">
            {advisor.observation}
          </p>
        </div>
        <div>
          <p className="eos-type-caption">Recommendation</p>
          <p className="eos-type-body mt-1 text-[var(--eos-color-text)]">
            {advisor.recommendation}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-[var(--eos-space-md)] pt-[var(--eos-space-lg)]">
        <ConfidenceBand
          value={clampConfidence(advisor.confidence)}
          tone="intelligence"
        />

        {advisor.indicators && advisor.indicators.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {advisor.indicators.map((indicator) => (
              <div key={indicator.label}>
                <p className="eos-type-caption">{indicator.label}</p>
                <p
                  className="eos-type-supporting mt-0.5 exds-soft-counter"
                  style={{
                    color: EXDS_TONE_VAR[indicator.tone ?? "historical"],
                  }}
                >
                  {indicator.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {advisor.escalation ? (
          <p
            className="eos-type-supporting"
            style={{ color: EXDS_TONE_VAR.attention }}
          >
            Escalation · {advisor.escalation}
          </p>
        ) : null}

        {advisor.councilRelationship ? (
          <p className="eos-type-caption">
            Council · {advisor.councilRelationship}
          </p>
        ) : null}
      </div>
    </article>
  );
}
