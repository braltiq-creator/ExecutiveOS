import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LedgerMark } from "@/components/layout/LedgerMark";
import { EXDS_TONE_VAR, toneFromHealth } from "../colour";
import type { ExdsHealthLevel } from "../types";
import { HealthRing } from "./micro/HealthRing";

type ExecutiveSidebarProps = {
  /**
   * Existing navigation tree — pass PrimaryNav (or equivalent).
   * EXDS does not alter navigation architecture.
   */
  navigation: ReactNode;
  organisationName: string;
  organisationHealth: number;
  organisationHealthLevel?: ExdsHealthLevel;
  cadenceLabel: string;
  activeProfile: string;
  councilStatus: string;
  currentWorkspace: string;
  brandHref?: string;
  footer?: ReactNode;
  className?: string;
};

/**
 * Dark executive navigation chrome.
 * Larger branding, Intelligence Platform subtitle, org health,
 * cadence, profile, Council status, workspace indicator.
 *
 * Compose around existing PrimaryNav — do not fork routes.
 */
export function ExecutiveSidebar({
  navigation,
  organisationName,
  organisationHealth,
  organisationHealthLevel = "neutral",
  cadenceLabel,
  activeProfile,
  councilStatus,
  currentWorkspace,
  brandHref = "/today",
  footer,
  className,
}: ExecutiveSidebarProps) {
  const healthTone = toneFromHealth(organisationHealthLevel);

  return (
    <aside
      className={cn(
        "flex h-full w-[var(--exds-sidebar-width)] shrink-0 flex-col",
        "border-r border-[var(--exds-sidebar-border)]",
        "bg-[var(--exds-sidebar-bg)] px-3 py-5",
        className,
      )}
      aria-label="Executive navigation"
    >
      <Link
        href={brandHref}
        className={cn(
          "exds-focus-ring mb-6 flex items-start gap-3 rounded-[var(--eos-radius-md)] px-1.5 py-1",
        )}
        aria-label="ExecutiveOS — Executive Intelligence Platform"
      >
        <LedgerMark
          className="mt-0.5 size-8 shrink-0 text-[var(--exds-intelligence)]"
        />
        <span className="min-w-0 leading-tight">
          <span className="block font-display text-[length:1.2rem] font-semibold tracking-[-0.035em] text-[var(--eos-color-text)]">
            ExecutiveOS
          </span>
          <span className="mt-1 block text-[length:0.68rem] font-medium leading-snug text-[var(--eos-color-text-muted)]">
            Executive Intelligence Platform
          </span>
        </span>
      </Link>

      {/* Organisation health */}
      <div
        className={cn(
          "mb-4 flex items-center gap-3 rounded-[var(--eos-radius-md)]",
          "border border-[var(--exds-sidebar-border)]",
          "bg-[var(--exds-sidebar-elevated)] px-3 py-2.5",
        )}
      >
        <HealthRing
          value={organisationHealth}
          health={organisationHealthLevel}
          size={36}
        />
        <div className="min-w-0">
          <p className="eos-type-caption">Organisation health</p>
          <p className="eos-type-subheading truncate text-[var(--eos-color-text)]">
            {organisationName}
          </p>
          <p
            className="eos-type-caption mt-0.5"
            style={{ color: EXDS_TONE_VAR[healthTone] }}
          >
            {organisationHealthLevel === "healthy"
              ? "Stable"
              : organisationHealthLevel === "watch"
                ? "Watching"
                : organisationHealthLevel === "attention"
                  ? "Attention"
                  : "In view"}
          </p>
        </div>
      </div>

      {/* Context strip */}
      <dl className="mb-5 space-y-2 px-1">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="eos-type-caption">Cadence</dt>
          <dd className="eos-type-caption text-[var(--eos-color-text-secondary)]">
            {cadenceLabel}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="eos-type-caption">Profile</dt>
          <dd className="eos-type-caption truncate text-[var(--eos-color-text-secondary)]">
            {activeProfile}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="eos-type-caption">Council</dt>
          <dd
            className="eos-type-caption truncate"
            style={{ color: EXDS_TONE_VAR.intelligence }}
          >
            {councilStatus}
          </dd>
        </div>
      </dl>

      <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>

      <div className="mt-auto space-y-3 border-t border-[var(--exds-sidebar-border)] px-1 pt-4">
        <div>
          <p className="eos-type-caption">Workspace</p>
          <p className="eos-type-subheading mt-0.5 text-[var(--eos-color-text)]">
            {currentWorkspace}
          </p>
        </div>
        {footer}
      </div>
    </aside>
  );
}
