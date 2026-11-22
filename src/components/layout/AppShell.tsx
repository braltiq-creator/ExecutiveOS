"use client";

import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { OutcomeHealthRibbon } from "@/components/layout/OutcomeHealthRibbon";
import { PrimaryNav } from "@/components/layout/PrimaryNav";
import { useSession } from "@/components/providers/SessionProvider";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { openCommandPalette } from "@/components/ui/command-palette";
import { BrandMark, ExsPageTransition } from "@/experience/exs";
import { moduleIconForPath } from "@/experience/icons";
import { cn } from "@/lib/utils/cn";

type AppShellProps = {
  children: React.ReactNode;
  breadcrumb?: string;
  title?: string;
  /** @deprecated Layout width is fixed in Sprint 1 shell. */
  maxWidth?: "5xl" | "6xl";
  /**
   * Compact / fixed surfaces:
   * - snapshot: one-screen executive surfaces
   * - mission: Command Centre — page fixed; nested feed scrolls
   */
  density?: "default" | "snapshot" | "mission";
};

export function AppShell({
  children,
  breadcrumb,
  title,
  density = "default",
}: AppShellProps) {
  const session = useSession();
  const pathname = usePathname() ?? "";
  const mission = density === "mission";
  const ModuleIcon = moduleIconForPath(pathname);

  return (
    <div className="eos-ambient relative min-h-full font-sans text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--eos-radius-md)] focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg"
      >
        Skip to main content
      </a>

      <div
        className={cn(
          "relative z-10 flex pb-20 lg:pb-0",
          mission ? "h-screen overflow-hidden" : "min-h-screen",
        )}
      >
        <aside
          className={cn(
            "eos-glass sticky top-0 hidden h-screen shrink-0 flex-col",
            "w-[13.5rem] border-0 border-r border-[var(--exs-border,var(--eos-glass-border))] px-2.5 py-4",
            "xl:w-56",
            "lg:flex",
          )}
          aria-label="ExecutiveOS navigation"
        >
          <BrandMark density="full" className="mb-6 px-1" />

          <p className="eos-type-label mb-2 px-2.5 text-[length:0.62rem] tracking-[0.1em]">
            Environment
          </p>
          <PrimaryNav variant="sidebar" className="flex-1" />

          <div className="mt-auto space-y-1 border-t border-[var(--exs-divider,var(--eos-color-divider))] px-2.5 pt-4">
            <p className="truncate font-display text-[length:0.8rem] font-semibold tracking-tight text-[var(--exs-text,var(--eos-text))]">
              {session.company.name}
            </p>
            <p className="eos-type-caption leading-5 text-[var(--exs-text-muted)]">
              {session.profile.title}
            </p>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="eos-glass-soft z-20 shrink-0 border-0 border-b border-[var(--exs-border,var(--eos-border))]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <BrandMark density="compact" className="lg:hidden" />
                {!mission ? (
                  <>
                    <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
                      {ModuleIcon ? (
                        <ModuleIcon
                          className="h-4 w-4 shrink-0 text-[var(--exs-nav,var(--eos-blue))]"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : null}
                      {title ? (
                        <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground">
                          {title}
                        </p>
                      ) : (
                        <p className="truncate text-sm text-secondary">
                          {session.profile.preferredName}&apos;s workspace
                        </p>
                      )}
                    </div>
                    <OutcomeHealthRibbon />
                  </>
                ) : (
                  <div className="hidden items-center gap-2.5 sm:flex">
                    <span
                      className="exs-intel-indicator inline-flex size-1.5 rounded-full bg-[var(--exs-intelligence)]"
                      data-live="true"
                      aria-hidden="true"
                    />
                    <p className="truncate font-display text-sm font-medium tracking-tight text-[var(--exs-text)]">
                      Executive Briefing
                    </p>
                    <span className="text-[length:0.7rem] text-[var(--exs-text-muted)]">
                      Command Centre
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Open command palette"
                  onClick={openCommandPalette}
                  className="hidden border border-[var(--exs-border)] bg-[color-mix(in_srgb,var(--exs-surface)_60%,transparent)] sm:inline-flex"
                >
                  <span className="text-[var(--exs-text-secondary)]">
                    Search
                  </span>
                  <kbd className="ml-2 rounded border border-[var(--exs-border)] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    ⌘K
                  </kbd>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Open command palette"
                  onClick={openCommandPalette}
                  className="sm:hidden"
                >
                  Search
                </Button>
                <AccountMenu />
              </div>
            </div>

            {breadcrumb ? (
              <div className="px-4 pb-3 sm:px-6 lg:px-7">
                <Breadcrumb
                  items={[
                    { label: "ExecutiveOS", href: "/today" },
                    { label: breadcrumb },
                  ]}
                />
              </div>
            ) : null}
          </header>

          <main
            id="main-content"
            className={cn(
              "w-full flex-1 px-4 sm:px-6 lg:px-7",
              mission
                ? "mx-auto flex min-h-0 max-w-[1600px] flex-col overflow-hidden py-3"
                : density === "snapshot"
                  ? "mx-auto max-w-5xl py-3 lg:overflow-hidden lg:py-3.5"
                  : "mx-auto max-w-5xl py-8 lg:py-10",
            )}
          >
            <ExsPageTransition
              className={mission ? "flex min-h-0 flex-1 flex-col" : undefined}
            >
              {children}
            </ExsPageTransition>
          </main>
        </div>
      </div>

      <PrimaryNav variant="mobile" />
    </div>
  );
}
