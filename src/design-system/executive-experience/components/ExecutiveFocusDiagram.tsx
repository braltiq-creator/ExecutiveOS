import { cn } from "@/lib/utils/cn";

export type ExecutiveFocusDomain = {
  id: string;
  label: string;
};

type ExecutiveFocusDiagramProps = {
  title?: string;
  centerLabel?: string;
  domains: ExecutiveFocusDomain[];
  className?: string;
};

const DOMAIN_ICONS: Record<string, string> = {
  pipeline: "◇",
  forecast: "↗",
  customers: "○",
  product: "▢",
  demand: "↗",
  factory: "▣",
  inventory: "▤",
  capital: "$",
  production: "▲",
  reliability: "◎",
  maintenance: "⚙",
  cost: "–",
  assets: "▣",
  field: "→",
  jobs: "→",
  workforce: "○",
  parts: "▢",
  sla: "◎",
  delivery: "→",
};

/**
 * Executive Focus — evidence domains converge on judgement.
 * Profile-driven labels; never manufacturing-hardcoded into commercial.
 */
export function ExecutiveFocusDiagram({
  title = "Executive Focus",
  centerLabel = "Executive Judgement",
  domains,
  className,
}: ExecutiveFocusDiagramProps) {
  const ring = domains.slice(0, 4);
  const centerLines = centerLabel.split(/\s+/);
  const line1 = centerLines.slice(0, Math.ceil(centerLines.length / 2)).join(" ");
  const line2 = centerLines.slice(Math.ceil(centerLines.length / 2)).join(" ");

  return (
    <section
      data-exds-focus-diagram="true"
      className={cn(
        "exds-reveal-up flex h-full flex-col overflow-hidden rounded-[calc(var(--exds-card-radius)+2px)] border",
        "bg-[var(--exds-navy)] px-[var(--eos-space-lg)] py-[var(--eos-space-lg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-electric-border)",
        boxShadow: "var(--exds-electric-glow)",
      }}
      aria-label={title}
    >
      <p className="exds-editorial-label" style={{ color: "var(--exds-electric)" }}>
        {title}
      </p>
      <p
        className="eos-type-caption mt-1"
        style={{ color: "var(--exds-navy-muted)" }}
      >
        Evidence → Judgement → Decision
      </p>

      <div className="relative mx-auto mt-4 flex aspect-square w-full max-w-[17.5rem] flex-1 items-center justify-center">
        {/* Geometry rings */}
        <span
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full border"
          style={{ borderColor: "rgba(61, 139, 253, 0.22)" }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-[22%] rounded-full border"
          style={{ borderColor: "rgba(61, 139, 253, 0.35)" }}
        />

        {/* Connecting axes */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[10%] h-[80%] w-px -translate-x-1/2"
          style={{ background: "rgba(61, 139, 253, 0.45)" }}
        />
        <span
          aria-hidden="true"
          className="absolute left-[10%] top-1/2 h-px w-[80%] -translate-y-1/2"
          style={{ background: "rgba(61, 139, 253, 0.45)" }}
        />

        <div
          className="relative z-[1] flex h-[5.75rem] w-[5.75rem] flex-col items-center justify-center rounded-full border text-center"
          style={{
            borderColor: "var(--exds-electric)",
            background: "var(--exds-navy-elevated)",
            boxShadow: "var(--exds-electric-glow)",
          }}
        >
          <p
            className="px-2 text-[length:0.62rem] font-semibold uppercase leading-tight tracking-[0.14em]"
            style={{ color: "var(--exds-decision, #d77a3a)" }}
          >
            {line1}
            {line2 ? (
              <>
                <br />
                {line2}
              </>
            ) : null}
          </p>
        </div>

        {ring[0] ? (
          <DomainNode
            className="absolute left-1/2 top-0 -translate-x-1/2"
            domain={ring[0]}
          />
        ) : null}
        {ring[1] ? (
          <DomainNode
            className="absolute right-0 top-1/2 -translate-y-1/2"
            domain={ring[1]}
          />
        ) : null}
        {ring[2] ? (
          <DomainNode
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            domain={ring[2]}
          />
        ) : null}
        {ring[3] ? (
          <DomainNode
            className="absolute left-0 top-1/2 -translate-y-1/2"
            domain={ring[3]}
          />
        ) : null}
      </div>
    </section>
  );
}

function DomainNode({
  domain,
  className,
}: {
  domain: ExecutiveFocusDomain;
  className?: string;
}) {
  const icon = DOMAIN_ICONS[domain.id] ?? "◇";
  return (
    <div
      className={cn(
        "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-[var(--eos-radius-sm)] border px-2.5 py-2 text-center",
        className,
      )}
      style={{
        borderColor: "var(--exds-electric-border)",
        background: "var(--exds-navy-elevated)",
      }}
    >
      <span
        aria-hidden="true"
        className="text-[length:0.75rem] leading-none"
        style={{ color: "var(--exds-electric)" }}
      >
        {icon}
      </span>
      <p className="text-[length:0.68rem] font-semibold tracking-tight text-[var(--exds-navy-fg)]">
        {domain.label}
      </p>
    </div>
  );
}
