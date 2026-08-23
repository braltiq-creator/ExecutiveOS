import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";

export type ForecastActualPoint = {
  period: string;
  forecast: number;
  actual: number;
  variancePct?: number | null;
};

type ExecutiveForecastActualChartProps = {
  points: ForecastActualPoint[];
  question?: string;
  className?: string;
};

/**
 * Forecast vs Actual — executive instrument, not a dashboard widget.
 * Answers: Is demand tracking the forecast?
 */
export function ExecutiveForecastActualChart({
  points,
  question = "Is demand tracking the forecast?",
  className,
}: ExecutiveForecastActualChartProps) {
  const series = points.slice(-8);
  const max = Math.max(
    1,
    ...series.flatMap((p) => [p.forecast, p.actual]),
  );

  return (
    <div
      data-exds-forecast-actual="true"
      className={cn("exds-reveal-up space-y-4", className)}
      aria-label={question}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          {question}
        </p>
        <ul className="flex flex-wrap gap-4" aria-label="Series legend">
          <li className="eos-type-caption flex items-center gap-1.5">
            <span
              className="h-0.5 w-4"
              style={{ background: EXDS_TONE_VAR.intelligence }}
              aria-hidden
            />
            Forecast
          </li>
          <li className="eos-type-caption flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: EXDS_TONE_VAR.decision }}
              aria-hidden
            />
            Actual
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(2.5rem,1fr))] items-end gap-2 border-b border-[rgba(47,122,229,0.2)] pb-2">
        {series.map((p) => {
          const fH = Math.max(4, (p.forecast / max) * 100);
          const aH = Math.max(4, (p.actual / max) * 100);
          const varTone =
            p.variancePct == null
              ? "historical"
              : Math.abs(p.variancePct) >= 12
                ? "attention"
                : Math.abs(p.variancePct) >= 6
                  ? "watching"
                  : "improving";
          return (
            <div key={p.period} className="flex flex-col items-center gap-1.5">
              <div className="relative flex h-28 w-full items-end justify-center gap-0.5">
                <div
                  className="w-[38%] rounded-t-[2px]"
                  style={{
                    height: `${fH}%`,
                    background: EXDS_TONE_VAR.intelligence,
                    opacity: 0.55,
                  }}
                  title={`Forecast ${p.forecast}`}
                />
                <div
                  className="w-[38%] rounded-t-[2px]"
                  style={{
                    height: `${aH}%`,
                    background: EXDS_TONE_VAR.decision,
                  }}
                  title={`Actual ${p.actual}`}
                />
              </div>
              <p className="eos-type-caption tabular-nums text-[length:0.65rem]">
                {p.period.slice(-5)}
              </p>
              {p.variancePct != null ? (
                <p
                  className="tabular-nums text-[length:0.65rem] font-semibold"
                  style={{ color: EXDS_TONE_VAR[varTone] }}
                >
                  {p.variancePct > 0 ? "+" : ""}
                  {p.variancePct}%
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
