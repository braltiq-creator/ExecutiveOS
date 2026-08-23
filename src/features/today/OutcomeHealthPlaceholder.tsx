import { SectionShell } from "@/components/shared/SectionShell";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

export function OutcomeHealthPlaceholder() {
  const health = MOCK_OUTCOME_PORTFOLIO.overallScore;

  return (
    <SectionShell
      id="today-outcome-health"
      label="Outcome health"
      description="Portfolio signal for strategic Outcomes — chrome also mirrors this axis."
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {health}
        </p>
        <p className="text-sm text-secondary">
          Portfolio health · {MOCK_OUTCOME_PORTFOLIO.outcomes.length} Outcomes
          in mock portfolio
        </p>
      </div>
    </SectionShell>
  );
}
