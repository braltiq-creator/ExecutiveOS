import type { ReactNode } from "react";
import { ExperienceCardShell } from "@/experience/design-system/Card";

export function PortalSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <ExperienceCardShell className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="ex-heading text-base">{title}</h2>
          {description ? (
            <p className="ex-body mt-1 max-w-xl">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </ExperienceCardShell>
  );
}

export function PortalStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[var(--ex-radius)] border border-[var(--eos-border)] bg-[var(--ex-canvas)] px-4 py-3">
      <p className="ex-caption">{label}</p>
      <p className="ex-heading mt-1 text-xl">{value}</p>
      {hint ? <p className="ex-body mt-1 text-sm">{hint}</p> : null}
    </div>
  );
}
