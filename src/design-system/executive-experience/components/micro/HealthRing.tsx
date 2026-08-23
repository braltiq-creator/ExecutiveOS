import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR, toneFromHealth } from "../../colour";
import type { ExdsHealthLevel, ExdsSemanticTone } from "../../types";

type HealthRingProps = {
  value: number;
  health?: ExdsHealthLevel;
  tone?: ExdsSemanticTone;
  size?: number;
  label?: string;
  className?: string;
};

/** Circular health indicator — organisation / domain status. */
export function HealthRing({
  value,
  health = "neutral",
  tone,
  size = 40,
  label,
  className,
}: HealthRingProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const resolved = tone ?? toneFromHealth(health);
  const stroke = EXDS_TONE_VAR[resolved];
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-1", className)}
      role="img"
      aria-label={label ?? `Health ${pct}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--eos-health-track)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-[var(--exds-duration)] ease-[var(--exds-ease)]"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="fill-[var(--eos-color-text)]"
          style={{
            fontSize: size * 0.28,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct}
        </text>
      </svg>
      {label ? <span className="eos-type-caption">{label}</span> : null}
    </div>
  );
}
